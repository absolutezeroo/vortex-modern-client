/**
 * FurnitureChestLogic
 *
 * Base logic of the two chest furnis. All it does is mirror the `is_wired_enabled` map entry
 * into the model, which is what makes the visualization show or hide the wired emblem sprite.
 *
 * Name DERIVED: the class is `_SafeCls_1811` in the primary tree and exists in no unobfuscated
 * one — the 2016 build predates it. It is named for what it is: the shared base of
 * `furniture_furnichest` and `furniture_coinschest`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1811.as
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';
import {MapStuffData} from '@habbo/room/object/data/MapStuffData';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureChestLogic extends FurnitureLogic
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1811.as::IS_WIRED_ENABLED_KEY
    private static readonly IS_WIRED_ENABLED_KEY: string = 'is_wired_enabled';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1811.as::_SafeStr_9423
    private _isWiredEnabled: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1811.as::processUpdateMessage()
    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(!(message instanceof RoomObjectDataUpdateMessage)) return;

        const data = message.data;

        if(!(data instanceof MapStuffData)) return;

        const enabled = data.getValue(FurnitureChestLogic.IS_WIRED_ENABLED_KEY) === '1';

        if(enabled !== this._isWiredEnabled)
        {
            this._isWiredEnabled = enabled;

            this.object?.getModelController()?.setNumber(
                RoomObjectVariableEnum.FURNITURE_CHEST_IS_WIRED_ENABLED, enabled ? 1 : 0
            );

            this.update(performance.now());
        }
    }
}
