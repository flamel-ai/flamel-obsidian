import type {ParsedComponent} from "./parser";
import {applyDefaults, validateComponent} from "./schema";

export type ComponentRenderer = (
	component: ParsedComponent,
	containerEl: HTMLElement,
	ctx: RenderContext,
) => void;

export interface RenderContext {
	isDarkTheme: boolean;
	vaultBasePath: string;
	resolveVaultPath: (path: string) => string;
}

const renderers = new Map<string, ComponentRenderer>();

export function registerComponent(name: string, renderer: ComponentRenderer): void {
	renderers.set(name, renderer);
}

export function getRenderer(name: string): ComponentRenderer | undefined {
	return renderers.get(name);
}

export function renderComponent(
	component: ParsedComponent,
	containerEl: HTMLElement,
	ctx: RenderContext,
): boolean {
	const renderer = renderers.get(component.name);
	if (!renderer) return false;

	// Validate props against schema
	const errors = validateComponent(component.name, component.props, component.children);
	if (errors.length) {
		renderError(containerEl, `${component.name}: ${errors.join(", ")}`);
		return true;
	}

	// Apply defaults before rendering
	component.props = applyDefaults(component.name, component.props);

	renderer(component, containerEl, ctx);
	return true;
}

export function renderError(containerEl: HTMLElement, message: string): void {
	const el = containerEl.createDiv({cls: "flamel-mdx-error"});
	el.setText(message);
}
