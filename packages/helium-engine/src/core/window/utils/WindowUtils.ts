import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';

/**
 * Generic window enable/disable helpers, including recursive "disable a
 * whole section" with blend-based dimming.
 *
 * The AS3 original special-cases a handful of anonymous window types when
 * deciding whether to recurse into children vs. blend the window itself
 * (see TODOs below) — those exact types could not be identified with
 * confidence from the obfuscated source, so this port applies the general
 * (Container / ItemList / Selector all share `IWindowContainer` in this
 * port, unlike the separate AS3 interfaces) rule uniformly.
 *
 * @see sources/win63_2026_crypted_version/com/sulake/core/window/utils/WindowUtils.as
 */
export class WindowUtils
{
    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/utils/WindowUtils.as::disableButton()
    public static disableButton(window: IWindow, disabled: boolean): void
    {
        if(disabled)
        {
            window.disable();
        }
        else
        {
            window.enable();
        }
    }

    private static getBlend(window: IWindow): number
    {
        return window.blend;
    }

    private static setBlend(window: IWindow, blend: number): void
    {
        window.blend = blend;
    }

    private static asContainer(window: IWindow): IWindowContainer | null
    {
        const container = window as unknown as Partial<IWindowContainer>;

        return typeof container.numChildren === 'number' && typeof container.getChildAt === 'function'
            ? (window as unknown as IWindowContainer)
            : null;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/utils/WindowUtils.as::disableSection()
    public static disableSection(window: IWindow, disabled: boolean = true, dimFactor: number = 0.5): void
    {
        if(window.tags.indexOf('DO_NOT_DISABLE') !== -1)
        {
            return;
        }

        let savedBlend = -1;

        for(const tag of window.tags)
        {
            if(tag.indexOf('BLEND=') === 0)
            {
                savedBlend = Number(tag.substring(6));
            }
        }

        if(savedBlend === -1)
        {
            savedBlend = WindowUtils.getBlend(window);

            const tag = `BLEND=${savedBlend}`;

            if(window.tags.indexOf(tag) === -1)
            {
                window.tags.push(tag);
            }
        }

        let targetBlend: number;

        if(disabled && window.tags.indexOf('INVIS_ON_DISABLE') !== -1)
        {
            targetBlend = 0;
        }
        else
        {
            targetBlend = disabled ? savedBlend * dimFactor : savedBlend;
        }

        const isIcon = window.tags.indexOf('#icon') !== -1;
        // AS3 param flag 16 = "shares parent's graphic context" (no own drawable surface).
        const ownsGraphicContext = !window.getParamFlag(16);

        // TODO(AS3): AS3 skips all of the recursion/blend logic below entirely for
        // one anonymous interactive-control type (`_SafeCls_2013` in the obfuscated
        // 2026 source), which manages its own disabled visual state. Not identifiable
        // with confidence, so it is not special-cased here.
        const container = WindowUtils.asContainer(window);

        if(container)
        {
            for(let i = 0; i < container.numChildren; i++)
            {
                const child = container.getChildAt(i);

                if(child)
                {
                    WindowUtils.disableSection(child, disabled, ownsGraphicContext ? 1 : dimFactor);
                }
            }

            // TODO(AS3): AS3 also force-applies blend directly to two further anonymous
            // container subtypes (`_SafeCls_2254`, `_SafeCls_2326`) in addition to
            // recursing into children — not identifiable with confidence from the
            // obfuscated source. Only the "owns its own graphic context" case is
            // honored here.
            if(ownsGraphicContext)
            {
                WindowUtils.setBlend(window, targetBlend);
            }
        }
        else if(!isIcon)
        {
            WindowUtils.setBlend(window, targetBlend);
        }

        WindowUtils.disableButton(window, disabled);
    }
}
