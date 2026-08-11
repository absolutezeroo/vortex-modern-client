import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * A guardian accepts or skips an offered chat review (header 2545).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_2508.as
 * (composer class itself is obfuscated; identified by `GuideSessionController.as::
 * onGuardianChatReviewAcceptEvent()`'s `accept_button` / `skip_link`, its only senders, and by
 * `_composers[2545]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `ChatReviewGuideDecidesOnOfferMessageEvent = 2545`.)
 */
export class ChatReviewGuideDecidesOnOfferMessageComposer extends MessageComposer<[boolean]>
{
    // AS3: _SafeCls_2508.as::_SafeStr_4556
    private _data: [boolean];

    // AS3: _SafeCls_2508.as::_SafeCls_2508()
    constructor(accepted: boolean)
    {
        super();

        this._data = [accepted];
    }

    // AS3: _SafeCls_2508.as::getMessageArray()
    getMessageArray(): [boolean]
    {
        return this._data;
    }
}
