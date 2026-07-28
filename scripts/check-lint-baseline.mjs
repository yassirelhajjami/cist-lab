import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const eslintEntry = join(dirname(require.resolve('eslint/package.json')), 'bin', 'eslint.js');
const baseline = JSON.parse(readFileSync(new URL('../lint-baseline.json', import.meta.url), 'utf8'));

const run = spawnSync(process.execPath, [eslintEntry, '.', '--format', 'json'], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024
});

if (!run.stdout) {
  process.stderr.write(run.stderr || 'ESLint produced no report.\n');
  process.exit(2);
}

const report = JSON.parse(run.stdout);
const messages = report.flatMap((file) => file.messages);
const current = {
  total: messages.length,
  errors: messages.filter((message) => message.severity === 2).length,
  warnings: messages.filter((message) => message.severity === 1).length,
  rules: {}
};

for (const message of messages) {
  const rule = message.ruleId ?? 'unclassified';
  current.rules[rule] = (current.rules[rule] ?? 0) + 1;
}

const regressions = [];
for (const metric of ['total', 'errors', 'warnings']) {
  if (current[metric] > baseline[metric]) {
    regressions.push(`${metric}: ${current[metric]} exceeds ${baseline[metric]}`);
  }
}

for (const [rule, count] of Object.entries(current.rules)) {
  const allowed = baseline.rules[rule] ?? 0;
  if (count > allowed) regressions.push(`${rule}: ${count} exceeds ${allowed}`);
}

if (regressions.length) {
  console.error('Lint baseline increased:\n- ' + regressions.join('\n- '));
  process.exit(1);
}

console.log(
  `Lint ratchet passed: ${current.total}/${baseline.total} findings ` +
  `(${current.errors} errors, ${current.warnings} warnings).`
);

const reduced = Object.entries(baseline.rules)
  .filter(([rule, allowed]) => (current.rules[rule] ?? 0) < allowed)
  .map(([rule, allowed]) => `${rule}: ${allowed} -> ${current.rules[rule] ?? 0}`);

if (reduced.length) {
  console.log('Baseline can be lowered:\n- ' + reduced.join('\n- '));
}
