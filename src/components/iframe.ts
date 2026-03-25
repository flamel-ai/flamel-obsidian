import type {ParsedComponent} from "../mdx/parser";
import type {RenderContext} from "../mdx/registry";

export function renderIframe(
	component: ParsedComponent,
	containerEl: HTMLElement,
	_ctx: RenderContext,
): void {
	const src = component.props.src ?? "";
	const title = component.props.title ?? "Embedded content";
	const height = component.props.height ?? "640";

	if (!src) return;

	const wrapper = containerEl.createDiv({cls: "flamel-mdx-iframe"});

	wrapper.createEl("iframe", {
		attr: {
			src,
			title,
			width: "100%",
			height,
			sandbox: "allow-scripts allow-same-origin allow-popups allow-forms",
			referrerpolicy: "strict-origin-when-cross-origin",
			loading: "lazy",
			allowfullscreen: "true",
			frameborder: "0",
		},
		cls: "flamel-mdx-iframe-el",
	});

	if (title && title !== "Embedded content") {
		wrapper.createDiv({cls: "flamel-mdx-iframe-title", text: title});
	}

	// Label showing the component source
	const label = wrapper.createDiv({cls: "flamel-mdx-component-label"});
	label.createSpan({text: "Iframe", cls: "flamel-mdx-component-label-name"});
	const displaySrc = src.length > 60 ? src.substring(0, 57) + "..." : src;
	label.createSpan({text: ` src="${displaySrc}"`, cls: "flamel-mdx-component-label-prop"});
}
