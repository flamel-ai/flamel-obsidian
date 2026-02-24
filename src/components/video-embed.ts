import type {ParsedComponent} from "../mdx/parser";
import type {RenderContext} from "../mdx/registry";

export function renderVideoEmbed(
	component: ParsedComponent,
	containerEl: HTMLElement,
	_ctx: RenderContext,
): void {
	const id = component.props.id ?? "";
	const title = component.props.title ?? "";

	if (!id) return;

	const wrapper = containerEl.createDiv({cls: "flamel-mdx-video-embed"});

	// Thumbnail preview with play button overlay
	const thumbnailUrl = `https://img.youtube.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg`;

	const thumbnail = wrapper.createDiv({cls: "flamel-mdx-video-thumbnail"});
	const img = thumbnail.createEl("img", {
		attr: {
			src: thumbnailUrl,
			alt: title || "Video thumbnail",
			loading: "lazy",
		},
	});
	img.addEventListener("error", () => {
		// Fallback to hqdefault if maxresdefault not available
		img.src = `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
	});

	// Static play button SVG — safe, not user-controlled
	const playButton = thumbnail.createDiv({cls: "flamel-mdx-video-play"});
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "68");
	svg.setAttribute("height", "48");
	svg.setAttribute("viewBox", "0 0 68 48");
	const bgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
	bgPath.setAttribute("d", "M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z");
	bgPath.setAttribute("fill", "red");
	const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
	arrowPath.setAttribute("d", "M45 24L27 14v20");
	arrowPath.setAttribute("fill", "white");
	svg.appendChild(bgPath);
	svg.appendChild(arrowPath);
	playButton.appendChild(svg);

	// Click to expand to iframe
	thumbnail.addEventListener("click", () => {
		wrapper.empty();
		const iframeContainer = wrapper.createDiv({cls: "flamel-mdx-video-iframe-container"});
		iframeContainer.createEl("iframe", {
			attr: {
				src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`,
				title: title || "Video",
				referrerpolicy: "strict-origin-when-cross-origin",
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
				allowfullscreen: "true",
				frameborder: "0",
			},
			cls: "flamel-mdx-video-iframe",
		});
	});

	if (title) {
		wrapper.createDiv({cls: "flamel-mdx-video-title", text: title});
	}

	// Label showing the component source
	const label = wrapper.createDiv({cls: "flamel-mdx-component-label"});
	label.createSpan({text: "VideoEmbed", cls: "flamel-mdx-component-label-name"});
	label.createSpan({text: ` id="${id}"`, cls: "flamel-mdx-component-label-prop"});
}
