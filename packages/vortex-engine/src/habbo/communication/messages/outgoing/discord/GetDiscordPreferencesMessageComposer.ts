import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the player's stored Discord toggles, header 2883
 * (`_composers[2883] = _SafeCls_2988` in WIN63's registry). Carries no payload.
 *
 * Sent once, from `DiscordSettingsController.initComponent()`; the answer is
 * `DiscordPreferencesMessageEvent` (2767).
 *
 * **Name derived** — `win63_version` has no `discord` path and PRODUCTION predates the feature, so
 * the class is `_SafeCls_2988` in every tree that has it. Named after the request it makes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2989/_SafeCls_2988.as
 */
export class GetDiscordPreferencesMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_2989/_SafeCls_2988.as::_SafeStr_4642
    private _data: [] = [];

    // AS3: .../_SafePkg_2989/_SafeCls_2988.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
