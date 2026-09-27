import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function source(name) {
  const text = fs.readFileSync(path.join(root, `.github/workflows/shared/${name}-safe-outputs.md`), 'utf8');
  const lines = text.split('            script: |\n')[1].split('\n');
  const result = [];
  for (const line of lines) {
    if (line && !line.startsWith('              ')) break;
    result.push(line.slice(14));
  }
  return result.join('\n');
}
const url = 'https://github.com/example/repo/issues/1';
const slack = {type: 'slack_post_message', channel_id: 'C_TEST', text: `Status: ${url}`, github_source_url: url};
const calendar = {type: 'calendar_update_event_brief', event_id: 'event1', brief_content: 'New brief', github_source_url: url};
async function run(kind, items, options = {}) {
  const requests = [], failures = [], issues = [], messages = [];
  const summary = new Proxy({}, {get: (_, key) => key === 'write' ? async () => {} : (...args) => { messages.push(args); return summary; }});
  const context = {
    require: name => {
      assert.equal(name, 'fs');
      return {existsSync: () => options.outputExists !== false, readFileSync: () => JSON.stringify({items})};
    },
    process: {env: {
      GH_AW_AGENT_OUTPUT: '/fixture/output.json', SLACK_BOT_TOKEN: 'fake-token', SLACK_ALLOWED_CHANNEL_IDS: 'C_TEST',
      GOOGLE_OAUTH_CLIENT_ID: 'fake-client', GOOGLE_OAUTH_CLIENT_SECRET: 'fake-secret', GOOGLE_OAUTH_REFRESH_TOKEN: 'fake-refresh',
      GOOGLE_CALENDAR_ID: 'team@example.test', CALENDAR_WRITE_ENABLED: 'true', ...options.env,
    }},
    context: {repo: {owner: 'example', repo: 'repo'}, workflow: 'fixture', runId: 1},
    core: {info: text => messages.push(text), setFailed: text => failures.push(text), summary},
    github: {rest: {issues: {
      listForRepo: async () => ({data: options.existingIssues || []}),
      create: async data => { issues.push(data); return {data: {html_url: url}}; },
    }}},
    URLSearchParams,
    fetch: async (target, init = {}) => {
      requests.push({url: target, ...init});
      if (options.respond) return options.respond(target, init);
      const data = target.includes('oauth2') ? {access_token: 'fake-access'} : target.includes('slack.com') ? {ok: true, ts: '123.45'} : {description: options.description || 'Organizer notes'};
      return {ok: true, status: 200, json: async () => data};
    },
  };
  await vm.runInNewContext(`(async () => { ${source(kind)}\n })()`, context, {timeout: 1000});
  return {requests, failures, issues, messages};
}

test('Slack posts a valid source-linked message to its allowed channel', async () => {
  const r = await run('slack', [{...slack, thread_ts: '111.2'}]);
  assert.equal(r.requests.length, 1); assert.deepEqual(r.failures, []);
  const body = JSON.parse(r.requests[0].body);
  assert.equal(body.channel, 'C_TEST'); assert.equal(body.thread_ts, '111.2'); assert.equal(body.unfurl_links, false);
});
for (const [label, item] of [
  ['unapproved channel', {...slack, channel_id: 'C_OTHER'}],
  ['non-GitHub source', {...slack, github_source_url: 'https://example.test'}],
  ['missing source in body', {...slack, text: 'No link'}],
  ['oversized message', {...slack, text: 'x'.repeat(3001)}],
]) test(`Slack rejects ${label} before posting`, async () => {
  const r = await run('slack', [item]); assert.equal(r.requests.length, 0); assert.equal(r.failures.length, 1);
});
test('Slack rejects an oversized batch before posting', async () => {
  const r = await run('slack', Array(4).fill(slack)); assert.equal(r.requests.length, 0); assert.equal(r.failures.length, 1);
});
test('Slack API failure is surfaced', async () => {
  const r = await run('slack', [slack], {respond: async () => ({ok: true, json: async () => ({ok: false, error: 'channel_not_found'})})});
  assert.match(r.failures[0], /channel_not_found/);
});
test('Missing Slack token creates a configuration issue instead of posting', async () => {
  const r = await run('slack', [slack], {env: {SLACK_BOT_TOKEN: ''}});
  assert.equal(r.requests.length, 0); assert.equal(r.issues.length, 1); assert.equal(r.failures.length, 1);
});
test('Calendar dry-run performs no API calls', async () => {
  const r = await run('calendar', [calendar], {env: {CALENDAR_WRITE_ENABLED: 'false'}});
  assert.equal(r.requests.length, 0); assert.deepEqual(r.failures, []);
});
test('Calendar appends a brief without replacing organizer notes', async () => {
  const r = await run('calendar', [calendar]); assert.deepEqual(r.failures, []);
  const patch = r.requests.find(x => x.method === 'PATCH');
  assert.equal(JSON.parse(patch.body).description, 'Organizer notes\n\n<!-- meeting-brief-start -->\nNew brief\n<!-- meeting-brief-end -->');
});
test('Calendar replaces only the marked brief, preserving surrounding text', async () => {
  const original = 'Before\n<!-- meeting-brief-start -->\nOld brief\n<!-- meeting-brief-end -->\nAfter';
  const r = await run('calendar', [calendar], {description: original});
  assert.equal(JSON.parse(r.requests.find(x => x.method === 'PATCH').body).description, original.replace('Old brief', 'New brief'));
});
for (const [label, item] of [
  ['missing event ID', {...calendar, event_id: ''}],
  ['empty brief', {...calendar, brief_content: ''}],
  ['invalid source', {...calendar, github_source_url: 'https://example.test'}],
]) test(`Calendar rejects ${label} without an event write`, async () => {
  const r = await run('calendar', [item]); assert.equal(r.requests.filter(x => x.method === 'PATCH').length, 0); assert.equal(r.failures.length, 1);
});
test('Calendar rejects an oversized batch before API calls', async () => {
  const r = await run('calendar', Array(11).fill(calendar)); assert.equal(r.requests.length, 0); assert.equal(r.failures.length, 1);
});
test('Calendar API failure fails the handler', async () => {
  await assert.rejects(run('calendar', [calendar], {respond: async (target, init) => ({
    ok: init.method !== 'PATCH', status: init.method === 'PATCH' ? 403 : 200,
    json: async () => target.includes('oauth2') ? {access_token: 'fake'} : {},
  })}), /Failed to patch event.*403/);
});
test('Missing calendar credential reports configuration without API calls', async () => {
  const r = await run('calendar', [calendar], {env: {GOOGLE_OAUTH_REFRESH_TOKEN: ''}});
  assert.equal(r.requests.length, 0); assert.equal(r.issues.length, 1); assert.equal(r.failures.length, 1);
});
test('Generated Slack and calendar write steps retain their five-minute timeout', () => {
  const ruby = `ARGV.each { |p| d=YAML.load_file(p); d.fetch('jobs').each_value { |j| j.fetch('steps',[]).each { |s| puts JSON.generate(s.slice('name','timeout-minutes')) if ['Write validated calendar event brief','Post validated Slack messages'].include?(s['name']) } } }`;
  const output = execFileSync('ruby', ['-ryaml', '-rjson', '-e', ruby,
    path.join(root, '.github/workflows/daily-standup-prep.lock.yml'), path.join(root, '.github/workflows/launch-readiness.lock.yml')], {encoding:'utf8'});
  const steps = output.trim().split('\n').map(JSON.parse);
  assert.equal(steps.length, 2); for (const step of steps) assert.equal(step['timeout-minutes'], 5);
});
