/**
 * Direction constants for window layout.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/enum/Direction.as
 */
export const Direction =
    {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
    } as const;

export type DirectionValue = typeof Direction[keyof typeof Direction];
