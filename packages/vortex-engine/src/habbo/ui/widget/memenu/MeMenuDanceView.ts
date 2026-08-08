import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IMeMenuView} from './IMeMenuView';
import type {MeMenuWidget} from './MeMenuWidget';
import {Logger} from '@core/utils/Logger';
import {RoomWidgetDanceMessage} from '../messages/RoomWidgetDanceMessage';

const log = Logger.getLogger('habbo.ui.widget.memenu.MeMenuDanceView');

/**
 * The four dance moves, plus stop.
 *
 * The buttons are **built at open time**, not laid out in the XML: styles 2-4 are club-only and
 * are simply not created without a subscription, so the list is as long as the user's entitlement.
 * Wearing an effect disables all of them — you cannot dance in an effect.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuDanceView.as
 */
export class MeMenuDanceView implements IMeMenuView
{
    // AS3: .../widget/memenu/MeMenuDanceView.as::FIRST_DANCE_STYLE
    // Name DERIVED: the 1..4 bounds AS3 loops over inline.
    private static readonly FIRST_DANCE_STYLE: number = 1;

    // AS3: .../widget/memenu/MeMenuDanceView.as::LAST_DANCE_STYLE
    private static readonly LAST_DANCE_STYLE: number = 4;

    // AS3: .../widget/memenu/MeMenuDanceView.as::_widget
    // Name DERIVED (`_SafeStr_4549`).
    private _widget: MeMenuWidget | null = null;

    // AS3: .../widget/memenu/MeMenuDanceView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/memenu/MeMenuDanceView.as::init()
    public init(widget: MeMenuWidget, name: string): void
    {
        this._widget = widget;

        this.createWindow(name);
    }

    // AS3: .../widget/memenu/MeMenuDanceView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../widget/memenu/MeMenuDanceView.as::updateUnseenItemCount()
    // Empty in AS3 too.
    public updateUnseenItemCount(_category: string, _count: number): void
    {
    }

    // AS3: .../widget/memenu/MeMenuDanceView.as::dispose()
    public dispose(): void
    {
        this._widget = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
     * Each dance button is a separate build of the `memenu_dance_button` layout, named
     * `dance_<n>_button` so the click handler can recover the style from the name. They go in at
     * `numListItems - 1` — before the list's last existing item, not appended.
     */
    // AS3: .../widget/memenu/MeMenuDanceView.as::createWindow()
    private createWindow(name: string): void
    {
        const widget = this._widget;

        if(widget === null) return;

        this._window = widget.windowManager.buildWidgetLayout('memenu_dance') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            // AS3 throws here; this runs from a click and a throw would take the room UI down.
            log.warn('memenu_dance did not build — the dance page cannot be shown');
            this._window = null;

            return;
        }

        this._window.name = name;

        for(const buttonName of ['stop_dancing_button', 'back_btn'])
        {
            this._window.findChildByName(buttonName)?.addEventListener('WME_CLICK', this.onButtonClicked);
        }

        const list = this._window.findChildByName('buttonContainer') as IItemListWindow | null;

        if(list !== null && list !== undefined)
        {
            for(let style = MeMenuDanceView.FIRST_DANCE_STYLE; style <= MeMenuDanceView.LAST_DANCE_STYLE; style++)
            {
                // Styles 2-4 are club dances; style 1 is always available.
                const allowed = RoomWidgetDanceMessage.CLUB_DANCES.indexOf(style) >= 0
                    ? widget.allowHabboClubDances
                    : true;

                if(!allowed) continue;

                const button = widget.windowManager.buildWidgetLayout('memenu_dance_button');

                if(button === null || button === undefined) continue;

                button.name = `dance_${style}_button`;
                button.caption = `\${widget.memenu.dance${style}}`;
                button.addEventListener('WME_CLICK', this.onButtonClicked);
                list.addListItemAt(button, list.numListItems - 1);

                if(widget.hasEffectOn) button.disable();
                else button.enable();
            }
        }

        // The club upsell is hidden for a subscriber; everyone else keeps it, whatever the dances.
        const clubInfo = this._window.findChildByName('club_info');

        if(clubInfo !== null && widget.isHabboClubActive) clubInfo.visible = false;
    }

    /**
     * The style is parsed back out of the button's own name — `dance_3_button` → 3 — which is why
     * the names above are built rather than taken from the layout.
     */
    // AS3: .../widget/memenu/MeMenuDanceView.as::onButtonClicked()
    private onButtonClicked = (event: {target?: unknown}): void =>
    {
        const target = event.target as IWindow | null;
        const name = target?.name ?? '';
        const widget = this._widget;

        if(widget === null) return;

        switch(name)
        {
            case 'dance_1_button':
            case 'dance_2_button':
            case 'dance_3_button':
            case 'dance_4_button':
            {
                const style = parseInt(name.split('_')[1], 10);

                widget.messageListener?.processWidgetMessage(new RoomWidgetDanceMessage(style));
                widget.isDancing = true;
                widget.hide();
                this.track('dance_start');

                break;
            }

            case 'stop_dancing_button':
                widget.messageListener?.processWidgetMessage(new RoomWidgetDanceMessage(RoomWidgetDanceMessage.STOP));
                widget.isDancing = false;
                widget.hide();
                this.track('dance_stop');

                break;

            case 'back_btn':
                widget.changeView('me_menu_top_view');

                break;

            default:
                log.debug(`Me Menu Dance View: unknown button: ${name}`);
        }
    };

    // TS-only: AS3 calls the HabboTracking singleton; this port reaches tracking through the
    // handler's container, so the two call sites are folded into one.
    private track(unit: string): void
    {
        this._widget?.handler?.container?.habboTracking?.trackEventLog('MeMenu', 'click', unit);
    }
}
