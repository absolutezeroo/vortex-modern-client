/**
 * Background object type-name constants used in `landing.view.bgobject.<N>`
 * config strings to select which motion class spawns for a slot.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/layout/backgroundobjects/class_4088.as
 * (obfuscated as `_SafeCls_4477` in the primary source).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/_SafeCls_4477.as
 */
export class BackgroundObjectType
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/_SafeCls_4477.as::LINEAR
    public static readonly LINEAR: string = 'line';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/_SafeCls_4477.as::SPIRAL
    public static readonly SPIRAL: string = 'spiral';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/_SafeCls_4477.as::STATIC_ANIMATED
    public static readonly STATIC_ANIMATED: string = 'animated';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/_SafeCls_4477.as::RANDOM_WALK
    public static readonly RANDOM_WALK: string = 'randomwalk';

    // TODO(AS3): the same file also declares CLASS_LINEAR, CLASS_SPIRAL, CLASS_STATIC_ANIMATED and
    // CLASS_RANDOM_WALK — `Class` constants pairing each name above with the constructor that
    // implements it. This port keeps that pairing in `MovingBackgroundObjects._typeMap`, which is
    // where the lookup actually happens; four exported class references would only duplicate it.
}
