import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const names = ['quick-build', 'preview-designs', 'design-site'];

// Keep the Claude commands and reference files as the shared workflow source.
const runtime = `## OpenCode runtime instructions

Run this workflow in OpenCode. These runtime instructions adapt the shared
Claude Code documents below and any reference files you read.

- The plugin root is ${JSON.stringify(root)}. Resolve CLAUDE_PLUGIN_ROOT,
  \${CLAUDE_PLUGIN_ROOT}, and <CLAUDE_PLUGIN_ROOT> to that absolute directory
  when reading files or preparing subagent prompts. Never use the Studio cwd
  as the plugin root. The shell.env hook also sets CLAUDE_PLUGIN_ROOT for bash;
  always quote complete shell paths, including paths containing this variable.
- Use OpenCode tools: bash, read, write, edit, webfetch, skill, and task.
  Task()/Task means task with subagent_type: "general". Use the tools' actual
  schemas, not the pseudocode signatures in the workflow. Pass these runtime
  instructions and absolute reference/output paths to every subagent.
- Use question for user decisions, or ask in chat and wait if unavailable.
  Keep the orchestrator interactive. Respect configured permissions; the
  shared permission warm-up steps do not guarantee permission inheritance.
- For /preview-designs or /wordpress.com:preview-designs delegation, read
  the command at the plugin root's commands/preview-designs.md and execute
  it with these runtime instructions and the current site spec/output path.
- Load site-specification with skill, or read skills/site-specification/SKILL.md
  under the plugin root. content-import is not bundled: for redesigns use
  webfetch and save an explicit content summary (source URL, page titles,
  headings, text, links, and image URLs) instead of assuming that skill exists.
- Browser opening: use open on macOS, xdg-open on Linux, or the platform's
  equivalent. If no desktop/browser is available, return the URL or file path.
- Read references on demand. Preserve all review checkpoints and security
  requirements in the workflow. Use the configured model; no Claude model
  or Claude Code installation is required.

## Shared workflow

`;

export default async function WordPressPlugin() {
  const commands = await Promise.all(names.map(async (name) => {
    const source = await readFile(join(root, 'commands', `${name}.md`), 'utf8');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    const description = match?.[1].match(/^description: (.+)$/m)?.[1];
    if (!description) throw new Error(`Missing command description: ${name}`);
    const body = match[2]
      .replaceAll('general-purpose', 'general')
      .replaceAll('claude-code-', 'opencode-')
      .replaceAll('Claude', 'OpenCode');
    return [name, { description, template: runtime + body, agent: 'build', subtask: false }];
  }));

  return {
    config: async (config) => {
      config.command ??= {};
      for (const [name, command] of commands) {
        config.command[`wordpress.com:${name}`] ??= command;
      }
      config.skills ??= {};
      config.skills.paths = [...new Set([...(config.skills.paths ?? []), join(root, 'skills')])];
    },
    'shell.env': async (_input, output) => {
      output.env.CLAUDE_PLUGIN_ROOT = root;
    },
  };
}
