import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {NewConsoleMessageEvent} from '@habbo/communication/messages/incoming/friendlist/NewConsoleMessageEvent';
import {RoomInviteEvent} from '@habbo/communication/messages/incoming/friendlist/RoomInviteEvent';
import type {NewConsoleMessageEventParser} from '@habbo/communication/messages/parser/friendlist/NewConsoleMessageEventParser';
import type {RoomInviteEventParser} from '@habbo/communication/messages/parser/friendlist/RoomInviteEventParser';
import {Logger} from '@core/utils/Logger';

import type {HabboHelp} from '../../../HabboHelp';

const log = Logger.getLogger('habbo.help.cfh.registry.instantmessage.InstantMessageEventHandler');

/**
 * Instant message event listener for CFH reports
 *
 * Captures console messages and room invites and stores them
 * in the InstantMessageRegistry for later use in CFH reports.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as
 */
export class InstantMessageEventHandler
{
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::_help
    private _help: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::InstantMessageEventHandler()
    constructor(help: HabboHelp)
    {
        this._help = help;

        this._help.addMessageEvent(new NewConsoleMessageEvent(this.onInstantMessage.bind(this)));
        this._help.addMessageEvent(new RoomInviteEvent(this.onRoomInvite.bind(this)));

        log.debug('InstantMessageEventHandler initialized');
    }

    /**
	 * Whether this handler has been disposed
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._help === null;
    }

    /**
	 * Store an incoming console message in the CFH instant-message registry
	 *
	 * AS3 branches on `chatId < 0` and then runs the same `addItem()` call in both
	 * arms — kept as one call here, the branch is a no-op in the source too.
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::onInstantMessage()
    onInstantMessage(event: IMessageEvent): void
    {
        if(!this._help) return;

        const parser = event.parser as NewConsoleMessageEventParser | null;

        if(!parser) return;

        this._help.instantMessageRegistry.addItem(parser.chatId, parser.senderName, parser.messageText);
    }

    /**
	 * Store an incoming room invite in the CFH instant-message registry
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::onRoomInvite()
    onRoomInvite(event: IMessageEvent): void
    {
        if(!this._help) return;

        const parser = event.parser as RoomInviteEventParser | null;

        if(!parser) return;

        this._help.instantMessageRegistry.addItem(parser.senderId, '', parser.messageText);
    }

    /**
	 * Dispose of this handler
	 *
	 * The two message events are owned by `HabboHelp._messageEvents` — as in AS3, which
	 * registers them through `help.addMessageEvent()` and unregisters the whole vector in
	 * `HabboHelp.dispose()`, not here.
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._help = null;
    }
}
