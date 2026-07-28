export type TrustedActivityType = 'lesson' | 'challenge' | 'daily_login';

export interface TrustedCompletionInput {
  activityType: TrustedActivityType;
  activityId?: string;
  submittedOutput?: string;
  score?: number;
  timeSpent?: number;
  attemptsCount?: number;
}

export interface TrustedCompletionResult {
  already_completed: boolean;
  mission_completed: boolean;
  xp_awarded: number;
  coins_awarded: number;
  new_badges: string[];
  profile: {
    id: string;
    xp: number;
    coins: number;
    level: number;
    rank_title: string;
  };
}

export interface TrustedBadgeEvaluationResult {
  awarded: string[];
  total_earned: number;
}

export async function completeTrustedActivity(
  input: TrustedCompletionInput
): Promise<TrustedCompletionResult> {
  const response = await fetch('/api/progression/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify(input)
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Unable to save trusted progress.';
    throw new Error(message);
  }

  return payload as TrustedCompletionResult;
}

export async function evaluateTrustedBadges(): Promise<TrustedBadgeEvaluationResult | null> {
  const response = await fetch('/api/progression/badges/evaluate', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store'
  });

  const payload: unknown = await response.json().catch(() => null);
  // The badges page is also available in local/demo mode. Authentication is
  // still enforced by the route, but a missing session is an expected state
  // for the UI rather than an exception that should trigger Next's error
  // overlay.
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Unable to evaluate trusted badge progress.';
    throw new Error(message);
  }

  return payload as TrustedBadgeEvaluationResult;
}
