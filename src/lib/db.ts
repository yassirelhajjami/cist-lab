// src/lib/db.ts
import { supabase, isSupabaseConfigured } from './db-client';
import { XP_LEVELS, getRankAndLevelForXP } from './db/constants';
import { localDB } from './db/local-db';
import { dbService } from './db/service';

export {
  supabase,
  isSupabaseConfigured,
  XP_LEVELS,
  getRankAndLevelForXP,
  localDB,
  dbService
};
