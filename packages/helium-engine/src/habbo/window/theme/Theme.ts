import type {PropertyMap} from '@core/window/theme/PropertyMap';

/**
 * Represents a named window theme with a base style range and property defaults.
 *
 * Each theme covers a contiguous range of styles from `baseStyle` to
 * `baseStyle + styleCount - 1`. The `isReal` flag distinguishes actual
 * visual themes (Volter, Ubuntu, Illumina) from virtual groupings
 * (None, Icon, Legacy border).
 *
 * @see sources/win63_version/habbo/window/theme/Theme.as
 */
export class Theme
{
	public static readonly NONE: string = 'None';
	public static readonly ICON: string = 'Icon';
	public static readonly LEGACY_BORDER: string = 'Legacy border';
	public static readonly VOLTER: string = 'Volter';
	public static readonly UBUNTU: string = 'Ubuntu';
	public static readonly ILLUMINA_LIGHT: string = 'Illumina Light';
	public static readonly ILLUMINA_DARK: string = 'Illumina Dark';

	constructor(name: string, isReal: boolean, baseStyle: number, styleCount: number, propertyDefaults: PropertyMap)
	{
		this._name = name;
		this._isReal = isReal;
		this._baseStyle = baseStyle;
		this._styleCount = styleCount;
		this._propertyDefaults = propertyDefaults;
	}

	private _name: string;

	/**
	 * The display name of this theme.
	 */
	public get name(): string
	{
		return this._name;
	}

	private _isReal: boolean;

	/**
	 * Whether this is a real visual theme (as opposed to a virtual grouping).
	 */
	public get isReal(): boolean
	{
		return this._isReal;
	}

	private _baseStyle: number;

	/**
	 * The first style index covered by this theme.
	 */
	public get baseStyle(): number
	{
		return this._baseStyle;
	}

	private _styleCount: number;

	/**
	 * The number of styles covered by this theme.
	 */
	public get styleCount(): number
	{
		return this._styleCount;
	}

	private _propertyDefaults: PropertyMap;

	/**
	 * The default property values for elements rendered in this theme.
	 */
	public get propertyDefaults(): PropertyMap
	{
		return this._propertyDefaults;
	}

	/**
	 * Checks whether the given style falls within this theme's range.
	 *
	 * @param style - The style index to check
	 * @returns True if `baseStyle <= style < baseStyle + styleCount`
	 */
	public coversStyle(style: number): boolean
	{
		return style >= this._baseStyle && style < this._baseStyle + this._styleCount;
	}
}
