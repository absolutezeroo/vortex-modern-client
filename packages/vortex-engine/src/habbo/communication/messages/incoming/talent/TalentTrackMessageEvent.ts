import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TalentTrackMessageEventParser} from '../../parser/talent/TalentTrackMessageEventParser';

/**
 * The whole talent track. Header 3909, from WIN63's own registry.
 *
 * Name from `sources/win63_version/habbo/communication/messages/incoming/talent/TalentTrackMessageEvent.as`,
 * corroborated by the emulator's header table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2634/_SafeCls_2633.as
 */
export class TalentTrackMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2633.as::_SafeCls_2633()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TalentTrackMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_2633.as::getParser()
    get talentParser(): TalentTrackMessageEventParser
    {
        return this._parser as TalentTrackMessageEventParser;
    }
}
