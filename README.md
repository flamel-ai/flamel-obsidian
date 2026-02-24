# Flamel MDX

An Obsidian plugin that renders [fumadocs](https://fumadocs.vercel.app/) MDX components inline — preview `<VideoEmbed>`, `<ThemedImage>`, and `<Mermaid>` blocks directly in your notes.

## What it does

When writing documentation with fumadocs MDX components, this plugin renders them as live previews inside Obsidian instead of showing raw JSX tags. It works in both reading view and live preview (edit mode).

The plugin also registers `.mdx` files as markdown so you can open and edit them natively in Obsidian.

## Components

### VideoEmbed

Embeds a YouTube video with a lazy-loading thumbnail. Click the thumbnail to load the video player.

```jsx
<VideoEmbed id="dQw4w9WgXcQ" title="Getting started" />
```

| Prop | Required | Default | Description |
|------|----------|---------|-------------|
| `id` | Yes | — | YouTube video ID (the part after `v=` in the URL) |
| `title` | No | `"Video"` | Title displayed below the thumbnail |

### ThemedImage

Displays a different image depending on whether the user is in light or dark mode.

```jsx
<ThemedImage
  light="/docs/images/diagram-light.png"
  dark="/docs/images/diagram-dark.png"
  alt="Architecture diagram"
/>
```

| Prop | Required | Default | Description |
|------|----------|---------|-------------|
| `light` | Yes | — | Image path or URL for light theme |
| `dark` | Yes | — | Image path or URL for dark theme |
| `alt` | No | `""` | Alt text for the image |
| `className` | No | — | CSS class name |

Image paths starting with `/` are resolved relative to your vault. Absolute URLs (e.g. `https://...`) are used as-is.

### Mermaid

Renders a [Mermaid](https://mermaid.js.org/) diagram as an SVG. You can pass the diagram syntax as a prop or as children.

**As a prop:**

```jsx
<Mermaid chart="graph TD; A-->B; B-->C;" />
```

**As children:**

```jsx
<Mermaid>
graph TD
  A[Start] --> B[Process]
  B --> C[End]
</Mermaid>
```

| Prop | Required | Default | Description |
|------|----------|---------|-------------|
| `chart` | No* | — | Mermaid diagram syntax |

*Either `chart` prop or children content is required.

The diagram automatically adapts to the current Obsidian theme (light or dark).

## Installation

### With BRAT (recommended)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) lets you install plugins directly from GitHub and get automatic updates.

1. Install **Obsidian42 - BRAT** from the Obsidian community plugin store if you haven't already.
2. Open **Settings → BRAT → Add Beta plugin**.
3. Enter the GitHub repo: `flamel-ai/mogadishu-v3`
4. Click **Add Plugin** — BRAT will download and enable it.

To update later, go to **Settings → BRAT → Check for updates**.

### Manual install

Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](../../releases/latest) and copy them into:

```
<YourVault>/.obsidian/plugins/flamel-mdx/
```

Then restart Obsidian and enable the plugin in **Settings → Community plugins**.

### From source

1. Clone this repository into your vault's plugin directory:

   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone <repo-url> flamel-mdx
   cd flamel-mdx
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Restart Obsidian (or reload plugins), then enable **Flamel MDX** in **Settings → Community plugins**.

## Setup

### Obsidian configuration

After enabling the plugin, go to **Settings → Flamel MDX** to configure:

- **Image base path** — Base URL for resolving image paths in `ThemedImage` components. If your images use vault-relative paths like `/docs/images/logo.png`, leave this empty. If they reference a remote host, enter the base URL (e.g. `https://flamel.ai`).
- **Live preview** — Toggle inline component previews in edit mode. Enabled by default.

### Working with .mdx files

The plugin registers `.mdx` as a markdown file extension, so Obsidian will open `.mdx` files in the editor like any other note. No additional configuration is needed.

### Import statements

MDX import/export statements (e.g. `import { Mermaid } from "fumadocs-ui"`) are automatically hidden in both reading view and live preview. You can keep them in your files for fumadocs compatibility without visual clutter.

## Usage

### Inserting components

There are three ways to insert components:

1. **Ribbon icon** — Click the Flamel flame icon in the left ribbon to open the component picker.
2. **Command palette** — Open the command palette (`Cmd/Ctrl + P`) and search for:
   - `Flamel MDX: Insert component` — opens a picker to choose which component to insert
   - `Flamel MDX: Insert themed image` — directly opens the ThemedImage form
   - `Flamel MDX: Insert video embed` — directly opens the VideoEmbed form
   - `Flamel MDX: Insert Mermaid diagram` — directly opens the Mermaid form
3. **Type it manually** — Write the JSX tag directly in your note. The plugin will render it automatically.

### Component picker

The component picker modal lets you fuzzy-search across all available components. Select one to open a form where you fill in the props. For `ThemedImage`, the form includes a **Browse** button to search images in your vault.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Dev mode (watch + hot-reload)

```bash
npm run dev
```

This watches for changes and rebuilds automatically. If the `OBSIDIAN_VAULT_PLUGIN_DIR` environment variable is set, it also copies the built files to that directory on each rebuild.

To point dev mode at your vault:

```bash
OBSIDIAN_VAULT_PLUGIN_DIR="/path/to/vault/.obsidian/plugins/flamel-mdx" npm run dev
```

### Production build

```bash
npm run build
```

Runs TypeScript type checking, then bundles with esbuild into `main.js`.

### Lint

```bash
npm run lint
```

Uses ESLint with TypeScript and Obsidian-specific rules. A GitHub Action runs this automatically on every push.

### Releasing a new version

```bash
npm run release          # patch bump (1.0.0 → 1.0.1)
npm run release:minor    # minor bump (1.0.0 → 1.1.0)
npm run release:major    # major bump (1.0.0 → 2.0.0)
```

This bumps the version in `package.json` and `manifest.json`, commits, tags, and pushes. A GitHub Actions workflow then builds the plugin and creates a GitHub release with `main.js`, `manifest.json`, and `styles.css` attached. Team members using BRAT can check for updates in **Settings → BRAT**.

## Project structure

```
src/
├── main.ts                  # Plugin entry point and lifecycle
├── settings.ts              # Settings tab and defaults
├── components/
│   ├── video-embed.ts       # YouTube video renderer
│   ├── themed-image.ts      # Light/dark image renderer
│   └── mermaid-diagram.ts   # Mermaid diagram renderer
├── mdx/
│   ├── parser.ts            # JSX component parser
│   ├── registry.ts          # Component renderer registry
│   ├── schema.ts            # Component definitions and validation
│   └── post-processor.ts    # Reading view markdown post-processor
├── editor/
│   └── live-preview.ts      # CodeMirror live preview plugin
└── ui/
    ├── component-picker.ts  # Fuzzy search component picker modal
    ├── insert-modal.ts      # Component property input form
    ├── image-suggest.ts     # Vault image file browser
    └── flamel-icon.ts       # Flamel flame icon SVG
```

## License

[0-BSD](LICENSE)
