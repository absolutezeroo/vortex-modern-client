import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {IChestSubController} from './subcontrollers/IChestSubController';
import type {WiredChestWrapperView} from './WiredChestWrapperView';

/**
 * What a chest sub-controller may ask of the controller that owns it: send, subscribe, read the
 * shared managers, and drive the open/opening/closed state machine.
 *
 * **The three status setters are the machine.** A chest goes closed -> opening (a request is out)
 * -> open (contents arrived, with the sub-controller that holds them), and only the controller may
 * move it, which is why the sub-controllers call back rather than setting anything themselves.
 *
 * `activeChestId` and `requestedChestId` are deliberately separate: a reply for a chest the player
 * has already navigated away from is identified by the two disagreeing. `onItemsChunk` tests the
 * *requested* id on its first fragment and the *active* id thereafter.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/_SafeCls_2149.as
 * (name derived: obfuscated in every tree, named for the role it plays)
 */
export interface IWiredChestControllerHost
{
    // AS3: _SafeCls_2149.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void;

    // AS3: _SafeCls_2149.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void;

    // AS3: _SafeCls_2149.as::send()
    send(composer: IMessageComposer<unknown[]>): void;

    // AS3: _SafeCls_2149.as::get roomEvents()
    readonly roomEvents: HabboUserDefinedRoomEvents;

    // AS3: _SafeCls_2149.as::get localization()
    readonly localization: IHabboLocalizationManager | null;

    // AS3: _SafeCls_2149.as::get sessionDataManager()
    readonly sessionDataManager: ISessionDataManager | null;

    // AS3: _SafeCls_2149.as::setClosedStatus()
    setClosedStatus(): void;

    // AS3: _SafeCls_2149.as::setOpeningStatus()
    setOpeningStatus(chestId: number): void;

    // AS3: _SafeCls_2149.as::setOpenStatus()
    setOpenStatus(chestId: number, subController: IChestSubController): void;

    // AS3: _SafeCls_2149.as::get status()
    readonly status: number;

    // AS3: _SafeCls_2149.as::get chestWrapperView()
    readonly chestWrapperView: WiredChestWrapperView | null;

    // AS3: _SafeCls_2149.as::get activeChestId()
    readonly activeChestId: number;

    // AS3: _SafeCls_2149.as::get requestedChestId()
    readonly requestedChestId: number;
}
