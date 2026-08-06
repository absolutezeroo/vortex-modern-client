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

// AS3: MysteryBoxToolbarExtension.as::_SafeStr_11315
const MINIMISED_CONFIG_KEY: string = 'mystery_box_toolbar_extension_minimised';

// AS3: MysteryBoxToolbarExtension.as::createWindow() / setMinimised() — the two window heights.
const HEIGHT_MINIMISED: number = 25;
const HEIGHT_EXPANDED: number = 137;

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
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/mysterybox/MysteryBoxToolbarExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: MysteryBoxToolbarExtension.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: MysteryBoxToolbarExtension.as::_SafeStr_4574 (the handler)
    private _handler: FurnitureContextMenuWidgetHandler | null;

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

        const faqLink = this._window.findChildByName('faq_link');

        if(faqLink) faqLink.visible = (container.config?.getProperty('mysterybox.faq.url') ?? '') !== '';

        this._window.procedure = this.windowProcedure;

        container.toolbar?.extensionView?.attachExtension(ToolbarDisplayExtensionIds.MYSTERY_BOX, this._window);

        const sessionDataManager = container.sessionDataManager;

        sessionDataManager?.events.on(MysteryBoxKeysUpdateEvent.MYSTERY_BOX_KEYS_UPDATE, this.onKeysUpdated, this);

        this.setMinimised(this.minimised);
        this.setKeyColors(sessionDataManager?.mysteryBoxColor ?? '', sessionDataManager?.mysteryKeyColor ?? '');
    }

    /**
     * AS3 switches on `event.target.name`; this port's window manager passes the window that
     * raised the event as the procedure's second argument, which is the same window.
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
            case 'faq_link':
                HabboWebTools.openWebPage(
                    this._handler?.container?.config?.getProperty('mysterybox.faq.url') ?? '',
                    'habboMain'
                );
                break;
        }
    };

    /**
     * Either half can be empty — a user can hold a box with no key, or the reverse — so the two
     * blocks are independent, and the small icons only ever show while minimised.
     */
    // AS3: MysteryBoxToolbarExtension.as::setKeyColors()
    private setKeyColors(boxColor: string, keyColor: string): void
    {
        const window = this._window;

        if(window === null) return;

        const hasBox = boxColor !== null && boxColor !== '';

        this.setChildVisible('box_colour', hasBox);
        this.setChildVisible('box_overlay', hasBox);
        this.setChildVisible('small_box', hasBox && this.minimised);

        const boxRegion = window.findChildByName('box_region') as IRegionWindow | null;

        if(boxRegion) boxRegion.toolTipCaption = hasBox ? `\${mysterybox.tracker.box.${boxColor.toLowerCase()}}` : '';

        if(hasBox)
        {
            const color = KEY_COLORS[boxColor.toLowerCase()] ?? 0;

            this.setChildColor('box_colour', color);
            this.setChildColor('small_box', color);
        }

        const hasKey = keyColor !== null && keyColor !== '';

        this.setChildVisible('key_colour', hasKey);
        this.setChildVisible('key_overlay', hasKey);
        this.setChildVisible('small_key', hasKey && this.minimised);

        const keyRegion = window.findChildByName('key_region') as IRegionWindow | null;

        if(keyRegion) keyRegion.toolTipCaption = hasKey ? `\${mysterybox.tracker.key.${keyColor.toLowerCase()}}` : '';

        if(hasKey)
        {
            const color = KEY_COLORS[keyColor.toLowerCase()] ?? 0;

            this.setChildColor('key_colour', color);
            this.setChildColor('small_key', color);
        }
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
        return this._handler?.container?.config?.getBoolean(MINIMISED_CONFIG_KEY) ?? false;
    }

    // AS3: MysteryBoxToolbarExtension.as::setMinimised()
    private setMinimised(value: boolean): void
    {
        const window = this._window;

        if(this._handler === null || window === null) return;

        if(value)
        {
            this.setChildVisible('minimize_region', false);
            this.setChildVisible('maximize_region', true);
            this.setChildVisible('small_box', window.findChildByName('box_colour')?.visible ?? false);
            this.setChildVisible('small_key', window.findChildByName('key_colour')?.visible ?? false);
            window.height = HEIGHT_MINIMISED;
        }
        else
        {
            this.setChildVisible('minimize_region', true);
            this.setChildVisible('maximize_region', false);
            this.setChildVisible('small_box', false);
            this.setChildVisible('small_key', false);
            window.height = HEIGHT_EXPANDED;
        }

        this._handler.container?.config?.setProperty(MINIMISED_CONFIG_KEY, value ? 'true' : 'false');
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
