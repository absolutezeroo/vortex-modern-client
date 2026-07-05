/**
 * IHabboUserDefinedRoomEvents
 *
 * @see sources/win63_version/habbo/roomevents/IHabboUserDefinedRoomEvents.as
 *
 * TODO(AS3): no concrete implementation exists yet (the user-defined room events /
 * competition-scripting system hasn't been ported). IRoomWidgetHandlerContainer
 * exposes this as nullable and RoomDesktop currently always resolves it to `null`.
 */
import type {EventEmitter} from 'eventemitter3';

export interface IHabboUserDefinedRoomEvents
{
    readonly events: EventEmitter;

    stuffSelected(id: number): void;

    userSelected(id: number): void;

    showInspectButton(): boolean;

    showToolbarMenuButton(): boolean;

    wiredWhisperDisabled: boolean;

    hasClickUserWired(): boolean;

    switchPlayTestMode(): void;

    resetCache(): void;
}
