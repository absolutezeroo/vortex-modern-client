import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetPollUpdateEvent} from '../events/RoomWidgetPollUpdateEvent';
import {PollSession} from './PollSession';

const log = Logger.getLogger('habbo.ui.widget.poll.PollWidget');

/**
 * Owns the polls in flight, one `PollSession` per poll id. It draws nothing itself — every
 * window belongs to a session's dialogs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/PollWidget.as
 */
export class PollWidget extends RoomWidgetBase
{
    // AS3: .../widget/poll/PollWidget.as::_sessions
    private _sessions: Map<number, PollSession> | null = new Map();

    // AS3: .../widget/poll/PollWidget.as::PollWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../widget/poll/PollWidget.as::get mainWindow()
    // Not overridden in AS3 — the dialogs centre themselves.
    override get mainWindow(): IWindow | null
    {
        return null;
    }

    // AS3: .../widget/poll/PollWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetPollUpdateEvent.OFFER, this.showPollOffer);
        events.on(RoomWidgetPollUpdateEvent.ERROR, this.showPollError);
        events.on(RoomWidgetPollUpdateEvent.CONTENT, this.showPollContent);

        super.registerUpdateEvents(events);
    }

    // AS3: .../widget/poll/PollWidget.as::unregisterUpdateEvents()
    // No super call, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetPollUpdateEvent.OFFER, this.showPollOffer);
        events.off(RoomWidgetPollUpdateEvent.ERROR, this.showPollError);
        events.off(RoomWidgetPollUpdateEvent.CONTENT, this.showPollContent);
    }

    // AS3: .../widget/poll/PollWidget.as::dispose()
    // Every session is disposed; AS3 walks the map taking index 0 each time, which works because
    // the disposal does not remove entries — the whole map is thrown away after.
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._sessions !== null)
        {
            for(const session of this._sessions.values())
            {
                session.dispose();
            }

            this._sessions.clear();
            this._sessions = null;
        }

        super.dispose();
    }

    /**
     * Thanks first, then teardown — `showThanks()` needs the session's end message, so the order
     * matters.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/PollWidget.as::pollFinished()
    pollFinished(id: number): void
    {
        const session = this._sessions?.get(id) ?? null;

        if(session === null) return;

        session.showThanks();
        session.dispose();
        this._sessions?.delete(id);
    }

    // AS3: .../widget/poll/PollWidget.as::pollCancelled()
    // The same as finishing, minus the thanks.
    pollCancelled(id: number): void
    {
        const session = this._sessions?.get(id) ?? null;

        if(session === null) return;

        session.dispose();
        this._sessions?.delete(id);
    }

    /**
     * A second offer for a live poll logs and **re-offers on the existing session** rather than
     * replacing it — `showOffer()` disposes the previous offer window itself.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/PollWidget.as::showPollOffer()
    private showPollOffer = (event: RoomWidgetPollUpdateEvent): void =>
    {
        if(this._sessions === null) return;

        let session = this._sessions.get(event.id) ?? null;

        if(session === null)
        {
            session = new PollSession(event.id, this);
            this._sessions.set(event.id, session);
        }
        else
        {
            log.debug('Poll with given id already exists!');
        }

        session.showOffer(event.headline, event.summary);
    };

    // AS3: .../widget/poll/PollWidget.as::showPollError()
    // Errors are not tied to a session — they are a plain alert carrying the server's summary.
    private showPollError = (event: RoomWidgetPollUpdateEvent): void =>
    {
        this.windowManager.alert('${win_error}', event.summary, 0, (dialog) => dialog.dispose());
    };

    // AS3: .../widget/poll/PollWidget.as::showPollContent()
    // Content for an unknown id is dropped — the offer is what creates the session.
    private showPollContent = (event: RoomWidgetPollUpdateEvent): void =>
    {
        const session = this._sessions?.get(event.id) ?? null;

        if(session === null) return;

        session.showContent(event.startMessage, event.endMessage, event.questionArray, event.npsPoll);
    };
}
