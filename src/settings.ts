import {App, PluginSettingTab, Setting} from "obsidian";
import type FlamelMdxPlugin from "./main";

export interface FlamelMdxSettings {
	vaultBasePath: string;
	enableLivePreview: boolean;
}

export const DEFAULT_SETTINGS: FlamelMdxSettings = {
	vaultBasePath: "",
	enableLivePreview: true,
};

export class FlamelMdxSettingTab extends PluginSettingTab {
	plugin: FlamelMdxPlugin;

	constructor(app: App, plugin: FlamelMdxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl("h2", {text: "Flamel MDX"});

		new Setting(containerEl)
			.setName("Image base path")
			.setDesc(
				"Base URL for resolving image paths in ThemedImage components. " +
				"Leave empty to use paths as-is. Example: https://flamel.ai"
			)
			.addText(text => text
				.setPlaceholder("https://example.com")
				.setValue(this.plugin.settings.vaultBasePath)
				.onChange(async (value) => {
					this.plugin.settings.vaultBasePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Live preview")
			.setDesc("Show inline component previews in edit mode (live preview).")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLivePreview)
				.onChange(async (value) => {
					this.plugin.settings.enableLivePreview = value;
					await this.plugin.saveSettings();
				}));
	}
}
