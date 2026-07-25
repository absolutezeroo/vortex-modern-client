import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * The Vortex furni editor: a staff tool for rewriting a placed furni's stored server state
 * (position, altitude, rotation, wall offset, extra data, owner, definition) live.
 *
 * NOT ported from AS3 — no Habbo equivalent exists, so there is no AS3 source to trace to.
 */
export interface IHabboFurniEditor extends IDisposable
{
    /**
     * Whether this account holds the server's `room.furni.edit` capability, as reported once during
     * the handshake.
     *
     * A UI hint only: it decides whether the infostand offers the editor button. The server
     * re-checks the capability on every read and every write, so nothing is gained by forcing it
     * true client-side.
     */
    readonly canEdit: boolean;

    /**
     * Opens the editor on a placed furni and requests its current server state. The window fills in
     * only once the server answers, so it never shows values the server has not confirmed.
     */
    open(objectId: number): void;

    /** Closes the editor window if it is open. */
    close(): void;
}
