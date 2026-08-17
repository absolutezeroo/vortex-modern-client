import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TalentTrackLevelMessageEventParser} from '../../parser/talent/TalentTrackLevelMessageEventParser';

/**
 * The level a talent track stands at. Header 2210, from WIN63's own registry.
 *
 * Name from `sources/win63_version/habbo/communication/messages/incoming/talent/TalentTrackLevelMessageEvent.as`,
 * corroborated by the emulator's header table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2634/_SafeCls_3387.as
 */
export class TalentTrackLevelMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3387.as::_SafeCls_3387()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TalentTrackLevelMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_3387.as::getParser()
    get talentParser(): TalentTrackLevelMessageEventParser
    {
        return this._parser as TalentTrackLevelMessageEventParser;
    }
}
