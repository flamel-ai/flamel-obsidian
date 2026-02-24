import type {ParsedComponent} from "../mdx/parser";
import type {RenderContext} from "../mdx/registry";

export function renderThemedImage(
	component: ParsedComponent,
	containerEl: HTMLElement,
	ctx: RenderContext,
): void {
	const light = component.props.light ?? "";
	const dark = component.props.dark ?? "";
	const alt = component.props.alt ?? "";
	const className = component.props.className ?? "";

	if (!light || !dark) return;

	const wrapper = containerEl.createDiv({cls: "flamel-mdx-themed-image"});

	const imageSrc = ctx.isDarkTheme ? dark : light;
	const resolvedSrc = resolveImagePath(imageSrc, ctx);

	const img = wrapper.createEl("img", {
		attr: {
			src: resolvedSrc,
			alt: alt || "Themed image",
			loading: "lazy",
		},
		cls: `flamel-mdx-themed-image-img ${className || ""}`.trim(),
	});

	img.addEventListener("error", () => {
		img.classList.add("flamel-mdx-hidden");
		const fallback = wrapper.createDiv({cls: "flamel-mdx-image-fallback"});
		fallback.createDiv({cls: "flamel-mdx-image-fallback-icon", text: "🖼️"});
		fallback.createDiv({
			cls: "flamel-mdx-image-fallback-text",
			text: `Image not found: ${imageSrc}`,
		});
	});

	// Theme indicator + label
	const label = wrapper.createDiv({cls: "flamel-mdx-component-label"});
	label.createSpan({text: "ThemedImage", cls: "flamel-mdx-component-label-name"});
	const themeIndicator = ctx.isDarkTheme ? "dark" : "light";
	label.createSpan({
		text: ` (showing ${themeIndicator})`,
		cls: "flamel-mdx-component-label-prop",
	});
}

function resolveImagePath(path: string, ctx: RenderContext): string {
	// If it's an absolute URL, use as-is
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	// Resolve vault-relative paths (e.g., "/docs/images/foo.webp")
	return ctx.resolveVaultPath(path);
}
