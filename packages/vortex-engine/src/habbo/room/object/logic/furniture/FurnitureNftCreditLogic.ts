import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {RoomObjectVariableEnum} from '../../RoomObjectVariableEnum';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';
import {FurnitureLogic} from './FurnitureLogic';

/**
 * An NFT credit furni. Unlike `FurnitureCreditLogic`, which reads its value out of the furni data's
 * `credits` list, this one takes it from the *type name*: `nft_something_500` is worth 500. It also
 * marks the model `furniture_nft_credit`, which is how the redeem widget tells the two apart.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as
 */
export class FurnitureNftCreditLogic extends FurnitureLogic
{
    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::EMERALD_HAND_TYPE
    private static readonly EMERALD_HAND_TYPE: string = 'nft_emerald_emerhand';

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::EMERALD_EGG_TYPE
    private static readonly EMERALD_EGG_TYPE: string = 'nft_emerald_eggmerald';

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::getEventTypes()
    override getEventTypes(): string[]
    {
        const types = [RoomObjectWidgetRequestEvent.ROWRE_CREDITFURNI];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    /**
     * ⚠ The two emerald fallbacks above are unreachable in AS3 and are unreachable here. AS3 writes
     * `var v:int = int(match ? int(match[0]) : NaN)`, and `int(NaN)` is 0, so `v` is an `int` by the
     * time `isNaN(v)` tests it — an int is never NaN, and the `nft_emerald_emerhand` (15000) and
     * `nft_emerald_eggmerald` (2000) branches never run. Both types get 0.
     *
     * Transcribed rather than repaired, because the value the widget shows has to agree with what
     * the server pays out, and only the server knows which one it means. Writing this the natural
     * TypeScript way — `Number.isNaN(parseInt(...))` — would silently switch the two emeralds to
     * 15000/2000 and desync it. The constants stay declared so the intent is visible.
     */
    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::initialize()
    override initialize(data: unknown): void
    {
        super.initialize(data);

        if(data === null || this.object === null) return;

        const type = this.object.getType();
        const match = type.match(/\d+$/);
        const creditValue = match ? parseInt(match[0]) : 0;

        const controller = this.object.getModelController();

        if(controller !== null)
        {
            controller.setNumber(RoomObjectVariableEnum.FURNITURE_CREDIT_VALUE, creditValue);
            controller.setString(RoomObjectVariableEnum.FURNITURE_NFT_CREDIT, 'true');
        }
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::processUpdateMessage()
    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::mouseEvent()
    override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
    {
        if(event === null || geometry === null) return;

        if(this.object === null) return;

        if(event.type !== 'doubleClick') super.mouseEvent(event, geometry);
        else this.useObject();
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::useObject()
    override useObject(): void
    {
        if(this.eventDispatcher !== null && this.object !== null)
        {
            this.eventDispatcher.emit(
                RoomObjectWidgetRequestEvent.ROWRE_CREDITFURNI,
                new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_CREDITFURNI, this.object)
            );
        }

        super.useObject();
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureNftCreditLogic.as::dispose()
    override dispose(): void
    {
        super.dispose();
    }
}
