import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Answers the phone-number verification offer with what the user chose to do about it.
 *
 * Two senders, both in this port: `HabboNuxDialogs.onVerify()` sends 0 (start verifying) and
 * `onReject()` sends 2 once the "never ask again" confirm is accepted; `HabboPhoneNumber` uses the
 * same composer for its own dialog.
 *
 * The status values are the raw integers AS3 passes at each call site — the class itself declares
 * no constants for them, only an unused `-1` sentinel (see {@link UNDEFINED_STATUS}).
 *
 * Header 1983, from WIN63's registry (`_composers[1983] = _SafeCls_2666`); the emulator
 * corroborates it as `SetPhoneNumberVerificationStatusMessageEvent`. The class name is recovered
 * from `sources/win63_version/habbo/communication/messages/outgoing/gifts/SetPhoneNumberVerificationStatusMessageComposer.as`.
 *
 * Filed next to `ResetPhoneNumberStateMessageComposer`, which this port already keeps under
 * `outgoing/preferences/`; AS3 groups both under `outgoing/gifts/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2666.as
 */
export class SetPhoneNumberVerificationStatusMessageComposer extends MessageComposer<[number]>
{
    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2666.as::_SafeStr_6946
     *
     * Declared `public static const … = -1` and referenced by nothing in any tree, so its real
     * name is unrecoverable and this one is **derived** from the value.
     */
    public static readonly UNDEFINED_STATUS: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2666.as::_SafeStr_4642
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2666.as::_SafeCls_2666()
    constructor(status: number)
    {
        super();

        this._data = [status];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2666.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
