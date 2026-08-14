import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';

/**
 * Presents a {@link ChestItemType} to the product-icon widget, which knows nothing about chests.
 *
 * **`productTypeId` is inverted relative to the name**: a *wall* item reports 0 and a floor item 1.
 * That is what the widget expects, and it is the one field here worth reading twice.
 *
 * Ported ahead of the rest of `wired_trading/chests/` because
 * `ChestItemIconPreviewerPreset` needs it and nothing else in that folder does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/views/ChestItemTypeRenderableWrapper.as
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

    // AS3: ChestItemTypeRenderableWrapper.as::get extraData()
    get extraData(): string
    {
        return this._chestItemType.legacyPosterId ?? '';
    }

    /**
	 * The three below are inert: a chest item is never a pet or a bot, and AS3 returns empty
	 * strings and a null vector rather than throwing. `figureSetIds` returns an empty array here
	 * because the port's interface declares it non-nullable.
	 */
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

    // AS3: ChestItemTypeRenderableWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }
}
