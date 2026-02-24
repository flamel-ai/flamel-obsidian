import {MarkdownPostProcessorContext} from "obsidian";
import {parseComponents} from "./parser";
import {renderComponent, type RenderContext} from "./registry";

export function createMdxPostProcessor(getContext: () => RenderContext) {
	return (el: HTMLElement, _ctx: MarkdownPostProcessorContext): void => {
		try {
			const renderCtx = getContext();

			// Hide MDX import/export statements that appear as text
			hideMdxStatements(el);

			// Strategy 1: Check if the markdown renderer preserved JSX as HTML elements
			// (e.g., <ThemedImage> → <themedimage> in the DOM)
			if (processHtmlElements(el, renderCtx)) return;

			// Strategy 2: Check if the JSX ended up as text content
			// (e.g., within <p> tags or as plain text nodes)
			processTextContent(el, renderCtx);
		} catch (err) {
			console.error("[flamel-mdx] Post-processor error:", err);
		}
	};
}

function processHtmlElements(el: HTMLElement, ctx: RenderContext): boolean {
	const mapping: Record<string, string> = {
		videoembed: "VideoEmbed",
		themedimage: "ThemedImage",
		mermaid: "Mermaid",
	};

	let found = false;
	for (const [tagName, pascalName] of Object.entries(mapping)) {
		const elements = el.querySelectorAll(tagName);
		for (const element of Array.from(elements)) {
			const htmlEl = element as HTMLElement;
			const props: Record<string, string> = {};

			for (const attr of Array.from(htmlEl.attributes)) {
				props[attr.name] = attr.value;
			}

			const container = document.createElement("div");
			container.className = "flamel-mdx-component-wrapper";
			renderComponent(
				{
					name: pascalName,
					props,
					children: htmlEl.textContent || null,
					raw: htmlEl.outerHTML,
					start: 0,
					end: 0,
				},
				container,
				ctx,
			);
			htmlEl.replaceWith(container);
			found = true;
		}
	}
	return found;
}

function processTextContent(el: HTMLElement, ctx: RenderContext): void {
	// Scan all text-containing elements for component syntax
	const candidates = [el, ...Array.from(el.querySelectorAll("p, div, span, section"))];

	for (const candidate of candidates) {
		const htmlEl = candidate as HTMLElement;
		if (htmlEl.closest(".flamel-mdx-component-wrapper")) continue;
		if (htmlEl.querySelector(".flamel-mdx-component-wrapper")) continue;

		const text = htmlEl.textContent || "";
		const components = parseComponents(text);
		if (components.length === 0) continue;

		// If the entire element is a single component, replace it
		const firstComp = components[0];
		if (components.length === 1 && firstComp && firstComp.raw.trim() === text.trim()) {
			const container = document.createElement("div");
			container.className = "flamel-mdx-component-wrapper";
			renderComponent(firstComp, container, ctx);
			htmlEl.replaceWith(container);
			return;
		}

		// Mixed content: replace component portions
		replaceComponentsInElement(htmlEl, components, ctx);
		return;
	}
}

function replaceComponentsInElement(
	el: HTMLElement,
	components: ReturnType<typeof parseComponents>,
	ctx: RenderContext,
): void {
	const text = el.textContent || "";
	const fragment = document.createDocumentFragment();
	let lastIndex = 0;

	for (const comp of components) {
		if (comp.start > lastIndex) {
			const textBefore = text.substring(lastIndex, comp.start);
			if (textBefore.trim()) {
				const span = document.createElement("span");
				span.textContent = textBefore;
				fragment.appendChild(span);
			}
		}

		const container = document.createElement("div");
		container.className = "flamel-mdx-component-wrapper";
		renderComponent(comp, container, ctx);
		fragment.appendChild(container);

		lastIndex = comp.end;
	}

	if (lastIndex < text.length) {
		const remaining = text.substring(lastIndex);
		if (remaining.trim()) {
			const span = document.createElement("span");
			span.textContent = remaining;
			fragment.appendChild(span);
		}
	}

	el.replaceWith(fragment);
}

const MDX_STATEMENT_REGEX = /^(import\s+.*from\s+['"].*['"];?\s*|export\s+(default\s+)?.*$)/;

function hideMdxStatements(el: HTMLElement): void {
	const paragraphs = el.querySelectorAll("p");
	for (const p of Array.from(paragraphs)) {
		const text = (p.textContent || "").trim();
		if (MDX_STATEMENT_REGEX.test(text)) {
			(p as HTMLElement).classList.add("flamel-mdx-hidden");
		}
	}
}
