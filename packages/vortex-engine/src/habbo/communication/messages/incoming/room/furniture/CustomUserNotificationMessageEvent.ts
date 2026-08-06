import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CustomUserNotificationMessageParser
} from '../../../parser/room/furniture/CustomUserNotificationMessageParser';

/**
 * The server refuses a furniture use, or reports a failed respect vote.
 *
 * Handled by AS3 in two places at once — `CustomUserNotificationWidgetHandler`
 * (`onFurnitureUsageRequirementMissingMessage()`, which opens the matching dialog) and
 * `AvatarInfoWidgetHandler` (`onCustomUserNotificationMessage()`, which refunds the respect on
 * codes 4 and 5). Both subscribe the same event class.
 *
 * Header 169, from WIN63's registry (`_events[169] = _SafeCls_3982`); the emulator corroborates it
 * as `CustomUserNotificationMessageComposer`, which is where the name comes from — the class is
 * obfuscated in the primary tree and absent from the other two.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3982.as
 */
export class CustomUserNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CustomUserNotificationMessageParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3982.as::getParser()
     *
     * Named `customUserNotificationParser` rather than overriding the base `getParser<T>()`, whose
     * generic signature a narrowed return type cannot satisfy.
     */
    get customUserNotificationParser(): CustomUserNotificationMessageParser | null
    {
        return this._parser as CustomUserNotificationMessageParser | null;
    }
}
