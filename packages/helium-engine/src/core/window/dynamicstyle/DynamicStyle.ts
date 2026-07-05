/**
 * Represents a dynamic style with state-based visual properties.
 *
 * In AS3, dynamic styles contained color transforms, offsets, and etching
 * properties per window state (default, hover, pressed, disabled). Each
 * style can also hold child styles keyed by tag (e.g. "#icon", "#bg").
 *
 * @see sources/win63_2021_version/com/sulake/core/window/dynamicstyle/DynamicStyle.as
 */
export class DynamicStyle
{
    public static readonly STYLE_LIFTED_HOVER: string = 'lifted_hover';
    public static readonly BRIGHTNESS_AND_SHADOW_UNDER: string = 'brightness_and_shadow_under';
    public static readonly BRIGHTNESS_AND_SHADOW_UNDER_GENTLE: string = 'brightness_and_shadow_under_gentle';
    public static readonly BUTTON: string = 'button';

    public name: string;
    public defaultStyles: Record<string, unknown> = {};
    public hoverStyles: Record<string, unknown> = {};
    public pressedStyles: Record<string, unknown> = {};
    public disabledStyles: Record<string, unknown> = {colorTransform: [1, 1, 1, 0.4, 0, 0, 0, 0]};

    private _childStyles: Map<string, DynamicStyle> = new Map();

    constructor(name: string = '')
    {
        this.name = name;
    }

    /**
	 * Returns the style properties for the given window state bitmask.
	 *
	 * @param state - The window state flag
	 * @returns The style properties object for that state
	 */
    public getStyleByWindowState(state: number): Record<string, unknown>
    {
        switch(state)
        {
            case 16:
                return this.pressedStyles;
            case 4:
                return this.hoverStyles;
            case 0:
                return this.defaultStyles;
            case 32:
                return this.disabledStyles;
        }

        return {};
    }

    /**
	 * Returns the child dynamic style matching one of the window's tags.
	 *
	 * Tags beginning with "#" are checked against child style keys.
	 *
	 * @param tags - The tags to search for
	 * @returns The matching child style, or null
	 */
    public getChildStyleByTags(tags: string[]): DynamicStyle | null
    {
        for(const tag of tags)
        {
            if(tag.charAt(0) === '#')
            {
                return this.getChildDynamicStyleByKey(tag);
            }
        }

        return null;
    }

    /**
	 * Registers a child style under the given key.
	 *
	 * @param key - The child style key (e.g. "#icon")
	 * @param style - The child dynamic style
	 */
    public setChildStyle(key: string, style: DynamicStyle): void
    {
        this._childStyles.set(key, style);
    }

    /**
	 * Computes the color value for the given window state.
	 *
	 * @param state - The window state flag
	 * @returns The computed color value, or 0 if no color transform
	 */
    public getColorValue(state: number): number
    {
        const props = this.getStyleByWindowState(state);
        const ct = props.colorTransform as number[] | undefined;

        if(ct)
        {
            let colorStr = '';

            for(let i = 0; i < 3; i++)
            {
                const channel = (ct[i] * 0xFF) + ct[i + 4];
                colorStr += Math.min(0xFF, channel).toString(16).padStart(2, '0');
            }

            return parseInt(colorStr, 16);
        }

        return 0;
    }

    /**
	 * Returns the color transform array for the given window state.
	 *
	 * @param state - The window state flag
	 * @returns Color transform as [rMul, gMul, bMul, aMul, rOff, gOff, bOff, aOff]
	 */
    public getColorTransform(state: number): {
        redMultiplier: number;
        greenMultiplier: number;
        blueMultiplier: number;
        alphaMultiplier: number;
        redOffset: number;
        greenOffset: number;
        blueOffset: number;
        alphaOffset: number
    }
    {
        const props = this.getStyleByWindowState(state);
        const ct = props.colorTransform as number[] | undefined;
        const tint = (props.tint as number[] | undefined) ?? [0xFF, 0xFF, 0xFF];

        if(ct)
        {
            return {
                redMultiplier: (ct[0] * tint[0]) / 0xFF,
                greenMultiplier: (ct[1] * tint[1]) / 0xFF,
                blueMultiplier: (ct[2] * tint[2]) / 0xFF,
                alphaMultiplier: ct[3],
                redOffset: ct[4],
                greenOffset: ct[5],
                blueOffset: ct[6],
                alphaOffset: ct[7],
            };
        }

        return {
            redMultiplier: 1,
            greenMultiplier: 1,
            blueMultiplier: 1,
            alphaMultiplier: 1,
            redOffset: 0,
            greenOffset: 0,
            blueOffset: 0,
            alphaOffset: 0,
        };
    }

    private getChildDynamicStyleByKey(key: string): DynamicStyle
    {
        const child = this._childStyles.get(key);

        if(child)
        {
            return child;
        }

        return new DynamicStyle();
    }
}
