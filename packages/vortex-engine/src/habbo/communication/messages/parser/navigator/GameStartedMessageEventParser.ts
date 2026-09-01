import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameLobbyData} from '../game/snowwar/data/GameLobbyData';

/**
 * GameStartedMessageEventParser
 *
 * A game lobby started. The navigator only closes its main view on this - it never
 * reads the payload.
 *
 * Name recovered from the emulator's `Game2GameStartedMessageComposer = 2902`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4302.as
 */
export class GameStartedMessageEventParser implements IMessageParser
{
    /**
	 * The payload has no reader yet — the navigator's only handler for this message closes its
	 * main view and ignores it (`_SafeCls_1951.as::onGameStarted()`). It is parsed anyway, as AS3
	 * does: `GameLobbyData` landed with the snow-war port, and the alternative is a parser that
	 * silently answers `null` to the accessor its own AS3 declares.
	 */
    // AS3: .../_SafeCls_4302.as::_SafeStr_7890
    private _lobbyData: GameLobbyData | null = null;

    // AS3: .../_SafeCls_4302.as::get lobbyData()
    get lobbyData(): GameLobbyData | null
    {
        return this._lobbyData;
    }

    // AS3: .../_SafeCls_4302.as::flush()
    flush(): boolean
    {
        this._lobbyData = null;
        return true;
    }

    // AS3: .../_SafeCls_4302.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._lobbyData = new GameLobbyData(wrapper);

        return true;
    }
}
