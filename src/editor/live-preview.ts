import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {RangeSetBuilder} from "@codemirror/state";
import {editorLivePreviewField} from "obsidian";
import {parseComponents, type ParsedComponent} from "../mdx/parser";
import {renderComponent, type RenderContext} from "../mdx/registry";

class MdxComponentWidget extends WidgetType {
	constructor(
		readonly component: ParsedComponent,
		readonly getContext: () => RenderContext,
	) {
		super();
	}

	eq(other: MdxComponentWidget): boolean {
		return this.component.raw === other.component.raw;
	}

	toDOM(): HTMLElement {
		const container = document.createElement("div");
		container.className = "flamel-mdx-component-wrapper flamel-mdx-live-preview";
		const ctx = this.getContext();
		renderComponent(this.component, container, ctx);
		return container;
	}

	get estimatedHeight(): number {
		switch (this.component.name) {
			case "VideoEmbed": return 300;
			case "ThemedImage": return 200;
			case "Mermaid": return 200;
			default: return 100;
		}
	}

	ignoreEvent(): boolean {
		return false;
	}
}

interface DecoRange {
	from: number;
	to: number;
	deco: Decoration;
}

function buildDecorations(view: EditorView, getContext: () => RenderContext): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();

	try {
		if (!view.state.field(editorLivePreviewField, false)) {
			return builder.finish();
		}

		const doc = view.state.doc;
		const text = doc.toString();

		const cursorPositions = view.state.selection.ranges.map(r => ({
			from: doc.lineAt(r.from).number,
			to: doc.lineAt(r.to).number,
		}));

		const ranges: DecoRange[] = [];

		// Import line hiding (single-line replaces only)
		const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm;
		let importMatch;
		while ((importMatch = importRegex.exec(text)) !== null) {
			const lineFrom = doc.lineAt(importMatch.index).number;
			const lineTo = doc.lineAt(importMatch.index + importMatch[0].length).number;
			const cursorOnLine = cursorPositions.some(
				cursor => cursor.from <= lineTo && cursor.to >= lineFrom
			);
			if (!cursorOnLine) {
				ranges.push({
					from: importMatch.index,
					to: importMatch.index + importMatch[0].length,
					deco: Decoration.replace({}),
				});
			}
		}

		// Component widgets — avoid block decorations by using:
		// 1. Inline widget at the start of the component
		// 2. Per-line Decoration.replace({}) to hide each source line individually
		const components = parseComponents(text);
		for (const comp of components) {
			const startLine = doc.lineAt(comp.start);
			const endPos = Math.min(comp.end, doc.length);
			const endLine = doc.lineAt(endPos > 0 ? endPos - 1 : 0);

			const cursorOnComponent = cursorPositions.some(
				cursor => cursor.from <= endLine.number && cursor.to >= startLine.number
			);
			if (cursorOnComponent) continue;

			// Inline widget placed just before the component text
			ranges.push({
				from: comp.start,
				to: comp.start,
				deco: Decoration.widget({
					widget: new MdxComponentWidget(comp, getContext),
					side: -1,
				}),
			});

			// Hide each source line individually (single-line replaces = inline, not block)
			for (let i = startLine.number; i <= endLine.number; i++) {
				const line = doc.line(i);
				const from = Math.max(line.from, comp.start);
				const to = Math.min(line.to, comp.end);
				if (from < to) {
					ranges.push({from, to, deco: Decoration.replace({})});
				}
			}
		}

		ranges.sort((a, b) => a.from - b.from || a.to - b.to);

		for (const range of ranges) {
			builder.add(range.from, range.to, range.deco);
		}
	} catch (err) {
		console.error("[flamel-mdx] Error building decorations:", err);
	}

	return builder.finish();
}

export function createLivePreviewPlugin(getContext: () => RenderContext) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, getContext);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.selectionSet ||
					update.viewportChanged
				) {
					this.decorations = buildDecorations(update.view, getContext);
				}
			}
		},
		{
			decorations: (v) => v.decorations,
		}
	);
}
