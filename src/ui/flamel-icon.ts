import {addIcon} from "obsidian";

// Flamel flame SVG — gradient paths scaled to 100x100 viewBox for Obsidian icons
const FLAMEL_FLAME_SVG = `<defs>
<linearGradient id="ff1" x1="44.9" x2="44.9" y1="11.4" y2="88.6" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ec9128"/><stop offset=".81" stop-color="#ee4544"/><stop offset="1" stop-color="#ec4780"/>
</linearGradient>
<linearGradient id="ff2" x1="65.2" x2="65.2" y1="41.2" y2="87.7" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ec9128"/><stop offset=".81" stop-color="#ee4544"/><stop offset="1" stop-color="#ec4780"/>
</linearGradient>
</defs>
<path fill="url(#ff1)" d="M31 30.9c-.6 2-1 3.9-.8 5.8 0 1.5.3 3 .8 4.4.9 2.2 2.4 3.7 4.6 4.4 3.1 1 6.1.9 9.1-.3 3.4-1.4 5.4-4.1 6.5-7.6 1.5-5 1.1-10-.3-14.9-1-3.6-2.5-6.9-4.9-9.7-.4-.6-1-1-1.4-1.6 1.2.4 2.3 1 3.3 1.6 3.3 1.9 6.5 4.1 9.2 6.9 4.7 4.7 8 10.2 8.9 16.9.7 4.4.1 8.6-1.1 12.8-1.8 5.8-4.5 11-8.3 15.7-1.9 2.3-3.5 4.8-4.8 7.5-.9 2.1-1.5 4.4-1.6 6.7-.2 2.9.3 5.6 1 8.3.1.2.3.5.1.7-.2.2-.5 0-.7 0-6.3-2.2-12.2-5.1-17.3-9.3-2.5-2.1-4.7-4.5-6.4-7.3-1.9-3-2.8-6.3-3.2-9.8-1.1-9.1.9-17.6 4.5-25.9.7-1.6 1.4-3.1 2.3-4.5.1-.2.2-.5.5-.7z"/>
<path fill="url(#ff2)" d="M69.4 41.2c.9 1 1.6 2.3 2.3 3.5 2.2 4 3.9 8.3 4.6 12.8 1.1 7.5-1 13.9-6.5 19.1-2 1.9-4.3 3.3-6.4 4.9-2.7 1.9-5.5 3.7-7.9 6-.4.3-.5.1-.6-.2-1.1-3.3-1.3-6.6-.2-10 1.3-3.9 3.4-7.4 6.1-10.5 3.7-4.5 6-9.7 7.6-15.2.8-2.8 1.4-5.6 1.3-8.5 0-.7-.1-1.3-.2-1.9z"/>`;

export function registerFlamelIcon(): void {
	addIcon("flamel-flame", FLAMEL_FLAME_SVG);
}
