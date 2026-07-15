/**
 * IAvatarAddition
 *
 * Interface for avatar visual additions (floating icons, bubbles, effects).
 * Additions are overlays rendered on top of the avatar sprite such as
 * typing bubbles, muted icons, idle Z animations, etc.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/additions/IAvatarAddition.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';

export interface IAvatarAddition {
    readonly id: number;
    readonly disposed: boolean;

    /**
     * Updates the addition sprite position and asset for the current scale.
     *
     * @param sprite - The sprite to update
     * @param scale - The current visualization scale
     */
    update(sprite: IRoomObjectSprite | null, scale: number): void;

    /**
     * Animates the addition each frame.
     *
     * @param sprite - The sprite to animate
     * @returns True if the animation caused a visual change
     */
    animate(sprite: IRoomObjectSprite | null): boolean;

    /**
     * Disposes of this addition and releases resources.
     */
    dispose(): void;
}
