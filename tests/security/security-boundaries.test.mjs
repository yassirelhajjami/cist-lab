import test from 'node:test';
import assert from 'node:assert/strict';

import { unauthenticatedResponse } from '../../src/lib/server/api-auth.ts';
import {
  isApprovedWebhookUrl,
  isRedirectStatus
} from '../../src/lib/server/webhook-security.ts';
import { isArcadeLevelUnlocked } from '../../src/lib/progression/level-access.ts';

test('AI and webhook authentication guard rejects an unauthenticated request', async () => {
  const aiResponse = unauthenticatedResponse(null, 'Sign in to use the AI tutor.');
  const webhookResponse = unauthenticatedResponse(undefined, 'Authentication required.');

  assert.equal(aiResponse?.status, 401);
  assert.equal(webhookResponse?.status, 401);
  assert.deepEqual(await aiResponse?.json(), { error: 'Sign in to use the AI tutor.' });
  assert.deepEqual(await webhookResponse?.json(), { error: 'Authentication required.' });
  assert.equal(unauthenticatedResponse({ id: 'student-a' }, 'No'), null);
});

test('webhook URL allowlist accepts only known HTTPS providers', () => {
  assert.equal(isApprovedWebhookUrl('https://discord.com/api/webhooks/1/token'), true);
  assert.equal(isApprovedWebhookUrl('https://hooks.slack.com/services/a/b/c'), true);
  assert.equal(isApprovedWebhookUrl('https://outlook.office.com/webhook/example'), true);

  assert.equal(isApprovedWebhookUrl('https://example.com/hook'), false);
  assert.equal(isApprovedWebhookUrl('http://discord.com/api/webhooks/1/token'), false);
  assert.equal(isApprovedWebhookUrl('https://discord.com.evil.example/hook'), false);
  assert.equal(isApprovedWebhookUrl('https://discord.com@evil.example/hook'), false);
});

test('webhook URL validation rejects localhost and IP literals', () => {
  const blocked = [
    'https://localhost/hook',
    'https://127.0.0.1/hook',
    'https://10.0.0.2/hook',
    'https://172.16.0.2/hook',
    'https://192.168.1.2/hook',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/hook'
  ];

  for (const url of blocked) assert.equal(isApprovedWebhookUrl(url), false, url);
});

test('webhook redirects fail closed before a second host can be fetched', () => {
  for (const status of [300, 301, 302, 303, 307, 308]) {
    assert.equal(isRedirectStatus(status), true);
  }
  assert.equal(isRedirectStatus(200), false);
  assert.equal(isRedirectStatus(404), false);
});

test('direct level selection cannot open a locked level', () => {
  assert.equal(isArcadeLevelUnlocked(1, []), true);
  assert.equal(isArcadeLevelUnlocked(2, []), false);
  assert.equal(isArcadeLevelUnlocked(2, [1]), true);
  assert.equal(isArcadeLevelUnlocked(11, [1, 2, 3]), false);
  assert.equal(isArcadeLevelUnlocked(11, [10]), true);
  assert.equal(isArcadeLevelUnlocked(0, []), false);
  assert.equal(isArcadeLevelUnlocked(Number.NaN, []), false);
});
