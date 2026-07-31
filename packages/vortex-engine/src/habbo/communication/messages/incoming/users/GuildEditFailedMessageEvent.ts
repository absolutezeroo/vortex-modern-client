import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuildEditFailedMessageParser} from '../../parser/users/GuildEditFailedMessageParser';

/**
 * GuildEditFailedMessageEvent (header 496)
 *
 * Refusal of a create-or-edit attempt. Reason
 * `GuildEditFailedMessageParser.REASON_HC_REQUIRED` opens the HC-required window; every
 * other reason becomes a localized alert keyed `group.edit.fail.<reason>`.
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildEditFailed()`);
 * the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2051.as
 */
export class GuildEditFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildEditFailedMessageParser);
    }

    // AS3: .../_SafeCls_2051.as::get reason()
    get reason(): number
    {
        return (this._parser as GuildEditFailedMessageParser).reason;
    }
}
