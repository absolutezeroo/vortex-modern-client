import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {ColorConverter} from '@room/utils/ColorConverter';

import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';

/**
 * Util — the wired system's grab-bag of static helpers: window-tree geometry (lowest point, move
 * children into a column), enable/disable a whole section with blend-based dimming, variable name/
 * value formatting, int parsing, and colour math.
 *
 * A handful of window-dimming branches key off obfuscated marker interfaces that could not be
 * resolved to a distinct port interface (`_SafeCls_2013` a button, `_SafeCls_2254`/`_SafeCls_2326`
 * a border/alpha-blended container, `_SafeCls_2116` a composite children holder). Where possible
 * the port duck-types them (`_SafeCls_2116` → any object with a `children` array); the rest carry a
 * documented approximation, exactly as `core/window/utils/WindowUtils.disableSection` already does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/Util.as
 */
export class Util
{
    // AS3: Util.as::VARIABLE_SYNTAX_MODE_PRETTIFY
    public static readonly VARIABLE_SYNTAX_MODE_PRETTIFY: number = 0;

    // AS3: Util.as::VARIABLE_SYNTAX_MODE_NONE
    public static readonly VARIABLE_SYNTAX_MODE_NONE: number = 1;

    // AS3: Util.as::setProcDirectly()
    public static setProcDirectly(window: IWindow, proc: NonNullable<IWindow['procedure']>): void
    {
        window.setParamFlag(1, true);
        window.procedure = proc;
    }

    // AS3: Util.as::getLowestPoint()
    public static getLowestPoint(container: IWindowContainer): number
    {
        let lowest = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child != null && child.visible && child.height > 0)
            {
                lowest = Math.max(lowest, child.y + child.height);
            }
        }

        return lowest;
    }

    // AS3: Util.as::getLowestPointList()
    public static getLowestPointList(list: IItemListWindow): number
    {
        let lowest = 0;

        for(let i = 0; i < list.numListItems; i++)
        {
            const child = list.getListItemAt(i);

            if(child != null && child.visible && child.height > 0)
            {
                lowest = Math.max(lowest, child.y + child.height);
            }
        }

        return lowest;
    }

    // AS3: Util.as::hideChildren()
    public static hideChildren(container: IWindowContainer, keepRuler: boolean = false): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child != null && !(keepRuler && child.name === 'ruler'))
            {
                child.visible = false;
            }
        }
    }

    // AS3: Util.as::showChildren()
    public static showChildren(container: IWindowContainer): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child != null)
            {
                child.visible = true;
            }
        }
    }

    // AS3: Util.as::moveChildrenToColumn()
    public static moveChildrenToColumn(container: IWindowContainer, names: string[], startY: number, spacing: number): void
    {
        let y = startY;

        for(const name of names)
        {
            const child = container.getChildByName(name);

            if(child != null && child.visible && child.height > 0)
            {
                child.y = y;
                y += child.height + spacing;
            }
        }
    }

    // AS3: Util.as::moveAllChildrenToColumn()
    public static moveAllChildrenToColumn(container: IWindowContainer, startY: number, spacing: number): void
    {
        let y = startY;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child != null && child.visible && child.height > 0)
            {
                child.y = y;
                y += child.height + spacing;
            }
        }
    }

    // AS3: Util.as::select()
    public static select(window: ISelectableWindow, selected: boolean): void
    {
        if(selected)
        {
            window.select();
        }
        else
        {
            window.unselect();
        }
    }

    // AS3: Util.as::flatVariableName()
    public static flatVariableName(variable: WiredVariable): string
    {
        return variable.variableName.replace('@', '').replace('~', '').replace(/\./g, '_');
    }

    // AS3: Util.as::splitName()
    public static splitName(variable: WiredVariable): string[]
    {
        return variable.variableName.split('.');
    }

    // AS3: Util.as::variableValueWithString()
    public static variableValueWithString(variable: WiredVariable, value: number): string | null
    {
        if(!variable.hasValue)
        {
            return null;
        }

        if(value === 2147483647 || value === -2147483648)
        {
            return 'Hidden';
        }

        const connected = Util.getConnectedText(variable, value);

        return String(value) + (connected == null ? '' : ' (' + connected + ')');
    }

    // AS3: Util.as::getConnectedText()
    public static getConnectedText(variable: WiredVariable, value: number): string | null
    {
        const connector = variable.textConnector;

        if(connector == null)
        {
            return null;
        }

        return connector.getValue(value);
    }

    // AS3: Util.as::getIntFromInput()
    public static getIntFromInput(field: ITextFieldWindow, fallback: number, allowRadix: boolean = false): number
    {
        return Util.getIntFromString(field.text, fallback, allowRadix);
    }

    // AS3: Util.as::getIntFromString()
    public static getIntFromString(value: string, fallback: number, allowRadix: boolean = false): number
    {
        if(allowRadix && value.indexOf('0b') === 0)
        {
            return parseInt(value.substr(2), 2);
        }

        if(allowRadix && value.indexOf('0x') === 0)
        {
            return parseInt(value.substr(2), 16);
        }

        if(isNaN(Number(value)))
        {
            return fallback;
        }

        return Math.trunc(Number(value));
    }

    // AS3: Util.as::pushIntAsLong()
    public static pushIntAsLong(array: number[], value: number): void
    {
        array.push(value < 0 ? -1 : 0);
        array.push(value);
    }

    // AS3: Util.as::getBlend()
    private static getBlend(window: IWindow): number
    {
        // TODO(AS3): AS3 special-cases an alpha-blended window type (`_SafeCls_2326`), reading the
        // blend from the colour's alpha byte ((color >>> 24 & 0xFF) / 255). That interface has no
        // members and no distinct port counterpart, so the general `blend` accessor is used.
        return window.blend;
    }

    // AS3: Util.as::setBlend()
    private static setBlend(window: IWindow, blend: number): void
    {
        // TODO(AS3): see getBlend — for `_SafeCls_2326` windows AS3 packs the blend into the colour's
        // alpha byte instead. Not identifiable here; the general `blend` accessor is used.
        window.blend = blend;
    }

    // AS3: Util.as::disableSection()
    public static disableSection(window: IWindow, disabled: boolean = true): void
    {
        if(window.tags.indexOf('DO_NOT_DISABLE') !== -1)
        {
            return;
        }

        let savedBlend = -1;

        if(window.isEnabled() && disabled)
        {
            savedBlend = Util.getBlend(window);

            const tag = 'BLEND=' + savedBlend;

            if(window.tags.indexOf(tag) === -1)
            {
                window.tags.push(tag);
            }
        }
        else if(!window.isEnabled() && !disabled)
        {
            for(const tag of window.tags)
            {
                if(tag.indexOf('BLEND=') === 0)
                {
                    savedBlend = Number(tag.substring(6, tag.length));
                }
            }
        }

        let target: number;

        if(savedBlend === -1)
        {
            target = Util.getBlend(window);
        }
        else
        {
            target = disabled ? savedBlend / 2 : savedBlend;
        }

        const isIcon = window.tags.indexOf('#icon') !== -1;

        // TODO(AS3): AS3 skips the whole recurse/blend block for a button type (`_SafeCls_2013`),
        // which manages its own disabled visual. That marker interface has no members and no distinct
        // port counterpart, so it is not special-cased here (buttons still get the leaf blend below).
        const container = Util.asContainer(window);
        const childrenHolder = window as unknown as { children?: IWindow[] };
        const isItemList = Util.isItemList(window);

        // TODO(AS3): the container-ish gate is `_SafeCls_1828 || IItemListWindow || ISelectorWindow`.
        // ISelectorWindow is not separately duck-typed; in practice such windows are also containers.
        if(container != null || isItemList)
        {
            if(Array.isArray(childrenHolder.children))
            {
                // _SafeCls_2116: a composite window exposing its children as an array.
                for(const child of childrenHolder.children)
                {
                    Util.disableSection(child, disabled);
                }
            }
            else if(container != null)
            {
                for(let i = 0; i < container.numChildren; i++)
                {
                    const child = container.getChildAt(i);

                    if(child != null)
                    {
                        Util.disableSection(child, disabled);
                    }
                }
            }

            // TODO(AS3): AS3 additionally force-blends the container itself when it is a border/alpha
            // window (`_SafeCls_2254 || _SafeCls_2326`). Neither is identifiable here, so the extra
            // self-blend is omitted; child recursion above already dims the visible leaves.
        }
        else if(!isIcon)
        {
            Util.setBlend(window, target);
        }

        if(disabled)
        {
            window.disable();
        }
        else
        {
            window.enable();
        }
    }

    // Duck-types the AS3 `_SafeCls_1828` (IWindowContainer) branch of disableSection.
    private static asContainer(window: IWindow): IWindowContainer | null
    {
        const candidate = window as unknown as Partial<IWindowContainer>;

        return typeof candidate.numChildren === 'number' && typeof candidate.getChildAt === 'function'
            ? (window as unknown as IWindowContainer)
            : null;
    }

    // Duck-types the AS3 `IItemListWindow` branch of disableSection.
    private static isItemList(window: IWindow): boolean
    {
        const candidate = window as unknown as Partial<IItemListWindow>;

        return typeof candidate.numListItems === 'number' && typeof candidate.getListItemAt === 'function';
    }

    // AS3: Util.as::variableCompare()
    private static variableCompare(a: WiredVariable, b: WiredVariable): number
    {
        const aInternal = a.variableType === WiredVariableType.INTERNAL;
        const bInternal = b.variableType === WiredVariableType.INTERNAL;

        if(aInternal && !bInternal)
        {
            return 1;
        }

        if(bInternal && !aInternal)
        {
            return -1;
        }

        if(aInternal)
        {
            if(Number(a.variableId) > Number(b.variableId))
            {
                return -1;
            }

            if(Number(a.variableId) === Number(b.variableId))
            {
                return 0;
            }

            return 1;
        }

        return a.variableName.localeCompare(b.variableName);
    }

    // AS3: Util.as::sortVariables()
    public static sortVariables(variables: WiredVariable[]): void
    {
        variables.sort(Util.variableCompare);
    }

    // AS3: Util.as::compareIntArrays()
    public static compareIntArrays(a: number[], b: number[]): boolean
    {
        if(a.length !== b.length)
        {
            return false;
        }

        for(let i = 0; i < a.length; i++)
        {
            if(a[i] !== b[i])
            {
                return false;
            }
        }

        return true;
    }

    // AS3: Util.as::findVariableById()
    public static findVariableById(variables: WiredVariable[], id: string): WiredVariable | null
    {
        for(const variable of variables)
        {
            if(variable.variableId === id)
            {
                return variable;
            }
        }

        return null;
    }

    // AS3: Util.as::uintToHexColor()
    public static uintToHexColor(color: number): string
    {
        let hex = (color >>> 0).toString(16);

        while(hex.length < 6)
        {
            hex = '0' + hex;
        }

        return '#' + hex;
    }

    // AS3: Util.as::snakeToTitle()
    public static snakeToTitle(value: string): string
    {
        if(!value)
        {
            return '';
        }

        const text = value.toLowerCase().replace(/_/g, ' ');

        return text.replace(/\b\w/g, (match: string) => match.toUpperCase());
    }

    // AS3: Util.as::lightenColor()
    public static lightenColor(color: number, factor: number): number
    {
        let hsl = ColorConverter.rgbToHSL(color) >>> 0;
        let lightness = hsl & 0xFF;

        lightness = Math.min(255, lightness * factor);
        hsl = (hsl & ~0xFF | lightness) >>> 0;

        return ColorConverter.hslToRGB(hsl);
    }
}
