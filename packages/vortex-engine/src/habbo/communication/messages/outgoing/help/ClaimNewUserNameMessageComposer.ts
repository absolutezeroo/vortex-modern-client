import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claims the name picked in the onboarding name-change dialog (WIN63 header 879).
 *
 * **Not the same message as `ChangeUserNameMessageComposer` (1703).** The two are distinct
 * composers with distinct senders: 1703 is the *help*-side rename
 * (`help/namechange/NameChangeController.as:167`), 879 is this onboarding claim
 * (`friendbar/onBoardingHc/NameChangeDialog.as::claimName()`). The port sent 1703 from both until
 * 2026-08-27, so an onboarding claim reached the server as a help-side rename request.
 *
 * Name derived from its only sender, `claimName()` — the class is obfuscated in the primary tree
 * and the message postdates win63_version, so no tree carries a readable name for it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2781/_SafeCls_3401.as
 */
export class ClaimNewUserNameMessageComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3401.as::_SafeStr_4556
    private _data: [string];

    // AS3: _SafeCls_3401.as::_SafeCls_3401()
    constructor(name: string)
    {
        super();

        this._data = [name];
    }

    // AS3: _SafeCls_3401.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
