import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import {BackgroundController} from '@core/window/components/BackgroundController';
import {BorderController} from '@core/window/components/BorderController';
import {ButtonController} from '@core/window/components/ButtonController';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {ColorConverter} from '@room/utils/ColorConverter';

import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';

/**
 * Util — the wired system's grab-bag of static helpers: window-tree geometry (lowest point, move
 * children into a column), enable/disable a whole section with blend-based dimming, variable name/
 * value formatting, int parsing, and colour math.
 *
 * The window-dimming branches key off four marker interfaces that are obfuscated in every tree.
 * Three are empty and were identified by their implementor: `_SafeCls_2013` is `IButtonWindow`
 * (ButtonController), `_SafeCls_2254` `IBorderWindow` (BorderController) and `_SafeCls_2326`
 * `IBackgroundWindow` (BackgroundController) - PRODUCTION declares all three with the same empty
 * body and the same single implementor. Since the port has no marker interfaces of its own, the
 * checks run against those controller classes, whose subclass chains match AS3's. `_SafeCls_2116`
 * (a composite exposing `children` as an array) and `ISelectorWindow` stay duck-typed: neither maps
 * to one class here.
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

    /**
     * A background window has no `blend` of its own: it paints one flat ARGB fill, so its opacity
     * *is* the alpha byte of `color`. Every other window type dims through the shared accessor.
     *
     * `_SafeCls_2326` is `IBackgroundWindow`: an empty interface over IWindowContainer, implemented
     * by `BackgroundController` alone in both trees, which is what identifies it — PRODUCTION's
     * `IBackgroundWindow.as` has the same empty body and the same single implementor.
     */
    // AS3: Util.as::getBlend()
    private static getBlend(window: IWindow): number
    {
        if(window instanceof BackgroundController)
        {
            return (window.color >>> 24 & 0xFF) / 255;
        }

        return window.blend;
    }

    // AS3: Util.as::setBlend()
    private static setBlend(window: IWindow, blend: number): void
    {
        if(window instanceof BackgroundController)
        {
            const alpha = Math.max(0, Math.min(255, Math.trunc(blend * 255)));

            window.color = window.color & 0xFFFFFF | alpha << 24;

            return;
        }

        window.blend = blend;
    }

    /**
	 * Is `candidate` the window `ancestor` itself, or anything below it?
	 *
	 * TS-only placement: AS3 has this as `WindowController.windowIsChild()`, a member of every
	 * window, and this port's `IWindow` does not carry it. It lives here rather than being copied
	 * a third time — `WiredMenuInspectionTab` and now `VariableManagementDetailView` both need it
	 * for the same thing, deciding whether a click landed outside a bubble. (`TableRowView` keeps
	 * its own: AS3 declares one on that class too.)
	 *
	 * AS3 recurses *down* through `_children`; walking *up* through `parent` answers the same
	 * question and visits one chain instead of a whole subtree.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/WindowController.as::windowIsChild()
    public static windowIsChild(ancestor: IWindow, candidate: IWindow | null): boolean
    {
        let window: IWindow | null = candidate;

        while(window != null)
        {
            if(window === ancestor)
            {
                return true;
            }

            window = window.parent;
        }

        return false;
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

        // `_SafeCls_2013` is `IButtonWindow` (empty over IInteractiveWindow; `ButtonController` is
        // its only direct implementor in both trees, and the port's subclass chain — DropMenuItem,
        // SelectableButton, ToolTip — matches AS3's exactly). A button paints its own disabled
        // state from `enable()`/`disable()` below, so blending it as well would dim it twice.
        if(!(window instanceof ButtonController))
        {
            const container = Util.asContainer(window);
            const childrenHolder = window as unknown as { children?: IWindow[] };

            if(container != null || Util.isItemList(window) || Util.isSelector(window))
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

                // A border or a background *is* the visible surface of its container, not a frame
                // around separately-dimmed children, so it takes the blend itself on top of the
                // recursion above. `_SafeCls_2254` is `IBorderWindow` — same empty-interface
                // identification as `IBackgroundWindow` in getBlend().
                if(window instanceof BorderController || window instanceof BackgroundController)
                {
                    Util.setBlend(window, target);
                }
            }
            else if(!isIcon)
            {
                Util.setBlend(window, target);
            }
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

    // TS-only: duck-types the AS3 `param1 is ISelectorWindow` branch of disableSection(). Unlike
    // the three marker interfaces above, ISelectorWindow has members and more than one
    // implementor, and the port's selector controllers share no base class to test against.
    private static isSelector(window: IWindow): boolean
    {
        const candidate = window as unknown as Partial<ISelectorWindow>;

        return typeof candidate.numSelectables === 'number' && typeof candidate.getSelectableAt === 'function';
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
