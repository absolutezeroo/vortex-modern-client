import type {IWindowParser} from './IWindowParser';
import type {IWindow} from '../IWindow';
import type {IStaticBitmapWrapperWindow} from '../components/IStaticBitmapWrapperWindow';
import type {BoxSizerController} from '../components/BoxSizerController';
import {PropertyStruct} from './PropertyStruct';
import {WindowType, TYPE_CODE_TO_NAME, TYPE_NAME_TO_CODE} from '../enum/WindowType';
import {PARAM_NAME_TO_FLAG, WindowParam} from '../enum/WindowParam';

type XmlLayoutInput = string | Document | Element;

interface IParsedVar
{
	key: string;
	value: unknown;
}

/**
 * XML window parser.
 *
 * Faithful AS3-oriented implementation of `WindowParser`.
 * Parses XML layouts and builds a window tree through `WindowContext.create`.
 *
 * @see sources/win63_version/core/window/utils/WindowParser.as
 */
export class WindowParser implements IWindowParser
{
	/**
	 * Localization resolver callback.
	 *
	 * When set, `${key}` tokens in captions and string properties
	 * are resolved through this function.
	 */
	public static localizationResolver: ((key: string) => string | null) | null = null;

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	public parseAndConstruct(layout: XmlLayoutInput, parent: IWindow, namedWindows: Map<string, IWindow> | null): IWindow | null
	{
		const root = this.resolveLayoutRoot(layout);

		if (!root)
		{
			return null;
		}

		const sharedVars = new Map<string, unknown>();

		if (root.nodeName === 'layout')
		{
			const variablesNode = getDirectChildByName(root, 'variables');

			if (variablesNode)
			{
				const vars = this.parseSharedVariables(variablesNode);

				for (const [key, value] of vars)
				{
					sharedVars.set(key, value);
				}
			}

			const filtersNode = getDirectChildByName(root, 'filters');

			if (filtersNode)
			{
				const filters = this.parseFilters(filtersNode, sharedVars);

				if (filters.length > 0)
				{
					parent.filters = filters;
				}
			}

			const windowNodes = getDirectChildrenByName(root, 'window');
			const rootChildren = windowNodes.length > 0
				? windowNodes
				: getDirectChildElements(root).filter((node) =>
				{
					const nodeName = node.nodeName;

					return nodeName !== 'variables' && nodeName !== 'filters';
				});

			if (rootChildren.length === 0)
			{
				return null;
			}

			if (rootChildren.length === 1)
			{
				return rootChildren[0].nodeName === 'window'
					? this.parseAndConstruct(rootChildren[0], parent, namedWindows)
					: this.parseWindowNodes(rootChildren, parent, sharedVars, namedWindows);
			}

			return this.parseWindowNodes(rootChildren, parent, sharedVars, namedWindows);
		}

		if (root.nodeName === 'window')
		{
			const children = getDirectChildElements(root).filter((node) =>
			{
				const nodeName = node.nodeName;

				return nodeName !== 'variables' && nodeName !== 'filters';
			});

			if (children.length === 0)
			{
				return null;
			}

			return this.parseWindowNodes(children, parent, sharedVars, namedWindows);
		}

		return this.parseSingleWindowEntity(root, parent, sharedVars, namedWindows);
	}

	private parseWindowNodes(
		nodes: Element[],
		parent: IWindow,
		sharedVars: Map<string, unknown>,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		let last: IWindow | null = null;

		for (const node of nodes)
		{
			if (node.nodeName === 'children')
			{
				for (const child of getDirectChildElements(node))
				{
					const created = this.parseSingleWindowEntity(child, parent, sharedVars, namedWindows);

					if (created)
					{
						last = created;
					}
				}

				continue;
			}

			if (node.nodeName === 'window')
			{
				const created = this.parseAndConstruct(node, parent, namedWindows);

				if (created)
				{
					last = created;
				}

				continue;
			}

			const created = this.parseSingleWindowEntity(node, parent, sharedVars, namedWindows);

			if (created)
			{
				last = created;
			}
		}

		return last;
	}

	public windowToXMLString(window: IWindow): string
	{
		const typeName = TYPE_CODE_TO_NAME[window.type] ?? 'null';
		let xml = '';

		xml += `<${typeName}`;
		xml += ` x="${window.x}"`;
		xml += ` y="${window.y}"`;
		xml += ` width="${window.width}"`;
		xml += ` height="${window.height}"`;
		xml += ` params="${window.param}"`;
		xml += ` style="${window.style}"`;

		if (window.dynamicStyle)
		{
			xml += ` dynamic_style="${escapeXml(window.dynamicStyle)}"`;
		}

		if (window.name)
		{
			xml += ` name="${escapeXml(window.name)}"`;
		}

		if (window.caption)
		{
			xml += ` caption="${escapeXml(window.caption)}"`;
		}

		if (window.id !== 0)
		{
			xml += ` id="${window.id}"`;
		}

		if (window.color !== 0x00FFFFFF)
		{
			xml += ` color="0x${window.alpha.toString(16)}${window.color.toString(16)}"`;
		}

		if (window.blend !== 1)
		{
			xml += ` blend="${window.blend}"`;
		}

		if (!window.visible)
		{
			xml += ` visible="${window.visible}"`;
		}

		if (!window.clipping)
		{
			xml += ` clipping="${window.clipping}"`;
		}

		if (window.background)
		{
			xml += ` background="${window.background}"`;
		}

		if (window.mouseThreshold !== 10)
		{
			xml += ` treshold="${window.mouseThreshold}"`;
		}

		if (window.tags.length > 0)
		{
			xml += ` tags="${escapeXml(window.tags.join(','))}"`;
		}

		if (window.limits.minWidth > -2147483648)
		{
			xml += ` width_min="${window.limits.minWidth}"`;
		}

		if (window.limits.maxWidth < 2147483647)
		{
			xml += ` width_max="${window.limits.maxWidth}"`;
		}

		if (window.limits.minHeight > -2147483648)
		{
			xml += ` height_min="${window.limits.minHeight}"`;
		}

		if (window.limits.maxHeight < 2147483647)
		{
			xml += ` height_max="${window.limits.maxHeight}"`;
		}

		xml += '>\r';

		if (window.filters && window.filters.length > 0)
		{
			xml += '\t<filters>\r';

			for (const filter of window.filters)
			{
				const serialized = this.filterToXMLString(filter);

				if (serialized)
				{
					xml += `\t\t${serialized}\r`;
				}
			}

			xml += '\t</filters>\r';
		}

		const childrenXml = this.serializeChildren(window);

		if (childrenXml.length > 0)
		{
			xml += `\t<children>\r${childrenXml}\t</children>\r`;
		}

		return `${xml}</${typeName}>\r`;
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
		}
	}

	private parseSingleWindowEntity(
		node: Element,
		parent: IWindow,
		sharedVars: Map<string, unknown>,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		const resolvedType = TYPE_NAME_TO_CODE[node.nodeName];
		const typeId = resolvedType !== undefined ? resolvedType : WindowType.NULL;
		const defaultStyle = parent ? parent.style : 0;

		const name = decodeEscaped(String(this.parseAttribute(node, 'name', sharedVars, '')));
		const style = parseInteger(this.parseAttribute(node, 'style', sharedVars, String(defaultStyle)));
		const dynamicStyle = String(this.parseAttribute(node, 'dynamic_style', sharedVars, ''));
		let param = parseInteger(this.parseAttribute(node, 'params', sharedVars, '0'));
		let tagsText = decodeEscaped(String(this.parseAttribute(node, 'tags', sharedVars, '')));
		const x = parseNumber(this.parseAttribute(node, 'x', sharedVars, '0'));
		const y = parseNumber(this.parseAttribute(node, 'y', sharedVars, '0'));
		const width = parseNumber(this.parseAttribute(node, 'width', sharedVars, '0'));
		const height = parseNumber(this.parseAttribute(node, 'height', sharedVars, '0'));
		const visible = String(this.parseAttribute(node, 'visible', sharedVars, 'true')) === 'true';
		const id = parseInteger(this.parseAttribute(node, 'id', sharedVars, '0'));

		const paramsNode = getDirectChildByName(node, 'params');

		if (paramsNode)
		{
			for (const paramNode of getDirectChildElements(paramsNode))
			{
				const paramName = String(this.parseAttribute(paramNode, 'name', sharedVars, '')).toLowerCase();
				const mappedParam = PARAM_NAME_TO_FLAG[paramName];

				if (mappedParam === undefined)
				{
					throw new Error(`Unknown window parameter "${paramName}"!`);
				}

				param |= mappedParam;
			}
		}

		let caption = '';

		if ((param & WindowParam.INHERIT_CAPTION) !== 0)
		{
			caption = parent ? parent.caption : '';
		}

		caption = decodeEscaped(String(this.parseAttribute(node, 'caption', sharedVars, caption)));
		caption = resolveLocalizationTokens(caption);

		let tags: string[] | null = null;

		if (tagsText !== '')
		{
			tags = tagsText.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
		}

		const variablesNode = getDirectChildByName(node, 'variables');
		const properties = this.parseProperties(variablesNode, sharedVars);

		const window = parent.context.create(
			name,
			'',
			typeId,
			style,
			param,
			{x, y, width, height},
			null,
			parent,
			id,
			tags,
			dynamicStyle,
			properties
		);

		if (!window)
		{
			return null;
		}

		if (this.hasAttribute(node, 'width_min'))
		{
			window.limits.minWidth = parseInteger(this.parseAttribute(node, 'width_min', sharedVars, String(window.limits.minWidth)));
		}

		if (this.hasAttribute(node, 'width_max'))
		{
			window.limits.maxWidth = parseInteger(this.parseAttribute(node, 'width_max', sharedVars, String(window.limits.maxWidth)));
		}

		if (this.hasAttribute(node, 'height_min'))
		{
			window.limits.minHeight = parseInteger(this.parseAttribute(node, 'height_min', sharedVars, String(window.limits.minHeight)));
		}

		if (this.hasAttribute(node, 'height_max'))
		{
			window.limits.maxHeight = parseInteger(this.parseAttribute(node, 'height_max', sharedVars, String(window.limits.maxHeight)));
		}

		const limitFn = (window.limits as unknown as { limit?: () => void }).limit;

		if (typeof limitFn === 'function')
		{
			limitFn.call(window.limits);
		}

		const background = String(this.parseAttribute(node, 'background', sharedVars, String(window.background))) === 'true';
		const blend = parseNumber(this.parseAttribute(node, 'blend', sharedVars, String(window.blend)));
		const clipping = String(this.parseAttribute(node, 'clipping', sharedVars, String(window.clipping))) === 'true';
		const colorRaw = String(this.parseAttribute(node, 'color', sharedVars, String(window.color)));
		const threshold = parseInteger(this.parseAttribute(node, 'treshold', sharedVars, String(window.mouseThreshold)));

		if (window.caption !== caption)
		{
			window.caption = caption;
		}

		if (window.blend !== blend)
		{
			window.blend = blend;
		}

		if (window.visible !== visible)
		{
			window.visible = visible;
		}

		if (window.clipping !== clipping)
		{
			window.clipping = clipping;
		}

		if (window.background !== background)
		{
			window.background = background;
		}

		if (window.mouseThreshold !== threshold)
		{
			window.mouseThreshold = threshold;
		}

		const color = parseColor(colorRaw);

		if (window.color !== color)
		{
			window.color = color;
		}

		const filtersNode = getDirectChildByName(node, 'filters');

		if (filtersNode)
		{
			const filters = this.parseFilters(filtersNode, sharedVars);

			if (filters.length > 0)
			{
				window.filters = filters;
			}
		}

		if (window.type === WindowType.STATIC_BITMAP_WRAPPER)
		{
			let assetUri: string | null = null;

			for (const property of properties)
			{
				if (property.key === 'asset_uri' && typeof property.value === 'string')
				{
					assetUri = property.value;
					break;
				}
			}

			if (!assetUri && name)
			{
				assetUri = `${name}_normal`;
			}

			if (assetUri)
			{
				(window as unknown as IStaticBitmapWrapperWindow).assetUri = assetUri;
			}
		}

		if (namedWindows && name)
		{
			namedWindows.set(name, window);
		}

		const childrenNode = getDirectChildByName(node, 'children');

		if (childrenNode)
		{
			const childNodes = getDirectChildElements(childrenNode);
			const target = window.getLayoutChildTarget();
			const boxSizer = window as unknown as BoxSizerController;
			const isBoxSizer = typeof boxSizer.setAutoRearrange === 'function';
			const isItemList = typeof (window as unknown as { arrangeItems: () => void }).arrangeItems === 'function';

			if (isBoxSizer)
			{
				boxSizer.setAutoRearrange(false);
			}

			for (const childNode of childNodes)
			{
				this.parseSingleWindowEntity(childNode, target, sharedVars, namedWindows);
			}

			if (isBoxSizer)
			{
				boxSizer.setAutoRearrange(true);
			}

			if (isItemList)
			{
				(window as unknown as { arrangeItems: () => void }).arrangeItems();
			}
		}

		return window;
	}

	private resolveLayoutRoot(layout: XmlLayoutInput): Element | null
	{
		if (layout instanceof Element)
		{
			return layout;
		}

		if (layout instanceof Document)
		{
			return layout.documentElement;
		}

		try
		{
			const doc = new DOMParser().parseFromString(layout, 'text/xml');
			const parserError = doc.getElementsByTagName('parsererror');

			if (parserError.length > 0)
			{
				throw new Error(parserError[0].textContent ?? 'Failed to parse XML');
			}

			return doc.documentElement;
		}
		catch (error)
		{
			throw new Error(`WindowParser failed to parse XML layout: ${String(error)}`);
		}
	}

	private parseSharedVariables(variablesNode: Element): Map<string, unknown>
	{
		const map = new Map<string, unknown>();

		for (const varNode of getDirectChildrenByName(variablesNode, 'var'))
		{
			const parsed = this.parseVarNode(varNode, map);

			if (parsed.key.length > 0)
			{
				map.set(parsed.key, parsed.value);
			}
		}

		return map;
	}

	private parseProperties(variablesNode: Element | null, sharedVars: Map<string, unknown>): PropertyStruct[]
	{
		if (!variablesNode)
		{
			return [];
		}

		const properties: PropertyStruct[] = [];

		for (const varNode of getDirectChildrenByName(variablesNode, 'var'))
		{
			const parsed = this.parseVarNode(varNode, sharedVars);

			if (parsed.key.length > 0)
			{
				properties.push(new PropertyStruct(parsed.key, parsed.value));
			}
		}

		return properties;
	}

	private parseVarNode(node: Element, sharedVars: Map<string, unknown>): IParsedVar
	{
		const key = node.getAttribute('key') ?? node.getAttribute('name') ?? '';
		const type = node.getAttribute('type') ?? '';
		let value: unknown = node.getAttribute('value');
		const children = getDirectChildElements(node);

		if ((value === null || value === undefined || value === '') && children.length > 0)
		{
			let valueNode: Element | null = children[0];

			if (valueNode && valueNode.nodeName === 'value')
			{
				const wrapped = getDirectChildElements(valueNode);
				valueNode = wrapped.length > 0 ? wrapped[0] : null;
			}

			if (valueNode)
			{
				switch (valueNode.nodeName)
				{
					case 'Point':
						value = this.parsePoint(valueNode);
						break;
					case 'Rectangle':
						value = this.parseRectangle(valueNode);
						break;
					case 'Array':
						value = getDirectChildrenByName(valueNode, 'var').map((child) => this.parseVarNode(child, sharedVars).value);
						break;
					case 'Map':
					{
						const mapped: Record<string, unknown> = {};

						for (const child of getDirectChildrenByName(valueNode, 'var'))
						{
							const parsed = this.parseVarNode(child, sharedVars);
							mapped[parsed.key] = parsed.value;
						}

						value = mapped;
						break;
					}
				}
			}
		}

		if (typeof value === 'string' && value.startsWith('$'))
		{
			const resolved = sharedVars.get(value.slice(1));

			if (resolved !== undefined)
			{
				value = resolved;
			}
		}

		return {
			key,
			value: castValue(value, type)
		};
	}

	private parsePoint(node: Element): { x: number; y: number }
	{
		return {
			x: parseNumber(node.getAttribute('x')),
			y: parseNumber(node.getAttribute('y'))
		};
	}

	private parseRectangle(node: Element): { x: number; y: number; width: number; height: number }
	{
		return {
			x: parseNumber(node.getAttribute('x')),
			y: parseNumber(node.getAttribute('y')),
			width: parseNumber(node.getAttribute('width')),
			height: parseNumber(node.getAttribute('height'))
		};
	}

	private parseFilters(filtersNode: Element, sharedVars: Map<string, unknown>): Record<string, unknown>[]
	{
		const filters: Record<string, unknown>[] = [];

		for (const filterNode of getDirectChildElements(filtersNode))
		{
			const built = this.buildBitmapFilter(filterNode, sharedVars);

			if (built)
			{
				filters.push(built);
			}
		}

		return filters;
	}

	private buildBitmapFilter(filterNode: Element, sharedVars: Map<string, unknown>): Record<string, unknown> | null
	{
		if (filterNode.nodeName !== 'DropShadowFilter')
		{
			return null;
		}

		return {
			type: 'DropShadowFilter',
			distance: parseNumber(this.parseAttribute(filterNode, 'distance', sharedVars, '0')),
			angle: parseNumber(this.parseAttribute(filterNode, 'angle', sharedVars, '45')),
			color: parseColor(String(this.parseAttribute(filterNode, 'color', sharedVars, '0'))),
			alpha: parseNumber(this.parseAttribute(filterNode, 'alpha', sharedVars, '1')),
			blurX: parseNumber(this.parseAttribute(filterNode, 'blurX', sharedVars, '0')),
			blurY: parseNumber(this.parseAttribute(filterNode, 'blurY', sharedVars, '0')),
			strength: parseNumber(this.parseAttribute(filterNode, 'strength', sharedVars, '1')),
			quality: parseInteger(this.parseAttribute(filterNode, 'quality', sharedVars, '1')),
			inner: String(this.parseAttribute(filterNode, 'inner', sharedVars, 'false')) === 'true',
			knockout: String(this.parseAttribute(filterNode, 'knockout', sharedVars, 'false')) === 'true',
			hideObject: String(this.parseAttribute(filterNode, 'hideObject', sharedVars, 'false')) === 'true'
		};
	}

	private filterToXMLString(filter: unknown): string
	{
		if (!filter || typeof filter !== 'object')
		{
			return '';
		}

		const data = filter as Record<string, unknown>;

		if (data.type !== 'DropShadowFilter')
		{
			return '';
		}

		let xml = '<DropShadowFilter';
		xml += data.distance !== 0 ? ` distance="${data.distance}"` : '';
		xml += data.angle !== 45 ? ` angle="${data.angle}"` : '';
		xml += data.color !== 0 ? ` color="${data.color}"` : '';
		xml += data.alpha !== 1 ? ` alpha="${data.alpha}"` : '';
		xml += data.blurX !== 0 ? ` blurX="${data.blurX}"` : '';
		xml += data.blurY !== 0 ? ` blurY="${data.blurY}"` : '';
		xml += data.strength !== 1 ? ` strength="${data.strength}"` : '';
		xml += data.quality !== 1 ? ` quality="${data.quality}"` : '';
		xml += data.inner === true ? ` inner="${data.inner}"` : '';
		xml += data.knockout === true ? ` knockout="${data.knockout}"` : '';
		xml += data.hideObject === true ? ` hideObject="${data.hideObject}"` : '';
		xml += ' />';

		return xml;
	}

	private serializeChildren(window: IWindow): string
	{
		const container = window as unknown as { numChildren?: number; getChildAt?: (index: number) => IWindow | null };

		if (typeof container.numChildren !== 'number' || typeof container.getChildAt !== 'function' || container.numChildren <= 0)
		{
			return '';
		}

		let xml = '';

		for (let i = 0; i < container.numChildren; i++)
		{
			const child = container.getChildAt(i);

			if (!child)
			{
				continue;
			}

			if (child.tags.indexOf('_EXCLUDE') !== -1)
			{
				continue;
			}

			xml += this.windowToXMLString(child);
		}

		return xml;
	}

	private parseAttribute(
		node: Element,
		name: string,
		sharedVars: Map<string, unknown>,
		defaultValue: unknown
	): unknown
	{
		if (!node.hasAttribute(name))
		{
			return defaultValue;
		}

		const raw = node.getAttribute(name);

		if (raw === null)
		{
			return defaultValue;
		}

		if (raw.startsWith('$'))
		{
			const key = raw.slice(1);
			const resolved = sharedVars.get(key);

			if (resolved !== undefined && resolved !== null)
			{
				return resolved;
			}

			// ${key} localization references are resolved at render time — pass through
			return raw;
		}

		return raw;
	}

	private hasAttribute(node: Element, name: string): boolean
	{
		return node.hasAttribute(name);
	}
}

function getDirectChildElements(node: Element): Element[]
{
	const elements: Element[] = [];

	for (let i = 0; i < node.children.length; i++)
	{
		const child = node.children.item(i);

		if (child)
		{
			elements.push(child);
		}
	}

	return elements;
}

function getDirectChildrenByName(node: Element, name: string): Element[]
{
	return getDirectChildElements(node).filter((child) => child.nodeName === name);
}

function getDirectChildByName(node: Element, name: string): Element | null
{
	const children = getDirectChildrenByName(node, name);

	return children.length > 0 ? children[0] : null;
}

function parseInteger(value: unknown): number
{
	const parsed = Number.parseInt(String(value ?? '0'), 10);

	return Number.isFinite(parsed) ? parsed : 0;
}

function parseNumber(value: unknown): number
{
	if (value === null || value === undefined)
	{
		return 0;
	}

	const parsed = Number(value);

	return Number.isFinite(parsed) ? parsed : 0;
}

function parseColor(value: string): number
{
	if (!value)
	{
		return 0;
	}

	if (value.length > 1 && value.charAt(1) === 'x')
	{
		const parsedHex = Number.parseInt(value, 16);

		return Number.isFinite(parsedHex) ? (parsedHex >>> 0) : 0;
	}

	const parsed = Number.parseInt(value, 10);

	return Number.isFinite(parsed) ? (parsed >>> 0) : 0;
}

function castValue(value: unknown, type: string): unknown
{
	switch (type.toLowerCase())
	{
		case 'boolean':
			return String(value).toLowerCase() === 'true';
		case 'int':
		case 'number':
			return parseNumber(value);
		case 'uint':
			return parseInteger(value) >>> 0;
		case 'hex':
		{
			const raw = String(value ?? '0');

			return Number.parseInt(raw.replace(/^0x/i, ''), 16) >>> 0;
		}
		case 'array':
			return String(value ?? '').split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);
		default:
		{
			if (typeof value === 'string')
			{
				return decodeEscaped(value);
			}

			return value;
		}
	}
}

function decodeEscaped(value: string): string
{
	if (!value)
	{
		return '';
	}

	let decoded = value;
	let previous = '';

	while (decoded !== previous)
	{
		previous = decoded;

		try
		{
			decoded = decodeURIComponent(decoded);
		}
		catch (_)
		{
			break;
		}
	}

	return decoded;
}

function escapeXml(value: string): string
{
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Resolves `${key}` localization tokens in a string.
 *
 * @param value - The string potentially containing `${key}` tokens
 * @returns The resolved string, or the original if no resolver or no match
 */
export function resolveLocalizationTokens(value: string): string
{
	if (!value || !WindowParser.localizationResolver)
	{
		return value;
	}

	return value.replace(/\$\{([^}]+)\}/g, (_match, key) =>
	{
		const resolved = WindowParser.localizationResolver!(key);

		return resolved ?? key;
	});
}
