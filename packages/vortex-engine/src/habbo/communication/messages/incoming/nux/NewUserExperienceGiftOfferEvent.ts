import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    NewUserExperienceGiftOfferEventParser
} from '../../parser/nux/NewUserExperienceGiftOfferEventParser';

/**
 * The server offers the new user a set of gifts to choose from.
 *
 * Handled by AS3: `HabboNuxDialogs.onNewUserExperienceGiftOfferMessage()`, which opens
 * `NuxGiftSelectionView` on the parser's `giftOptions`.
 *
 * Header 3307, from WIN63's registry (`_events[3307] = _SafeCls_2677`); the emulator corroborates
 * it as `NewUserExperienceGiftOfferComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/nux/NewUserExperienceGiftOfferEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_2677.as
 */
export class NewUserExperienceGiftOfferEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NewUserExperienceGiftOfferEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_2677.as::getParser()
     *
     * Named `giftOfferParser` rather than overriding the base `getParser<T>()`, whose generic
     * signature a narrowed return type cannot satisfy.
     */
    get giftOfferParser(): NewUserExperienceGiftOfferEventParser | null
    {
        return this._parser as NewUserExperienceGiftOfferEventParser | null;
    }
}
