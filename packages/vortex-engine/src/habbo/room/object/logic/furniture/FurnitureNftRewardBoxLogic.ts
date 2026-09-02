import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {RoomObjectFurnitureActionEvent} from '@habbo/room/events/RoomObjectFurnitureActionEvent';
import {FurnitureLogic} from './FurnitureLogic';

/**
 * An NFT reward box. Double-clicking an unopened one raises `ROFCAE_NFT_REWARD_BOX`, which the room
 * UI turns into the confirmation dialog behind `ClaimNftRewardBoxMessageComposer`. A box that has
 * already been opened — state 0 is closed, anything else is open — swallows the double-click.
 *
 * `useObject()` deliberately does not chain to `super`: unlike every other action furni, opening a
 * reward box must not also send the generic use-object packet.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftRewardBoxLogic.as
 */
export class FurnitureNftRewardBoxLogic extends FurnitureLogic
{
    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftRewardBoxLogic.as::getEventTypes()
    override getEventTypes(): string[]
    {
        const types = [RoomObjectFurnitureActionEvent.ROFCAE_NFT_REWARD_BOX];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftRewardBoxLogic.as::mouseEvent()
    override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
    {
        if(event === null || geometry === null) return;

        if(this.object === null) return;

        if(event.type !== 'doubleClick') super.mouseEvent(event, geometry);
        else if(!this.hasBeenOpened) this.useObject();
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftRewardBoxLogic.as::useObject()
    override useObject(): void
    {
        if(this.eventDispatcher !== null && this.object !== null)
        {
            this.eventDispatcher.emit(
                RoomObjectFurnitureActionEvent.ROFCAE_NFT_REWARD_BOX,
                new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_NFT_REWARD_BOX, this.object)
            );
        }
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftRewardBoxLogic.as::get hasBeenOpened()
    private get hasBeenOpened(): boolean
    {
        return this.object!.getState(0) !== 0;
    }
}
