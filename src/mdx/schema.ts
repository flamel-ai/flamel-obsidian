export interface PropDef {
	type: "string";
	required?: boolean;
	default?: string;
	description?: string;
}

export interface ComponentDef {
	description: string;
	props: Record<string, PropDef>;
	children?: {description: string};
	validate?: (props: Record<string, string>, children: string | null) => string[];
}

export const componentSchema: Record<string, ComponentDef> = {
	VideoEmbed: {
		description: "Embeds a YouTube video with lazy-loading thumbnail",
		props: {
			id: {type: "string", required: true, description: "YouTube video ID"},
			title: {type: "string", default: "Video"},
		},
	},
	ThemedImage: {
		description: "Shows light/dark image based on current theme",
		props: {
			light: {type: "string", required: true, description: "Light theme image path"},
			dark: {type: "string", required: true, description: "Dark theme image path"},
			alt: {type: "string", default: ""},
			className: {type: "string"},
		},
	},
	Mermaid: {
		description: "Renders a Mermaid diagram",
		props: {
			chart: {type: "string", description: "Mermaid diagram syntax"},
		},
		children: {description: "Mermaid diagram syntax (alternative to chart prop)"},
		validate: (props, children) => {
			if (!props.chart && !children) {
				return ["missing 'chart' prop or children content"];
			}
			return [];
		},
	},
	Iframe: {
		description: "Embeds external content via iframe (e.g. Scribe walkthroughs)",
		props: {
			src: {type: "string", required: true, description: "URL to embed (must be HTTPS)"},
			title: {type: "string", default: "Embedded content", description: "Accessible title"},
			height: {type: "string", default: "640", description: "Height in pixels"},
		},
		validate: (props) => {
			const errors: string[] = [];
			if (props.src && !props.src.startsWith("https://")) {
				errors.push("src must be an HTTPS URL");
			}
			if (props.height && (!/^\d+$/.test(props.height) || parseInt(props.height) <= 0)) {
				errors.push("height must be a positive number");
			}
			return errors;
		},
	},
};

export function getComponentNames(): string[] {
	return Object.keys(componentSchema);
}

export function validateComponent(
	componentName: string,
	props: Record<string, string>,
	children: string | null,
): string[] {
	const def = componentSchema[componentName];
	if (!def) return [`Unknown component: ${componentName}`];

	const errors: string[] = [];

	// Check required props
	for (const [propName, propDef] of Object.entries(def.props)) {
		if (propDef.required && !props[propName]) {
			errors.push(`missing required '${propName}' prop`);
		}
	}

	// Run custom validation if defined
	if (def.validate) {
		errors.push(...def.validate(props, children));
	}

	return errors;
}

export function applyDefaults(
	componentName: string,
	props: Record<string, string>,
): Record<string, string> {
	const def = componentSchema[componentName];
	if (!def) return props;

	const result = {...props};
	for (const [propName, propDef] of Object.entries(def.props)) {
		if (result[propName] === undefined && propDef.default !== undefined) {
			result[propName] = propDef.default;
		}
	}
	return result;
}
