import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IUpdateReceiver} from '@core/runtime';
import type {Component} from '@core/runtime';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetFriendRequestUpdateEvent} from '../events/RoomWidgetFriendRequestUpdateEvent';
import {RoomWidgetFriendRequestMessage} from '../messages/RoomWidgetFriendRequestMessage';
import {RoomWidgetGetObjectLocationMessage} from '../messages/RoomWidgetGetObjectLocationMessage';
import {RoomWidgetUserLocationUpdateEvent} from '../events/RoomWidgetUserLocationUpdateEvent';
import {RoomWidgetOpenProfileMessage} from '../messages/RoomWidgetOpenProfileMessage';
import {FriendRequestDialog} from './FriendRequestDialog';

/**
 * Holds the friend-request bubbles currently floating in the room, one per request id, and
 * repositions them every frame.
 *
 * It registers itself as an update receiver **only while it has bubbles** — `checkUpdateNeed()`
 * is called after every add and remove, so an empty room costs nothing per frame.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestWidget.as
 */
export class FriendRequestWidget extends RoomWidgetBase implements IUpdateReceiver
{
    // AS3: .../widget/friendrequest/FriendRequestWidget.as::UPDATE_PRIORITY
    // Name DERIVED: AS3 passes 10 to registerUpdateReceiver inline.
    private static readonly UPDATE_PRIORITY: number = 10;

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::USER_TYPE
    // Name DERIVED: AS3 passes 1 as the object type inline — the plain-user type, so a request
    // from a bot or a pet would not resolve.
    private static readonly USER_TYPE: number = 1;

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::_roomUI
    // AS3 types this as the base Component, not as IRoomUI, because all it uses is the
    // register/removeUpdateReceiver pair the base owns — and this port keeps that: those two
    // are not on IRoomUI either.
    private _roomUI: Component | null;

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::_requests
    private _requests: Map<number, FriendRequestDialog> | null = new Map();

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::FriendRequestWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        roomUI: Component | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._roomUI = roomUI;
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::get mainWindow()
    // Not overridden in AS3 — each bubble places itself over an avatar.
    override get mainWindow(): IWindow | null
    {
        return null;
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetFriendRequestUpdateEvent.SHOW_FRIEND_REQUEST, this.eventHandler);
        events.on(RoomWidgetFriendRequestUpdateEvent.HIDE_FRIEND_REQUEST, this.eventHandler);

        super.registerUpdateEvents(events);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::unregisterUpdateEvents()
    // No super call, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetFriendRequestUpdateEvent.SHOW_FRIEND_REQUEST, this.eventHandler);
        events.off(RoomWidgetFriendRequestUpdateEvent.HIDE_FRIEND_REQUEST, this.eventHandler);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._roomUI !== null)
        {
            this._roomUI.removeUpdateReceiver(this);
            this._roomUI = null;
        }

        if(this._requests !== null)
        {
            for(const dialog of this._requests.values())
            {
                dialog.dispose();
            }

            this._requests.clear();
            this._requests = null;
        }

        super.dispose();
    }

    /**
     * Asks where each sender is and hands the answer to its bubble. This is the one consumer of
     * `ObjectLocationRequestHandler`'s synchronous reply, and a null rectangle inside it is what
     * drops a request whose sender left the room.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestWidget.as::update()
    update(_deltaTime: number): void
    {
        if(this._requests === null || this.messageListener === null) return;

        // Copied first: a null rectangle makes the dialog call back into `ignoreRequest`, which
        // removes it from this very map.
        for(const dialog of [...this._requests.values()])
        {
            const answer = this.messageListener.processWidgetMessage(new RoomWidgetGetObjectLocationMessage(
                RoomWidgetGetObjectLocationMessage.GET_OBJECT_LOCATION,
                dialog.userId,
                FriendRequestWidget.USER_TYPE
            ));

            if(answer instanceof RoomWidgetUserLocationUpdateEvent)
            {
                dialog.targetRect = answer.rectangle;
            }
        }
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::checkUpdateNeed()
    // The whole reason the widget is not always in the update loop.
    checkUpdateNeed(): void
    {
        if(this._roomUI === null) return;

        if(this._requests !== null && this._requests.size > 0)
        {
            this._roomUI.registerUpdateReceiver(this, FriendRequestWidget.UPDATE_PRIORITY);
        }
        else
        {
            this._roomUI.removeUpdateReceiver(this);
        }
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::acceptRequest()
    acceptRequest(requestId: number): void
    {
        if(this.messageListener === null) return;

        this.messageListener.processWidgetMessage(
            new RoomWidgetFriendRequestMessage(RoomWidgetFriendRequestMessage.ACCEPT, requestId)
        );
        this.removeRequest(requestId);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::declineRequest()
    declineRequest(requestId: number): void
    {
        if(this.messageListener === null) return;

        this.messageListener.processWidgetMessage(
            new RoomWidgetFriendRequestMessage(RoomWidgetFriendRequestMessage.DECLINE, requestId)
        );
        this.removeRequest(requestId);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::ignoreRequest()
    // Drops the bubble without answering — the request stays pending in the friend list.
    ignoreRequest(requestId: number): void
    {
        this.removeRequest(requestId);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::showProfile()
    // AS3 does not null-check the listener here, unlike the two above.
    showProfile(userId: number, source: string): void
    {
        this.messageListener?.processWidgetMessage(
            new RoomWidgetOpenProfileMessage(RoomWidgetOpenProfileMessage.OPEN_USER_PROFILE, userId, source)
        );
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::eventHandler()
    // `checkUpdateNeed()` runs after *both* branches, including the one that added nothing.
    private eventHandler = (event: RoomWidgetFriendRequestUpdateEvent): void =>
    {
        if(event === null || event === undefined) return;

        switch(event.type)
        {
            case RoomWidgetFriendRequestUpdateEvent.SHOW_FRIEND_REQUEST:
                this.addRequest(
                    event.requestId,
                    new FriendRequestDialog(this, event.requestId, event.userId, event.userName ?? '')
                );
                break;

            case RoomWidgetFriendRequestUpdateEvent.HIDE_FRIEND_REQUEST:
                this.removeRequest(event.requestId);
                break;
        }

        this.checkUpdateNeed();
    };

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::addRequest()
    private addRequest(requestId: number, dialog: FriendRequestDialog): void
    {
        this._requests?.set(requestId, dialog);
    }

    // AS3: .../widget/friendrequest/FriendRequestWidget.as::removeRequest()
    // Calls `checkUpdateNeed()` itself, which is why removing the last bubble leaves the update
    // loop even when the caller is `eventHandler` (which calls it again, harmlessly).
    private removeRequest(requestId: number): void
    {
        const dialog = this._requests?.get(requestId) ?? null;

        if(dialog === null) return;

        this._requests?.delete(requestId);
        dialog.dispose();
        this.checkUpdateNeed();
    }
}
