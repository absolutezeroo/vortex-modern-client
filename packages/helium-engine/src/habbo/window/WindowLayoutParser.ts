import {ELEMENT_NAME_TO_TYPE} from './enum/WindowElementType';
import {PARAM_NAME_TO_FLAG} from './enum/WindowParam';
import type {IWindowLayout, IWindowLayoutNode} from './IWindowLayout';

/**
 * Parses and resolves window layout JSON data.
 *
 * Port of the AS3 WindowParser.parseSingleWindowEntity() operating on JSON
 * instead of XML. Resolves $var references, tag -> typeId mappings,
 * and param string -> bitwise flag values.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as
 */
export class WindowLayoutParser
{
	/**
	 * Resolve a layout with variable substitution.
	 *
	 * @param layout - The raw layout data from JSON
	 * @param varOverrides - Additional variable overrides
	 * @returns A fully resolved copy of the layout tree
	 */
	static resolve(layout: IWindowLayout, varOverrides?: Record<string, unknown>): IWindowLayoutNode
	{
		const vars = {...layout.vars, ...varOverrides};

		return WindowLayoutParser.resolveNode(layout.window, vars);
	}

	/**
	 * Recursively resolve a single layout node.
	 */
	private static resolveNode(node: IWindowLayoutNode, vars: Record<string, unknown>): IWindowLayoutNode
	{
		const resolvedAttrs: Record<string, string> = {};

		for (const [key, value] of Object.entries(node.attributes))
		{
			if (value !== undefined)
			{
				resolvedAttrs[key] = WindowLayoutParser.resolveValue(value, vars);
			}
		}

		const typeId = node.typeId >= 0
			? node.typeId
			: ELEMENT_NAME_TO_TYPE[node.tag] ?? -1;

		const params = node.params ?? WindowLayoutParser.resolveParamsFromAttributes(resolvedAttrs);

		const children = node.children.map((child) => WindowLayoutParser.resolveNode(child, vars));

		return {
			tag: node.tag,
			typeId,
			attributes: resolvedAttrs,
			children,
			params,
		};
	}

	/**
	 * Resolve a single value, substituting $var references.
	 */
	private static resolveValue(value: string, vars: Record<string, unknown>): string
	{
		if (!value) return '';

		if (value.startsWith('$'))
		{
			const key = value.slice(1);
			const resolved = vars[key];

			return resolved !== undefined ? String(resolved) : '';
		}

		return value;
	}

	/**
	 * Resolve param flags from a params attribute string.
	 * Falls back to parsing the attribute as a number if not a known name.
	 */
	private static resolveParamsFromAttributes(attrs: Record<string, string>): number
	{
		const paramsStr = attrs['params'];

		if (!paramsStr) return 0;

		let flags = 0;
		const parts = paramsStr.split(',');

		for (const part of parts)
		{
			const trimmed = part.trim().toLowerCase();
			const known = PARAM_NAME_TO_FLAG[trimmed];

			if (known !== undefined)
			{
				flags |= known;
			}
			else
			{
				const num = Number(trimmed);

				if (!Number.isNaN(num))
				{
					flags |= num;
				}
			}
		}

		return flags;
	}
}
