import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import WordPressPlugin from '../opencode.mjs';

test('registers the three interactive workflows and preserves user configuration', async () => {
  const hooks = await WordPressPlugin();
  const custom = { template: 'My own preview workflow' };
  const config = {
    command: { other: { template: 'Other command' }, 'wordpress.com:preview-designs': custom },
    skills: { paths: ['/my/skills'], urls: ['https://example.com/skills/'] },
    permission: { bash: 'ask' },
  };
  await hooks.config(config);
  await hooks.config(config);
  assert.equal(config.command['wordpress.com:preview-designs'], custom);
  assert.equal(config.command.other.template, 'Other command');
  for (const name of ['quick-build', 'design-site']) {
    const command = config.command[`wordpress.com:${name}`];
    assert.equal(command.agent, 'build');
    assert.equal(command.subtask, false);
    assert.match(command.template, /\$ARGUMENTS/);
    assert.match(command.template, /subagent_type.*general/);
    assert.doesNotMatch(command.template, /general-purpose|claude-code-(?:build-started|theme-activated)/);
    assert.ok(command.description);
  }
  assert.deepEqual(config.skills.paths, ['/my/skills', fileURLToPath(new URL('../skills', import.meta.url))]);
  assert.deepEqual(config.skills.urls, ['https://example.com/skills/']);
  assert.deepEqual(config.permission, { bash: 'ask' });
});

test('loads preview workflow and gives shells the repository path without changing cwd', async () => {
  const hooks = await WordPressPlugin();
  const config = {};
  await hooks.config(config);
  assert.match(config.command['wordpress.com:preview-designs'].template, /Generate 3 distinct/);
  assert.match(config.command['wordpress.com:quick-build'].template, /wordpress\.com:preview-designs/);
  const output = { env: { KEEP: 'value' } };
  await hooks['shell.env']({ cwd: '/tmp/Studio' }, output);
  assert.deepEqual(output.env, {
    KEEP: 'value',
    CLAUDE_PLUGIN_ROOT: fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, ''),
  });
});
