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

class LocalDB {
  private get(key: string, initial: any) {
    if (typeof window === 'undefined') return initial;
    const val = localStorage.getItem(`cist_cq_${key}`);
    if (!val) {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(val);
    } catch {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(initial));
      return initial;
    }
  }

  private set(key: string, val: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(val));
    }
  }

  get courses() {
    const loaded = this.get('courses', INITIAL_COURSES);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('courses', INITIAL_COURSES);
      return INITIAL_COURSES;
    }
    return loaded;
  }
  set courses(val) { this.set('courses', val); }

  get profiles() {
    const loaded = this.get('profiles', INITIAL_PROFILES);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('profiles', INITIAL_PROFILES);
      return INITIAL_PROFILES;
    }
    return loaded;
  }
  set profiles(val) { this.set('profiles', val); }

  get students() {
    const loaded = this.get('students', INITIAL_STUDENTS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('students', INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return loaded;
  }
  set students(val) { this.set('students', val); }

  get missions() {
    const loaded = this.get('missions', INITIAL_MISSIONS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('missions', INITIAL_MISSIONS);
      return INITIAL_MISSIONS;
    }
    return loaded;
  }
  set missions(val) { this.set('missions', val); }

  get lessons() {
    const loaded = this.get('lessons', INITIAL_LESSONS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('lessons', INITIAL_LESSONS);
      return INITIAL_LESSONS;
    }
    return loaded;
  }
  set lessons(val) { this.set('lessons', val); }

  get challenges() {
    const loaded = this.get('challenges', INITIAL_CHALLENGES);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      this.set('challenges', INITIAL_CHALLENGES);
      return INITIAL_CHALLENGES;
    }
    return loaded;
  }
  set challenges(val) { this.set('challenges', val); }

  get progress() { return this.get('progress', INITIAL_PROGRESS); }
  set progress(val) { this.set('progress', val); }

  get projects() { return this.get('projects', INITIAL_PROJECTS); }
  set projects(val) { this.set('projects', val); }

  get posts() { return this.get('posts', INITIAL_COMMUNITY_POSTS); }
  set posts(val) { this.set('posts', val); }

  get comments() { return this.get('comments', INITIAL_COMMENTS); }
  set comments(val) { this.set('comments', val); }

  get badges() { return this.get('badges', INITIAL_BADGES); }
  set badges(val) { this.set('badges', val); }

  get studentBadges() { return this.get('studentBadges', INITIAL_STUDENT_BADGES); }
  set studentBadges(val) { this.set('studentBadges', val); }

  get leaderboardRequests() { return this.get('leaderboardRequests', INITIAL_LEADERBOARD_REQUESTS); }
  set leaderboardRequests(val) { this.set('leaderboardRequests', val); }

  get notifications() { return this.get('notifications', INITIAL_NOTIFICATIONS); }
  set notifications(val) { this.set('notifications', val); }
}

export const localDB = new LocalDB();
