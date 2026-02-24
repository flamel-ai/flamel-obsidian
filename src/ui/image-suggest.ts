import {App, FuzzySuggestModal, TFile} from "obsidian";

const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg", "gif", "svg", "avif"];

export class ImageSuggestModal extends FuzzySuggestModal<TFile> {
	private onChoose: (path: string) => void;

	constructor(app: App, onChoose: (path: string) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder("Search for an image...");
	}

	getItems(): TFile[] {
		return this.app.vault.getFiles().filter(f =>
			IMAGE_EXTENSIONS.includes(f.extension.toLowerCase())
		);
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	onChooseItem(item: TFile): void {
		// Return vault-relative path with leading /
		const path = item.path.startsWith("/") ? item.path : `/${item.path}`;
		this.onChoose(path);
	}
}
