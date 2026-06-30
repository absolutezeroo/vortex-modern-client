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
	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::THEMES
	private static readonly THEMES: string[] = [
		Theme.NONE,
		Theme.VOLTER,
		Theme.UBUNTU,
		Theme.ILLUMINA_LIGHT,
		Theme.ILLUMINA_DARK,
		Theme.ICON,
		Theme.LEGACY_BORDER,
	];

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::const_1031
	private static readonly LEGACY_STYLE_UPPER_BOUND: number = 100;

	// TS-only: named window type constants for Icon and Border lookups
	private static readonly WINDOW_TYPE_ICON: number = 1;
	private static readonly WINDOW_TYPE_BORDER: number = 30;

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::var_693
	private _themes: Map<string, Theme> = new Map();
	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::var_779
	private _skinContainer: SkinContainer;

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager()
	constructor(skinContainer: SkinContainer)
	{
		this._skinContainer = skinContainer;

		const properties = new PropertyMap();

		properties.addBoolean('always_show_selection', false);
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("antialias_type","advanced",["normal","advanced"])
		properties.addEnumeration('antialias_type', 'advanced', ['normal', 'advanced']);
		properties.addString('asset_uri', '');
		properties.addBoolean('auto_arrange_items', true);
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("auto_size","none",["none","left","center","right"])
		properties.addEnumeration('auto_size', 'none', ['none', 'left', 'center', 'right']);
		properties.addString('bitmap_asset_name', '');
		properties.addBoolean('border', false);
		properties.addHex('border_color', 0);
		properties.addBoolean('condense_white', false);
		properties.addBoolean('container_resize_to_columns', false);
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("direction","down",["up","down","left","right"])
		properties.addEnumeration('direction', 'down', ['up', 'down', 'left', 'right']);
		properties.addBoolean('display_as_password', false);
		properties.addBoolean('display_raw', false);
		properties.addBoolean('editable', true);
		properties.addHex('etching_color', 0);
		properties.addBoolean('fit_size_to_contents', false);
		properties.addBoolean('focus_capturer', false);
		properties.addBoolean('greyscale', false);
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("grid_fit_type","pixel",["pixel","none","subpixel"])
		properties.addEnumeration('grid_fit_type', 'pixel', ['pixel', 'none', 'subpixel']);
		properties.addBoolean('handle_bitmap_disposing', true);
		properties.addString('help_page', '');
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("link_target","default",["default","_blank","_parent","_self","_top","internal"])
		properties.addEnumeration('link_target', 'default', ['default', '_blank', '_parent', '_self', '_top', 'internal']);
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
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("pivot_point", PivotPoint.PIVOT_NAMES[0], class_2901.PIVOT_POINT_RANGE)
		// PIVOT_POINT_RANGE = PivotPoint.PIVOT_NAMES — sources/win63_version/core/window/enum/PivotPoint.as::PIVOT_NAMES
		properties.addEnumeration('pivot_point', 'top left', [
			'top left', 'top center', 'top right',
			'center left', 'center', 'center right',
			'bottom left', 'bottom center', 'bottom right',
		]);
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
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("text_style","regular",class_3398.getStyleNameArrayRef())
		// class_3398 = sources/win63_version/core/window/utils/class_3398.as — base styles; skin CSS adds more at runtime
		properties.addEnumeration('text_style', 'regular', ['regular', 'italic', 'bold']);
		properties.addString('tool_tip_caption', '');
		properties.addUint('tool_tip_delay', 500);
		properties.addBoolean('tool_tip_is_dynamic', false);
		properties.addBoolean('interactive_cursor_disabled', false);
		properties.addBoolean('vertical', false);
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("widget_type","",class_2086.WIDGET_TYPES)
		// class_2086 = sources/win63_version/habbo/window/widgets/class_2086.as — WIDGET_TYPES is sorted alphabetically
		properties.addEnumeration('widget_type', '', [
			'avatar_image', 'badge_image', 'balloon', 'countdown',
			'furniture_image', 'hover_bitmap', 'illumina_border',
			'illumina_chat_bubble', 'illumina_input',
			'limited_item_overlay_grid', 'limited_item_overlay_preview', 'limited_item_overlay_supply',
			'pet_image', 'pixel_limit', 'product_icon', 'product_image',
			'progress_indicator',
			'rarity_item_overlay_grid', 'rarity_item_overlay_preview',
			'room_previewer', 'room_thumbnail', 'room_user_count',
			'running_number', 'separator', 'updating_timestamp',
		]);
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
		// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::ThemeManager() — addEnumeration("illumina_border:border_style","illumina_light",IlluminaBorderWidget.BORDER_STYLES)
		properties.addEnumeration('illumina_border:border_style', 'illumina_light', ['illumina_light', 'illumina_dark']);

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

		ubuntuProps.addEnumeration('antialias_type', 'advanced', ['normal', 'advanced']);
		ubuntuProps.addEnumeration('text_style', 'u_regular', ['regular', 'italic', 'bold']);

		this._themes.set(Theme.UBUNTU, new Theme(Theme.UBUNTU, true, 3, 5, ubuntuProps));

		// Illumina Light theme: real theme, styles 100-199
		const illuminaLightProps = properties.clone();

		illuminaLightProps.addEnumeration('antialias_type', 'advanced', ['normal', 'advanced']);
		illuminaLightProps.addHex('etching_color', 3003121663);
		illuminaLightProps.addEnumeration('text_style', 'il_regular', ['regular', 'italic', 'bold']);

		this._themes.set(Theme.ILLUMINA_LIGHT, new Theme(Theme.ILLUMINA_LIGHT, true, 100, 100, illuminaLightProps));

		// Illumina Dark theme: real theme, styles 200-299
		const illuminaDarkProps = illuminaLightProps.clone();

		illuminaDarkProps.addEnumeration('illumina_border:border_style', 'illumina_dark', ['illumina_light', 'illumina_dark']);

		this._themes.set(Theme.ILLUMINA_DARK, new Theme(Theme.ILLUMINA_DARK, true, 200, 100, illuminaDarkProps));
	}

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::getStyle()
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

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::getThemeAndIntent()
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

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::getIntents()
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

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::getPropertyDefaults()
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

	// TS-only: setPropertyDefaults is declared in IThemeManager but not implemented in AS3 ThemeManager
	public setPropertyDefaults(_style: number, _properties: IPropertyMap): void
	{
		// Not used in the Habbo ThemeManager; property defaults are set per-theme in the constructor.
	}

	// AS3: sources/win63_version/habbo/window/theme/ThemeManager.as::getThemes()
	public getThemes(): string[]
	{
		return [...ThemeManager.THEMES];
	}
}
