import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Open the inventory on this tab" — except two of the four types do not open the inventory at
 * all: `INVENTORY_EFFECTS` opens a *catalogue* page, and `INVENTORY_CLOTHES` is an empty case in
 * `MeMenuWidgetHandler` and does nothing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetOpenInventoryMessage.as
 */
export class RoomWidgetOpenInventoryMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::OPEN_INVENTORY
    // Name DERIVED (`_SafeStr_10696`), from its value.
    public static readonly OPEN_INVENTORY: string = 'RWGOI_MESSAGE_OPEN_INVENTORY';

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::INVENTORY_EFFECTS
    public static readonly INVENTORY_EFFECTS: string = 'inventory_effects';

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::INVENTORY_BADGES
    public static readonly INVENTORY_BADGES: string = 'inventory_badges';

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::INVENTORY_CLOTHES
    // An empty case in the handler's switch — deliberately, since it sits *after* the default.
    public static readonly INVENTORY_CLOTHES: string = 'inventory_clothes';

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::INVENTORY_FURNITURE
    public static readonly INVENTORY_FURNITURE: string = 'inventory_furniture';

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::_inventoryType
    // Name DERIVED (`_SafeStr_9995`): the field behind `get inventoryType()`.
    private _inventoryType: string;

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::RoomWidgetOpenInventoryMessage()
    // Takes the inventory type, not the message type — the type is fixed.
    constructor(inventoryType: string)
    {
        super(RoomWidgetOpenInventoryMessage.OPEN_INVENTORY);

        this._inventoryType = inventoryType;
    }

    // AS3: .../widget/messages/RoomWidgetOpenInventoryMessage.as::get inventoryType()
    public get inventoryType(): string
    {
        return this._inventoryType;
    }
}
