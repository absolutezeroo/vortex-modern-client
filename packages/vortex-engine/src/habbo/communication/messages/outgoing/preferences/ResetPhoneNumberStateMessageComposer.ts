import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ResetPhoneNumberStateMessageComposer (header 2056)
 *
 * Clears the phone-number collection state so the player can be asked again. The button
 * behind it appears only for a specific combination of `sms.identity.verification.*`
 * config and collection status, and hides itself the moment it is used.
 *
 * Carries no payload: AS3 pushes nothing onto its array.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/outgoing/gifts/ResetPhoneNumberStateMessageComposer.as`,
 * which is unobfuscated there; the emulator corroborates it as
 * `ResetPhoneNumberStateMessageEvent = 2056`. The class is `_SafeCls_3067` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_3067.as
 */
export class ResetPhoneNumberStateMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2667/_SafeCls_3067.as::_SafeStr_4642
    private _data: [] = [];

    // AS3: .../_SafeCls_3067.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
