import type {IAvatarDataContainer} from './animation/IAvatarDataContainer';
import type {IAnimationLayerData} from './animation/IAnimationLayerData';
import type {ISpriteDataContainer} from './animation/ISpriteDataContainer';
import type {IAvatarFigureContainer} from './IAvatarFigureContainer';
import type {IPartColor} from './structure/figure/IPartColor';

/**
 * Interface for avatar images that can be rendered.
 *
 * @see sources/win63_version/habbo/avatar/class_3374.as (IAvatarImage)
 */
export interface IAvatarImage
{
    readonly avatarSpriteData: IAvatarDataContainer | null;
    readonly animationHasResetOnToggle: boolean;
    readonly mainAction: string;
    disposed?: boolean;

    getCroppedImage(setType: string, scale?: number): any;

    getImage(setType: string, hightlight: boolean, scale?: number): any;

    getServerRenderData(): any[];

    setDirection(setType: string, direction: number): void;

    setDirectionAngle(setType: string, angle: number): void;

    updateAnimationByFrames(frames?: number): void;

    getScale(): string;

    getSprites(): ISpriteDataContainer[];

    getLayerData(sprite: ISpriteDataContainer): IAnimationLayerData | null;

    getAsset(name: string): any;

    getDirection(): number;

    getFigure(): IAvatarFigureContainer;

    getPartColor(partType: string): IPartColor | null;

    isAnimating(): boolean;

    getCanvasOffsets(): number[];

    initActionAppends(): void;

    endActionAppends(): void;

    appendAction(actionType: string, ...args: any[]): boolean;

    isPlaceholder(): boolean;

    forceActionUpdate(): void;

    resetAnimationFrameCounter(): void;

    disposeInactiveActionCache(): void;

    dispose(): void;
}
