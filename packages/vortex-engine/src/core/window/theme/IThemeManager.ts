import type {IPropertyMap} from './IPropertyMap';

/**
 * Theme manager interface.
 *
 * Manages theme property defaults by style.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/theme/IThemeManager.as
 */
export interface IThemeManager
{
    // AS3: .../src/com/sulake/core/window/theme/IThemeManager.as::getPropertyDefaults()
    getPropertyDefaults(style: number): IPropertyMap | null;

    setPropertyDefaults(style: number, properties: IPropertyMap): void;
}
