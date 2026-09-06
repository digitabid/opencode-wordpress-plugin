# Build with WordPress — Claude Code and OpenCode Plugin

Describe a website in plain English, get a complete WordPress block theme deployed to your local Studio site — ready to push to WordPress.com or Pressable.

## What this does

Building WordPress themes from scratch is complex — theme.json, block markup, template parts, design systems, responsive layouts. This plugin handles all of it. You describe your site (e.g., "A landing page for my pottery studio called Clay & Fire"), pick from 3 generated design directions, and get a fully deployed theme on a local WordPress Studio site.

There are two workflows:

- **`/quick-build`** — Fast, single-session flow. Describe your site, review the spec, pick a design, and get a live theme in minutes.
- **`/design-site`** — Multi-phase professional pipeline with style tile iteration, page layout reviews, full-page mockups, and a live design gallery that auto-refreshes as artifacts are generated.

## Prerequisites

1. **Claude Code or OpenCode** — Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) or [OpenCode](https://opencode.ai/docs/).
2. **WordPress Studio** — A local WordPress environment from Automattic. [Download Studio](https://developer.wordpress.com/studio/), then enable the CLI so the `studio` command is available in your terminal ([CLI docs](https://developer.wordpress.com/docs/developer-tools/studio/cli/)).
3. **Node.js 18+** — Needed by the bundled block markup validator that runs after theme generation.

## Installation

### Claude Code

1. Clone this repo (or note the path if you already have it):
   ```bash
   git clone https://github.com/Automattic/claude-code-wordpress.com.git
   ```

2. Start Claude from your Studio sites folder with the plugin flag:
   ```bash
   cd ~/Studio
   claude --plugin-dir /path/to/claude-code-wordpress.com
   ```

Claude must be started from the folder where your Studio sites live (or a subdirectory of it). The plugin checks this on first run and will prompt you if you're in the wrong directory.

### OpenCode

1. Clone this repository using the command above.
2. Add the adapter's absolute file URL to `plugin` in your Studio folder's
   `opencode.json` (or your global `~/.config/opencode/opencode.json`). Merge
   this entry into an existing configuration rather than replacing it:

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "plugin": ["file:///absolute/path/to/claude-code-wordpress.com/opencode.mjs"]
   }
   ```

   To get the correct URL, including encoding for spaces, run from this repository:

   ```bash
   node --input-type=module -e 'import { pathToFileURL } from "node:url"; console.log(pathToFileURL(process.cwd() + "/opencode.mjs").href)'
   ```

3. Start OpenCode from the folder containing your Studio sites:

   ```bash
   cd ~/Studio
   opencode
   ```

4. Run `/wordpress.com:quick-build A landing page for my pottery studio`.
   `/wordpress.com:preview-designs` and `/wordpress.com:design-site` are also
   available. The commands use the interactive `build` agent and your configured
   model. Claude Code is not required.

The adapter loads the shared command Markdown at startup, registers the
`site-specification` skill, maps delegation to OpenCode's `general` subagent,
and supplies the repository path to shell tools. Keep the entire clone in
place; restart OpenCode after updating it. Existing commands with the same
names take precedence. Your model and permission settings are preserved.
Approve access to the plugin and Studio directories when OpenCode requests it.
On systems without a desktop browser, previews are returned as URLs/file paths.

OpenCode support uses the official [plugin hooks](https://opencode.ai/docs/plugins/),
[custom commands](https://opencode.ai/docs/commands/), and
[agent skills](https://opencode.ai/docs/skills/). No MCP server or npm dependency
is required by this adapter.

To uninstall, remove the adapter entry from `plugin` and restart OpenCode.

### Adapter verification

```bash
node --test tests/opencode.test.mjs
```

After installation, `opencode debug config` shows the registered commands and
`opencode debug skill` lists `site-specification`.

## Getting started

Here's what a typical `/wordpress.com:quick-build` session looks like:

1. **Run the command** — Type your site description after the command:
   ```
   /wordpress.com:quick-build A landing page for my pottery studio called Clay & Fire
   ```

2. **Share design assets (optional)** — Claude asks if you have logos, photos, or brand guidelines. Share a folder path or skip.

3. **Review the site spec** — Claude extracts the site name, type, audience, tone, brand keywords, and key sections, then presents them for confirmation. Adjust anything before moving on.

4. **Studio site setup** — Claude creates a new Studio site (or offers to reuse an existing one).

5. **Pick a design** — 3 HTML design previews (header + hero) open in your browser. Each represents a distinct aesthetic direction. Pick 1, 2, or 3 — optionally with tweaks like "2, but darker" or "3 with the typography from 1."

6. **Theme is built and deployed** — Claude generates the full theme (theme.json, templates, template parts, styles, animations), validates block markup, activates the theme, and returns your local site URL.

7. **Next steps** — From here you can iterate on the design, create a shareable preview link, add pages, or regenerate design options.

## Commands

| Command | Description |
|---|---|
| `/wordpress.com:quick-build <description>` | Main workflow — describe your site, pick a design, get a deployed theme |
| `/wordpress.com:preview-designs <description>` | Generate or regenerate 3 design direction previews without a full build |
| `/wordpress.com:design-site <description>` | Advanced multi-phase workflow — style tiles, page layouts, full mockups, then theme build |

## Advanced: `/design-site`

The `/wordpress.com:design-site` command adds several phases before the final theme build:

- **Style tiles** — 3 palette/typography/component directions rendered as interactive HTML tiles. Pick one (or mix elements) to lock your design tokens.
- **Page layouts** — 3 full-page layout compositions built from your locked tokens. Pick the layout approach that works best.
- **Full mockups** — Every page (homepage, about, pricing, etc.) rendered as a complete HTML document for review before any WordPress code is generated.
- **Live design gallery** — A gallery page at `/?design-gallery` on your Studio site that auto-refreshes as artifacts are generated, so you can review everything in one place.
- **Redesigns** — Pass a URL and the plugin scrapes existing content to use as a foundation for the new design.

For contributors: the implementation details live in `skills/` (skill definitions) and `references/` (knowledge docs loaded by subagents at runtime).

## Telemetry

**Opt out:** Set this environment variable before running Claude or OpenCode:

```bash
export WP_SITE_CREATOR_NO_TELEMETRY=1
```

This plugin collects anonymous, count-only usage statistics to help understand how commands are used. No user identity, machine fingerprints, site names, file paths, or personal data are collected — just simple counters.

**What's tracked:**

| Group | Stat | When |
|---|---|---|
| `agent-site-builder` | `started` | `/wordpress.com:quick-build` invoked |
| `agent-site-builder` | `theme-activated` | Theme deployed and activated |

OpenCode uses the `opencode-build-started` and `opencode-theme-activated`
counters through the same tracking script and respects the same opt-out.

## Troubleshooting

- **`studio: command not found`** — Enable the CLI in WordPress Studio's settings, then restart your terminal. [CLI docs](https://developer.wordpress.com/docs/developer-tools/studio/cli/).
- **"Wrong directory" error** — Start Claude from `~/Studio` (or wherever your Studio sites live). The plugin needs to be running from the Studio sites folder.
- **Design previews are blank** — This usually means a path issue with image sources. Re-run `/wordpress.com:preview-designs` to regenerate.
- **Node.js not found during block fixing** — Install [Node.js 18+](https://nodejs.org/). The block markup validator requires it.
- **Theme activates but looks wrong** — Re-run `/wordpress.com:quick-build` to regenerate the theme, or iterate on specific elements by asking Claude to adjust colors, typography, or layout.
