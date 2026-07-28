// src/lib/db/service.ts
import { supabase, isSupabaseConfigured } from '../db-client';
import { getRankAndLevelForXP } from './constants';
import { localDB } from './local-db';
import { BADGE_REQUIREMENTS, BadgeActivityStats } from './badge-requirements';
import type { User } from '@supabase/supabase-js';
import {
  Course,
  Profile,
  Student,
  Mission,
  Lesson,
  Challenge,
  StudentProgress,
  Project,
  CommunityPost,
  Comment,
  Badge,
  StudentBadge,
  LeaderboardRequest,
  Notification
} from '@/types';

type StudentProfileRow = Profile & { students: Student | Student[] | null };

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url?: string | null;
  grade?: string | null;
  level: number;
  rank_title: string;
  xp: number;
  score: number;
}

const describeDbError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== 'object') return String(error || 'Unknown database error');
  const dbError = error as { code?: string; message?: string; details?: string; hint?: string };
  return [dbError.code, dbError.message, dbError.details, dbError.hint].filter(Boolean).join(' | ') || 'Unknown database error';
};

const isUuid = (value: string | null | undefined): value is string =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

export const dbService = {
  // --- AUTH SERVICES ---
  async login(email: string, password?: string): Promise<{ user: User; profile: Profile; student: Student | null }> {
    if (isSupabaseConfigured && supabase) {
      let data, error;
      try {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' }));
      } catch {
        throw new Error('Cannot reach the server. Please check your internet connection and try again.');
      }
      if (error) throw error;
      if (!data.user) throw new Error('Authentication succeeded without a user record.');

      // Fetch profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user?.id)
        .single();

      if (profileError || !profile) {
        // Sign out to avoid a dangling auth session with no profile
        await supabase.auth.signOut();
        throw new Error(
          profileError?.message ||
          `Account authenticated but no profile found. Ask your admin to create your profile in the system.`
        );
      }

      let student: Student | null = null;
      if (profile.role === 'student') {
        const { data: s } = await supabase
          .from('students').select('*').eq('profile_id', profile.id).maybeSingle();
        student = s ?? null;
      }
      return { user: data.user, profile, student };
    } else {
      // Mock login check
      const profile = localDB.profiles.find((p: Profile & { password?: string }) => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) throw new Error('CIST Student or Admin account not found.');
      if (password && password.length < 4) throw new Error('Password must be at least 4 characters.');
      
      const expectedPassword = profile.password || 'password';
      if (password && password !== expectedPassword) {
        throw new Error('Invalid login credentials');
      }
      
      // Store mock user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cist_cq_session', JSON.stringify({ userId: profile.id, role: profile.role }));
      }
      const student = localDB.students.find((s: Student) => s.profile_id === profile.id) || null;
      return { user: { id: profile.id, email: profile.email } as User, profile, student };
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cist_cq_session');
    }
    if (isSupabaseConfigured && supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
  },

  async getCurrentUser(): Promise<{ user: User; profile: Profile; student: Student | null } | null> {
    if (isSupabaseConfigured && supabase) {
      let user: User | null = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) return null;
        user = data.user;
      } catch (networkErr: unknown) {
        console.warn('[db] Supabase getUser() network error — falling back to unauthenticated:', describeDbError(networkErr));
        return null;
      }
      let profile: Profile | null = null;
      try {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        profile = data;
      } catch {
        return null;
      }
      if (!profile) return null;
      let student: Student | null = null;
      if (profile.role === 'student') {
        try {
          const { data: s } = await supabase.from('students').select('*').eq('profile_id', profile.id).maybeSingle();
          if (!s) {
            try {
              const session = await supabase.auth.getSession();
              const token = session.data?.session?.access_token;
              if (token) {
                const res = await fetch('/api/ensure-student', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                  const body = await res.json();
                  student = body.student ?? null;
                } else {
                  console.warn('[db] ensure-student returned', res.status);
                }
              }
            } catch (healErr: unknown) {
              console.error('[db] Auto-heal via API failed:', describeDbError(healErr));
            }
          } else {
            student = s;
          }
        } catch {
          // fetch failed
        }
      }
      return { user, profile, student };
    } else {
      if (typeof window === 'undefined') return null;
      const sessionStr = localStorage.getItem('cist_cq_session');
      if (!sessionStr) return null;
      const session = JSON.parse(sessionStr);
      const profile = localDB.profiles.find((p: Profile) => p.id === session.userId);
      if (!profile) return null;
      let student = localDB.students.find((s: Student) => s.profile_id === profile.id) || null;
      if (profile.role === 'student' && !student) {
        student = {
          id: `d-gen-${Math.random().toString(36).substr(2, 9)}`,
          profile_id: profile.id,
          student_code: `CIST-10-0${Math.floor(100 + Math.random() * 900)}`,
          grade: profile.grade || 'Grade 10',
          classroom: 'Room 204',
          status: 'active',
          created_at: new Date().toISOString()
        };
        const list = localDB.students;
        list.push(student);
        localDB.students = list;
      }
      return { user: { id: profile.id, email: profile.email } as User, profile, student };
    }
  },

  // --- PROFILES & STUDENTS SERVICES ---
  async getStudents(): Promise<(Profile & { students: Student })[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*, students(*)').eq('role', 'student');
      if (error) throw error;
      
      return (data as StudentProfileRow[]).map((item) => {
        let studentObj: Student | null = null;
        if (Array.isArray(item.students)) {
          studentObj = item.students[0] || null;
        } else {
          studentObj = item.students || null;
        }

        if (!studentObj) {
          studentObj = {
            id: item.id,
            profile_id: item.id,
            student_code: 'NO-CODE',
            grade: item.grade || 'Unassigned',
            classroom: 'Unassigned',
            notes: 'System fallback: Profile is missing corresponding student record.',
            status: 'active',
            created_at: item.created_at
          };
        }

        return {
          ...item,
          students: studentObj
        };
      });
    } else {
      const students = localDB.students;
      const profiles = localDB.profiles.filter((p: Profile) => p.role === 'student');
      return students.flatMap((s: Student) => {
        const p = profiles.find((prof: Profile) => prof.id === s.profile_id);
        return p ? [{ ...p, students: s }] : [];
      });
    }
  },

  async createStudent(input: {
    fullName: string;
    email: string;
    password?: string;
    grade: string;
    classroom: string;
    studentCode: string;
    notes?: string;
    userId?: string;
  }): Promise<{ profile: Profile; student: Student }> {
    const { fullName, email, password, grade, classroom, studentCode, notes, userId } = input;
    if (isSupabaseConfigured && supabase) {
      let profile: Profile;
      const { data: existingProfile } = await supabase.from('profiles').select().eq('email', email).maybeSingle();
      
      if (existingProfile) {
        const { data: updatedProfile, error: pErr } = await supabase.from('profiles').update({
          full_name: fullName,
          grade,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
          status: 'active',
          user_id: userId || existingProfile.user_id || null
        }).eq('id', existingProfile.id).select().single();
        if (pErr) throw pErr;
        profile = updatedProfile;
      } else {
        const { data: newProfile, error: pErr } = await supabase.from('profiles').insert({
          full_name: fullName,
          email,
          role: 'student',
          grade,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
          status: 'active',
          user_id: userId || null
        }).select().single();
        if (pErr) throw pErr;
        profile = newProfile;
      }

      let student: Student;
      const { data: existingStudent } = await supabase.from('students').select().eq('profile_id', profile.id).maybeSingle();
      
      if (existingStudent) {
        const { data: updatedStudent, error: sErr } = await supabase.from('students').update({
          student_code: studentCode,
          grade,
          classroom,
          notes,
          status: 'active'
        }).eq('id', existingStudent.id).select().single();
        if (sErr) throw sErr;
        student = updatedStudent;
      } else {
        const { data: newStudent, error: sErr } = await supabase.from('students').insert({
          profile_id: profile.id,
          student_code: studentCode,
          grade,
          classroom,
          notes,
          status: 'active'
        }).select().single();
        if (sErr) throw sErr;
        student = newStudent;
      }
      
      return { profile, student };
    } else {
      const profileId = `s-gen-${Math.random().toString(36).substr(2, 9)}`;
      const studentId = `d-gen-${Math.random().toString(36).substr(2, 9)}`;
      
      const newProfile: Profile & { password?: string } = {
        id: profileId,
        user_id: `auth-${profileId}`,
        full_name: fullName,
        email,
        role: 'student',
        grade,
        avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
        status: 'active',
        xp: 0,
        coins: 0,
        level: 1,
        rank_title: 'Rookie Coder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password: password || 'password'
      };

      const newStudent: Student = {
        id: studentId,
        profile_id: profileId,
        student_code: studentCode,
        grade,
        classroom,
        notes: notes || '',
        status: 'active',
        created_at: new Date().toISOString()
      };

      const profiles = localDB.profiles;
      profiles.push(newProfile);
      localDB.profiles = profiles;

      const students = localDB.students;
      students.push(newStudent);
      localDB.students = students;

      await this.createNotification(profileId, 'Welcome to CIST CodeQuest!', 'Your account has been set up. Start your first mission to earn XP and level up!', 'system');

      return { profile: newProfile, student: newStudent };
    }
  },

  async updateStudent(profileId: string, profileUpdates: Partial<Profile>, studentUpdates: Partial<Student>, password?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error: pErr } = await supabase.from('profiles').update(profileUpdates).eq('id', profileId);
      if (pErr) throw pErr;
      const { error: sErr } = await supabase.from('students').update(studentUpdates).eq('profile_id', profileId);
      if (sErr) throw sErr;
      return true;
    } else {
      const profiles = localDB.profiles.map((p: Profile & { password?: string }) => {
        if (p.id === profileId) {
          const updated = { ...p, ...profileUpdates, updated_at: new Date().toISOString() };
          if (password) {
            updated.password = password;
          }
          if (profileUpdates.xp !== undefined) {
            const { level, rank } = getRankAndLevelForXP(profileUpdates.xp);
            updated.level = level;
            updated.rank_title = rank;
          }
          return updated;
        }
        return p;
      });
      localDB.profiles = profiles;

      const students = localDB.students.map((s: Student) => {
        if (s.profile_id === profileId) {
          return { ...s, ...studentUpdates };
        }
        return s;
      });
      localDB.students = students;
      return true;
    }
  },

  async deleteStudent(profileId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (student) {
        await supabase.from('student_progress').delete().eq('student_id', student.id);
        await supabase.from('student_badges').delete().eq('student_id', student.id);
        await supabase.from('leaderboard_requests').delete().eq('student_id', student.id);
        await supabase.from('project_votes').delete().eq('student_id', student.id);
        await supabase.from('projects').delete().eq('student_id', student.id);
        await supabase.from('comments').delete().eq('student_id', student.id);
        const { data: posts } = await supabase.from('community_posts').select('id').eq('student_id', student.id);
        if (posts && posts.length > 0) {
          const postIds = posts.map((p: { id: string }) => p.id);
          await supabase.from('comments').delete().in('post_id', postIds);
          await supabase.from('community_posts').delete().eq('student_id', student.id);
        }
        await supabase.from('students').delete().eq('id', student.id);
      }

      await supabase.from('notifications').delete().eq('user_id', profileId);
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) throw error;
      return true;
    } else {
      localDB.profiles = localDB.profiles.filter((p: Profile) => p.id !== profileId);
      localDB.students = localDB.students.filter((s: Student) => s.profile_id !== profileId);
      return true;
    }
  },

  async updateXPAndCoins(profileId: string, xpDelta: number, coinsDelta: number, _reason: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: profile } = await supabase.from('profiles').select('xp, coins, level').eq('id', profileId).single();
      if (profile) {
        const newXp = Math.max(0, profile.xp + xpDelta);
        const newCoins = Math.max(0, profile.coins + coinsDelta);
        const { level, rank } = getRankAndLevelForXP(newXp);
        
        await supabase.from('profiles').update({
          xp: newXp,
          coins: newCoins,
          level,
          rank_title: rank
        }).eq('id', profileId);

        if (level > profile.level) {
          await this.createNotification(profileId, 'Level Up!', `Congratulations! You reached Level ${level} (${rank})!`, 'xp');
        }
      }
    } else {
      const profiles = localDB.profiles.map((p: Profile) => {
        if (p.id === profileId) {
          const oldLevel = p.level;
          const newXp = Math.max(0, p.xp + xpDelta);
          const newCoins = Math.max(0, p.coins + coinsDelta);
          const { level, rank } = getRankAndLevelForXP(newXp);
          const updated = {
            ...p,
            xp: newXp,
            coins: newCoins,
            level,
            rank_title: rank,
            updated_at: new Date().toISOString()
          };
          if (level > oldLevel) {
            setTimeout(() => {
              this.createNotification(profileId, 'Level Up!', `Incredible work! You are now Level ${level} - ${rank}!`, 'xp');
            }, 100);
          }
          return updated;
        }
        return p;
      });
      localDB.profiles = profiles;
    }
  },

  // --- COURSES SERVICES ---
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          return [...localDB.courses].sort((a: Course, b: Course) => a.order_index - b.order_index);
        }
        return data;
      } catch (err) {
        console.warn('Supabase getCourses failed, falling back to localDB:', err);
        return [...localDB.courses].sort((a: Course, b: Course) => a.order_index - b.order_index);
      }
    } else {
      return [...localDB.courses].sort((a: Course, b: Course) => a.order_index - b.order_index);
    }
  },

  async createCourse(course: Omit<Course, 'id' | 'created_at'>): Promise<Course> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').insert(course).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `c-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newCourse: Course = {
        id,
        ...course,
        created_at: new Date().toISOString()
      };
      const courses = localDB.courses;
      courses.push(newCourse);
      localDB.courses = courses;
      return newCourse;
    }
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const courses = localDB.courses.map((c: Course) => (c.id === id ? { ...c, ...updates } : c));
      localDB.courses = courses;
      return courses.find((c: Course) => c.id === id);
    }
  },

  async deleteCourse(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const courses = localDB.courses.filter((c: Course) => c.id !== id);
      localDB.courses = courses;
      return true;
    }
  },

  // --- MISSIONS, LESSONS, CHALLENGES ---
  async getMissions(): Promise<Mission[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('missions').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        
        const dbMissions = data || [];
        const missingSeeds = localDB.missions.filter((lm: Mission) => !dbMissions.some((dm: Mission) => dm.id === lm.id));
        const merged = [...dbMissions, ...missingSeeds];

        return merged.map((m: Mission) => {
          if (!m.course_id) {
            if (m.title.includes('AI') || m.title.includes('Neural')) {
              m.course_id = 'c0000000-0000-0000-0000-000000000012';
            } else if (m.title.includes('CSS') || m.title.includes('Styling')) {
              m.course_id = 'c0000000-0000-0000-0000-000000000011';
            } else if (m.category === 'Web') {
              m.course_id = 'c0000000-0000-0000-0000-000000000009';
            } else if (m.category === 'Python') {
              m.course_id = 'c0000000-0000-0000-0000-000000000010';
            } else {
              const matches = m.title.match(/Grade\s+(\d+)/i);
              if (matches && matches[1]) {
                const gradeNum = parseInt(matches[1]);
                const paddedHex = gradeNum.toString(16).padStart(12, '0');
                m.course_id = `c0000000-0000-0000-0000-${paddedHex}`;
              } else {
                m.course_id = 'c0000000-0000-0000-0000-000000000001';
              }
            }
          }
          return m;
        }).sort((a: Mission, b: Mission) => a.order_index - b.order_index);
      } catch (err) {
        console.warn('Supabase getMissions failed, falling back to localDB:', err);
        return [...localDB.missions].sort((a: Mission, b: Mission) => a.order_index - b.order_index);
      }
    } else {
      return [...localDB.missions].sort((a: Mission, b: Mission) => a.order_index - b.order_index);
    }
  },

  async createMission(mission: Omit<Mission, 'id' | 'created_at'>): Promise<Mission> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('missions').insert(mission).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `m-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newMission: Mission = {
        id,
        ...mission,
        created_at: new Date().toISOString()
      };
      const missions = localDB.missions;
      missions.push(newMission);
      localDB.missions = missions;
      return newMission;
    }
  },

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('missions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const missions = localDB.missions.map((m: Mission) => (m.id === id ? { ...m, ...updates } : m));
      localDB.missions = missions;
      return missions.find((m: Mission) => m.id === id);
    }
  },

  async deleteMission(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.missions = localDB.missions.filter((m: Mission) => m.id !== id);
      localDB.lessons = localDB.lessons.filter((l: Lesson) => l.mission_id !== id);
      localDB.challenges = localDB.challenges.filter((c: Challenge) => c.mission_id !== id);
      return true;
    }
  },

  async getLessons(missionId?: string): Promise<Lesson[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('lessons').select('*');
        if (missionId) query = query.eq('mission_id', missionId);
        const { data, error } = await query.order('order_index', { ascending: true });
        if (error) throw error;
        
        const dbLessons = data || [];
        let localSeeds = localDB.lessons;
        if (missionId) localSeeds = localSeeds.filter((l: Lesson) => l.mission_id === missionId);
        const missingSeeds = localSeeds.filter((ls: Lesson) => !dbLessons.some((dl: Lesson) => dl.id === ls.id));
        
        return [...dbLessons, ...missingSeeds].sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
      } catch (err) {
        console.warn('Supabase getLessons failed, falling back to localDB:', err);
        let lessons = localDB.lessons;
        if (missionId) lessons = lessons.filter((l: Lesson) => l.mission_id === missionId);
        return [...lessons].sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
      }
    } else {
      let lessons = localDB.lessons;
      if (missionId) lessons = lessons.filter((l: Lesson) => l.mission_id === missionId);
      return [...lessons].sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
    }
  },

  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lessons').insert(lesson).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `l-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newLesson: Lesson = {
        id,
        ...lesson,
        created_at: new Date().toISOString()
      };
      const lessons = localDB.lessons;
      lessons.push(newLesson);
      localDB.lessons = lessons;
      return newLesson;
    }
  },

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lessons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const lessons = localDB.lessons.map((l: Lesson) => (l.id === id ? { ...l, ...updates } : l));
      localDB.lessons = lessons;
      return lessons.find((l: Lesson) => l.id === id);
    }
  },

  async deleteLesson(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.lessons = localDB.lessons.filter((l: Lesson) => l.id !== id);
      return true;
    }
  },

  async getChallenges(missionId?: string): Promise<Challenge[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('challenges').select('*');
        if (missionId) query = query.eq('mission_id', missionId);
        const { data, error } = await query;
        if (error) throw error;
        
        const dbChallenges = data || [];
        let localSeeds = localDB.challenges;
        if (missionId) localSeeds = localSeeds.filter((c: Challenge) => c.mission_id === missionId);
        const missingSeeds = localSeeds.filter((cs: Challenge) => !dbChallenges.some((dc: Challenge) => dc.id === cs.id));
        
        return [...dbChallenges, ...missingSeeds];
      } catch (err) {
        console.warn('Supabase getChallenges failed, falling back to localDB:', err);
        if (missionId) {
          return localDB.challenges.filter((c: Challenge) => c.mission_id === missionId);
        }
        return localDB.challenges;
      }
    } else {
      if (missionId) {
        return localDB.challenges.filter((c: Challenge) => c.mission_id === missionId);
      }
      return localDB.challenges;
    }
  },

  async createChallenge(challenge: Omit<Challenge, 'id' | 'created_at'>): Promise<Challenge> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('challenges').insert(challenge).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `c-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newChallenge: Challenge = {
        id,
        ...challenge,
        created_at: new Date().toISOString()
      };
      const challenges = localDB.challenges;
      challenges.push(newChallenge);
      localDB.challenges = challenges;
      return newChallenge;
    }
  },

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('challenges').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const challenges = localDB.challenges.map((c: Challenge) => (c.id === id ? { ...c, ...updates } : c));
      localDB.challenges = challenges;
      return challenges.find((c: Challenge) => c.id === id);
    }
  },

  async deleteChallenge(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.challenges = localDB.challenges.filter((c: Challenge) => c.id !== id);
      return true;
    }
  },

  // --- PROGRESS TRACKING ---
  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    if (isSupabaseConfigured && supabase) {
      if (!studentId) return [];

      const { data, error } = await supabase.from('student_progress').select('*').eq('student_id', studentId);
      if (error) throw new Error(`Unable to load student progress: ${describeDbError(error)}`);
      // The curriculum can intentionally fall back to local seed content when the
      // hosted tables are empty. Include progress for that content as well so a
      // signed-in student can complete lessons whose seed IDs are not UUIDs.
      const localProgress = localDB.progress.filter((p: StudentProgress) => p.student_id === studentId);
      return [...(data ?? []), ...localProgress].filter(
        (item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index
      );
    } else {
      return localDB.progress.filter((p: StudentProgress) => p.student_id === studentId);
    }
  },

  async completeLesson(studentId: string, profileId: string, missionId: string, lessonId: string): Promise<StudentProgress> {
    if (isSupabaseConfigured && supabase
      && isUuid(studentId) && isUuid(missionId) && isUuid(lessonId)) {
      const { data: existingRows, error: lookupError } = await supabase.from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('lesson_id', lessonId)
        .limit(1);

      if (lookupError) {
        throw new Error(`Unable to check lesson progress: ${describeDbError(lookupError)}`);
      }

      const existing = existingRows?.[0] as StudentProgress | undefined;
      if (existing) return existing;

      const { data, error } = await supabase.from('student_progress').insert({
        student_id: studentId,
        mission_id: missionId,
        lesson_id: lessonId,
        status: 'completed',
        score: 100,
        completed_at: new Date().toISOString()
      }).select().single();
      
      if (error) {
        throw new Error(`Unable to save lesson progress: ${describeDbError(error)}`);
      }
      if (!data) throw new Error('Unable to save lesson progress: no row was returned.');
      
      await this.updateXPAndCoins(profileId, 25, 5, 'Completed Lesson');
      return data;
    } else {
      const progress = localDB.progress;
      const exists = progress.find((p: StudentProgress) => p.student_id === studentId && p.lesson_id === lessonId);
      
      if (!exists) {
        const newProgress: StudentProgress = {
          id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          mission_id: missionId,
          lesson_id: lessonId,
          challenge_id: null,
          status: 'completed',
          score: 100,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        progress.push(newProgress);
        localDB.progress = progress;
        
        await this.updateXPAndCoins(profileId, 25, 5, 'Completed Lesson');
        return newProgress;
      }
      return exists;
    }
  },

  async completeChallenge(
    studentId: string,
    profileId: string,
    missionId: string,
    challengeId: string,
    xpReward = 75,
    coinReward = 30,
    score = 100,
    timeSpent = 0,
    attemptsCount = 1
  ): Promise<StudentProgress> {
    if (isSupabaseConfigured && supabase
      && isUuid(studentId) && isUuid(missionId) && isUuid(challengeId)) {
      const { data: existingRows, error: lookupError } = await supabase.from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('challenge_id', challengeId)
        .limit(1);

      if (lookupError) {
        throw new Error(`Unable to check challenge progress: ${describeDbError(lookupError)}`);
      }

      const exists = existingRows?.[0] as StudentProgress | undefined;

      if (exists) {
        if (exists.status === 'completed') return exists;
        
        const { data, error } = await supabase.from('student_progress').update({
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString()
        }).eq('id', exists.id).select().single();
        
        if (error) throw new Error(`Unable to update challenge progress: ${describeDbError(error)}`);
        if (!data) throw new Error('Unable to update challenge progress: no row was returned.');
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return data;
      }

      const { data, error } = await supabase.from('student_progress').insert({
        student_id: studentId,
        mission_id: missionId,
        challenge_id: challengeId,
        status: 'completed',
        score,
        time_spent: timeSpent,
        attempts_count: attemptsCount,
        completed_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw new Error(`Unable to save challenge progress: ${describeDbError(error)}`);
      if (!data) throw new Error('Unable to save challenge progress: no row was returned.');
      
      await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
      return data;
    } else {
      const progress = localDB.progress;
      const existsIdx = progress.findIndex((p: StudentProgress) => p.student_id === studentId && p.challenge_id === challengeId);
      
      if (existsIdx === -1) {
        const newProgress: StudentProgress = {
          id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          mission_id: missionId,
          lesson_id: null,
          challenge_id: challengeId,
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        progress.push(newProgress);
        localDB.progress = progress;
        
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return newProgress;
      } else {
        const exists = progress[existsIdx];
        if (exists.status === 'completed') return exists;
        
        const updatedProgress: StudentProgress = {
          ...exists,
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString()
        };
        progress[existsIdx] = updatedProgress;
        localDB.progress = progress;
        
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return updatedProgress;
      }
    }
  },

  // Check if mission is complete
  async checkAndCompleteMission(studentId: string, profileId: string, missionId: string): Promise<boolean> {
    const lessons = await this.getLessons(missionId);
    const challenges = await this.getChallenges(missionId);
    const progress = await this.getStudentProgress(studentId);
    const canUseRemoteProgress = isSupabaseConfigured && supabase
      && isUuid(studentId) && isUuid(missionId)
      && lessons.every((lesson: Lesson) => isUuid(lesson.id))
      && challenges.every((challenge: Challenge) => isUuid(challenge.id));

    if (lessons.length === 0 && challenges.length === 0) {
      return false;
    }

    const completedLessons = progress.filter((p: StudentProgress) => p.mission_id === missionId && p.lesson_id && p.status === 'completed');
    const completedChallenges = progress.filter((p: StudentProgress) => p.mission_id === missionId && p.challenge_id && p.status === 'completed');

    if (completedLessons.length === lessons.length && completedChallenges.length === challenges.length) {
      const mission = (await this.getMissions()).find((m: Mission) => m.id === missionId);
      const xp = mission ? mission.xp_reward : 100;
      const coins = mission ? mission.coin_reward : 50;

      const missionProgressExists = progress.find((p: StudentProgress) => p.mission_id === missionId && !p.lesson_id && !p.challenge_id && p.status === 'completed');
      if (!missionProgressExists) {
        if (canUseRemoteProgress && supabase) {
          const { error } = await supabase.from('student_progress').insert({
            student_id: studentId,
            mission_id: missionId,
            status: 'completed',
            score: 100,
            completed_at: new Date().toISOString()
          });
          if (error) throw new Error(`Unable to save mission progress: ${describeDbError(error)}`);
        } else {
          const newProgress: StudentProgress = {
            id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
            student_id: studentId,
            mission_id: missionId,
            lesson_id: null,
            challenge_id: null,
            status: 'completed',
            score: 100,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          const allProgress = localDB.progress;
          allProgress.push(newProgress);
          localDB.progress = allProgress;
        }

        await this.updateXPAndCoins(profileId, xp, coins, `Completed Mission: ${mission?.title}`);
        await this.createNotification(profileId, '🎉 Mission Completed!', `You completed "${mission?.title}" and earned ${xp} XP and ${coins} Coins!`, 'system');

        return true;
      }
    }
    return false;
  },

  // --- PROJECTS SHOWCASE ---
  async getProjects(status?: string): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('projects').select('*, students(*, profiles(*))');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      let projects = localDB.projects;
      if (status) projects = projects.filter((p: Project) => p.status === status);
      const students = localDB.students;
      const profiles = localDB.profiles;

      return projects.map((p: Project) => {
        const s = students.find((st: Student) => st.id === p.student_id);
        const prof = s ? profiles.find((pr: Profile) => pr.id === s.profile_id) : undefined;
        return {
          ...p,
          students: s ? { ...s, profiles: prof } : undefined
        };
      }).sort((a: Project, b: Project) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async submitProject(studentId: string, project: Omit<Project, 'id' | 'student_id' | 'status' | 'votes_count' | 'teacher_score' | 'xp_awarded' | 'created_at'>): Promise<Project> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').insert({
        student_id: studentId,
        ...project,
        status: 'pending',
        votes_count: 0,
        teacher_score: null,
        xp_awarded: 0
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `p-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newProject: Project = {
        id,
        student_id: studentId,
        ...project,
        status: 'pending',
        votes_count: 0,
        teacher_score: null,
        xp_awarded: 0,
        created_at: new Date().toISOString()
      };
      const projects = localDB.projects;
      projects.push(newProject);
      localDB.projects = projects;
      return newProject;
    }
  },

  async moderateProject(projectId: string, status: 'approved' | 'rejected', score: number, feedback: string, xp: number): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data: project } = await supabase.from('projects').select('student_id').eq('id', projectId).single();
      const { error } = await supabase.from('projects').update({
        status,
        teacher_score: score,
        xp_awarded: xp
      }).eq('id', projectId);
      if (error) throw error;

      if (project && status === 'approved') {
        const { data: student } = await supabase.from('students').select('profile_id').eq('id', project.student_id).single();
        if (student) {
          await this.updateXPAndCoins(student.profile_id, xp + 200, 50, `Project Approved: ${feedback}`);
          await this.createNotification(student.profile_id, '🎨 Project Approved!', `Your project was approved by teacher! You got a score of ${score}/100 and earned ${xp + 200} XP!`, 'project');
          await this.evaluateBadgeUnlocks(project.student_id, student.profile_id);
        }
      }
      return true;
    } else {
      const projects = localDB.projects.map((p: Project) => {
        if (p.id === projectId) {
          return {
            ...p,
            status,
            teacher_score: score,
            xp_awarded: xp
          };
        }
        return p;
      });
      localDB.projects = projects;

      const project = projects.find((p: Project) => p.id === projectId);
      if (project && status === 'approved') {
        const student = localDB.students.find((s: Student) => s.id === project.student_id);
        if (student) {
          await this.updateXPAndCoins(student.profile_id, xp + 200, 50, `Project Approved: ${feedback}`);
          await this.createNotification(student.profile_id, '🎨 Project Approved!', `Your project "${project.title}" was approved! Score: ${score}/100 (+${xp + 200} XP)`, 'project');
          await this.evaluateBadgeUnlocks(project.student_id, student.profile_id);
        }
      }
      return true;
    }
  },

  async voteProject(projectId: string, studentId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('project_votes').insert({ project_id: projectId, student_id: studentId });
      if (error) throw error;
      const { data: project } = await supabase.from('projects').select('votes_count').eq('id', projectId).single();
      if (project) {
        await supabase.from('projects').update({ votes_count: project.votes_count + 1 }).eq('id', projectId);
      }
      return true;
    } else {
      if (typeof window !== 'undefined') {
        const voteKey = `cist_cq_vote_${projectId}_${studentId}`;
        const hasVoted = localStorage.getItem(voteKey);
        if (hasVoted) throw new Error('You have already voted for this project.');
        localStorage.setItem(voteKey, 'true');
      }

      const projects = localDB.projects.map((p: Project) => {
        if (p.id === projectId) {
          return { ...p, votes_count: p.votes_count + 1 };
        }
        return p;
      });
      localDB.projects = projects;
      return true;
    }
  },

  // --- COMMUNITY FORUM ---
  async getPosts(status?: string): Promise<CommunityPost[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('community_posts').select('*, students(*, profiles(*))');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      let posts = localDB.posts;
      if (status) posts = posts.filter((p: CommunityPost) => p.status === status);
      const students = localDB.students;
      const profiles = localDB.profiles;

      return posts.map((p: CommunityPost) => {
        const s = students.find((st: Student) => st.id === p.student_id);
        const prof = s ? profiles.find((pr: Profile) => pr.id === s.profile_id) : null;
        return {
          ...p,
          students: s ? { ...s, profiles: prof } : null
        };
      }).sort((a: CommunityPost, b: CommunityPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createPost(studentId: string, post: Omit<CommunityPost, 'id' | 'student_id' | 'status' | 'likes_count' | 'comments_count' | 'created_at'>): Promise<CommunityPost> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('community_posts').insert({
        student_id: studentId,
        ...post,
        status: 'approved',
        likes_count: 0,
        comments_count: 0
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `o-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newPost: CommunityPost = {
        id,
        student_id: studentId,
        ...post,
        status: 'approved',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      };
      const posts = localDB.posts;
      posts.push(newPost);
      localDB.posts = posts;
      return newPost;
    }
  },

  async moderatePost(postId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('community_posts').update({ status }).eq('id', postId);
      if (error) throw error;
      return true;
    } else {
      const posts = localDB.posts.map((p: CommunityPost) => (p.id === postId ? { ...p, status } : p));
      localDB.posts = posts;
      return true;
    }
  },

  async getComments(postId?: string): Promise<Comment[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('comments').select('*, students(*, profiles(*))').eq('status', 'approved');
      if (postId) query = query.eq('post_id', postId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let comments = localDB.comments;
      if (postId) {
        comments = comments.filter((c: Comment) => c.post_id === postId && c.status === 'approved');
      } else {
        comments = comments.filter((c: Comment) => c.status === 'approved');
      }
      const students = localDB.students;
      const profiles = localDB.profiles;

      return comments.map((c: Comment) => {
        const s = students.find((st: Student) => st.id === c.student_id);
        const prof = s ? profiles.find((pr: Profile) => pr.id === s.profile_id) : null;
        return {
          ...c,
          students: s ? { ...s, profiles: prof } : null
        };
      });
    }
  },

  async addComment(postId: string, studentId: string, content: string): Promise<Comment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('comments').insert({
        post_id: postId,
        student_id: studentId,
        content,
        status: 'approved'
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `k-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newComment: Comment = {
        id,
        post_id: postId,
        student_id: studentId,
        content,
        status: 'approved',
        created_at: new Date().toISOString()
      };
      const comments = localDB.comments;
      comments.push(newComment);
      localDB.comments = comments;

      const posts = localDB.posts.map((p: CommunityPost) => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      });
      localDB.posts = posts;

      return newComment;
    }
  },

  async hideComment(commentId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').update({ status: 'hidden' }).eq('id', commentId);
      if (error) throw error;
      return true;
    } else {
      const comments: Comment[] = localDB.comments.map((c: Comment) =>
        c.id === commentId ? { ...c, status: 'hidden' } : c
      );
      localDB.comments = comments;
      return true;
    }
  },

  async likePost(postId: string, studentId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('post_likes').insert({ post_id: postId, student_id: studentId });
      if (error) {
        if (error.code === '23505') return false; // Already liked
        throw error;
      }
      const { data: post } = await supabase.from('community_posts').select('likes_count').eq('id', postId).single();
      if (post) {
        await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
      }
      return true;
    } else {
      if (typeof window !== 'undefined') {
        const likeKey = `cist_cq_like_${postId}_${studentId}`;
        const hasLiked = localStorage.getItem(likeKey);
        if (hasLiked) return false;
        localStorage.setItem(likeKey, 'true');
      }
      const posts = localDB.posts.map((p: CommunityPost) => {
        if (p.id === postId) {
          return { ...p, likes_count: p.likes_count + 1 };
        }
        return p;
      });
      localDB.posts = posts;
      return true;
    }
  },

  // --- BADGES SERVICES ---
  async getBadges(): Promise<Badge[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data;
    } else {
      return localDB.badges;
    }
  },

  async createBadge(badge: Omit<Badge, 'id' | 'created_at'>): Promise<Badge> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('badges').insert(badge).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `b-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newBadge: Badge = {
        id,
        ...badge,
        created_at: new Date().toISOString()
      };
      const badges = localDB.badges;
      badges.push(newBadge);
      localDB.badges = badges;
      return newBadge;
    }
  },

  async getStudentBadges(studentId?: string): Promise<Badge[]> {
    if (isSupabaseConfigured && supabase) {
      if (studentId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(studentId)) return [];
        const { data, error } = await supabase.from('student_badges').select('*, badges(*)').eq('student_id', studentId);
        if (error) throw error;
        // A configured account must display only awards confirmed by the
        // database. Never merge offline/localStorage awards into live data.
        return (data as Array<StudentBadge & { badges: Badge | null }>)
          .map((sb) => sb.badges)
          .filter((badge): badge is Badge => badge !== null);
      } else {
        const { data, error } = await supabase.from('student_badges').select('*, badges(*)');
        if (error) throw error;
        return data;
      }
    } else {
      if (studentId) {
        const studentBadges = localDB.studentBadges.filter((sb: StudentBadge) => sb.student_id === studentId);
        const badges = localDB.badges;
        return studentBadges.map((sb: StudentBadge) => badges.find((b: Badge) => b.id === sb.badge_id)).filter(Boolean) as Badge[];
      } else {
        const badges = localDB.badges;
        return localDB.studentBadges.map((sb: StudentBadge) => ({
          ...sb,
          badges: badges.find((b: Badge) => b.id === sb.badge_id)
        }))
          .map((sb) => sb.badges)
          .filter((badge): badge is Badge => Boolean(badge));
      }
    }
  },

  async evaluateBadgeUnlocks(studentId: string, profileId: string): Promise<Badge[]> {
    const [badges, progress] = await Promise.all([
      this.getBadges(),
      this.getStudentProgress(studentId)
    ]);

    let profile: Profile | undefined;
    let approvedProjects = 0;
    if (isSupabaseConfigured && supabase && isUuid(studentId) && isUuid(profileId)) {
      const [{ data: profileData, error: profileError }, { count, error: projectError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', profileId).single(),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'approved')
      ]);
      if (profileError) throw new Error(`Unable to evaluate badge profile: ${describeDbError(profileError)}`);
      if (projectError) throw new Error(`Unable to evaluate badge projects: ${describeDbError(projectError)}`);
      profile = profileData as Profile;
      approvedProjects = count ?? 0;
    } else {
      profile = localDB.profiles.find((item: Profile) => item.id === profileId);
      approvedProjects = localDB.projects.filter((project: Project) => project.student_id === studentId && project.status === 'approved').length;
    }

    if (!profile) return [];

    const uniqueCount = (values: Array<string | null | undefined>) => new Set(values.filter(Boolean)).size;
    const completed = progress.filter((item: StudentProgress) => item.status === 'completed');
    const stats: BadgeActivityStats = {
      lessons: uniqueCount(completed.map((item) => item.lesson_id)),
      challenges: uniqueCount(completed.map((item) => item.challenge_id)),
      missions: uniqueCount(completed.filter((item) => !item.lesson_id && !item.challenge_id).map((item) => item.mission_id)),
      approvedProjects,
      coins: profile.coins ?? 0,
      xp: profile.xp ?? 0,
      level: profile.level ?? 1
    };

    const unlocked: Badge[] = [];
    for (const badge of badges) {
      const requirement = BADGE_REQUIREMENTS[badge.name];
      if (requirement?.isMet(stats)) {
        const award = await this.awardBadge(studentId, badge.id);
        if (award) unlocked.push(badge);
      }
    }
    return unlocked;
  },

  async awardBadge(studentId: string, badgeId: string): Promise<StudentBadge | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('student_badges')
        .insert({ student_id: studentId, badge_id: badgeId })
        .select()
        .maybeSingle();
      
      if (error) {
        if (error.code === '23505') {
          return null; // Gracefully handle unique violations
        }
        if (error.code === '42501') {
          console.warn(`[db] Badge award was not persisted: ${describeDbError(error)}`);
          return null;
        }
        throw error;
      }
      if (!data) return null;

      const { data: student } = await supabase.from('students').select('profile_id').eq('id', studentId).single();
      const { data: badge } = await supabase.from('badges').select('name').eq('id', badgeId).single();
      if (student && badge) {
        await this.createNotification(student.profile_id, '🏆 Badge Unlocked!', `You have earned the "${badge.name}" badge!`, 'badge');
      }
      return data;
    } else {
      const studentBadges = localDB.studentBadges;
      const exists = studentBadges.find((sb: StudentBadge) => sb.student_id === studentId && sb.badge_id === badgeId);
      
      if (!exists) {
        const newAward: StudentBadge = {
          id: `sb-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString()
        };
        studentBadges.push(newAward);
        localDB.studentBadges = studentBadges;

        const student = localDB.students.find((s: Student) => s.id === studentId);
        const badge = localDB.badges.find((b: Badge) => b.id === badgeId);
        if (student && badge) {
          await this.createNotification(student.profile_id, '🏆 Badge Unlocked!', `You have earned the "${badge.name}" badge!`, 'badge');
        }
        return newAward;
      }
      return exists;
    }
  },

  async removeBadge(studentId: string, badgeId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('student_badges').delete().eq('student_id', studentId).eq('badge_id', badgeId);
      return true;
    } else {
      localDB.studentBadges = localDB.studentBadges.filter((sb: StudentBadge) => !(sb.student_id === studentId && sb.badge_id === badgeId));
      return true;
    }
  },

  // --- LEADERBOARD & ACCESS REQUESTS ---
  async getLeaderboardRequests(): Promise<LeaderboardRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leaderboard_requests').select('*, students(*, profiles(*))');
      if (error) throw error;
      return data;
    } else {
      const requests = localDB.leaderboardRequests;
      const students = localDB.students;
      const profiles = localDB.profiles;

      return requests.map((r: LeaderboardRequest) => {
        const s = students.find((st: Student) => st.id === r.student_id);
        const prof = s ? profiles.find((p: Profile) => p.id === s.profile_id) : undefined;
        return {
          ...r,
          students: s ? { ...s, profiles: prof } : undefined
        };
      });
    }
  },

  async submitLeaderboardRequest(studentId: string, message: string): Promise<LeaderboardRequest> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leaderboard_requests').insert({
        student_id: studentId,
        message,
        status: 'pending'
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `lr-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newRequest: LeaderboardRequest = {
        id,
        student_id: studentId,
        status: 'pending',
        message,
        created_at: new Date().toISOString(),
        reviewed_at: null
      };
      const requests = localDB.leaderboardRequests;
      requests.push(newRequest);
      localDB.leaderboardRequests = requests;
      return newRequest;
    }
  },

  async moderateLeaderboardRequest(requestId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data: request } = await supabase.from('leaderboard_requests').select('student_id').eq('id', requestId).single();
      const { error } = await supabase.from('leaderboard_requests').update({
        status,
        reviewed_at: new Date().toISOString()
      }).eq('id', requestId);
      if (error) throw error;

      if (request) {
        const { data: student } = await supabase.from('students').select('profile_id').eq('id', request.student_id).single();
        if (student) {
          const title = status === 'approved' ? 'Leaderboard Access Approved!' : 'Leaderboard Access Declined';
          const msg = status === 'approved' 
            ? 'Congratulations! You are now competing on the official CIST CodeQuest Leaderboard!'
            : 'Your leaderboard request was reviewed and declined. Contact your teacher for details.';
          await this.createNotification(student.profile_id, title, msg, 'system');
        }
      }
      return true;
    } else {
      const requests = localDB.leaderboardRequests.map((r: LeaderboardRequest) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            reviewed_at: new Date().toISOString()
          };
        }
        return r;
      });
      localDB.leaderboardRequests = requests;

      const request = requests.find((r: LeaderboardRequest) => r.id === requestId);
      if (request) {
        const student = localDB.students.find((s: Student) => s.id === request.student_id);
        if (student) {
          const title = status === 'approved' ? '🏆 Leaderboard Access Approved!' : 'Leaderboard Access Declined';
          const msg = status === 'approved' 
            ? 'Awesome! You are now ranked on the CIST CodeQuest leaderboard.'
            : 'Your request to join the leaderboard was declined. Keep practicing and resubmit later.';
          await this.createNotification(student.profile_id, title, msg, 'system');
        }
      }
      return true;
    }
  },

  // Get ranked leaderboard data
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const studentsList = await this.getStudents();
    const requests = await this.getLeaderboardRequests();
    const approvedStudentIds = requests
      .filter((r: LeaderboardRequest) => r.status === 'approved')
      .map((r: LeaderboardRequest) => r.student_id);

    let allApprovedProjects: Project[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*').eq('status', 'approved');
      if (!error && data) {
        allApprovedProjects = data;
      }
    } else {
      allApprovedProjects = localDB.projects.filter((p: Project) => p.status === 'approved');
    }

    const leaderboard = studentsList
      .filter((s) => s.students && approvedStudentIds.includes(s.students.id) && s.status === 'active')
      .map((s): LeaderboardEntry => {
        const studentProjects = allApprovedProjects.filter((p: Project) => p.student_id === s.students.id);
        const votesWeight = studentProjects.reduce((sum: number, p: Project) => sum + p.votes_count, 0) * 10;
        const scoreWeight = studentProjects.length > 0
          ? (studentProjects.reduce((sum: number, p: Project) => sum + (p.teacher_score || 0), 0) / studentProjects.length) * 5
          : 0;
        
        const totalScore = Math.round(s.xp + votesWeight + scoreWeight);
        return {
          id: s.students.id,
          name: s.full_name,
          avatar_url: s.avatar_url,
          grade: s.grade,
          level: s.level,
          rank_title: s.rank_title,
          xp: s.xp,
          score: totalScore
        };
      });

    return leaderboard.sort((a, b) => b.score - a.score);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(profileId: string): Promise<Notification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return localDB.notifications
        .filter((n: Notification) => n.user_id === profileId)
        .sort((a: Notification, b: Notification) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createNotification(profileId: string, title: string, message: string, type = 'system'): Promise<Notification> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: profileId,
        title,
        message,
        type,
        is_read: false
      }).select().single();
      if (error) {
        // Notifications are a secondary convenience. A missing/outdated RLS
        // policy must never reject the parent reward or game-completion flow.
        console.warn(`[db] Notification was not persisted: ${describeDbError(error)}`);
        return {
          id: `notification-pending-${Date.now()}`,
          user_id: profileId,
          title,
          message,
          type,
          is_read: false,
          created_at: new Date().toISOString()
        };
      }
      return data;
    } else {
      const newNotification: Notification = {
        id: `n-gen-${Math.random().toString(36).substr(2, 9)}`,
        user_id: profileId,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const notifications = localDB.notifications;
      notifications.push(newNotification);
      localDB.notifications = notifications;
      return newNotification;
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return true;
    } else {
      const notifications = localDB.notifications.map((n: Notification) => (n.id === id ? { ...n, is_read: true } : n));
      localDB.notifications = notifications;
      return true;
    }
  }
};
