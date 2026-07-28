/**
 * RoomWidgetPetPackageUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetPackageUpdateEvent.as
 *
 * Three phases on one class: the dialog opening, the server's verdict on the chosen name, and a
 * late pet image arriving after the dialog is already up.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetPackageUpdateEvent extends RoomWidgetUpdateEvent
{
    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value and from its
     * two readable siblings below.
     */
    // AS3: RoomWidgetPetPackageUpdateEvent.as::_SafeStr_10498
    public static readonly OPEN_PET_PACKAGE_REQUESTED: string = 'RWOPPUE_OPEN_PET_PACKAGE_REQUESTED';

    // AS3: RoomWidgetPetPackageUpdateEvent.as::OPEN_PET_PACKAGE_RESULT
    public static readonly OPEN_PET_PACKAGE_RESULT: string = 'RWOPPUE_OPEN_PET_PACKAGE_RESULT';

    // AS3: RoomWidgetPetPackageUpdateEvent.as::OPEN_PET_PACKAGE_UPDATE_PET_IMAGE
    public static readonly OPEN_PET_PACKAGE_UPDATE_PET_IMAGE: string = 'RWOPPUE_OPEN_PET_PACKAGE_UPDATE_PET_IMAGE';

    // AS3: RoomWidgetPetPackageUpdateEvent.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: RoomWidgetPetPackageUpdateEvent.as::_SafeStr_8605
    private _typeId: number = -1;

    // AS3: RoomWidgetPetPackageUpdateEvent.as::_SafeStr_4582
    private _image: ImageBitmap | null = null;

    // AS3: RoomWidgetPetPackageUpdateEvent.as::_nameValidationStatus
    private _nameValidationStatus: number = 0;

    // AS3: RoomWidgetPetPackageUpdateEvent.as::_nameValidationInfo
    private _nameValidationInfo: string | null = null;

    // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent()
    constructor(
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param1
        type: string,
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param2
        objectId: number,
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param3
        image: ImageBitmap | null,
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param4
        nameValidationStatus: number,
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param5
        nameValidationInfo: string | null,
        // AS3: RoomWidgetPetPackageUpdateEvent.as::RoomWidgetPetPackageUpdateEvent() param6
        typeId: number
    )
    {
        super(type);

        this._objectId = objectId;
        this._image = image;
        this._nameValidationStatus = nameValidationStatus;
        this._nameValidationInfo = nameValidationInfo;
        this._typeId = typeId;
    }

    // AS3: RoomWidgetPetPackageUpdateEvent.as::get nameValidationStatus()
    public get nameValidationStatus(): number
    {
        return this._nameValidationStatus;
    }

    // AS3: RoomWidgetPetPackageUpdateEvent.as::get nameValidationInfo()
    public get nameValidationInfo(): string | null
    {
        return this._nameValidationInfo;
    }

    // AS3: RoomWidgetPetPackageUpdateEvent.as::get image()
    public get image(): ImageBitmap | null
    {
        return this._image;
    }

    // AS3: RoomWidgetPetPackageUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetPetPackageUpdateEvent.as::get typeId()
    public get typeId(): number
    {
        return this._typeId;
    }
}
