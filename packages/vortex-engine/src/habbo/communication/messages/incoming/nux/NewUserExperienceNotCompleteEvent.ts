import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    NewUserExperienceNotCompleteEventParser
} from '../../parser/nux/NewUserExperienceNotCompleteEventParser';

/**
 * The server reports that the player has not finished the new-user experience.
 *
 * Handled by AS3: `HabboNuxDialogs.onNewUserExperienceNotCompleteMessage()`, which opens
 * `NuxOfferOldUserView` — the "verify your phone number" offer. The message carries no payload.
 *
 * Header 752, from WIN63's registry (`_events[752] = _SafeCls_3189`); the emulator corroborates it
 * as `NewUserExperienceNotCompleteComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/nux/NewUserExperienceNotCompleteEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3189.as
 */
export class NewUserExperienceNotCompleteEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NewUserExperienceNotCompleteEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3189.as::getParser()
     *
     * Named `notCompleteParser` rather than overriding the base `getParser<T>()`, whose generic
     * signature a narrowed return type cannot satisfy.
     */
    get notCompleteParser(): NewUserExperienceNotCompleteEventParser | null
    {
        return this._parser as NewUserExperienceNotCompleteEventParser | null;
    }
}
