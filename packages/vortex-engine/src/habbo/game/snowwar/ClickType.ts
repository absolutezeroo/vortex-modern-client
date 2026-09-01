/**
 * What a click in the arena means, read off the two modifier keys held while it happened.
 *
 * `SnowWarEngine.handleClickOnTile()` walks away with `MOVE` or a throw, and
 * `handleClickOnHuman()` can only ever get a throw — clicking an opponent with no modifier is
 * still a throw, `THROW_DEFAULT`, which is the one type whose trajectory the ball picks from the
 * range instead of from the click. `getTrajectoryFromClickType()` maps the four onto
 * `SnowBallGameObject.TRAJECTORY_*`, and it is not the identity: fast → quick throw (0),
 * long lob → 2, short lob → 1, default → 3.
 *
 * **The name is derived**, and so is `MOVE`. `_SafeCls_3057` in the primary tree, `class_2993` in
 * `win63_version`, absent from the 2016 build — obfuscated everywhere it exists. Both names come
 * from the surviving members: the class declares `getClickTypeOnTile()`/`getClickTypeOnOpponent()`
 * and the engine calls the result a click type; `_SafeStr_10639` is the 0 that sends
 * `moveOwnAvatarTo()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/_SafeCls_3057.as
 */
export class ClickType
{
    /** Derived name — `_SafeStr_10639`. The no-modifier click on a tile: walk there. */
    // AS3: _SafeCls_3057.as::_SafeStr_10639
    public static readonly MOVE: number = 0;

    // AS3: _SafeCls_3057.as::THROW_FAST_BALL
    public static readonly THROW_FAST_BALL: number = 1;

    // AS3: _SafeCls_3057.as::THROW_LONG_LOB_BALL
    public static readonly THROW_LONG_LOB_BALL: number = 2;

    // AS3: _SafeCls_3057.as::THROW_SHORT_LOB_BALL
    public static readonly THROW_SHORT_LOB_BALL: number = 3;

    // AS3: _SafeCls_3057.as::THROW_DEFAULT
    public static readonly THROW_DEFAULT: number = 4;

    // AS3: _SafeCls_3057.as::getClickTypeOnTile()
    public static getClickTypeOnTile(altKey: boolean, shiftKey: boolean): number
    {
        if(altKey)
        {
            if(shiftKey)
            {
                return ClickType.THROW_SHORT_LOB_BALL;
            }

            return ClickType.THROW_LONG_LOB_BALL;
        }

        if(shiftKey)
        {
            return ClickType.THROW_FAST_BALL;
        }

        return ClickType.MOVE;
    }

    // AS3: _SafeCls_3057.as::getClickTypeOnOpponent()
    public static getClickTypeOnOpponent(altKey: boolean, shiftKey: boolean): number
    {
        if(altKey)
        {
            if(shiftKey)
            {
                return ClickType.THROW_SHORT_LOB_BALL;
            }

            return ClickType.THROW_LONG_LOB_BALL;
        }

        if(shiftKey)
        {
            return ClickType.THROW_FAST_BALL;
        }

        return ClickType.THROW_DEFAULT;
    }
}
