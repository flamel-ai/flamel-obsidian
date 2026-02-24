import {App, Editor, FuzzySuggestModal} from "obsidian";
import {componentSchema} from "../mdx/schema";
import {ComponentInsertModal} from "./insert-modal";

interface ComponentChoice {
	name: string;
	description: string;
}

export class ComponentPickerModal extends FuzzySuggestModal<ComponentChoice> {
	private editor: Editor;

	constructor(app: App, editor: Editor) {
		super(app);
		this.editor = editor;
		this.setPlaceholder("Pick a component to insert...");
	}

	getItems(): ComponentChoice[] {
		return Object.entries(componentSchema).map(([name, def]) => ({
			name,
			description: def.description,
		}));
	}

	getItemText(item: ComponentChoice): string {
		return `${item.name} — ${item.description}`;
	}

	onChooseItem(item: ComponentChoice): void {
		new ComponentInsertModal(this.app, item.name, this.editor).open();
	}
}
