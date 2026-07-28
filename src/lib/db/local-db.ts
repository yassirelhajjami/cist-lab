// src/lib/db/local-db.ts
import {
  INITIAL_COURSES,
  INITIAL_PROFILES,
  INITIAL_STUDENTS,
  INITIAL_MISSIONS,
  INITIAL_LESSONS,
  INITIAL_CHALLENGES,
  INITIAL_PROGRESS,
  INITIAL_PROJECTS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_COMMENTS,
  INITIAL_BADGES,
  INITIAL_STUDENT_BADGES,
  INITIAL_LEADERBOARD_REQUESTS,
  INITIAL_NOTIFICATIONS
} from './mock-data';
import type {
  Badge,
  Challenge,
  Comment,
  CommunityPost,
  Course,
  LeaderboardRequest,
  Lesson,
  Mission,
  Notification,
  Profile,
  Project,
  Student,
  StudentBadge,
  StudentProgress
} from '@/types';

class LocalDB {
  private get<T>(key: string, initial: T): T {
    if (typeof window === 'undefined') return initial;
    const val = localStorage.getItem(`cist_cq_${key}`);
    if (!val) {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(val) as T;
    } catch {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(initial));
      return initial;
    }
  }

  private set<T>(key: string, val: T) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(val));
    }
  }

  get courses(): Course[] {
    const loaded = this.get<Course[]>('courses', INITIAL_COURSES as Course[]);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('courses', INITIAL_COURSES);
      return INITIAL_COURSES as Course[];
    }
    return loaded;
  }
  set courses(val: Course[]) { this.set('courses', val); }

  get profiles(): Array<Profile & { password?: string }> {
    const loaded = this.get<Array<Profile & { password?: string }>>(
      'profiles',
      INITIAL_PROFILES as Array<Profile & { password?: string }>
    );
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('profiles', INITIAL_PROFILES);
      return INITIAL_PROFILES as Array<Profile & { password?: string }>;
    }
    return loaded;
  }
  set profiles(val: Array<Profile & { password?: string }>) { this.set('profiles', val); }

  get students(): Student[] {
    const loaded = this.get<Student[]>('students', INITIAL_STUDENTS as Student[]);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('students', INITIAL_STUDENTS);
      return INITIAL_STUDENTS as Student[];
    }
    return loaded;
  }
  set students(val: Student[]) { this.set('students', val); }

  get missions(): Mission[] {
    const loaded = this.get<Mission[]>('missions', INITIAL_MISSIONS as Mission[]);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('missions', INITIAL_MISSIONS);
      return INITIAL_MISSIONS as Mission[];
    }
    return loaded;
  }
  set missions(val: Mission[]) { this.set('missions', val); }

  get lessons(): Lesson[] {
    const loaded = this.get<Lesson[]>('lessons', INITIAL_LESSONS as Lesson[]);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('lessons', INITIAL_LESSONS);
      return INITIAL_LESSONS as Lesson[];
    }
    return loaded;
  }
  set lessons(val: Lesson[]) { this.set('lessons', val); }

  get challenges(): Challenge[] {
    const loaded = this.get<Challenge[]>('challenges', INITIAL_CHALLENGES as Challenge[]);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('challenges', INITIAL_CHALLENGES);
      return INITIAL_CHALLENGES as Challenge[];
    }
    return loaded;
  }
  set challenges(val: Challenge[]) { this.set('challenges', val); }

  get progress(): StudentProgress[] { return this.get('progress', INITIAL_PROGRESS as StudentProgress[]); }
  set progress(val: StudentProgress[]) { this.set('progress', val); }

  get projects(): Project[] { return this.get('projects', INITIAL_PROJECTS as Project[]); }
  set projects(val: Project[]) { this.set('projects', val); }

  get posts(): CommunityPost[] { return this.get('posts', INITIAL_COMMUNITY_POSTS as CommunityPost[]); }
  set posts(val: CommunityPost[]) { this.set('posts', val); }

  get comments(): Comment[] { return this.get('comments', INITIAL_COMMENTS as Comment[]); }
  set comments(val: Comment[]) { this.set('comments', val); }

  get badges(): Badge[] { return this.get('badges', INITIAL_BADGES as Badge[]); }
  set badges(val: Badge[]) { this.set('badges', val); }

  get studentBadges(): StudentBadge[] { return this.get('studentBadges', INITIAL_STUDENT_BADGES as StudentBadge[]); }
  set studentBadges(val: StudentBadge[]) { this.set('studentBadges', val); }

  get leaderboardRequests(): LeaderboardRequest[] { return this.get('leaderboardRequests', INITIAL_LEADERBOARD_REQUESTS as LeaderboardRequest[]); }
  set leaderboardRequests(val: LeaderboardRequest[]) { this.set('leaderboardRequests', val); }

  get notifications(): Notification[] { return this.get('notifications', INITIAL_NOTIFICATIONS as Notification[]); }
  set notifications(val: Notification[]) { this.set('notifications', val); }
}

export const localDB = new LocalDB();
