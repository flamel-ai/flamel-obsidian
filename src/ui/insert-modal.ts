import {App, Editor, Modal, Notice, Setting} from "obsidian";
import {componentSchema, validateComponent} from "../mdx/schema";
import {ImageSuggestModal} from "./image-suggest";

const IMAGE_PROPS = new Set(["light", "dark"]);

export class ComponentInsertModal extends Modal {
	private componentName: string;
	private editor: Editor;
	private values: Record<string, string> = {};
	private childrenValue = "";

	constructor(app: App, componentName: string, editor: Editor) {
		super(app);
		this.componentName = componentName;
		this.editor = editor;
	}

	onOpen(): void {
		const {contentEl} = this;
		const def = componentSchema[this.componentName];
		if (!def) return;

		contentEl.addClass("flamel-mdx-modal");
		this.setTitle(`Insert ${this.componentName}`);

		// Prop fields
		for (const [propName, propDef] of Object.entries(def.props)) {
			const isImageProp = this.componentName === "ThemedImage" && IMAGE_PROPS.has(propName);
			const label = propDef.required ? `${propName} *` : propName;

			const setting = new Setting(contentEl)
				.setName(label)
				.setDesc(propDef.description || "");

			if (propName === "chart") {
				// Mermaid chart gets a textarea
				setting.addTextArea(ta => {
					ta.setPlaceholder(propDef.description || "")
						.setValue(propDef.default || "")
						.onChange(v => { this.values[propName] = v; });
					ta.inputEl.rows = 6;
					ta.inputEl.classList.add("flamel-mdx-modal-textarea");
				});
			} else {
				setting.addText(text => {
					text.setPlaceholder(propDef.description || "")
						.setValue(propDef.default || "")
						.onChange(v => { this.values[propName] = v; });
					if (propDef.default) {
						this.values[propName] = propDef.default;
					}
				});

				if (isImageProp) {
					setting.addExtraButton(btn => {
						btn.setIcon("folder-open")
							.setTooltip("Browse images")
							.onClick(() => {
								new ImageSuggestModal(this.app, (path) => {
									this.values[propName] = path;
									// Update the text input to reflect the chosen path
									const input = setting.controlEl.querySelector("input");
									if (input) input.value = path;
								}).open();
							});
					});
				}
			}
		}

		// Children field (for Mermaid)
		if (def.children) {
			new Setting(contentEl)
				.setName("Content (children)")
				.setDesc(def.children.description)
				.addTextArea(ta => {
					ta.setPlaceholder("Enter content...")
						.onChange(v => { this.childrenValue = v; });
					ta.inputEl.rows = 6;
					ta.inputEl.classList.add("flamel-mdx-modal-textarea");
				});
		}

		// Insert button
		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText("Insert")
					.setCta()
					.onClick(() => this.handleInsert());
			});
	}

	private handleInsert(): void {
		const errors = validateComponent(
			this.componentName,
			this.values,
			this.childrenValue || null,
		);
		if (errors.length > 0) {
			new Notice(`Validation: ${errors.join(", ")}`);
			return;
		}

		const jsx = this.buildJsx();
		this.editor.replaceSelection(jsx);
		this.close();
	}

	private buildJsx(): string {
		const props = Object.entries(this.values)
			.filter(([, v]) => v && v.length > 0)
			.map(([k, v]) => `  ${k}="${v}"`)
			.join("\n");

		if (this.childrenValue) {
			return `<${this.componentName}\n${props}\n>\n${this.childrenValue}\n</${this.componentName}>`;
		}

		return `<${this.componentName}\n${props}\n/>`;
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
