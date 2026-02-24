import {Editor, MarkdownView, Plugin} from "obsidian";
import {DEFAULT_SETTINGS, FlamelMdxSettings, FlamelMdxSettingTab} from "./settings";
import {registerComponent, type RenderContext} from "./mdx/registry";
import {renderVideoEmbed} from "./components/video-embed";
import {renderThemedImage} from "./components/themed-image";
import {renderMermaidDiagram} from "./components/mermaid-diagram";
import {createMdxPostProcessor} from "./mdx/post-processor";
import {createLivePreviewPlugin} from "./editor/live-preview";
import {registerFlamelIcon} from "./ui/flamel-icon";
import {ComponentPickerModal} from "./ui/component-picker";
import {ComponentInsertModal} from "./ui/insert-modal";

export default class FlamelMdxPlugin extends Plugin {
	settings: FlamelMdxSettings;

	async onload() {
		await this.loadSettings();
		console.log("[flamel-mdx] Plugin loading...");

		try {
			this.registerExtensions(["mdx"], "markdown");
			console.log("[flamel-mdx] Registered .mdx extension");
		} catch (err) {
			console.error("[flamel-mdx] Failed to register .mdx extension:", err);
		}

		registerComponent("VideoEmbed", renderVideoEmbed);
		registerComponent("ThemedImage", renderThemedImage);
		registerComponent("Mermaid", renderMermaidDiagram);
		console.log("[flamel-mdx] Registered component renderers");

		try {
			this.registerMarkdownPostProcessor(
				createMdxPostProcessor(() => this.getRenderContext())
			);
			console.log("[flamel-mdx] Registered post-processor");
		} catch (err) {
			console.error("[flamel-mdx] Failed to register post-processor:", err);
		}

		try {
			this.registerEditorExtension(
				createLivePreviewPlugin(() => this.getRenderContext())
			);
			console.log("[flamel-mdx] Registered live preview extension");
		} catch (err) {
			console.error("[flamel-mdx] Failed to register live preview:", err);
		}

		this.addSettingTab(new FlamelMdxSettingTab(this.app, this));

		// Custom icon + ribbon
		registerFlamelIcon();
		this.addRibbonIcon("flamel-flame", "Insert MDX Component", () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				new ComponentPickerModal(this.app, view.editor).open();
			}
		});

		// Commands
		this.addCommand({
			id: "insert-mdx-component",
			name: "Insert MDX component",
			editorCallback: (editor: Editor) => {
				new ComponentPickerModal(this.app, editor).open();
			},
		});

		this.addCommand({
			id: "insert-themed-image",
			name: "Insert ThemedImage",
			editorCallback: (editor: Editor) => {
				new ComponentInsertModal(this.app, "ThemedImage", editor).open();
			},
		});

		this.addCommand({
			id: "insert-video-embed",
			name: "Insert VideoEmbed",
			editorCallback: (editor: Editor) => {
				new ComponentInsertModal(this.app, "VideoEmbed", editor).open();
			},
		});

		this.addCommand({
			id: "insert-mermaid",
			name: "Insert Mermaid",
			editorCallback: (editor: Editor) => {
				new ComponentInsertModal(this.app, "Mermaid", editor).open();
			},
		});

		console.log("[flamel-mdx] Plugin loaded successfully");
	}

	onunload() {
		// Cleanup handled by Obsidian's register* helpers
	}

	getRenderContext(): RenderContext {
		const adapter = this.app.vault.adapter;
		return {
			isDarkTheme: document.body.classList.contains("theme-dark"),
			vaultBasePath: this.settings.vaultBasePath,
			resolveVaultPath: (path: string) => {
				// Paths like "/docs/images/foo.webp" → resolve to vault resource URI
				const vaultPath = path.startsWith("/") ? path.slice(1) : path;
				return adapter.getResourcePath(vaultPath);
			},
		};
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<FlamelMdxSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
