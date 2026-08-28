import type {SpecialItemsController} from '../SpecialItemsController';
import type {ISpecialItem} from './ISpecialItem';

/**
 * The base of every special item: its position in the set, its name and description, and a set of
 * `IProductDisplayInfo` answers that all say "nothing".
 *
 * **It is deliberately never valid.** `isValid` returns false here, so a subclass that fails to
 * resolve its product is dropped by `parseSpecialItems()` rather than rendered blank — the base
 * class is the failure case, and only a subclass that found its furni overrides it to true.
 *
 * Name and description come from localisation keyed on the set and item keys, so a hotel names its
 * own items without the client knowing any of them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/model/AbstractSpecialItem.as
 */
export class AbstractSpecialItem implements ISpecialItem
{
    // AS3: AbstractSpecialItem.as::_index
    private _index: number;

    // AS3: AbstractSpecialItem.as::_setKey
    private _setKey: string;

    // AS3: AbstractSpecialItem.as::_itemKey
    private _itemKey: string;

    // AS3: AbstractSpecialItem.as::_name
    private _name: string;

    // AS3: AbstractSpecialItem.as::_desc
    private _desc: string;

    // AS3: AbstractSpecialItem.as::AbstractSpecialItem()
    constructor(index: number, setKey: string, itemKey: string, controller: SpecialItemsController)
    {
        this._index = index;
        this._setKey = setKey;
        this._itemKey = itemKey;

        const localization = controller.localizationManager;

        this._name = localization?.getLocalization(`special_items.${setKey}.body.${itemKey}.title`) ?? '';
        this._desc = localization?.getLocalization(`special_items.${setKey}.body.${itemKey}.desc`) ?? '';
    }

    // AS3: AbstractSpecialItem.as::get index()
    get index(): number
    {
        return this._index;
    }

    /** The set this item belongs to — AS3 keeps the field without exposing it. */
    // TS-only: AS3 stores `_setKey` and never reads it back; kept so the field is not dead weight.
    protected get setKey(): string
    {
        return this._setKey;
    }

    // AS3: AbstractSpecialItem.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: AbstractSpecialItem.as::get description()
    get description(): string
    {
        return this._desc;
    }

    // AS3: AbstractSpecialItem.as::get itemKey()
    get itemKey(): string
    {
        return this._itemKey;
    }

    // AS3: AbstractSpecialItem.as::get productTypeId()
    get productTypeId(): number
    {
        return -1;
    }

    // AS3: AbstractSpecialItem.as::get itemTypeId()
    get itemTypeId(): string
    {
        return '';
    }

    // AS3: AbstractSpecialItem.as::get petFigureString()
    get petFigureString(): string
    {
        return '';
    }

    /**
     * AS3 returns null here; `IProductDisplayInfo` declares the array non-nullable in this port, so
     * the empty array stands in — the widget's only use of it is a length check.
     */
    // AS3: AbstractSpecialItem.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }

    /** False on the base, so an item that resolved nothing is filtered out rather than drawn. */
    // AS3: AbstractSpecialItem.as::get isValid()
    get isValid(): boolean
    {
        return false;
    }

    // AS3: AbstractSpecialItem.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: AbstractSpecialItem.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }
}
