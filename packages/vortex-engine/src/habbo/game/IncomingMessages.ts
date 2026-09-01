import type {IDisposable} from '@core/runtime/IDisposable';
import {
    InfoHotelClosedMessageEvent
} from '@habbo/communication/messages/incoming/notifications/InfoHotelClosedMessageEvent';
import {
    InfoHotelClosingMessageEvent
} from '@habbo/communication/messages/incoming/notifications/InfoHotelClosingMessageEvent';
import {
    MaintenanceStatusMessageEvent
} from '@habbo/communication/messages/incoming/availability/MaintenanceStatusMessageEvent';
import type {HabboGameManager} from './HabboGameManager';

/**
 * The game manager's own three subscriptions, all of them the same thing said three ways: the hotel
 * is going down.
 *
 * Nothing here is game-specific — `hotelClosed` is read by `isHotelClosed`, which the games window
 * uses to refuse to start anything. The snow-war engine has its own, much larger handler
 * (`SnowWarIncomingMessages`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/IncomingMessages.as
 */
export class IncomingMessages implements IDisposable
{
    // AS3: IncomingMessages.as::_gameManager
    private _gameManager: HabboGameManager | null;

    // AS3: IncomingMessages.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: IncomingMessages.as::IncomingMessages()
    constructor(gameManager: HabboGameManager)
    {
        this._gameManager = gameManager;

        const communication = gameManager.communication;

        if(!communication) return;

        communication.addHabboConnectionMessageEvent(new MaintenanceStatusMessageEvent(() => this.onHotelClosed()));
        communication.addHabboConnectionMessageEvent(new InfoHotelClosingMessageEvent(() => this.onHotelClosed()));
        communication.addHabboConnectionMessageEvent(new InfoHotelClosedMessageEvent(() => this.onHotelClosed()));
    }

    // AS3: IncomingMessages.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: IncomingMessages.as::onHotelClosed()
    private onHotelClosed(): void
    {
        if(this._gameManager) this._gameManager.hotelClosed = true;
    }

    // AS3: IncomingMessages.as::dispose()
    public dispose(): void
    {
        this._gameManager = null;
        this._disposed = true;
    }
}
