# Flamel MDX — Obsidian plugin

## Project overview

- **What it does**: Renders fumadocs MDX components (`VideoEmbed`, `ThemedImage`, `Mermaid`) inline in Obsidian notes, in both reading view and live preview.
- **Entry point**: `src/main.ts` → compiled to `main.js` by esbuild.
- **Release artifacts**: `main.js`, `manifest.json`, `styles.css`.
- **Plugin ID**: `flamel-mdx`

## Environment & tooling

- **Node.js**: 18+ (LTS recommended)
- **Package manager**: npm
- **Bundler**: esbuild (`esbuild.config.mjs`)
- **Language**: TypeScript with `"strict": true`
- **Linter**: ESLint with `typescript-eslint` and `eslint-plugin-obsidianmd`

### Install

```bash
npm install
```

### Dev (watch + hot-reload to vault)

```bash
npm run dev
```

Set `OBSIDIAN_VAULT_PLUGIN_DIR` to auto-copy built files to your vault on each rebuild:

```bash
OBSIDIAN_VAULT_PLUGIN_DIR="/path/to/vault/.obsidian/plugins/flamel-mdx" npm run dev
```

### Production build

```bash
npm run build
```

### Release

```bash
npm run release          # patch bump (1.0.0 → 1.0.1)
npm run release:minor    # minor bump (1.0.0 → 1.1.0)
npm run release:major    # major bump (1.0.0 → 2.0.0)
```

This bumps versions in `package.json` and `manifest.json`, commits, tags, and pushes. A GitHub Actions workflow then builds and creates a release with the artifacts attached.

### Lint

```bash
npm run lint
```

## Architecture

### Component system

The plugin has a three-layer component architecture:

1. **Schema** (`src/mdx/schema.ts`) — Defines available components, their props (types, required/optional, defaults), and validation rules.
2. **Registry** (`src/mdx/registry.ts`) — Maps component names to renderer functions. Orchestrates validation → defaults → rendering.
3. **Renderers** (`src/components/`) — Each component has a dedicated renderer that returns a DOM element.

### Rendering pipeline

Two paths exist for rendering MDX components:

- **Reading view**: `src/mdx/post-processor.ts` — A Markdown post-processor that finds JSX tags in rendered HTML and replaces them with component DOM.
- **Live preview**: `src/editor/live-preview.ts` — A CodeMirror 6 ViewPlugin that shows inline widget previews while editing.

Both paths use `src/mdx/parser.ts` to extract component names, props, and children from JSX-like syntax.

### Available components

| Component | Description | Required props |
|-----------|-------------|----------------|
| `VideoEmbed` | YouTube embed with lazy thumbnail | `id` |
| `ThemedImage` | Light/dark theme-aware image | `light`, `dark` |
| `Mermaid` | Mermaid diagram → SVG | `chart` prop or children |

### Commands

| ID | Name | Behavior |
|----|------|----------|
| `insert-mdx-component` | Insert component | Opens component picker modal |
| `insert-themed-image` | Insert themed image | Opens ThemedImage form directly |
| `insert-video-embed` | Insert video embed | Opens VideoEmbed form directly |
| `insert-mermaid` | Insert Mermaid diagram | Opens Mermaid form directly |

### Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `vaultBasePath` | string | `""` | Base URL for resolving image paths in ThemedImage |
| `enableLivePreview` | boolean | `true` | Toggle inline previews in edit mode |

## File & folder conventions

```
src/
├── main.ts                  # Plugin lifecycle only — keep minimal
├── settings.ts              # Settings interface, defaults, settings tab
├── components/              # One file per component renderer
│   ├── video-embed.ts
│   ├── themed-image.ts
│   └── mermaid-diagram.ts
├── mdx/                     # MDX parsing and rendering infrastructure
│   ├── parser.ts            # Regex-based JSX parser
│   ├── registry.ts          # Component name → renderer dispatch
│   ├── schema.ts            # Component definitions and validation
│   └── post-processor.ts    # Reading view post-processor
├── editor/                  # Editor integrations
│   └── live-preview.ts      # CodeMirror 6 live preview plugin
└── ui/                      # User-facing modals and icons
    ├── component-picker.ts  # FuzzySuggestModal for component selection
    ├── insert-modal.ts      # Form modal for prop input
    ├── image-suggest.ts     # Vault image file browser
    └── flamel-icon.ts       # Custom SVG icon registration
```

- Keep `main.ts` focused on plugin lifecycle. Delegate all feature logic to modules.
- Each file should have a single responsibility. Split if exceeding ~200-300 lines.
- Do not commit build artifacts (`main.js`, `node_modules/`).

## Adding a new component

1. Add the component definition to `src/mdx/schema.ts` in the `componentSchema` object.
2. Create a renderer in `src/components/your-component.ts` that implements `(el, props, children, ctx) => void`.
3. Register it in `src/main.ts` with `registerComponent("YourComponent", renderYourComponent)`.
4. Add styles to `styles.css` using the `flamel-mdx-` prefix.
5. The component will automatically work in reading view, live preview, and the insert modal.

## Manifest rules (`manifest.json`)

- `id`: `flamel-mdx` — never change after release.
- `version`: Semantic Versioning `x.y.z`.
- `minAppVersion`: Keep accurate when using newer Obsidian APIs.
- `isDesktopOnly`: `false` — plugin is mobile-compatible.

## Testing

Manual install for testing: copy `main.js`, `manifest.json`, `styles.css` to:

```
<Vault>/.obsidian/plugins/flamel-mdx/
```

Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Distribution

The plugin is distributed to the team via [BRAT](https://github.com/TfTHacker/obsidian42-brat). Team members install BRAT from the Obsidian community plugin store, then add `flamel-ai/mogadishu-v3` as a beta plugin. BRAT pulls `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.

## Versioning & releases

Release using the npm scripts:

```bash
npm run release          # patch (1.0.0 → 1.0.1)
npm run release:minor    # minor (1.0.0 → 1.1.0)
npm run release:major    # major (1.0.0 → 2.0.0)
```

This runs `npm version` which:
1. Bumps `version` in `package.json`
2. Runs the `version` script to sync `manifest.json` and `versions.json`
3. Commits and creates a git tag (no `v` prefix)
4. Pushes the commit and tag

The `.github/workflows/release.yml` workflow triggers on the tag, builds the plugin, and creates a GitHub release with the three artifacts attached. BRAT users can then check for updates.

## Security & privacy

- No network calls except YouTube thumbnail/iframe loading (user-initiated).
- YouTube embeds use `youtube-nocookie.com` for privacy.
- No telemetry or analytics.
- No remote code execution.
- Only reads vault files for image path resolution.

## Performance

- Startup is lightweight — component renderers are registered synchronously.
- Mermaid library is loaded lazily from `window.mermaid` (provided by Obsidian).
- Live preview uses CodeMirror decorations to avoid re-rendering the entire document.
- YouTube thumbnails lazy-load; iframes only load on click.

## Coding conventions

- TypeScript with `"strict": true`.
- Bundle everything into `main.js` via esbuild (no unbundled runtime deps).
- Use `async/await` over promise chains.
- Use `this.register*` helpers for all cleanup.
- CSS classes use the `flamel-mdx-` prefix.
- Command IDs are stable — do not rename once released.

## Agent do/don't

**Do**
- Follow the existing component architecture when adding features.
- Validate props using the schema system.
- Handle errors gracefully — show inline error messages rather than crashing.
- Use the `RenderContext` for theme detection and path resolution.
- Test in both reading view and live preview.

**Don't**
- Add network calls without clear user-facing purpose and documentation.
- Put feature logic in `main.ts` — delegate to modules.
- Introduce heavy dependencies — keep the bundle small.
- Break the existing JSX parsing contract in `parser.ts`.

## Troubleshooting

- **Plugin doesn't load**: Ensure `main.js` and `manifest.json` are at the top level of `<Vault>/.obsidian/plugins/flamel-mdx/`.
- **Build fails**: Run `npm run build` — check for TypeScript errors.
- **Components not rendering**: Check the browser console for `[flamel-mdx]` debug messages. Verify JSX syntax matches expected format.
- **Mermaid not rendering**: Mermaid depends on `window.mermaid` which Obsidian provides. Ensure you're running a recent version of Obsidian.
- **Images not loading**: Check the "Image base path" setting. Vault-relative paths (starting with `/`) are resolved via Obsidian's resource API.
- **Live preview not working**: Check the "Live preview" toggle in settings. The CodeMirror extension requires Obsidian's live preview mode to be active.

## References

- Obsidian plugin API: https://docs.obsidian.md
- fumadocs: https://fumadocs.vercel.app/
- Mermaid: https://mermaid.js.org/
- Developer policies: https://docs.obsidian.md/Developer+policies
- Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
