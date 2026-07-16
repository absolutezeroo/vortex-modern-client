/**
 * One of the two offspring outcomes carried by PetBreedingResultEvent.
 *
 * AS3 names this class_3688 — obfuscated in every tree, so the class name is this port's, but
 * every member below is an AS3 public getter's own name and therefore recovered, not invented.
 * InfoStandWidgetHandler.onPetBreedingResult() reads exactly this field set off `resultData` /
 * `otherResultData`.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as
 */
export class PetBreedingResultData
{
    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::class_3688()
    constructor(
        stuffId: number,
        classId: number,
        productCode: string,
        userId: number,
        userName: string,
        rarityLevel: number,
        hasMutation: boolean
    )
    {
        this._stuffId = stuffId;
        this._classId = classId;
        this._productCode = productCode;
        this._userId = userId;
        this._userName = userName;
        this._rarityLevel = rarityLevel;
        this._hasMutation = hasMutation;
    }

    private _stuffId: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    private _classId: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get classId()
    get classId(): number
    {
        return this._classId;
    }

    private _productCode: string;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    private _userId: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    private _rarityLevel: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get rarityLevel()
    get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    private _hasMutation: boolean;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3688.as::get hasMutation()
    get hasMutation(): boolean
    {
        return this._hasMutation;
    }
}
