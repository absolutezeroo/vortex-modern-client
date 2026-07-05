import type {ISpriteDataContainer} from './ISpriteDataContainer';

/**
 * Interface for an avatar animation containing sprite, remove, and add data.
 *
 * @see sources/win63_version/habbo/avatar/animation/class_3557.as (IAnimation)
 */
export interface IAnimation
{
    readonly id: string;
    readonly spriteData: ISpriteDataContainer[];
    readonly removeData: string[];
    readonly addData: { id: string; align: string; base: string; ink: string; blend: number }[];
    readonly resetOnToggle: boolean;

    hasAvatarData(): boolean;

    hasDirectionData(): boolean;

    hasAddData(): boolean;
}
