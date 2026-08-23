/**
 * MysteryBoxToolbarExtension — the box/key colour tracker docked into the toolbar.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/mysterybox/MysteryBoxToolbarExtension.as
 *
 * It shows which colour box and which colour key the user currently holds, so two players can find
 * a matching pair — the whole point of the feature. The colours arrive on the session
 * (`MysteryBoxKeysMessageEvent`), which is why this listens to the session data manager rather
 * than to any room event.
 *
 * `KEY_COLORS` lives here in AS3 and MysteryBoxOpenDialogView reads it across; kept in the same
 * place so the two stay in step.
 *
 * The shipped `mystery_box_toolbar_extension` layout is the current client's, not the one this AS3
 * was written against. It carries its two states as two sibling backgrounds (`mysterybox_bg` /
 * `mysterybox_bg_contracted`) and folds on a click anywhere in `bg_region`, the way
 * `iro_event_info` does — and none of its children draws into the parent graphic context, so
 * shrinking the window no longer crops the body and every expanded-only child has to be hidden by
 * hand. `refresh()` is the one place that paints, after `GroupRoomInfoCtrl.refresh()`, which
 * renders the identical two-state toolbar panel; the AS3 setters keep their names, and their job
 * is to record state and hand the drawing over.
 */
import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {MysteryBoxKeysUpdateEvent} from '@habbo/session/events/MysteryBoxKeysUpdateEvent';
import {ToolbarDisplayExtensionIds} from '@habbo/toolbar/ToolbarDisplayExtensionIds';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {FurnitureContextMenuWidgetHandler} from '@habbo/ui/handler/FurnitureContextMenuWidgetHandler';

const log = Logger.getLogger('habbo.ui.widget.furniture.mysterybox.MysteryBoxToolbarExtension');

/**
 * AS3: MysteryBoxToolbarExtension.as::KEY_COLORS
 *
 * The eight mystery-box colours, as the tints applied to the greyscale box/key bitmaps. The wire
 * carries the colour by *name* ("purple", "lilac", …), so this table is the only thing that turns
 * a MysteryBoxKeys message into pixels.
 */
export const KEY_COLORS: Record<string, number> = {
    purple: 9452386,
    blue: 3891856,
    green: 6459451,
    yellow: 10658089,
    lilac: 6897548,
    orange: 10841125,
    turquoise: 2661026,
    red: 10104881
};

export class MysteryBoxToolbarExtension
{
    // AS3: MysteryBoxToolbarExtension.as::_SafeStr_11315
    private static readonly MINIMISED_CONFIG_KEY: string = 'mystery_box_toolbar_extension_minimised';

    // AS3: MysteryBoxToolbarExtension.as::setMinimised() — the two window heights.
    private static readonly HEIGHT_MINIMISED: number = 25;

    private static readonly HEIGHT_EXPANDED: number = 137;

    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/mysterybox/MysteryBoxToolbarExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: MysteryBoxToolbarExtension.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: MysteryBoxToolbarExtension.as::_SafeStr_4574 (the handler)
    private _handler: FurnitureContextMenuWidgetHandler | null;

    // TS-only: AS3 paints straight out of setKeyColors()' arguments; refresh() needs the pair again
    // every time the panel folds, so the last one is kept.
    private _boxColor: string = '';

    // TS-only: the key half of the pair above.
    private _keyColor: string = '';

    // AS3: MysteryBoxToolbarExtension.as::MysteryBoxToolbarExtension()
    constructor(handler: FurnitureContextMenuWidgetHandler)
    {
        this._handler = handler;
    }

    // AS3: MysteryBoxToolbarExtension.as::createWindow()
    public createWindow(): void
    {
        const handler = this._handler;
        const container = handler?.container;

        if(!handler || !container) return;

        this._window = container.windowManager?.buildWidgetLayout('mystery_box_toolbar_extension') as IWindowContainer | null;

        if(this._window === null)
        {
            log.warn('mystery_box_toolbar_extension layout missing — tracker not shown');

            return;
        }

        this._window.procedure = this.windowProcedure;

        container.toolbar?.extensionView?.attachExtension(ToolbarDisplayExtensionIds.MYSTERY_BOX, this._window);

        const sessionDataManager = container.sessionDataManager;

        sessionDataManager?.events.on(MysteryBoxKeysUpdateEvent.MYSTERY_BOX_KEYS_UPDATE, this.onKeysUpdated, this);

        // AS3 runs setMinimised(minimised), then setKeyColors(); both feed refresh() here, and the
        // fold state already lives on the config, so the one pass covers both.
        this.setKeyColors(sessionDataManager?.mysteryBoxColor ?? '', sessionDataManager?.mysteryKeyColor ?? '');
    }

    /**
     * AS3 switches on `event.target.name`; this port's window manager passes the window that
     * raised the event as the procedure's second argument, which is the same window.
     *
     * `minimize_region`/`maximize_region` are the corner buttons of the layout this AS3 shipped
     * with — kept because they are the AS3 branches; the current layout folds on `bg_region`.
     */
    // AS3: MysteryBoxToolbarExtension.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'minimize_region':
                this.setMinimised(true);
                break;
            case 'maximize_region':
                this.setMinimised(false);
                break;
            case 'bg_region':
                this.setMinimised(!this.minimised);
                break;
            case 'faq_link':
                HabboWebTools.openWebPage(this.faqUrl, 'habboMain');
                break;
        }
    };

    /**
     * TS-only: the one place that touches the window, after `GroupRoomInfoCtrl.refresh()`.
     *
     * Either half can be empty — a user can hold a box with no key, or the reverse — so the two
     * slots are driven independently, and the small icons only ever show while folded. The loop
     * runs over `box_region`/`box_colour`/`box_overlay`/`small_box`, then the same four for the
     * key; AS3 spells both blocks out.
     */
    // TS-only: no AS3 counterpart; AS3 paints from setMinimised()/setKeyColors() directly.
    private refresh(): void
    {
        const window = this._window;

        if(window === null) return;

        const expanded = !this.minimised;

        this.setChildVisible('mysterybox_bg', expanded);
        this.setChildVisible('mysterybox_bg_contracted', !expanded);
        this.setChildVisible('desc_txt', expanded);
        this.setChildVisible('faq_link', expanded && this.faqUrl !== '');
        this.setChildVisible('minimize_region', expanded);
        this.setChildVisible('maximize_region', !expanded);

        for(const [slot, colorName] of [['box', this._boxColor], ['key', this._keyColor]] as const)
        {
            const has = colorName !== '';

            this.setChildVisible(`${slot}_region`, expanded);
            this.setChildVisible(`${slot}_colour`, has);
            this.setChildVisible(`${slot}_overlay`, has);
            this.setChildVisible(`small_${slot}`, has && !expanded);

            const region = window.findChildByName(`${slot}_region`) as IRegionWindow | null;

            if(region) region.toolTipCaption = has ? `\${mysterybox.tracker.${slot}.${colorName.toLowerCase()}}` : '';

            if(has)
            {
                const color = KEY_COLORS[colorName.toLowerCase()] ?? 0;

                this.setChildColor(`${slot}_colour`, color);
                this.setChildColor(`small_${slot}`, color);
            }
        }

        window.height = expanded
            ? MysteryBoxToolbarExtension.HEIGHT_EXPANDED
            : MysteryBoxToolbarExtension.HEIGHT_MINIMISED;
    }

    // AS3: MysteryBoxToolbarExtension.as::setKeyColors()
    private setKeyColors(boxColor: string, keyColor: string): void
    {
        this._boxColor = boxColor ?? '';
        this._keyColor = keyColor ?? '';

        this.refresh();
    }

    // AS3: MysteryBoxToolbarExtension.as::onKeysUpdated()
    private onKeysUpdated(event: MysteryBoxKeysUpdateEvent): void
    {
        this.setKeyColors(event.boxColor, event.keyColor);
    }

    /**
     * The collapsed/expanded state is a config property, not a field — it survives room changes
     * and reloads because the toolbar rebuilds the tracker from it every time.
     */
    // AS3: MysteryBoxToolbarExtension.as::get minimised()
    private get minimised(): boolean
    {
        return this._handler?.container?.config?.getBoolean(MysteryBoxToolbarExtension.MINIMISED_CONFIG_KEY) ?? false;
    }

    // AS3: MysteryBoxToolbarExtension.as::setMinimised()
    private setMinimised(value: boolean): void
    {
        if(this._handler === null || this._window === null) return;

        this._handler.container?.config?.setProperty(MysteryBoxToolbarExtension.MINIMISED_CONFIG_KEY, value ? 'true' : 'false');

        this.refresh();
    }

    // TS-only: convenience accessor over the config property the AS3 reads inline twice.
    private get faqUrl(): string
    {
        return this._handler?.container?.config?.getProperty('mysterybox.faq.url') ?? '';
    }

    private setChildVisible(name: string, visible: boolean): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.visible = visible;
    }

    private setChildColor(name: string, color: number): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.color = color;
    }

    // AS3: MysteryBoxToolbarExtension.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: MysteryBoxToolbarExtension.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._handler !== null)
        {
            const container = this._handler.container;

            if(container)
            {
                container.toolbar?.extensionView?.detachExtension(ToolbarDisplayExtensionIds.MYSTERY_BOX);
                container.sessionDataManager?.events.off(
                    MysteryBoxKeysUpdateEvent.MYSTERY_BOX_KEYS_UPDATE, this.onKeysUpdated, this
                );
            }

            this._handler = null;
        }

        this._disposed = true;
    }
}
