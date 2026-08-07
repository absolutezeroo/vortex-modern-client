import type {IWindow} from '@core/window/IWindow';
import type EventEmitter from 'eventemitter3';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetDoorbellEvent} from '../events/RoomWidgetDoorbellEvent';
import {RoomWidgetLetUserInMessage} from '../messages/RoomWidgetLetUserInMessage';
import {DoorbellView} from './DoorbellView';

/**
 * Who is waiting at a doorbell-locked room's door, and the two answers you can give.
 *
 * The widget owns the list; the view only draws it. Note that `deny()` is also what a *full* list
 * does to the 51st caller — the cap is enforced by turning them away, not by ignoring them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/doorbell/DoorbellWidget.as
 */
export class DoorbellWidget extends RoomWidgetBase
{
    // AS3: .../DoorbellWidget.as::MAX_USERS_ON_DOORBELL_LIST
    private static readonly MAX_USERS_ON_DOORBELL_LIST: number = 50;

    // AS3: .../DoorbellWidget.as::_users
    private _users: string[] = [];

    // AS3: .../DoorbellWidget.as::_view
    private _view: DoorbellView | null;

    // AS3: .../DoorbellWidget.as::DoorbellWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._view = new DoorbellView(this);
    }

    // AS3: .../DoorbellWidget.as::get mainWindow()
    override get mainWindow(): IWindow | null
    {
        return this._view?.mainWindow ?? null;
    }

    // AS3: .../DoorbellWidget.as::get users()
    get users(): string[]
    {
        return this._users;
    }

    // AS3: .../DoorbellWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetDoorbellEvent.RINGING, this.onDoorbellRinging);
        events.on(RoomWidgetDoorbellEvent.REJECTED, this.onDoorbellHandled);
        events.on(RoomWidgetDoorbellEvent.ACCEPTED, this.onDoorbellHandled);

        super.registerUpdateEvents(events);
    }

    // AS3: .../DoorbellWidget.as::unregisterUpdateEvents()
    // AS3 does *not* call super here where `registerUpdateEvents` does — kept as written.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetDoorbellEvent.RINGING, this.onDoorbellRinging);
        events.off(RoomWidgetDoorbellEvent.REJECTED, this.onDoorbellHandled);
        events.off(RoomWidgetDoorbellEvent.ACCEPTED, this.onDoorbellHandled);
    }

    /**
     * AS3: .../DoorbellWidget.as::addUser()
     *
     * A name already on the list is ignored; past the cap the caller is denied outright rather
     * than queued.
     */
    addUser(userName: string): void
    {
        if(this._users.indexOf(userName) !== -1) return;

        if(this._users.length >= DoorbellWidget.MAX_USERS_ON_DOORBELL_LIST)
        {
            this.deny(userName);

            return;
        }

        this._users.push(userName);
        this._view?.update();
    }

    // AS3: .../DoorbellWidget.as::removeUser()
    removeUser(userName: string): void
    {
        const index = this._users.indexOf(userName);

        if(index === -1) return;

        this._users.splice(index, 1);
        this._view?.update();
    }

    // AS3: .../DoorbellWidget.as::accept()
    accept(userName: string): void
    {
        this.messageListener?.processWidgetMessage(new RoomWidgetLetUserInMessage(userName, true));
        this.removeUser(userName);
    }

    // AS3: .../DoorbellWidget.as::deny()
    deny(userName: string): void
    {
        this.messageListener?.processWidgetMessage(new RoomWidgetLetUserInMessage(userName, false));
        this.removeUser(userName);
    }

    // AS3: .../DoorbellWidget.as::denyAll()
    // Always index 0: `deny()` removes the entry, so the list shortens under the loop.
    denyAll(): void
    {
        while(this._users.length > 0)
        {
            this.deny(this._users[0]);
        }
    }

    // AS3: .../DoorbellWidget.as::onDoorbellRinging()
    private onDoorbellRinging = (event: RoomWidgetDoorbellEvent): void =>
    {
        this.addUser(event.userName);
    };

    // AS3: .../DoorbellWidget.as::onDoorbellHandled()
    // Both the accepted and the rejected answers do the same thing here: the row goes away.
    private onDoorbellHandled = (event: RoomWidgetDoorbellEvent): void =>
    {
        this.removeUser(event.userName);
    };

    // AS3: .../DoorbellWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._users = [];

        super.dispose();
    }
}
