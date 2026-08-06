import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Submits the SMS verification code the player typed.
 *
 * Sent by `HabboPhoneNumber.sendTryVerificationCode()`, which upper-cases the code first and
 * drops empty input before it gets here.
 *
 * Header 1846, from WIN63's registry (`_composers[1846] = _SafeCls_2748`); the emulator
 * corroborates it as `VerifyCodeMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/gifts/VerifyCodeMessageComposer.as`.
 *
 * Filed under `outgoing/preferences/` with the other phone composers this port already keeps
 * there; AS3 groups them under `outgoing/gifts/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2748.as
 */
export class VerifyCodeMessageComposer extends MessageComposer<[string]>
{
    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2748.as::_SafeStr_6946
     *
     * Declared `public static const … = -1` and referenced by nothing in any tree, so this name is
     * **derived** from the value — as in the two sibling phone composers.
     */
    public static readonly UNDEFINED_STATUS: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2748.as::_SafeStr_4642
    private _data: [string];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2748.as::_SafeCls_2748()
    constructor(verificationCode: string)
    {
        super();

        this._data = [verificationCode];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2748.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
