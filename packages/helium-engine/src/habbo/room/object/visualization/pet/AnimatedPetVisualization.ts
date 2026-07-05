/**
 * AnimatedPetVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.pet.AnimatedPetVisualization
 *
 * Extends AnimatedFurnitureVisualization for pet-specific rendering.
 * Supports posture/gesture-based animations, independent head direction,
 * custom pet parts with palette swapping, saddle visibility,
 * head-only mode, and experience bubble display.
 *
 * STUB - Core structure and key overrides defined. Complex pet-specific
 * rendering to be completed when pet system is implemented.
 */
import {Texture} from 'pixi.js';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {AnimationStateData} from '../data/AnimationStateData';
import type {AnimationFrame} from '../data/AnimationFrame';
import {AnimatedFurnitureVisualization} from '../furniture/AnimatedFurnitureVisualization';
import {AnimatedPetVisualizationData} from './AnimatedPetVisualizationData';

/**
 * Experience bubble data for displaying gained XP above the pet.
 */
class ExperienceData
{
    private _experience: number = 0;

    constructor(image: HTMLCanvasElement | null)
    {
        this._image = image;
    }

    private _image: HTMLCanvasElement | null;

    get image(): HTMLCanvasElement | null
    {
        return this._image;
    }

    private _alpha: number = 0;

    get alpha(): number
    {
        return this._alpha;
    }

    set alpha(value: number)
    {
        this._alpha = value;
    }

    setExperience(value: number): void
    {
        this._experience = value;
    }

    dispose(): void
    {
        this._image = null;
    }
}

export class AnimatedPetVisualization extends AnimatedFurnitureVisualization
{
    private static readonly POSTURE_ANIMATION_INDEX: number = 0;
    private static readonly GESTURE_ANIMATION_INDEX: number = 1;
    private static readonly EXPERIENCE_BUBBLE_VISIBLE_IN_MS: number = 1000;

    private _posture: string = '';
    private _gesture: string = '';
    private _isSleeping: boolean = false;
    private _headDirection: number = 0;
    private _experienceData: ExperienceData | null = null;
    private _experienceTimestamp: number = 0;
    private _gainedExperience: number = 0;
    private _petData: AnimatedPetVisualizationData | null = null;
    private _paletteName: string = '';
    private _paletteIndex: number = -1;
    private _customLayerIds: number[] = [];
    private _customPartIds: number[] = [];
    private _customPaletteIds: number[] = [];
    private _petColor: number = 0xFFFFFF;
    private _headOnly: boolean = false;
    private _isRiding: boolean = false;
    private _animationStates: AnimationStateData[] = [];
    private _allAnimationsOver: boolean = false;
    private _headSprites: (boolean | null)[] = [];
    private _nonHeadSprites: (boolean | null)[] = [];
    private _saddleSprites: (boolean | null)[] = [];
    private _lastDirectionX: number = -1;

    constructor()
    {
        super();

        // Create animation state data for posture and gesture
        while(this._animationStates.length < 2)
        {
            this._animationStates.push(new AnimationStateData());
        }
    }

    override initialize(data: IRoomObjectVisualizationData): boolean
    {
        if(!(data instanceof AnimatedPetVisualizationData))
        {
            return false;
        }

        this._petData = data;

        // TODO: Load experience bubble asset from commonAssets

        return super.initialize(data);
    }

    override update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void
    {
        super.update(geometry, time, update, skipUpdate);
        this.updateExperienceBubble(time);
    }

    override dispose(): void
    {
        super.dispose();

        for(const state of this._animationStates)
        {
            if(state !== null)
            {
                state.dispose();
            }
        }

        this._animationStates = [];

        if(this._experienceData !== null)
        {
            this._experienceData.dispose();
            this._experienceData = null;
        }
    }

    protected override updateAnimation(scale: number): number
    {
        const roomObject = this.object;

        if(roomObject !== null)
        {
            const dirX = Math.floor(roomObject.getDirection().x);

            if(dirX !== this._lastDirectionX)
            {
                this._lastDirectionX = dirX;
                this.resetAllAnimationFrames();
            }
        }

        return super.updateAnimation(scale);
    }

    protected override updateModel(scale: number): boolean
    {
        const roomObject = this.object;

        if(roomObject === null) return false;

        const model = roomObject.getModel();

        if(model === null) return false;

        if(model.getUpdateID() !== this._updateModelCounter)
        {
            const posture = model.getString('figure_posture') ?? '';
            const gesture = model.getString('figure_gesture') ?? '';

            this.validateActions(posture, gesture);

            this._isSleeping = model.getNumber('figure_sleep') > 0;

            const headDir = model.getNumber('head_direction');

            if(!isNaN(headDir) && this._petData !== null && this._petData.isAllowedToTurnHead)
            {
                this._headDirection = headDir;
            }
            else
            {
                this._headDirection = roomObject.getDirection().x;
            }

            this._experienceTimestamp = model.getNumber('figure_experience_timestamp');
            this._gainedExperience = model.getNumber('figure_gained_experience');

            const paletteIndex = Math.floor(model.getNumber('pet_palette_index'));

            if(paletteIndex !== this._paletteIndex)
            {
                this._paletteIndex = paletteIndex;
                this._paletteName = String(this._paletteIndex);
            }

            const customLayers = model.getNumberArray('pet_custom_layer_ids');
            const customParts = model.getNumberArray('pet_custom_part_ids');
            const customPalettes = model.getNumberArray('pet_custom_palette_ids');

            this._customLayerIds = customLayers !== null ? [...customLayers] : [];
            this._customPartIds = customParts !== null ? [...customParts] : [];
            this._customPaletteIds = customPalettes !== null ? [...customPalettes] : [];

            const isRiding = Math.floor(model.getNumber('pet_is_riding'));
            this._isRiding = !isNaN(isRiding) && isRiding > 0;

            const petColor = model.getNumber('pet_color');

            if(!isNaN(petColor) && petColor !== this._petColor)
            {
                this._petColor = petColor;
            }

            this._headOnly = model.getNumber('pet_head_only') > 0;

            this._updateModelCounter = model.getUpdateID();
            return true;
        }

        return false;
    }

    protected override setAnimation(_animationId: number): void
    {
        // Pet visualization uses posture/gesture system instead of direct animation IDs
    }

    protected override resetAllAnimationFrames(): void
    {
        this._allAnimationsOver = false;

        for(let i = this._animationStates.length - 1; i >= 0; i--)
        {
            const state = this._animationStates[i];

            if(state !== null)
            {
                state.setLayerCount(this.animatedLayerCount);
            }
        }
    }

    protected override updateAnimations(scale: number): number
    {
        if(this._allAnimationsOver) return 0;

        let allOver = true;
        let result = 0;

        for(let i = 0; i < this._animationStates.length; i++)
        {
            const state = this._animationStates[i];

            if(state !== null && !state.animationOver)
            {
                const layerResult = this.updateFramesForAnimation(state, scale);
                result |= layerResult;

                if(!state.animationOver)
                {
                    allOver = false;
                }
            }
        }

        this._allAnimationsOver = allOver;
        return result;
    }

    protected override getFrameNumber(scale: number, layerIndex: number): number
    {
        for(let i = this._animationStates.length - 1; i >= 0; i--)
        {
            const state = this._animationStates[i];

            if(state !== null)
            {
                const frame: AnimationFrame | null = state.getFrame(layerIndex);

                if(frame !== null)
                {
                    return frame.id;
                }
            }
        }

        return super.getFrameNumber(scale, layerIndex);
    }

    protected override getSpriteXOffset(scale: number, direction: number, layerIndex: number): number
    {
        let offset = super.getSpriteXOffset(scale, direction, layerIndex);

        for(let i = this._animationStates.length - 1; i >= 0; i--)
        {
            const state = this._animationStates[i];

            if(state !== null)
            {
                const frame = state.getFrame(layerIndex);

                if(frame !== null)
                {
                    offset += frame.x;
                }
            }
        }

        return offset;
    }

    protected override getSpriteYOffset(scale: number, direction: number, layerIndex: number): number
    {
        let offset = super.getSpriteYOffset(scale, direction, layerIndex);

        for(let i = this._animationStates.length - 1; i >= 0; i--)
        {
            const state = this._animationStates[i];

            if(state !== null)
            {
                const frame = state.getFrame(layerIndex);

                if(frame !== null)
                {
                    offset += frame.y;
                }
            }
        }

        return offset;
    }

    protected override updateLayerCount(count: number): void
    {
        super.updateLayerCount(count);
        this._headSprites = [];
    }

    protected override getAdditionalSpriteCount(): number
    {
        return super.getAdditionalSpriteCount() + 1;
    }

    /**
	 * Validate and update posture/gesture actions.
	 */
    private validateActions(posture: string, gesture: string): void
    {
        if(this._petData === null) return;

        if(posture !== this._posture)
        {
            this._posture = posture;
            // TODO: Get animation ID for posture from _petData
            // setAnimationForIndex(POSTURE_ANIMATION_INDEX, animId);
        }

        if(gesture !== this._gesture)
        {
            this._gesture = gesture;
            // TODO: Get animation ID for gesture from _petData
            // setAnimationForIndex(GESTURE_ANIMATION_INDEX, animId);
        }
    }

    /**
	 * Update the experience bubble display.
	 */
    private updateExperienceBubble(time: number): void
    {
        if(this._experienceData === null) return;

        this._experienceData.alpha = 0;

        if(this._experienceTimestamp > 0)
        {
            const elapsed = time - this._experienceTimestamp;

            if(elapsed < AnimatedPetVisualization.EXPERIENCE_BUBBLE_VISIBLE_IN_MS)
            {
                this._experienceData.alpha = Math.sin(elapsed / AnimatedPetVisualization.EXPERIENCE_BUBBLE_VISIBLE_IN_MS * Math.PI) * 255;
                this._experienceData.setExperience(this._gainedExperience);
            }
            else
            {
                this._experienceTimestamp = 0;
            }

            const sprite = this.getSprite(this.spriteCount - 1);

            if(sprite !== null)
            {
                if(this._experienceData.alpha > 0)
                {
                    const img = this._experienceData.image;
                    sprite.texture = img !== null ? Texture.from(img) : null;
                    sprite.offsetX = -20;
                    sprite.offsetY = -80;
                    sprite.alpha = this._experienceData.alpha;
                    sprite.visible = true;
                }
                else
                {
                    sprite.texture = null;
                    sprite.visible = false;
                }
            }
        }
    }
}
