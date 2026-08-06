import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Submits a phone number for SMS verification: the ISO country code, then the number as typed.
 *
 * Sent by `HabboPhoneNumber.sendTryPhoneNumber()`. The country code is whatever
 * `PhoneNumberCollectView.selectedCountryCode` resolved to, including its `"NOT_SELECTED"` and
 * `"--"` sentinels — AS3 sends those unfiltered.
 *
 * Header 2890, from WIN63's registry (`_composers[2890] = _SafeCls_2910`); the emulator
 * corroborates it as `TryPhoneNumberMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/gifts/TryPhoneNumberMessageComposer.as`.
 *
 * Filed under `outgoing/preferences/` with the other phone composers this port already keeps
 * there; AS3 groups them under `outgoing/gifts/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2910.as
 */
export class TryPhoneNumberMessageComposer extends MessageComposer<[string, string]>
{
    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2910.as::_SafeStr_6946
     *
     * Declared `public static const … = -1` and referenced by nothing in any tree, so this name is
     * **derived** from the value — as in the two sibling phone composers, which carry the same
     * unused sentinel.
     */
    public static readonly UNDEFINED_STATUS: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2910.as::_SafeStr_4642
    private _data: [string, string];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2910.as::_SafeCls_2910()
    constructor(countryCode: string, phoneNumber: string)
    {
        super();

        this._data = [countryCode, phoneNumber];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_2910.as::getMessageArray()
    getMessageArray(): [string, string]
    {
        return this._data;
    }
}
