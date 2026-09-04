import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {
    DiscordPreferences
} from '@habbo/communication/messages/parser/discord/DiscordPreferences';
import {
    DiscordPreferencesParser
} from '@habbo/communication/messages/parser/discord/DiscordPreferencesParser';

/**
 * The player's stored Discord Rich Presence toggles, header 2767
 * (`_SafeStr_4546[2767] = _SafeCls_2938` in WIN63's registry).
 *
 * Answers `GetDiscordPreferencesMessageComposer`, and is re-sent by the server after an update.
 * `vortex-emulator` has no Discord feature, so nothing sends 2767 today — the settings dialog
 * declines to open until one arrives, exactly as AS3 does.
 *
 * **Name derived** from the parser it takes: the class is `_SafeCls_2938` in the primary tree and
 * no other tree has the Discord package at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2939/_SafeCls_2938.as
 */
export class DiscordPreferencesMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafePkg_2939/_SafeCls_2938.as::_SafeCls_2938()
    constructor(callback: MessageEventCallback)
    {
        super(callback, DiscordPreferencesParser);
    }

    /**
	 * AS3 declares a narrowing `getParser()` here; `MessageEvent.getParser<T>()` already provides
	 * that generically in this port, so the cast happens at the call site instead — the same shape
	 * `SellablePetPalettesMessageEvent` uses.
	 */
    // AS3: .../_SafePkg_2939/_SafeCls_2938.as::get preferences()
    get preferences(): DiscordPreferences | null
    {
        return (this._parser as DiscordPreferencesParser | null)?.preferences ?? null;
    }
}
