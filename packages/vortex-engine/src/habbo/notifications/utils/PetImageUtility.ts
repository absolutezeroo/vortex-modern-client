/**
 * PetImageUtility — renders the small pet thumbnail the notification feed shows.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/utils/PetImageUtility.as
 *
 * A thin wrapper over RoomEngine.getPetImage() with the notification defaults baked in
 * (direction 3 → 135°, scale 32, whole pet, no listener). Passing no listener means only an
 * already-cached render comes back — a miss simply yields no icon, as in AS3.
 */
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {Vector3d} from '@room/utils/Vector3d';
import {Logger} from '@core/utils/Logger';

const logger = Logger.getLogger('habbo.notifications.utils.PetImageUtility');

// AS3 multiplies the direction index by 45 to get the angle it hands to getPetImage().
const DEGREES_PER_DIRECTION: number = 45;

export class PetImageUtility
{
    // AS3: PetImageUtility.as::_roomEngine (static there; an instance field here — the AS3
    // static is shared by every instance and nulled by whichever one is disposed first).
    private _roomEngine: IRoomEngine | null;

    // AS3: PetImageUtility.as::PetImageUtility()
    constructor(roomEngine: IRoomEngine | null)
    {
        this._roomEngine = roomEngine;
    }

    // AS3: PetImageUtility.as::getPetImage()
    // `color` arrives as a hex *string* and is parsed base 16, as in the pet package widget.
    public getPetImage(
        typeId: number,
        paletteId: number,
        color: string,
        direction: number = 3,
        headOnly: boolean = false,
        scale: number = 32,
        posture: string | null = null
    ): ImageBitmap | null
    {
        if(!this._roomEngine)
        {
            logger.warn('Pet Image Utility; Pet image creation failed: Room engine is not defined');

            return null;
        }

        if(typeId < 0 || paletteId < 0) return null;

        const result = this._roomEngine.getPetImage(
            typeId, paletteId, parseInt(color, 16),
            new Vector3d(DEGREES_PER_DIRECTION * direction), scale, null, headOnly, 0, null, posture
        );

        return result?.data ?? null;
    }

    // AS3: PetImageUtility.as::dispose()
    public dispose(): void
    {
        this._roomEngine = null;
    }
}
