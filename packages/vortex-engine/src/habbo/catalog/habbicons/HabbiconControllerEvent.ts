/**
 * What the controller broadcasts to its views. AS3 puts this on a plain `EventDispatcher` rather
 * than the component's own event bus, so the views subscribe through
 * `HabbiconController.addEventListener()`.
 *
 * The two obfuscated type constants keep their literal strings in the dump, so both names are
 * recovered from the values.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconControllerEvent.as
 */
export class HabbiconControllerEvent
{
    // AS3: HabbiconControllerEvent.as::_SafeStr_11523 (name recovered from "hce_owned_habbicons_updated")
    static readonly OWNED_HABBICONS_UPDATED: string = 'hce_owned_habbicons_updated';

    // AS3: HabbiconControllerEvent.as::SHOP_DATA_UPDATED
    static readonly SHOP_DATA_UPDATED: string = 'hce_shop_data_updated';

    // AS3: HabbiconControllerEvent.as::_SafeStr_11108 (name recovered from "hce_habbicon_status_changed")
    static readonly HABBICON_STATUS_CHANGED: string = 'hce_habbicon_status_changed';

    // AS3: HabbiconControllerEvent.as::RECENT_HABBICONS_UPDATED
    static readonly RECENT_HABBICONS_UPDATED: string = 'hce_recent_habbicons_updated';

    // AS3: HabbiconControllerEvent.as::ROOM_USE_HABBICON
    static readonly ROOM_USE_HABBICON: string = 'hce_room_use_habbicon';

    // AS3: HabbiconControllerEvent.as::type
    readonly type: string;

    // AS3: HabbiconControllerEvent.as::habbiconId
    readonly habbiconId: number;

    // AS3: HabbiconControllerEvent.as::collectionId
    readonly collectionId: number;

    // AS3: HabbiconControllerEvent.as::roomIndex
    readonly roomIndex: number;

    // AS3: HabbiconControllerEvent.as::HabbiconControllerEvent()
    constructor(type: string, habbiconId: number = 0, collectionId: number = 0, roomIndex: number = 0)
    {
        this.type = type;
        this.habbiconId = habbiconId;
        this.collectionId = collectionId;
        this.roomIndex = roomIndex;
    }

    // AS3: HabbiconControllerEvent.as::clone()
    clone(): HabbiconControllerEvent
    {
        return new HabbiconControllerEvent(this.type, this.habbiconId, this.collectionId, this.roomIndex);
    }
}
