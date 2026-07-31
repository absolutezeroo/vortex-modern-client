import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Place a stickie note from the inventory onto a wall.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3815.as
 *
 * Header 1122, from WIN63's registry (`_SafeCls_2046.as::_composers[1122]`). Corroborated by
 * vortex-emulator's `PlacePostItMessageEvent = 1122`.
 *
 * Selected in `placeObject()` by the object's own model, not by its category: the branch fires
 * when `getModelController().getString("furniture_is_stickie") != null`, ahead of the generic
 * {@link PlaceObjectMessageComposer} fallback. The location is the legacy wall-location string
 * built by `getOldLocationString()`, the same one a category-20 placement uses.
 *
 * The name comes from vortex-emulator; no unobfuscated tree carries this composer.
 */
export class PlacePostItMessageComposer extends MessageComposer<[number, string]>
{
    private _data: [number, string];

    constructor(itemId: number, wallLocation: string)
    {
        super();
        this._data = [itemId, wallLocation];
    }

    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
