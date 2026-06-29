import type {IThemeManager} from '@core/window/theme/IThemeManager';
import type {IPropertyMap} from '@core/window/theme/IPropertyMap';
import type {SkinContainer} from '@core/window/graphics/SkinContainer';
import {PropertyMap} from '@core/window/theme/PropertyMap';
import {Theme} from './Theme';

/**
 * Result of resolving a style to its theme and intent.
 */
export interface IThemeAndIntent
{
	theme: string;
	intent: string | null;
}

/**
 * Manages window themes, style resolution, and property defaults.
 *
 * Themes map named visual identities (Volter, Ubuntu, Illumina, etc.)
 * to ranges of style indices. The ThemeManager resolves style lookups
 * and provides per-theme property defaults for the window system.
 *
 * @see sources/win63_version/habbo/window/theme/ThemeManager.as
 */
export class ThemeManager implements IThemeManager
{
	private static readonly THEMES: string[] = [
		Theme.NONE,
		Theme.VOLTER,
		Theme.UBUNTU,
		Theme.ILLUMINA_LIGHT,
		Theme.ILLUMINA_DARK,
		Theme.ICON,
		Theme.LEGACY_BORDER,
	];

	private static readonly LEGACY_STYLE_UPPER_BOUND: number = 100;

	/** Window type constants for Icon and Border lookups. */
	private static readonly WINDOW_TYPE_ICON: number = 1;
	private static readonly WINDOW_TYPE_BORDER: number = 30;

	private _themes: Map<string, Theme> = new Map();
	private _skinContainer: SkinContainer;

	constructor(skinContainer: SkinContainer)
	{
		this._skinContainer = skinContainer;

		const properties = new PropertyMap();

		properties.addBoolean('always_show_selection', false);
		properties.addString('antialias_type', 'advanced');
		properties.addString('asset_uri', '');
		properties.addBoolean('auto_arrange_items', true);
		properties.addString('auto_size', 'none');
		properties.addString('bitmap_asset_name', '');
		properties.addBoolean('border', false);
		properties.addHex('border_color', 0);
		properties.addBoolean('condense_white', false);
		properties.addBoolean('container_resize_to_columns', false);
		properties.addString('direction', 'down');
		properties.addBoolean('display_as_password', false);
		properties.addBoolean('display_raw', false);
		properties.addBoolean('editable', true);
		properties.addHex('etching_color', 0);
		properties.addBoolean('fit_size_to_contents', false);
		properties.addBoolean('focus_capturer', false);
		properties.addBoolean('greyscale', false);
		properties.addString('grid_fit_type', 'pixel');
		properties.addBoolean('handle_bitmap_disposing', true);
		properties.addString('help_page', '');
		properties.addString('link_target', 'default');
		properties.addInt('spacing', 0);
		properties.addInt('margin_left', 0);
		properties.addInt('margin_top', 0);
		properties.addInt('margin_right', 0);
		properties.addInt('margin_bottom', 0);
		properties.addInt('max_chars', 0);
		properties.addInt('max_lines', 0);
		properties.addArray('item_array', []);
		properties.addBoolean('mouse_wheel_enabled', true);
		properties.addBoolean('multiline', false);
		properties.addString('pivot_point', 'top_left');
		properties.addInt('pointer_offset', 0);
		properties.addBoolean('resize_on_item_update', false);
		properties.addBoolean('inverse_resize_on_item_update', false);
		properties.addString('restrict', '');
		properties.addBoolean('scale_to_fit_items', false);
		properties.addString('scrollable', '');
		properties.addNumber('scroll_step_h', -1);
		properties.addNumber('scroll_step_v', -1);
		properties.addBoolean('selectable', true);
		properties.addBoolean('stretched_x', true);
		properties.addBoolean('stretched_y', true);
		properties.addHex('text_color', 0);
		properties.addString('text_style', 'regular');
		properties.addString('tool_tip_caption', '');
		properties.addUint('tool_tip_delay', 500);
		properties.addBoolean('tool_tip_is_dynamic', false);
		properties.addBoolean('interactive_cursor_disabled', false);
		properties.addBoolean('vertical', false);
		properties.addString('widget_type', '');
		properties.addBoolean('word_wrap', false);
		properties.addNumber('zoom_x', 1);
		properties.addNumber('zoom_y', 1);
		properties.addBoolean('open_upward', false);
		properties.addBoolean('keep_open_on_deactivate', false);
		properties.addInt('padding_horizontal', 6);
		properties.addInt('padding_vertical', 6);
		properties.addString('overflow_replace', '');
		properties.addBoolean('wrap_x', false);
		properties.addBoolean('wrap_y', false);
		properties.addNumber('rotation', 0);
		properties.addString('illumina_border:border_style', 'illumina_light');

		// None theme: virtual, covers all styles
		this._themes.set(Theme.NONE, new Theme(Theme.NONE, false, 0, 0xFFFFFFFF, properties));

		// Icon theme: count how many icon skin renderers exist
		let iconCount = 0;

		while (this._skinContainer.skinRendererExists(ThemeManager.WINDOW_TYPE_ICON, iconCount))
		{
			iconCount++;
		}

		this._themes.set(Theme.ICON, new Theme(Theme.ICON, false, 0, iconCount, properties));

		// Legacy border theme: count border renderers up to the upper bound
		let borderCount = 0;

		while (this._skinContainer.skinRendererExists(ThemeManager.WINDOW_TYPE_BORDER, borderCount) && borderCount < ThemeManager.LEGACY_STYLE_UPPER_BOUND)
		{
			borderCount++;
		}

		this._themes.set(Theme.LEGACY_BORDER, new Theme(Theme.LEGACY_BORDER, false, 0, borderCount, properties));

		// Volter theme: real theme, styles 0-2
		this._themes.set(Theme.VOLTER, new Theme(Theme.VOLTER, true, 0, 3, properties.clone()));

		// Ubuntu theme: real theme, styles 3-7
		const ubuntuProps = properties.clone();

		ubuntuProps.addString('antialias_type', 'advanced');
		ubuntuProps.addString('text_style', 'u_regular');

		this._themes.set(Theme.UBUNTU, new Theme(Theme.UBUNTU, true, 3, 5, ubuntuProps));

		// Illumina Light theme: real theme, styles 100-199
		const illuminaLightProps = properties.clone();

		illuminaLightProps.addString('antialias_type', 'advanced');
		illuminaLightProps.addString('text_style', 'il_regular');
		illuminaLightProps.addHex('etching_color', 3003121663);

		this._themes.set(Theme.ILLUMINA_LIGHT, new Theme(Theme.ILLUMINA_LIGHT, true, 100, 100, illuminaLightProps));

		// Illumina Dark theme: real theme, styles 200-299
		const illuminaDarkProps = illuminaLightProps.clone();

		illuminaDarkProps.addString('illumina_border:border_style', 'illumina_dark');

		this._themes.set(Theme.ILLUMINA_DARK, new Theme(Theme.ILLUMINA_DARK, true, 200, 100, illuminaDarkProps));
	}

	/**
	 * Resolves a style index for a given theme, element type, and intent.
	 *
	 * For the "None" theme, returns the intent parsed as an integer.
	 * Otherwise searches the theme's style range for a matching intent.
	 *
	 * @param themeName - The theme name
	 * @param elementType - The window element type
	 * @param intent - The intent string to match
	 * @returns The resolved style index
	 */
	public getStyle(themeName: string, elementType: number, intent: string): number
	{
		if (themeName === Theme.NONE)
		{
			return parseInt(intent, 10) || 0;
		}

		const theme = this._themes.get(themeName);

		if (!theme)
		{
			return 0;
		}

		for (let i = 0; i < theme.styleCount; i++)
		{
			const style = theme.baseStyle + i;

			if (intent === this._skinContainer.getIntentByTypeAndStyle(elementType, style))
			{
				return style;
			}
		}

		return theme.baseStyle;
	}

	/**
	 * Determines the theme name and intent for a given element type and style.
	 *
	 * @param elementType - The window element type
	 * @param style - The style index
	 * @returns An object with theme name and intent string
	 */
	public getThemeAndIntent(elementType: number, style: number): IThemeAndIntent
	{
		const intent = this._skinContainer.getIntentByTypeAndStyle(elementType, style);

		if (elementType === ThemeManager.WINDOW_TYPE_ICON)
		{
			return {theme: Theme.ICON, intent};
		}

		if (elementType === ThemeManager.WINDOW_TYPE_BORDER && style < ThemeManager.LEGACY_STYLE_UPPER_BOUND)
		{
			return {theme: Theme.LEGACY_BORDER, intent};
		}

		for (const theme of this._themes.values())
		{
			if (theme.isReal && theme.coversStyle(style))
			{
				return {theme: theme.name, intent};
			}
		}

		return {theme: Theme.NONE, intent};
	}

	/**
	 * Returns all available intents for a given element type within a theme.
	 *
	 * @param elementType - The window element type
	 * @param themeName - The theme name
	 * @param fallbackStyle - The fallback style if no intents are found
	 * @returns An array of intent strings
	 */
	public getIntents(elementType: number, themeName: string, fallbackStyle: number): string[]
	{
		const intents: string[] = [];

		if (themeName !== Theme.NONE)
		{
			const theme = this._themes.get(themeName);

			if (theme)
			{
				for (let i = 0; i < theme.styleCount; i++)
				{
					const intent = this._skinContainer.getIntentByTypeAndStyle(elementType, theme.baseStyle + i);

					if (intent !== null)
					{
						intents.push(intent);
					}
				}
			}
		}

		if (intents.length === 0)
		{
			intents.push(fallbackStyle.toString());
		}

		return intents;
	}

	/**
	 * Returns the property defaults for a given style.
	 *
	 * Searches real themes for one that covers the style and returns
	 * its property defaults. Falls back to an empty PropertyMap.
	 *
	 * @param style - The style index
	 * @returns The property map defaults
	 */
	public getPropertyDefaults(style: number): IPropertyMap | null
	{
		for (const theme of this._themes.values())
		{
			if (theme.isReal && theme.coversStyle(style))
			{
				return theme.propertyDefaults;
			}
		}

		return new PropertyMap();
	}

	/**
	 * Sets property defaults for a given style (no-op placeholder).
	 *
	 * @param _style - The style index
	 * @param _properties - The property map to set
	 */
	public setPropertyDefaults(_style: number, _properties: IPropertyMap): void
	{
		// Not used in the Habbo ThemeManager; property defaults are set per-theme in the constructor.
	}

	/**
	 * Returns the list of all available theme names.
	 *
	 * @returns An array of theme name strings
	 */
	public getThemes(): string[]
	{
		return [...ThemeManager.THEMES];
	}
}
