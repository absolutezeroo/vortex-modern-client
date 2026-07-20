import type {EventEmitter} from 'eventemitter3';

/**
 * IHabboUserDefinedRoomEvents — public surface of the HabboUserDefinedRoomEvents (wired) component,
 * as resolved by RoomDesktop / the room widgets.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/IHabboUserDefinedRoomEvents.as
 */
export interface IHabboUserDefinedRoomEvents
{
    // AS3: IHabboUserDefinedRoomEvents.as::get events()  (AS3 IEventDispatcher -> EventEmitter)
    readonly events: EventEmitter;

    // AS3: IHabboUserDefinedRoomEvents.as::stuffSelected()
    stuffSelected(id: number): void;

    // AS3: IHabboUserDefinedRoomEvents.as::userSelected()
    userSelected(id: number): void;

    // AS3: IHabboUserDefinedRoomEvents.as::showInspectButton()
    showInspectButton(): boolean;

    // AS3: IHabboUserDefinedRoomEvents.as::showToolbarMenuButton()
    showToolbarMenuButton(): boolean;

    // AS3: IHabboUserDefinedRoomEvents.as::get/set wiredWhisperDisabled()
    wiredWhisperDisabled: boolean;

    // AS3: IHabboUserDefinedRoomEvents.as::hasClickUserWired()
    hasClickUserWired(): boolean;

    // AS3: IHabboUserDefinedRoomEvents.as::get achievementsInRoom()
    readonly achievementsInRoom: string[] | null;

    // AS3: IHabboUserDefinedRoomEvents.as::switchPlayTestMode()
    switchPlayTestMode(): void;

    // AS3: IHabboUserDefinedRoomEvents.as::resetCache()
    resetCache(): void;

    // AS3: IHabboUserDefinedRoomEvents.as::hasWiredUIOpen()
    hasWiredUIOpen(): boolean;

    // AS3: IHabboUserDefinedRoomEvents.as::get isGameMode()
    readonly isGameMode: boolean;
}
