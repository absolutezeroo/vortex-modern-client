import type {ChestItemType} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';

/**
 * Lets a contract's `ChestItemType` be drawn by the same widget that draws a catalogue product.
 *
 * The widget asks for a product's identity, not a chest's — so the wrapper answers in the widget's
 * terms and leaves the four avatar-shaped questions empty, which is what AS3 does too.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/offerings/ChestItemTypeRenderableWrapper.as
 */
export class ChestItemTypeRenderableWrapper implements IProductDisplayInfo
{
    // AS3: ChestItemTypeRenderableWrapper.as::_chestItemType
    private _chestItemType: ChestItemType;

    // AS3: ChestItemTypeRenderableWrapper.as::ChestItemTypeRenderableWrapper()
    constructor(chestItemType: ChestItemType)
    {
        this._chestItemType = chestItemType;
    }

    /**
	 * Note the inversion: a wall item is 0 and a floor item 1, which is the widget's numbering and
	 * the opposite of the room's category ids.
	 */
    // AS3: ChestItemTypeRenderableWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        return this._chestItemType.isWallItem ? 0 : 1;
    }

    // AS3: ChestItemTypeRenderableWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return String(this._chestItemType.typeId);
    }

    /**
	 * AS3 hands the poster id straight through; this port's `ChestItemType` types it nullable, and
	 * the widget's own contract is a plain string.
	 */
    // AS3: ChestItemTypeRenderableWrapper.as::get extraData()
    get extraData(): string
    {
        return this._chestItemType.legacyPosterId ?? '';
    }

    // AS3: ChestItemTypeRenderableWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return '';
    }

    // AS3: ChestItemTypeRenderableWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }

    /**
	 * AS3 returns null here; `IProductDisplayInfo` declares it non-null in this port, and the empty
	 * array reads the same to every consumer — none of them distinguishes "no sets" from "null".
	 */
    // AS3: ChestItemTypeRenderableWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }
}
