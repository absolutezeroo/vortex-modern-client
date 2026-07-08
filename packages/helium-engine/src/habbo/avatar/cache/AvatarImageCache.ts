import {Texture} from 'pixi.js';
import type {AvatarStructure} from '../AvatarStructure';
import type {AssetAliasCollection} from '../alias/AssetAliasCollection';
import type {IAvatarImage} from '../IAvatarImage';
import type {IActiveActionData} from '../actions/IActiveActionData';
import type {AvatarImagePartContainer} from '../AvatarImagePartContainer';
import type {AvatarCanvas} from '../structure/AvatarCanvas';
import {AvatarDirectionAngle} from '../enum/AvatarDirectionAngle';
import {AvatarScaleType} from '../enum/AvatarScaleType';
import {AvatarImageBodyPartCache} from './AvatarImageBodyPartCache';
import {AvatarImageActionCache} from './AvatarImageActionCache';
import {AvatarImageDirectionCache} from './AvatarImageDirectionCache';
import {AvatarImageBodyPartContainer} from '../AvatarImageBodyPartContainer';
import type {IColorTransformData} from './ImageData';
import {ImageData} from './ImageData';

/**
 * Main cache manager for avatar image rendering.
 * Manages a hierarchical cache: bodyPart -> action -> direction -> frame.
 *
 * The rendering pipeline composites individual part sprites into body-part
 * containers, using direction-aware flipping and color transforms.
 *
 * @see sources/win63_version/habbo/avatar/cache/AvatarImageCache.as
 */
export class AvatarImageCache
{
    public static readonly DEFAULT_MAX_CACHE_STORAGE_TIME_MS: number = 60000;

    private static readonly UNDERSCORE: string = '_';
    private static readonly DEF_SEPARATOR: string = '.';
    private static readonly BASE_ACTION: string = 'std';
    private static readonly LAY_BASE_ACTION: string = 'lay';
    private static readonly PART_FACE: string = 'fc';
    private static readonly PART_EYES: string = 'ey';
    private static readonly PART_RIGHT_ITEM: string = 'ri';
    private static readonly ACTION_WAVE: string = 'wav';
    private static readonly ACTION_DRINK: string = 'drk';
    private static readonly ACTION_BLOW: string = 'blw';
    private static readonly ACTION_SIGN: string = 'sig';
    private static readonly ACTION_RESPECT: string = 'respect';

    private _structure: AvatarStructure;
    private _avatar: IAvatarImage;
    private _assets: AssetAliasCollection;
    private _scale: string;
    private _cache: Map<string, AvatarImageBodyPartCache>;
    private _canvas: AvatarCanvas | null;
    private _disposed: boolean;
    private _geometryType: string;
    private _defaultActionAssetPartDefinition: string;
    private _unionImages: ImageData[];
    private _serverRenderData: any[];

    constructor(
        structure: AvatarStructure,
        avatar: IAvatarImage,
        assets: AssetAliasCollection,
        scale: string
    )
    {
        this._structure = structure;
        this._avatar = avatar;
        this._assets = assets;
        this._scale = scale;
        this._cache = new Map();
        this._canvas = null;
        this._disposed = false;
        this._geometryType = '';
        this._defaultActionAssetPartDefinition = AvatarImageCache.BASE_ACTION;
        this._unionImages = [];
        this._serverRenderData = [];
    }

    /**
	 * Sets the direction for all body parts in the given set type.
	 *
	 * @param setType - The body part set identifier (e.g. 'full', 'head')
	 * @param direction - The avatar direction (0-7)
	 */
    public setDirection(setType: string, direction: number): void
    {
        const bodyPartIds = this._structure.getBodyPartsUnordered(setType);

        for(const bodyPartId of bodyPartIds)
        {
            const cache = this.getBodyPartCache(bodyPartId);

            if(cache) cache.setDirection(direction);
        }
    }

    /**
	 * Sets the action for all active body parts of the given action.
	 *
	 * @param action - The active action data
	 * @param frameCount - The current frame count
	 */
    public setAction(action: IActiveActionData, frameCount: number): void
    {
        const bodyPartIds = this._structure.getActiveBodyPartIds(action, this._avatar);

        for(const bodyPartId of bodyPartIds)
        {
            const cache = this.getBodyPartCache(bodyPartId);

            if(cache) cache.setAction(action, frameCount);
        }
    }

    /**
	 * Sets the geometry type (vertical, sitting, lay, etc.).
	 * Clears caches only when the transition requires it.
	 *
	 * @param geometryType - The geometry type string
	 */
    public setGeometryType(geometryType: string): void
    {
        if(this._geometryType === geometryType) return;

        if((this._geometryType === 'sitting' && geometryType === 'vertical') ||
			(this._geometryType === 'vertical' && geometryType === 'sitting') ||
			(this._geometryType === 'swhorizontal' || geometryType === 'swhorizontal'))
        {
            this._geometryType = geometryType;
            this._defaultActionAssetPartDefinition = this.getDefaultActionFromGeometryType(this._geometryType);
            this._canvas = null;

            return;
        }

        this.disposeInactiveActions(0);
        this._geometryType = geometryType;
        this._defaultActionAssetPartDefinition = this.getDefaultActionFromGeometryType(this._geometryType);
        this._canvas = null;
    }

    /**
	 * Disposes action caches that have been idle longer than the threshold.
	 *
	 * @param maxIdleTime - Maximum idle time in ms before eviction
	 */
    public disposeInactiveActions(maxIdleTime: number = AvatarImageCache.DEFAULT_MAX_CACHE_STORAGE_TIME_MS): void
    {
        const now = Date.now();

        for(const cache of this._cache.values())
        {
            if(cache) cache.disposeActions(maxIdleTime, now);
        }
    }

    /**
	 * Resets all body part caches to the given action.
	 *
	 * @param action - The action to reset to
	 */
    public resetBodyPartCache(action: IActiveActionData): void
    {
        for(const cache of this._cache.values())
        {
            if(cache) cache.setAction(action, 0);
        }
    }

    /**
	 * Core method: gets or creates a cached body part image container.
	 *
	 * Handles animation layer data overrides for direction, frame index,
	 * and action, then delegates to the hierarchical cache or renders if needed.
	 *
	 * @param bodyPartId - The body part identifier
	 * @param frameIndex - The current animation frame index
	 * @param forceUpdate - If true, bypasses cache and forces re-render
	 * @returns The body part container, or null if rendering fails
	 */
    public getImageContainer(bodyPartId: string, frameIndex: number, forceUpdate: boolean = false): AvatarImageBodyPartContainer | null
    {
        let bodyPartCache = this.getBodyPartCache(bodyPartId);

        if(!bodyPartCache)
        {
            bodyPartCache = new AvatarImageBodyPartCache();
            this._cache.set(bodyPartId, bodyPartCache);
        }

        let direction = bodyPartCache.getDirection();
        let adjustedFrameIndex = frameIndex;

        const action = bodyPartCache.getAction();

        if(!action) return null;

        if(action.definition.startFromFrameZero)
        {
            adjustedFrameIndex -= action.startFrame;
        }

        let cacheAction: IActiveActionData = action;
        let renderAction: IActiveActionData = action;
        const removeData: string[] = [];
        let effectParts: Map<string, string> = new Map();
        const animationOffset = {x: 0, y: 0};

        if(action && action.definition)
        {
            if(action.definition.isAnimation)
            {
                let animDirection = direction;
                const animation = this._structure.getAnimation(
                    action.definition.state + AvatarImageCache.DEF_SEPARATOR + action.actionParameter
                );
                const animFrameIndex = frameIndex - action.startFrame;

                if(animation)
                {
                    const layerData = animation.getLayerData(animFrameIndex, bodyPartId, action.overridingAction);

                    if(layerData)
                    {
                        animDirection = direction + layerData.dd;

                        if(layerData.dd < 0)
                        {
                            if(animDirection < 0)
                            {
                                animDirection = 8 + animDirection;
                            }
                            else if(animDirection > 7)
                            {
                                animDirection = 8 - animDirection;
                            }
                        }
                        else
                        {
                            if(animDirection < 0)
                            {
                                animDirection += 8;
                            }
                            else if(animDirection > 7)
                            {
                                animDirection -= 8;
                            }
                        }

                        if(this._scale === AvatarScaleType.LARGE)
                        {
                            animationOffset.x = layerData.dx;
                            animationOffset.y = layerData.dy;
                        }
                        else
                        {
                            animationOffset.x = layerData.dx / 2;
                            animationOffset.y = layerData.dy / 2;
                        }

                        adjustedFrameIndex = layerData.animationFrame;

                        if(layerData.action)
                        {
                            renderAction = layerData.action;
                        }

                        if(layerData.type === 'bodypart')
                        {
                            if(layerData.action)
                            {
                                cacheAction = layerData.action;
                            }

                            direction = animDirection;
                        }
                        else if(layerData.type === 'fx')
                        {
                            direction = animDirection;
                        }

                        effectParts = layerData.items;
                    }

                    const animRemoveData = animation.removeData;

                    if(animRemoveData)
                    {
                        for(const item of animRemoveData)
                        {
                            removeData.push(item);
                        }
                    }
                }
            }
        }

        let actionCache = bodyPartCache.getActionCache(cacheAction);

        if(!actionCache || forceUpdate)
        {
            actionCache = new AvatarImageActionCache();
            bodyPartCache.updateActionCache(cacheAction, actionCache);
        }

        let directionCache = actionCache.getDirectionCache(direction);

        if(!directionCache || forceUpdate)
        {
            const partList = this._structure.getParts(
                bodyPartId,
                this._avatar.getFigure(),
                cacheAction,
                this._geometryType,
                direction,
                removeData,
                this._avatar,
                effectParts
            );

            if(!partList) return null;

            directionCache = new AvatarImageDirectionCache(partList);
            actionCache.updateDirectionCache(direction, directionCache);
        }

        let container = directionCache.getImageContainer(adjustedFrameIndex);

        if(!container || forceUpdate)
        {
            const partList = directionCache.getPartList();

            container = this.renderBodyPart(direction, partList, adjustedFrameIndex, renderAction, forceUpdate);

            if(!container || forceUpdate)
            {
                return null;
            }

            if(container.isCacheable)
            {
                directionCache.updateImageContainer(container, adjustedFrameIndex);
            }
        }

        const bodyPartOffset = this._structure.getFrameBodyPartOffset(cacheAction, direction, adjustedFrameIndex, bodyPartId);

        container.offset = {
            x: animationOffset.x + bodyPartOffset.x,
            y: animationOffset.y + bodyPartOffset.y
        };

        return container;
    }

    /**
	 * Returns and clears the accumulated server render data.
	 */
    public getServerRenderData(): any[]
    {
        const data = this._serverRenderData;

        this._serverRenderData = [];

        return data;
    }

    /**
	 * Gets or creates a body part cache for the given ID.
	 *
	 * @param bodyPartId - The body part identifier
	 * @returns The body part cache
	 */
    public getBodyPartCache(bodyPartId: string): AvatarImageBodyPartCache
    {
        let cache = this._cache.get(bodyPartId) || null;

        if(!cache)
        {
            cache = new AvatarImageBodyPartCache();
            this._cache.set(bodyPartId, cache);
        }

        return cache;
    }

    /**
	 * Disposes all caches and clears references.
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this._structure = null!;
        this._avatar = null!;
        this._assets = null!;

        if(this._cache)
        {
            for(const cache of this._cache.values())
            {
                if(cache) cache.dispose();
            }

            this._cache.clear();
        }

        this._canvas = null;
        this._unionImages = [];
        this._serverRenderData = [];
        this._disposed = true;
    }

    /**
	 * Renders a body part by compositing all its individual part sprites
	 * into a single container, handling direction flipping, color transforms,
	 * and animation frames.
	 *
	 * @param direction - The avatar direction (0-7)
	 * @param partList - The list of part containers to render
	 * @param frameIndex - The animation frame index
	 * @param action - The active action data for asset name resolution
	 * @param forceUpdate - Whether this is a forced re-render
	 * @returns The composited body part container, or null if no parts render
	 */
    private renderBodyPart(
        direction: number,
        partList: AvatarImagePartContainer[],
        frameIndex: number,
        action: IActiveActionData,
        forceUpdate: boolean = false
    ): AvatarImageBodyPartContainer | null
    {
        if(!partList || partList.length === 0) return null;

        if(!this._canvas)
        {
            this._canvas = this._structure.getCanvas(this._scale, this._geometryType);

            if(!this._canvas) return null;
        }

        let assetDirection = direction;
        const isFlippedDirection = AvatarDirectionAngle.DIRECTION_IS_FLIPPED[direction] || false;
        let assetPartDefinition = action.definition.assetPartDefinition;
        let isCacheable = true;
        const partCount = partList.length;

        for(let i = partCount - 1; i >= 0; i--)
        {
            const partContainer = partList[i];

            if(direction === 7 && (partContainer.partType === AvatarImageCache.PART_FACE || partContainer.partType === AvatarImageCache.PART_EYES))
            {
                continue;
            }

            if(partContainer.partType === AvatarImageCache.PART_RIGHT_ITEM && !partContainer.partId)
            {
                continue;
            }

            const partType = partContainer.partType;
            const partId = partContainer.partId;
            let currentPartType = partType;

            const animFrame = partContainer.getFrameDefinition(frameIndex);
            let frameNumber: number;

            if(animFrame)
            {
                frameNumber = animFrame.number;

                if(animFrame.assetPartDefinition && animFrame.assetPartDefinition.length > 0)
                {
                    assetPartDefinition = animFrame.assetPartDefinition;
                }
            }
            else
            {
                frameNumber = partContainer.getFrameIndex(frameIndex);
            }

            assetDirection = direction;
            let isPartFlipped = false;

            if(isFlippedDirection)
            {
                if(assetPartDefinition === AvatarImageCache.ACTION_WAVE &&
					(currentPartType === 'lh' || currentPartType === 'ls' || currentPartType === 'lc'))
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_DRINK &&
					(currentPartType === 'rh' || currentPartType === 'rs' || currentPartType === 'rc'))
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_BLOW && currentPartType === 'rh')
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_SIGN && currentPartType === 'lh')
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_RESPECT && currentPartType === 'lh')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'ri')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'li')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'cp')
                {
                    isPartFlipped = true;
                }
                else
                {
                    if(direction === 4)
                    {
                        assetDirection = 2;
                    }
                    else if(direction === 5)
                    {
                        assetDirection = 1;
                    }
                    else if(direction === 6)
                    {
                        assetDirection = 0;
                    }

                    if(partContainer.flippedPartType !== currentPartType)
                    {
                        currentPartType = partContainer.flippedPartType;
                    }
                }
            }

            const resolvedAsset = this.tryResolveAsset(assetPartDefinition, currentPartType, partId, assetDirection, frameNumber);
            const graphicAsset = resolvedAsset?.asset ?? null;

            if(graphicAsset && graphicAsset.texture)
            {
                // Build color transform (AS3 lines 536-556)
                let hasColorTransform = false;
                const colorMult = {redMultiplier: 1, greenMultiplier: 1, blueMultiplier: 1, alphaMultiplier: 1};

                if(partContainer.isColorable && partContainer.color)
                {
                    const ct = partContainer.color.colorTransform;

                    colorMult.redMultiplier = ct.redMultiplier;
                    colorMult.greenMultiplier = ct.greenMultiplier;
                    colorMult.blueMultiplier = ct.blueMultiplier;
                    hasColorTransform = true;
                }

                if(partContainer.isBlendable)
                {
                    const blend = partContainer.blendTransform;

                    colorMult.redMultiplier *= blend.redMultiplier;
                    colorMult.greenMultiplier *= blend.greenMultiplier;
                    colorMult.blueMultiplier *= blend.blueMultiplier;
                    colorMult.alphaMultiplier *= blend.alphaMultiplier;
                    hasColorTransform = true;
                }

                // Compute offset point (AS3 lines 558-562)
                const offset = {x: -graphicAsset.offsetX, y: -graphicAsset.offsetY};

                if(isPartFlipped)
                {
                    offset.x += this._scale === AvatarScaleType.LARGE ? 65 : 31;
                }

                const colorTransform: IColorTransformData | null = hasColorTransform ? colorMult : null;

                // Combine asset-level flip with alias flip for draw-time flipping
                // In AS3, BitmapData is pre-flipped; we flip at draw time instead
                const aliasFlipH = this._assets.getAliasFlipH(resolvedAsset!.assetName);
                const totalAssetFlipH = aliasFlipH !== graphicAsset.flipH;
                const effectiveFlipH = isPartFlipped !== totalAssetFlipH;

                this._unionImages.push(new ImageData(
                    graphicAsset.texture,
                    {x: 0, y: 0, width: graphicAsset.width, height: graphicAsset.height},
                    offset,
                    effectiveFlipH,
                    colorTransform
                ));
            }
            else
            {
                isCacheable = false;
            }
        }

        if(this._unionImages.length === 0) return null;

        const unionImage = this.createUnionImage(this._unionImages, isFlippedDirection);

        const canvasOffset = this._scale === AvatarScaleType.LARGE
            ? this._canvas.height - 16
            : this._canvas.height - 8;

        const regPoint = unionImage.regPoint;

        const containerRegPoint = {
            x: -regPoint.x,
            y: canvasOffset - regPoint.y
        };

        if(isFlippedDirection && assetPartDefinition !== 'lay')
        {
            containerRegPoint.x += this._scale === AvatarScaleType.LARGE ? 67 : 31;
        }

        // Dispose union images
        for(let i = this._unionImages.length - 1; i >= 0; i--)
        {
            const img = this._unionImages.pop();

            if(img) img.dispose();
        }

        return new AvatarImageBodyPartContainer(unionImage.texture, containerRegPoint, isCacheable);
    }

    private tryResolveAsset(
        assetPartDefinition: string,
        partType: string,
        partId: string,
        direction: number,
        frame: number
    ): { asset: any; assetName: string } | null
    {
        const candidates: [string, number][] = [
            [assetPartDefinition, frame],
            [assetPartDefinition, 0],
            [this._defaultActionAssetPartDefinition, frame],
            [this._defaultActionAssetPartDefinition, 0]
        ];

        for(const candidate of candidates)
        {
            const assetName = this.buildAssetName(candidate[0], partType, partId, direction, candidate[1]);
            const asset = this._assets.getAsset(assetName);

            if(asset)
            {
                return {asset, assetName};
            }
        }

        return null;
    }

    private buildAssetName(
        assetPartDefinition: string,
        partType: string,
        partId: string,
        direction: number,
        frame: number
    ): string
    {
        return this._scale
			+ AvatarImageCache.UNDERSCORE + assetPartDefinition
			+ AvatarImageCache.UNDERSCORE + partType
			+ AvatarImageCache.UNDERSCORE + partId
			+ AvatarImageCache.UNDERSCORE + direction
			+ AvatarImageCache.UNDERSCORE + frame;
    }

    private getDefaultActionFromGeometryType(geometryType: string): string
    {
        return geometryType === 'horizontal' ? AvatarImageCache.LAY_BASE_ACTION : AvatarImageCache.BASE_ACTION;
    }

    /**
	 * Composites multiple ImageData objects into a single union image
	 * by computing the bounding rectangle union and drawing each part.
	 *
	 * @param imageDataList - The list of image data to composite
	 * @param isFlipped - Whether the composite should be flipped
	 * @returns The composited image data, or null if empty
	 */
    private createUnionImage(imageDataList: ImageData[], isFlipped: boolean): ImageData
    {
        // Compute the union bounding rect from all offset rects
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for(const imageData of imageDataList)
        {
            const offsetRect = imageData.offsetRect;

            minX = Math.min(minX, offsetRect.x);
            minY = Math.min(minY, offsetRect.y);
            maxX = Math.max(maxX, offsetRect.x + offsetRect.width);
            maxY = Math.max(maxY, offsetRect.y + offsetRect.height);
        }

        const width = Math.max(1, maxX - minX);
        const height = Math.max(1, maxY - minY);
        const regPoint = {x: -minX, y: -minY};

        // Create OffscreenCanvas for compositing (AS3 BitmapData equivalent)
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d')!;

        for(const imageData of imageDataList)
        {
            const texture = imageData.texture;

            if(!texture) continue;

            const source = texture.source?.resource;
            const frame = texture.frame;

            if(!source) continue;

            // Compute draw position: union regPoint - imageData regPoint (AS3 line 632)
            let drawX = regPoint.x - imageData.regPoint.x;
            const drawY = regPoint.y - imageData.regPoint.y;

            // If global direction is flipped, mirror the x position (AS3 line 636)
            if(isFlipped)
            {
                drawX = width - (drawX + imageData.rect.width);
            }

            // Determine if we need draw-time flip (AS3 line 638: XOR of global + per-part)
            const needsFlip = (isFlipped && !imageData.flipH) || (!isFlipped && imageData.flipH);

            ctx.save();

            if(needsFlip)
            {
                // Draw with horizontal flip via matrix (AS3 lines 640-647)
                ctx.translate(drawX + imageData.rect.width, drawY);
                ctx.scale(-1, 1);

                if(imageData.colorTransform)
                {
                    this.drawWithColorTransform(ctx, source as CanvasImageSource, frame, 0, 0, imageData.rect.width, imageData.rect.height, imageData.colorTransform);
                }
                else
                {
                    ctx.drawImage(
                        source as CanvasImageSource,
                        frame.x, frame.y, frame.width, frame.height,
                        0, 0, imageData.rect.width, imageData.rect.height
                    );
                }
            }
            else if(imageData.colorTransform)
            {
                // Draw with color transform (AS3 lines 651-658)
                this.drawWithColorTransform(ctx, source as CanvasImageSource, frame, drawX, drawY, imageData.rect.width, imageData.rect.height, imageData.colorTransform);
            }
            else
            {
                // Fast path: direct copy (AS3 copyPixels, line 661)
                ctx.drawImage(
                    source as CanvasImageSource,
                    frame.x, frame.y, frame.width, frame.height,
                    drawX, drawY, imageData.rect.width, imageData.rect.height
                );
            }

            ctx.restore();
        }

        const resultTexture = Texture.from({resource: canvas, alphaMode: 'premultiply-alpha-on-upload'});

        return new ImageData(
            resultTexture,
            {x: 0, y: 0, width, height},
            regPoint,
            isFlipped,
            null
        );
    }

    /**
	 * Draws a sprite to the canvas context with a color transform applied.
	 * Uses a temporary canvas for per-pixel color multiplication.
	 *
	 * Equivalent to AS3's BitmapData.draw() with ColorTransform parameter.
	 */
    private drawWithColorTransform(
        ctx: OffscreenCanvasRenderingContext2D,
        source: CanvasImageSource,
        frame: { x: number; y: number; width: number; height: number },
        destX: number,
        destY: number,
        width: number,
        height: number,
        colorTransform: IColorTransformData
    ): void
    {
        if(width <= 0 || height <= 0) return;

        const tempCanvas = new OffscreenCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d')!;

        tempCtx.drawImage(
            source,
            frame.x, frame.y, frame.width, frame.height,
            0, 0, width, height
        );

        const pixelData = tempCtx.getImageData(0, 0, width, height);
        const data = pixelData.data;

        for(let i = 0; i < data.length; i += 4)
        {
            data[i] = Math.min(255, (data[i] * colorTransform.redMultiplier) | 0);
            data[i + 1] = Math.min(255, (data[i + 1] * colorTransform.greenMultiplier) | 0);
            data[i + 2] = Math.min(255, (data[i + 2] * colorTransform.blueMultiplier) | 0);
            data[i + 3] = Math.min(255, (data[i + 3] * colorTransform.alphaMultiplier) | 0);
        }

        tempCtx.putImageData(pixelData, 0, 0);
        ctx.drawImage(tempCanvas, destX, destY);
    }
}
