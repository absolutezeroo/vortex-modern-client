import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the citizenship VIP-quests promo message (header 1584).
 *
 * The message carries no payload at all — arriving *is* the signal, and the toolbar answers it by
 * building the promo strip. AS3's `parse()` returns `true` without reading a byte, which is why
 * there is nothing to expose here.
 *
 * **Name derived.** The class is `_SafeCls_4115` in the primary tree and appears in no other tree:
 * `win63_version` has no header 1584 and the emulator's `Headers.cs` has no composer for it. The
 * name comes from its only consumer,
 * `CitizenshipVipQuestsPromoExtension.onCitizenshipQuestPromoEnabled()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2643/_SafeCls_4115.as
 */
export class CitizenshipQuestPromoEnabledMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2643/_SafeCls_4115.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2643/_SafeCls_4115.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
