import type {SpecialItemsController} from '../SpecialItemsController';
import {AbstractSpecialItem} from './AbstractSpecialItem';

/**
 * A special item that is a piece of floor furniture, resolved from its class name at construction.
 *
 * If the hotel names a furni the client does not have, the lookup fails, `isValid` stays false and
 * `parseSpecialItems()` drops the entry — which is how a set survives a furni being renamed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/model/FurniSpecialItem.as
 */
export class FurniSpecialItem extends AbstractSpecialItem
{
    /** Name DERIVED — `_SafeStr_8605`: the furni's numeric type, or -1 when it did not resolve. */
    // AS3: FurniSpecialItem.as::_SafeStr_8605
    private _furniId: number = -1;

    // AS3: FurniSpecialItem.as::_furniName
    private _furniName: string = '';

    // AS3: FurniSpecialItem.as::FurniSpecialItem()
    constructor(
        index: number,
        setKey: string,
        itemKey: string,
        controller: SpecialItemsController,
        className: string
    )
    {
        super(index, setKey, itemKey, controller);

        const furniData = controller.sessionDataManager?.getFloorItemDataByName(className) ?? null;

        if(furniData !== null)
        {
            this._furniId = furniData.id;
            this._furniName = furniData.localizedName;
        }
    }

    /** 1 is the product type the display widget draws a floor furni for. */
    // AS3: FurniSpecialItem.as::get productTypeId()
    override get productTypeId(): number
    {
        return 1;
    }

    // AS3: FurniSpecialItem.as::get itemTypeId()
    override get itemTypeId(): string
    {
        return String(this._furniId);
    }

    // AS3: FurniSpecialItem.as::get isValid()
    override get isValid(): boolean
    {
        return this._furniId !== -1;
    }

    /** The hotel's own title wins; the furni's shipped name is the fallback. */
    // AS3: FurniSpecialItem.as::get name()
    override get name(): string
    {
        const localized = super.name;

        if(localized !== null && localized.length > 0) return localized;

        return this._furniName;
    }
}
