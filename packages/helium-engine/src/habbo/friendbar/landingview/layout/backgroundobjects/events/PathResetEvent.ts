/**
 * Dispatched by a background parallax object when its animation path resets
 * (e.g. it reaches the end of its travel and loops back to the start), so
 * sibling objects (like a `StaticAnimatedBackgroundObject`) can resynchronize.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/events/PathResetEvent.as
 */
export class PathResetEvent
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/events/PathResetEvent.as::MOVING_OBJECT_PATH_RESET
    public static readonly MOVING_OBJECT_PATH_RESET: string = 'LWMOPRE_MOVING_OBJECT_PATH_RESET';

    private _objectId: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/events/PathResetEvent.as::PathResetEvent()
    constructor(objectId: number)
    {
        this._objectId = objectId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/events/PathResetEvent.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }
}
