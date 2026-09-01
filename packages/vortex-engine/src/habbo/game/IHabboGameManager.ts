import type {EventEmitter} from 'eventemitter3';
import type {IUnknown} from '@core/runtime/IUnknown';
import type {RoomObjectTileMouseEvent} from '@habbo/room/events/RoomObjectTileMouseEvent';

/**
 * What the rest of the client is allowed to ask of `HabboGameManager`.
 *
 * Everything on it is Snow War: the room engine forwards a click on a tile or on another avatar
 * here, the toolbar asks for the game directory, and the landing view holds the reference so it can
 * be reactivated when an arena session ends.
 *
 * **The name is recovered, not derived.** `_SafeCls_60` in the primary tree; the 2016 build's
 * `IHabboGameManager.as` is unobfuscated and its tail — `initGameDirectoryConnection()` plus the
 * seven obfuscated members that follow it — is this interface, member for member. The rest of the
 * 2016 file is the old Game Center (`loadGameClient`, `acceptGameInvite`, `showGameCenter`), which
 * the 2026 build no longer declares here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/_SafeCls_60.as
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/game/IHabboGameManager.as
 */
export interface IHabboGameManager extends IUnknown
{
    /**
     * The component's own event bus — AS3 declares `get events():IEventDispatcher` here and lets
     * `Component` satisfy it, which is exactly what `Component.events` does in this port.
     */
    // AS3: _SafeCls_60.as::get events()
    readonly events: EventEmitter;

    // AS3: _SafeCls_60.as::get gameCenterEnabled()
    readonly gameCenterEnabled: boolean;

    // AS3: _SafeCls_60.as::get isHotelClosed()
    readonly isHotelClosed: boolean;

    // AS3: _SafeCls_60.as::initGameDirectoryConnection()
    initGameDirectoryConnection(): void;

    // AS3: _SafeCls_60.as::startSnowWarGame()
    startSnowWarGame(arenaName: string): void;

    // AS3: _SafeCls_60.as::startQuickSnowWarGame()
    startQuickSnowWarGame(): void;

    // AS3: _SafeCls_60.as::onSnowWarArenaSessionEnded()
    onSnowWarArenaSessionEnded(): void;

    // AS3: _SafeCls_60.as::handleClickOnTile()
    handleClickOnTile(event: RoomObjectTileMouseEvent): void;

    // AS3: _SafeCls_60.as::handleClickOnHuman()
    handleClickOnHuman(gameObjectId: number, altKey: boolean, shiftKey: boolean): void;

    // AS3: _SafeCls_60.as::handleMouseOverOnHuman()
    handleMouseOverOnHuman(gameObjectId: number, altKey: boolean, shiftKey: boolean): void;

    /** Sends a deliberately wrong checksum, so the desync recovery path can be exercised. */
    // AS3: _SafeCls_60.as::generateChecksumMismatch()
    generateChecksumMismatch(): void;
}
