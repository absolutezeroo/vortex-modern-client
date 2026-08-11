import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * The guardian's verdict on a reviewed chat (header 1801): 0 ok, 1 bad, 2 very bad.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3709.as
 * (composer class itself is obfuscated; identified by `GuideSessionController.as::
 * onGuardianChatReviewVoteEvent()`, its only sender, and by `_composers[1801]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `ChatReviewGuideVoteMessageEvent = 1801`.)
 */
export class ChatReviewGuideVoteMessageComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_3709.as::_SafeStr_4556
    private _data: [number];

    // AS3: _SafeCls_3709.as::_SafeCls_3709()
    constructor(vote: number)
    {
        super();

        this._data = [vote];
    }

    // AS3: _SafeCls_3709.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
