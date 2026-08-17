import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BadgeLeaderboardMessageParser} from '../../parser/users/BadgeLeaderboardMessageParser';

/**
 * A chunk of the badge leaderboard. Header 2503, from WIN63's own registry
 * (`_SafeStr_4546[2503] = _SafeCls_3446`).
 *
 * **The name is DERIVED.** `win63_version` predates this board and the emulator has no header for
 * it at all, so there is nothing to corroborate against; it is named for the parser it carries.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3446.as
 */
export class BadgeLeaderboardMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3446.as::_SafeCls_3446()
    constructor(callback: MessageEventCallback)
    {
        super(callback, BadgeLeaderboardMessageParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead — the shape every other event in
     * this tree uses (see `SellablePetPalettesMessageEvent`).
     */
    // AS3: _SafeCls_3446.as::getParser()
    get leaderboardParser(): BadgeLeaderboardMessageParser
    {
        return this._parser as BadgeLeaderboardMessageParser;
    }
}
