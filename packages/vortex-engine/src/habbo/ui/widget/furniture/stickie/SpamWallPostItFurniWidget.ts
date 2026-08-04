import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {
    RoomWidgetStickieDataUpdateEvent
} from '@habbo/ui/widget/events/RoomWidgetStickieDataUpdateEvent';
import {
    RoomWidgetSpamWallPostItEditEvent
} from '@habbo/ui/widget/events/RoomWidgetSpamWallPostItEditEvent';
import {
    RoomWidgetSpamWallPostItFinishEditingMessage
} from '@habbo/ui/widget/messages/RoomWidgetSpamWallPostItFinishEditingMessage';
import {StickieFurniWidget} from './StickieFurniWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.stickie.SpamWallPostItFurniWidget');

/**
 * SpamWallPostItFurniWidget
 *
 * The sticky note the server asks for when a post-it is hung on a spam wall. It reuses the
 * ordinary note's whole interface and changes only where the text goes: there is nothing to
 * load, so it opens blank and yellow, and it sends the finished note in one message rather
 * than writing every keystroke back.
 *
 * That is also why the colour buttons behave differently here — picking one only redraws,
 * because nothing is committed until the editor closes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/stickie/SpamWallPostItFurniWidget.as
 */
export class SpamWallPostItFurniWidget extends StickieFurniWidget
{
    /** The note's default colour, straight from AS3. */
    // AS3: .../SpamWallPostItFurniWidget.as::onEditPostItRequest()
    private static readonly DEFAULT_COLOR_HEX: string = 'FFFF33';

    // AS3: .../SpamWallPostItFurniWidget.as::_SafeStr_5184
    private _location: string = '';

    // AS3: .../SpamWallPostItFurniWidget.as::SpamWallPostItFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null
    )
    {
        super(handler, windowManager, assets);

        // AS3 sets this BEFORE calling super(), which TypeScript cannot do - the base's own
        // field initialiser would overwrite it. Assigned straight after instead, which lands
        // at the same point in practice: nothing reads it until showInterface() runs.
        this._windowName = 'spamwall_postit_container';
    }

    // AS3: .../SpamWallPostItFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        dispatcher.on(RoomWidgetSpamWallPostItEditEvent.OPEN_EDITOR, this.onEditPostItRequest);

        super.registerUpdateEvents(dispatcher);
    }

    /** AS3 does NOT chain to super() here, unlike registerUpdateEvents(). Preserved. */
    // AS3: .../SpamWallPostItFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        dispatcher.off(RoomWidgetSpamWallPostItEditEvent.OPEN_EDITOR, this.onEditPostItRequest);
    }

    /** Deliberately empty: this note never receives a data update, only an open request. */
    // AS3: .../SpamWallPostItFurniWidget.as::onObjectUpdate()
    protected override onObjectUpdate(_event: RoomWidgetStickieDataUpdateEvent): void
    {
    }

    // AS3: .../SpamWallPostItFurniWidget.as::onEditPostItRequest()
    private onEditPostItRequest = (event: RoomWidgetSpamWallPostItEditEvent): void =>
    {
        this.hideInterface(false);

        this._objectId = event.objectId;
        this._location = event.location;
        this._objectType = event.objectType;
        this._text = '';
        this._colorHex = SpamWallPostItFurniWidget.DEFAULT_COLOR_HEX;
        this._controller = true;

        this.showInterface();
    };

    // AS3: .../SpamWallPostItFurniWidget.as::sendUpdate()
    protected override sendUpdate(): void
    {
        if(this._objectId === -1) return;

        this.storeTextFromField();

        log.debug('Spamwall Post-It Widget Send Update');

        this.messageListener?.processWidgetMessage(new RoomWidgetSpamWallPostItFinishEditingMessage(
            RoomWidgetSpamWallPostItFinishEditingMessage.SEND_POSTIT_DATA,
            this._objectId,
            this._location,
            this._text ?? '',
            this._colorHex
        ));

        this.hideInterface(false);
    }

    /** Redraws in the new colour and sends nothing — the note travels once, on close. */
    // AS3: .../SpamWallPostItFurniWidget.as::sendSetColor()
    protected override sendSetColor(color: number): void
    {
        this.storeTextFromField();

        let hex = color.toString(16).toUpperCase();

        if(hex.length > 6)
        {
            hex = hex.slice(hex.length - 6, hex.length);
        }

        if(hex === this._colorHex) return;

        this._colorHex = hex;

        this.showInterface();
    }

    /** Nothing to delete server-side: the note does not exist there until it is sent. */
    // AS3: .../SpamWallPostItFurniWidget.as::sendDelete()
    protected override sendDelete(): void
    {
        this.hideInterface(false);
    }

    // AS3: .../SpamWallPostItFurniWidget.as::dispose()
    public override dispose(): void
    {
        this._objectId = -1;
        this._location = '';

        super.dispose();
    }
}
