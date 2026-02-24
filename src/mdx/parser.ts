import {getComponentNames} from "./schema";

export interface ParsedComponent {
	name: string;
	props: Record<string, string>;
	children: string | null;
	raw: string;
	start: number;
	end: number;
}

/**
 * Build a regex that matches self-closing or open+close JSX tags for known components.
 * Handles multiline props.
 */
function buildComponentRegex(): RegExp {
	const names = getComponentNames().join("|");
	// Match self-closing: <Name prop="val" />
	// Match open+close: <Name prop="val">children</Name>
	// Use [\s\S] for multiline matching
	return new RegExp(
		`<(${names})((?:\\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|\\{[^}]*\\}))?)*\\s*)\\/>` +
		`|` +
		`<(${names})((?:\\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|\\{[^}]*\\}))?)*\\s*)>([\\s\\S]*?)<\\/\\3>`,
		"g"
	);
}

function parseProps(propsString: string): Record<string, string> {
	const props: Record<string, string> = {};
	// Match prop="value", prop='value', prop={value}, or bare prop
	const propRegex = /([a-zA-Z][a-zA-Z0-9-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
	let match;
	while ((match = propRegex.exec(propsString)) !== null) {
		const key = match[1] ?? "";
		if (!key) continue;
		const value = match[2] ?? match[3] ?? match[4] ?? "true";
		props[key] = value;
	}
	return props;
}

export function parseComponents(text: string): ParsedComponent[] {
	const regex = buildComponentRegex();
	const results: ParsedComponent[] = [];
	let match;

	while ((match = regex.exec(text)) !== null) {
		const isSelfClosing = match[1] !== undefined;

		if (isSelfClosing) {
			const name = match[1];
			if (!name) continue;
			results.push({
				name,
				props: parseProps(match[2] || ""),
				children: null,
				raw: match[0],
				start: match.index,
				end: match.index + match[0].length,
			});
		} else {
			const name = match[3];
			if (!name) continue;
			results.push({
				name,
				props: parseProps(match[4] || ""),
				children: match[5] || null,
				raw: match[0],
				start: match.index,
				end: match.index + match[0].length,
			});
		}
	}

	return results;
}

export function isComponentTag(text: string): boolean {
	const trimmed = text.trim();
	return getComponentNames().some(
		name => trimmed.startsWith(`<${name}`) && (trimmed.endsWith("/>") || trimmed.endsWith(`</${name}>`))
	);
}
