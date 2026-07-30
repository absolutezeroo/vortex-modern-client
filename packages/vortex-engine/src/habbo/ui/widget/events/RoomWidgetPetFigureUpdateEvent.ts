/**
 * RoomWidgetPetFigureUpdateEvent
 *
 * A pet's re-rendered portrait, for the infostand to swap in when the pet changes appearance.
 *
 * AS3 carries a `flash.display.BitmapData`; this port carries the figure string instead, which is
 * what the pet-image pipeline takes here (PetImageWidget renders from the figure) — the BitmapData
 * has no equivalent on this side.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetFigureUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetFigureUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetFigureUpdateEvent.as::PET_FIGURE_UPDATE
    public static readonly PET_FIGURE_UPDATE: string = 'RWPIUE_PET_FIGURE_UPDATE';

    private _petId: number;

    private _figure: string;

    // AS3: .../RoomWidgetPetFigureUpdateEvent.as::RoomWidgetPetFigureUpdateEvent()
    constructor(petId: number, figure: string)
    {
        super(RoomWidgetPetFigureUpdateEvent.PET_FIGURE_UPDATE);

        this._petId = petId;
        this._figure = figure;
    }

    // AS3: .../RoomWidgetPetFigureUpdateEvent.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../RoomWidgetPetFigureUpdateEvent.as::get image()
    // Renamed from AS3's `image` because the payload is the figure string, not a BitmapData.
    get figure(): string
    {
        return this._figure;
    }
}
