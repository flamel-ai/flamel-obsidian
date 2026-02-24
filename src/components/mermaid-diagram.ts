import type {ParsedComponent} from "../mdx/parser";
import type {RenderContext} from "../mdx/registry";

export function renderMermaidDiagram(
	component: ParsedComponent,
	containerEl: HTMLElement,
	ctx: RenderContext,
): void {
	const chartContent = component.props.chart || component.children;

	// Clean up escaped newlines
	const cleanedChart = (chartContent as string).replaceAll("\\n", "\n");

	const wrapper = containerEl.createDiv({cls: "flamel-mdx-mermaid"});
	const diagramContainer = wrapper.createDiv({cls: "flamel-mdx-mermaid-diagram"});

	// Show loading state
	diagramContainer.createDiv({
		cls: "flamel-mdx-mermaid-loading",
		text: "Rendering diagram...",
	});

	// Render the mermaid diagram (async, errors caught)
	renderMermaidSvg(cleanedChart, diagramContainer, ctx.isDarkTheme).catch(err => {
		console.error("[flamel-mdx] Mermaid render failed:", err);
	});

	// Label
	const label = wrapper.createDiv({cls: "flamel-mdx-component-label"});
	label.createSpan({text: "Mermaid", cls: "flamel-mdx-component-label-name"});
}

let mermaidIdCounter = 0;
let mermaidInitialized = false;
let lastMermaidTheme: string | null = null;

async function renderMermaidSvg(
	chart: string,
	container: HTMLElement,
	isDark: boolean,
): Promise<void> {
	try {
		const mermaidModule = await getMermaid();
		if (!mermaidModule) {
			container.empty();
			renderFallbackCodeBlock(chart, container);
			return;
		}

		// Only re-initialize when theme changes (mermaid.initialize sets global state)
		const theme = isDark ? "dark" : "default";
		if (!mermaidInitialized || lastMermaidTheme !== theme) {
			mermaidModule.initialize({
				startOnLoad: false,
				securityLevel: "strict",
				fontFamily: "inherit",
				theme,
			});
			mermaidInitialized = true;
			lastMermaidTheme = theme;
		}

		const id = `flamel-mermaid-${mermaidIdCounter++}`;
		const {svg} = await mermaidModule.render(id, chart);

		container.empty();
		const svgContainer = container.createDiv({cls: "flamel-mdx-mermaid-svg"});
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svg, "image/svg+xml");
		const svgEl = svgDoc.documentElement;
		if (svgEl instanceof SVGElement) {
			svgContainer.appendChild(document.importNode(svgEl, true));
		}
	} catch (err) {
		container.empty();
		const errorEl = container.createDiv({cls: "flamel-mdx-mermaid-error"});
		errorEl.createDiv({cls: "flamel-mdx-mermaid-error-title", text: "Diagram render error"});
		errorEl.createEl("pre", {
			cls: "flamel-mdx-mermaid-error-detail",
			text: err instanceof Error ? err.message : String(err),
		});
		renderFallbackCodeBlock(chart, container);
	}
}

async function getMermaid(): Promise<MermaidAPI | null> {
	const win = window as Window & {mermaid?: MermaidAPI};
	if (win.mermaid) return win.mermaid;

	return null;
}

interface MermaidAPI {
	initialize(config: Record<string, unknown>): void;
	render(id: string, text: string): Promise<{svg: string}>;
}

function renderFallbackCodeBlock(chart: string, container: HTMLElement): void {
	const pre = container.createEl("pre", {cls: "flamel-mdx-mermaid-fallback"});
	const code = pre.createEl("code");
	code.setText(chart);
}

