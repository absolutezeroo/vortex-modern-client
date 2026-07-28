/**
 * PlaceholderWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/placeholder/PlaceholderWidget.as
 *
 * Shown when a furni has no visualization the client can render. Holds no per-object state: the
 * event that opens it carries nothing, so every placeholder furni gets the same window.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetShowPlaceholderEvent} from '@habbo/ui/widget/events/RoomWidgetShowPlaceholderEvent';
import {PlaceholderView} from './PlaceholderView';

export class PlaceholderWidget extends RoomWidgetBase
{
    // AS3: PlaceholderWidget.as::_SafeStr_4550
    private _view: PlaceholderView | null = null;

    // AS3: PlaceholderWidget.as::PlaceholderWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: PlaceholderWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetShowPlaceholderEvent.SHOW_PLACEHOLDER, this.onShowEvent, this);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: PlaceholderWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetShowPlaceholderEvent.SHOW_PLACEHOLDER, this.onShowEvent, this);
    }

    // AS3: PlaceholderWidget.as::onShowEvent()
    private onShowEvent(_event: RoomWidgetShowPlaceholderEvent): void
    {
        this.showInterface();
    }

    // AS3: PlaceholderWidget.as::showInterface()
    private showInterface(): void
    {
        if(this._view === null)
        {
            this._view = new PlaceholderView(this.assets, this.windowManager);
        }

        this._view.showWindow();
    }

    /**
     * AS3: PlaceholderWidget.as::hideInterface()
     *
     * Nothing calls it — AS3 declares it private and never invokes it, so the view outlives every
     * close until the widget itself is disposed. Ported rather than dropped: a missing private is
     * still a missing member, and its absence is what would hide the leak if one is ever traced.
     */
    private hideInterface(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    // AS3: PlaceholderWidget.as::dispose()
    public override dispose(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        super.dispose();
    }
}
