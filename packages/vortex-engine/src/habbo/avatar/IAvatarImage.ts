import type {IAvatarDataContainer} from './animation/IAvatarDataContainer';
import type {IAnimationLayerData} from './animation/IAnimationLayerData';
import type {ISpriteDataContainer} from './animation/ISpriteDataContainer';
import type {IAvatarFigureContainer} from './IAvatarFigureContainer';
import type {IPartColor} from './structure/figure/IPartColor';
import type {IGraphicAsset} from '@room/object/visualization/utils/IGraphicAsset';

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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/_SafeCls_1793.as::getHeadRegPoints()
    getHeadRegPoints(scale: string): { x: number; y: number };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/_SafeCls_1793.as::getFaceOffset()
    getFaceOffset(scale: string): { x: number; y: number };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/_SafeCls_1793.as::isBlocked()
    isBlocked(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/AvatarImage.as::resetCache()
    // Not part of AS3's own IAvatarImage-equivalent (_SafeCls_1793.as) - AS3's caller
    // (AvatarRenderManager.resetAllCaches()) holds concrete AvatarImage references, not
    // the interface. Added here because this port stores AvatarImage as IAvatarImage.
    resetCache(): void;

    setDirection(setType: string, direction: number): void;

    setDirectionAngle(setType: string, angle: number): void;

    updateAnimationByFrames(frames?: number): void;

    getScale(): string;

    getSprites(): ISpriteDataContainer[];

    getLayerData(sprite: ISpriteDataContainer): IAnimationLayerData | null;

    getAsset(name: string): IGraphicAsset | null;

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
