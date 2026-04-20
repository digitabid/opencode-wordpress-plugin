# Build with WordPress Claude Code Plugin

Describe a website in plain English, get a complete WordPress block theme deployed to your local Studio site — ready to push to WordPress.com or Pressable.

## What this does

Building WordPress themes from scratch is complex — theme.json, block markup, template parts, design systems, responsive layouts. This plugin handles all of it. You describe your site (e.g., "A landing page for my pottery studio called Clay & Fire"), pick from 3 generated design directions, and get a fully deployed theme on a local WordPress Studio site.

There are two workflows:

- **`/quick-build`** — Fast, single-session flow. Describe your site, review the spec, pick a design, and get a live theme in minutes.
- **`/design-site`** — Multi-phase professional pipeline with style tile iteration, page layout reviews, full-page mockups, and a live design gallery that auto-refreshes as artifacts are generated.

## Prerequisites

1. **Claude Code** — [Install Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) if you haven't already.
2. **WordPress Studio** — A local WordPress environment from Automattic. [Download Studio](https://developer.wordpress.com/studio/), then enable the CLI so the `studio` command is available in your terminal ([CLI docs](https://developer.wordpress.com/docs/developer-tools/studio/cli/)).
3. **Node.js 18+** — Needed by the bundled block markup validator that runs after theme generation.

## Installation

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

**Opt out:** Set this environment variable before running Claude:

```bash
export WP_SITE_CREATOR_NO_TELEMETRY=1
```

This plugin collects anonymous, count-only usage statistics to help understand how commands are used. No user identity, machine fingerprints, site names, file paths, or personal data are collected — just simple counters.

**What's tracked:**

| Group | Stat | When |
|---|---|---|
| `agent-site-builder` | `started` | `/wordpress.com:quick-build` invoked |
| `agent-site-builder` | `theme-activated` | Theme deployed and activated |

## Troubleshooting

- **`studio: command not found`** — Enable the CLI in WordPress Studio's settings, then restart your terminal. [CLI docs](https://developer.wordpress.com/docs/developer-tools/studio/cli/).
- **"Wrong directory" error** — Start Claude from `~/Studio` (or wherever your Studio sites live). The plugin needs to be running from the Studio sites folder.
- **Design previews are blank** — This usually means a path issue with image sources. Re-run `/wordpress.com:preview-designs` to regenerate.
- **Node.js not found during block fixing** — Install [Node.js 18+](https://nodejs.org/). The block markup validator requires it.
- **Theme activates but looks wrong** — Re-run `/wordpress.com:quick-build` to regenerate the theme, or iterate on specific elements by asking Claude to adjust colors, typography, or layout.
