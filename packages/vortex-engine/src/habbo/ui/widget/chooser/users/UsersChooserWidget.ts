import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomWidgetHandler} from '../../../IRoomWidgetHandler';
import type {UserChooserWidgetHandler} from '../../../handler/UserChooserWidgetHandler';
import {ChooserWidgetBase} from '../ChooserWidgetBase';
import type {ChooserItem} from '../ChooserItem';
import {RoomWidgetChooserContentEvent} from '../../events/RoomWidgetChooserContentEvent';
import {RoomWidgetRoomObjectUpdateEvent} from '../../events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetRequestWidgetMessage} from '../../messages/RoomWidgetRequestWidgetMessage';
import {UsersView} from './UsersView';

/**
 * Owns the list behind the user chooser and keeps it current: anyone entering or leaving the room
 * re-asks for the whole list, on a 100ms delay so a burst of arrivals costs one rebuild.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserWidget.as
 */
export class UsersChooserWidget extends ChooserWidgetBase
{
    // AS3: .../chooser/users/UsersChooserWidget.as::STATE_USER_CHOOSER_CLOSED
    private static readonly STATE_USER_CHOOSER_CLOSED: number = 0;

    // AS3: .../chooser/users/UsersChooserWidget.as::STATE_USER_CHOOSER_OPEN
    private static readonly STATE_USER_CHOOSER_OPEN: number = 1;

    // AS3: .../chooser/users/UsersChooserWidget.as::REFRESH_DELAY
    // Name DERIVED: the 100ms one-shot AS3 starts on every add/remove.
    private static readonly REFRESH_DELAY: number = 100;

    // AS3: .../chooser/users/UsersChooserWidget.as::_view
    private _view: UsersView | null = null;

    // AS3: .../chooser/users/UsersChooserWidget.as::_items
    private _items: ChooserItem[] = [];

    // AS3: .../chooser/users/UsersChooserWidget.as::UsersChooserWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::get items()
    get items(): ChooserItem[]
    {
        return this._items;
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::get mainWindow()
    // Not overridden in AS3 — the view places its own window against the parent's corner.
    override get mainWindow(): IWindow | null
    {
        return null;
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::get state()
    // The desktop reads this to know whether to reopen the chooser after a room change.
    override get state(): number
    {
        return this._view !== null && this._view.isOpen()
            ? UsersChooserWidget.STATE_USER_CHOOSER_OPEN
            : UsersChooserWidget.STATE_USER_CHOOSER_CLOSED;
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetChooserContentEvent.USER_CHOOSER_CONTENT, this.onChooserContent);
        events.on(RoomWidgetRoomObjectUpdateEvent.USER_REMOVED, this.onUpdateUserChooser);
        events.on(RoomWidgetRoomObjectUpdateEvent.USER_ADDED, this.onUpdateUserChooser);

        super.registerUpdateEvents(events);
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::unregisterUpdateEvents()
    // No super call, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetChooserContentEvent.USER_CHOOSER_CONTENT, this.onChooserContent);
        events.off(RoomWidgetRoomObjectUpdateEvent.USER_REMOVED, this.onUpdateUserChooser);
        events.off(RoomWidgetRoomObjectUpdateEvent.USER_ADDED, this.onUpdateUserChooser);
    }

    /**
     * Only state 1 asks for the list — the desktop passes the widget's previous state back in
     * after a room change, so a chooser that was open reopens itself and one that was closed
     * stays closed. A room with `chooser_disabled` refuses either way.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserWidget.as::initialize()
    override initialize(state: number = 0): void
    {
        super.initialize(state);

        if(this.ownHandler?.isChooserDisabled() === true) return;

        if(state !== UsersChooserWidget.STATE_USER_CHOOSER_OPEN) return;

        this.messageListener?.processWidgetMessage(
            new RoomWidgetRequestWidgetMessage(RoomWidgetRequestWidgetMessage.REQUEST_USER_CHOOSER)
        );
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::dispose()
    override dispose(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        super.dispose();
    }

    // AS3: .../chooser/users/UsersChooserWidget.as::get ownHandler()
    // AS3 casts `_handler` at the one use; folded into an accessor here.
    private get ownHandler(): UserChooserWidgetHandler | null
    {
        return (this._handler as unknown as UserChooserWidgetHandler | null) ?? null;
    }

    /**
     * Sorts by lower-cased name and then by id **descending** — AS3's `sortOn` flag 16 is
     * DESCENDING, applied to the second key only — so same-named users are listed newest first.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserWidget.as::onChooserContent()
    private onChooserContent = (event: RoomWidgetChooserContentEvent): void =>
    {
        if(event === null || event === undefined || event.items === null) return;

        if(this._view === null) this._view = new UsersView(this, '${widget.chooser.user.title}');

        this._items = [...event.items];

        this._items.sort((a, b) =>
        {
            if(a.lowerCaseName < b.lowerCaseName) return -1;

            if(a.lowerCaseName > b.lowerCaseName) return 1;

            return b.id - a.id;
        });

        this._view.onItemsChanged();
    };

    /**
     * Only refreshes while the window is up, and only after a 100ms one-shot — the room object is
     * not in the user-data manager yet at the moment the event fires, so asking immediately would
     * miss the very user who just arrived.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserWidget.as::onUpdateUserChooser()
    private onUpdateUserChooser = (): void =>
    {
        if(this._view === null || !this._view.isOpen()) return;

        setTimeout(() =>
        {
            if(this.disposed) return;

            this.messageListener?.processWidgetMessage(
                new RoomWidgetRequestWidgetMessage(RoomWidgetRequestWidgetMessage.REQUEST_USER_CHOOSER)
            );
        }, UsersChooserWidget.REFRESH_DELAY);
    };
}
