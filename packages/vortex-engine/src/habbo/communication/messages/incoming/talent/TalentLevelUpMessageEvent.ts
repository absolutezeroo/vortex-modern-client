import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TalentLevelUpMessageEventParser} from '../../parser/talent/TalentLevelUpMessageEventParser';

/**
 * A talent-track level was completed, with its rewards. Header 1564, from WIN63's own registry.
 *
 * Name from `sources/win63_version/habbo/communication/messages/incoming/talent/TalentLevelUpMessageEvent.as`,
 * corroborated by the emulator's header table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2634/_SafeCls_2729.as
 */
export class TalentLevelUpMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2729.as::_SafeCls_2729()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TalentLevelUpMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_2729.as::getParser()
    get talentParser(): TalentLevelUpMessageEventParser
    {
        return this._parser as TalentLevelUpMessageEventParser;
    }
}
