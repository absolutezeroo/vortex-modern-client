/**
 * AvatarVisualization
 *
 * Main visualization class for avatar room objects. Extends
 * RoomObjectSpriteVisualization to render avatars using IAvatarImage
 * instances from the avatar render manager.
 *
 * Manages the full avatar rendering lifecycle including:
 * - Figure/gender/direction tracking from the room object model
 * - Avatar image creation and caching per scale and effect
 * - Action state management (posture, gesture, dance, carry, etc.)
 * - Shadow sprite rendering
 * - Visual additions (typing bubble, muted icon, idle Z, expressions, etc.)
 * - Animation frame updates
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/AvatarVisualization.as
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarEffectListener} from '@habbo/avatar/IAvatarEffectListener';
import type {IAvatarAddition} from './additions/IAvatarAddition';
import {RoomObjectSpriteVisualization} from '@room/object/visualization/RoomObjectSpriteVisualization';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {RoomObjectSpriteType} from '@room/object/enum/RoomObjectSpriteType';
import {AlphaTolerance} from '@room/object/enum/AlphaTolerance';
import {AvatarSetType} from '@habbo/avatar/enum/AvatarSetType';
import {AvatarAction} from '@habbo/avatar/enum/AvatarAction';
import {AvatarGuideStatus} from '@habbo/avatar/enum/AvatarGuideStatus';
import type {AvatarVisualizationData} from './AvatarVisualizationData';
import {FloatingIdleZ} from './additions/FloatingIdleZ';
import {MutedBubble} from './additions/MutedBubble';
import {TypingBubble} from './additions/TypingBubble';
import {GuideStatusBubble} from './additions/GuideStatusBubble';
import {GameClickTarget} from './additions/GameClickTarget';
import {NumberBubble} from './additions/NumberBubble';
import {ExpressionAdditionFactory} from './additions/ExpressionAdditionFactory';

/** String tag for the main avatar sprite data container. */
const AVATAR: string = 'avatar';

/** Default depth offset for avatar sprites. */
const AVATAR_SPRITE_DEFAULT_DEPTH: number = -0.01;

/** Additional depth adjustment for the player's own avatar. */
const AVATAR_OWN_DEPTH_ADJUST: number = 0.001;

/** Depth offset when the avatar is laying down. */
const AVATAR_SPRITE_LAYING_DEPTH: number = -0.409;

/** AS3 base Y scale used for figure_vertical_offset. */
const BASE_Y_SCALE: number = 1000;

/** Maximum number of avatars with effect cached by the visualization. */
const MAX_AVATARS_WITH_EFFECT: number = 3;

/** AS3 animation frame update interval. */
const ANIMATION_FRAME_UPDATE_INTERVAL: number = 2;

/** Snowboarding effect id; hides the regular shadow. */
const SNOWBOARDING_EFFECT: number = 97;

/** Freeze effect id; hides the regular shadow. */
const FREEZE_EFFECT: number = 218;

/** Sprite index for the main avatar composite image. */
const SPRITE_INDEX_AVATAR: number = 0;

/** Default canvas offsets when none are provided. */
const DEFAULT_CANVAS_OFFSETS: number[] = [0, 0, 0];

/** Sprite index for the shadow. */
const SPRITE_INDEX_SHADOW: number = 1;

/** Initial number of reserved sprites (avatar image + shadow). */
const INITIAL_RESERVED_SPRITES: number = 2;

/** Addition map keys for each addition type. */
const ADDITION_KEY_IDLE: number = 1;
const ADDITION_KEY_TYPING: number = 2;
const ADDITION_KEY_EXPRESSION: number = 3;
const ADDITION_KEY_NUMBER: number = 4;
const ADDITION_KEY_GAME_CLICK: number = 5;
const ADDITION_KEY_MUTED: number = 6;
const ADDITION_KEY_GUIDE_STATUS: number = 7;

/** Minimum time between geometry updates in milliseconds. */
const GEOMETRY_UPDATE_INTERVAL_MS: number = 41;

export class AvatarVisualization extends RoomObjectSpriteVisualization implements IAvatarImageListener, IAvatarEffectListener 
{
    private _lastAnimationUpdateTime: number = -1000;
    private _visualizationData: AvatarVisualizationData | null = null;
    private _avatarImages: Map<string, IAvatarImage> = new Map();
    private _avatarImagesWithEffect: Map<string, IAvatarImage> = new Map();
    private _updatesUntilFrameUpdate: number = 0;
    private _isAnimating: boolean = false;
    private _figure: string = '';
    private _gender: string = '';
    private _pendingFrameUpdates: number = 0;
    private _shadowAssetName: string | null = null;
    private _currentHeadAngleDeg: number = -1;
    private _currentHeadAngle: number = -1;
    private _extraSpritesStartIndex: number = 2;
    private _additions: Map<number, IAvatarAddition> | null = null;
    private _geometryUpdateCounter: number = -1;
    private _postureParameter: string = '';
    private _isTalking: boolean = false;
    private _isSleeping: boolean = false;
    private _isBlinking: boolean = false;
    private _expressionType: number = 0;
    private _gesture: number = 0;
    private _danceStyle: number = 0;
    private _mouseHighlight: number = 0;
    private _mouseHighlightEnabled: boolean = false;
    private _signType: number = -1;
    private _effectType: number = 0;
    private _carryObjectType: number = 0;
    private _useObjectType: number = 0;
    private _sitOffset: number = 0;
    private _verticalOffset: number = 0;
    private _effectJustApplied: boolean = false;
    private _isSittingManual: boolean = false;
    private _isLaying: boolean = false;
    private _activeAvatarImage: IAvatarImage | null = null;
    private _isOwnAvatar: boolean = false;
    private _forceUpdate: boolean = false;

    constructor() 
    {
        super();
    }

    private _angle: number = -1;

    /**
     * The body direction angle in degrees.
     */
    get angle(): number 
    {
        return this._angle;
    }

    private _posture: string = '';

    /**
     * The current avatar posture string (std, sit, lay, mv, etc.).
     */
    get posture(): string 
    {
        return this._posture;
    }

    private _disposed: boolean = false;

    /**
     * Whether this visualization has been disposed.
     */
    get disposed(): boolean 
    {
        return this._disposed;
    }

    /**
     * Gets the number of active additions.
     */
    protected get additionCount(): number 
    {
        return (this._additions) ? this._additions.size : 0;
    }

    /**
     * Gets an asset from the avatar render manager by name.
     * Used by additions to resolve their sprite assets.
     *
     * @param name - The asset name to look up
     * @returns The asset name string (for sprite asset resolution)
     */
    getAvatarRendererAsset(name: string): string | null 
    {
        if(!this._visualizationData) 
        {
            return null;
        }

        return name;
    }

    /**
     * Initializes the visualization with avatar visualization data.
     *
     * @param data - The IRoomObjectVisualizationData (must be AvatarVisualizationData)
     * @returns True if initialization succeeded
     */
    override initialize(data: IRoomObjectVisualizationData): boolean 
    {
        this._visualizationData = data as unknown as AvatarVisualizationData;
        this.createSprites(INITIAL_RESERVED_SPRITES);

        return true;
    }

    /**
     * Main update loop called each render frame. Reads model changes,
     * updates the avatar image, manages additions, and copies sprite data.
     *
     * @param geometry - The room geometry for direction calculations
     * @param time - The current timestamp in milliseconds
     * @param update - Whether a full update is requested
     * @param skipUpdate - Whether to skip the update
     */
    override update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void 
    {
        const roomObject = this.object;

        if(roomObject == null) return;
        if(geometry == null) return;
        if(this._visualizationData == null) return;

        const animationFrameDue = time >= (this._lastAnimationUpdateTime + GEOMETRY_UPDATE_INTERVAL_MS);

        if(animationFrameDue) 
        {
            this._lastAnimationUpdateTime = this._lastAnimationUpdateTime + GEOMETRY_UPDATE_INTERVAL_MS;

            if((this._lastAnimationUpdateTime + GEOMETRY_UPDATE_INTERVAL_MS) < time) 
            {
                this._lastAnimationUpdateTime = time - GEOMETRY_UPDATE_INTERVAL_MS;
            }
        }

        const model = roomObject.getModel();
        const scale = geometry.scale;
        let needsNewImage = false;
        let scaleChanged = false;
        let objectUpdated = false;
        const previousEffectType = this._effectType;
        let effectChanged = false;
        const modelChanged = this.updateModel(model, scale, update);

        if(this._forceUpdate) 
        {
            this.resetImages();
            this._forceUpdate = false;
        }

        if(modelChanged || scale !== this._scale || this._activeAvatarImage == null) 
        {
            if(scale !== this._scale) 
            {
                scaleChanged = true;
                this.validateActions(scale);
            }

            if(previousEffectType !== this._effectType) 
            {
                effectChanged = true;
            }

            if(scaleChanged || this._activeAvatarImage == null || effectChanged) 
            {
                this._activeAvatarImage = this.getAvatarImageForScale(scale, this._effectType);

                if(this._activeAvatarImage == null) 
                {
                    return;
                }

                needsNewImage = true;

                const avatarSprite = this.getSprite(0);

                if(avatarSprite && this._activeAvatarImage && this._activeAvatarImage.isPlaceholder()) 
                {
                    avatarSprite.alpha = 150;
                }
                else if(avatarSprite) 
                {
                    avatarSprite.alpha = 255;
                }
            }

            if(this._activeAvatarImage == null) 
            {
                return;
            }

            if(effectChanged && this._activeAvatarImage.animationHasResetOnToggle) 
            {
                this._activeAvatarImage.resetAnimationFrameCounter();
            }

            this.updateShadow(scale);
            objectUpdated = this.updateObject(roomObject, geometry, update, true);
            this.updateActions(this._activeAvatarImage);

            if(this._additions) 
            {
                let spriteIndex = this._extraSpritesStartIndex;

                for(const addition of this._additions.values()) 
                {
                    addition.update(this.getSprite(spriteIndex++), scale);
                }
            }

            this._scale = scale;
        }
        else 
        {
            objectUpdated = this.updateObject(roomObject, geometry, update);
        }

        if(this._additions) 
        {
            let spriteIndex = this._extraSpritesStartIndex;

            for(const addition of this._additions.values()) 
            {
                if(addition.animate(this.getSprite(spriteIndex++))) 
                {
                    this.increaseUpdateId();
                }
            }
        }

        const needsSpriteUpdate = objectUpdated || modelChanged || scaleChanged;
        const shouldAnimate = (this._isAnimating || this._pendingFrameUpdates > 0) && update && animationFrameDue;

        if(needsSpriteUpdate || needsNewImage) 
        {
            this._pendingFrameUpdates = ANIMATION_FRAME_UPDATE_INTERVAL;
        }

        if(needsSpriteUpdate || shouldAnimate || needsNewImage) 
        {
            this.increaseUpdateId();

            if(animationFrameDue) 
            {
                this._pendingFrameUpdates--;
                this._updatesUntilFrameUpdate--;
            }

            if(!(this._updatesUntilFrameUpdate <= 0 || scaleChanged || modelChanged || needsNewImage)) 
            {
                return;
            }

            this._activeAvatarImage.updateAnimationByFrames(1);
            this._updatesUntilFrameUpdate = ANIMATION_FRAME_UPDATE_INTERVAL;

            const canvasOffsets = this._activeAvatarImage.getCanvasOffsets();
            const offsets = (canvasOffsets == null || canvasOffsets.length < 3) ? DEFAULT_CANVAS_OFFSETS : canvasOffsets;

            this.updateMainSprite(model, geometry, offsets, needsSpriteUpdate);
            this.updateExtraSprites(offsets);

            this._isAnimating = this._activeAvatarImage.isAnimating();
        }
    }

    /**
     * Called when the avatar image has finished loading.
     *
     * @param figureString - The figure string that is ready
     */
    avatarImageReady(figureString: string): void 
    {
        this._forceUpdate = true;
    }

    /**
     * Called when an avatar effect has finished loading.
     *
     * @param effectId - The effect ID that is ready
     */
    avatarEffectReady(effectId: number): void 
    {
        this._forceUpdate = true;
    }

    /**
     * Adds a new addition to the additions map.
     *
     * @param addition - The addition to add
     * @returns The added addition
     */
    addAddition(addition: IAvatarAddition): IAvatarAddition 
    {
        if(!this._additions) 
        {
            this._additions = new Map();
        }

        if(this._additions.has(addition.id)) 
        {
            throw new Error(`Avatar addition with index ${addition.id} already exists!`);
        }

        this._additions.set(addition.id, addition);

        return addition;
    }

    /**
     * Gets an addition by its map key.
     *
     * @param id - The addition key
     * @returns The addition, or null if not found
     */
    getAddition(id: number): IAvatarAddition | null 
    {
        return (this._additions) ? (this._additions.get(id) ?? null) : null;
    }

    /**
     * Removes and disposes an addition by its map key.
     *
     * @param id - The addition key to remove
     */
    removeAddition(id: number): void 
    {
        const addition = this.getAddition(id);

        if(!addition) 
        {
            return;
        }

        this._additions!.delete(id);
        addition.dispose();
    }

    /**
     * Disposes of this visualization, cleaning up all cached images,
     * additions, and sprite data.
     */
    override dispose(): void 
    {
        if(this._avatarImages != null) 
        {
            this.resetImages();
        }

        this._visualizationData = null;
        this._shadowAssetName = null;

        if(this._additions) 
        {
            for(const addition of this._additions.values()) 
            {
                addition.dispose();
            }

            this._additions = null;
        }

        super.dispose();
        this._disposed = true;
    }

    /**
     * Reads all avatar-related properties from the room object model and
     * detects changes for incremental updates.
     *
     * @param model - The room object model
     * @param scale - The current visualization scale
     * @param isFullUpdate - Whether a full update was requested
     * @returns True if any model properties changed
     */
    private updateModel(model: IRoomObjectModel, scale: number, isFullUpdate: boolean): boolean 
    {
        let changed = false;
        let boolValue = false;
        let numValue = 0;
        let strValue = '';

        if(model.getUpdateID() !== this._updateModelCounter) 
        {
            // Talking
            boolValue = (model.getNumber(RoomObjectVariableEnum.AVATAR_TALK) > 0) && isFullUpdate;

            if(boolValue !== this._isTalking) 
            {
                this._isTalking = boolValue;
                changed = true;
            }

            // Expression
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_EXPRESSION);

            if(numValue !== this._expressionType) 
            {
                this._expressionType = numValue;
                changed = true;
            }

            // Sleeping
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_SLEEP) > 0;

            if(boolValue !== this._isSleeping) 
            {
                this._isSleeping = boolValue;
                changed = true;
            }

            // Blinking
            boolValue = (model.getNumber(RoomObjectVariableEnum.AVATAR_BLINK) > 0) && isFullUpdate;

            if(boolValue !== this._isBlinking) 
            {
                this._isBlinking = boolValue;
                changed = true;
            }

            // Gesture
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_GESTURE);

            if(numValue !== this._gesture) 
            {
                this._gesture = numValue;
                changed = true;
            }

            // Posture
            strValue = model.getString(RoomObjectVariableEnum.AVATAR_POSTURE);

            if(strValue !== this._posture) 
            {
                this._posture = strValue;
                changed = true;
            }

            // Posture parameter
            strValue = model.getString(RoomObjectVariableEnum.AVATAR_POSTURE_PARAMETER);

            if(strValue !== this._postureParameter) 
            {
                this._postureParameter = strValue;
                changed = true;
            }

            // Can stand up (effect just applied)
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_CAN_STAND_UP) > 0;

            if(boolValue !== this._effectJustApplied) 
            {
                this._effectJustApplied = boolValue;
                changed = true;
            }

            // Vertical offset
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_VERTICAL_OFFSET) * BASE_Y_SCALE;

            if(numValue !== this._verticalOffset) 
            {
                this._verticalOffset = numValue;
                changed = true;
            }

            // Dance
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_DANCE);

            if(numValue !== this._danceStyle) 
            {
                this._danceStyle = numValue;
                changed = true;
            }

            // Effect
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_EFFECT);

            if(numValue !== this._effectType) 
            {
                this._effectType = numValue;
                changed = true;
            }

            // Carry object
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_CARRY_OBJECT);

            if(numValue !== this._carryObjectType) 
            {
                this._carryObjectType = numValue;
                changed = true;
            }

            // Use object
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_USE_OBJECT);

            if(numValue !== this._useObjectType) 
            {
                this._useObjectType = numValue;
                changed = true;
            }

            // Head direction
            numValue = model.getNumber(RoomObjectVariableEnum.HEAD_DIRECTION);

            if(numValue !== this._currentHeadAngleDeg) 
            {
                this._currentHeadAngleDeg = numValue;
                changed = true;
            }

            // Use object synchronization with carry object
            if(this._carryObjectType > 0 && model.getNumber(RoomObjectVariableEnum.AVATAR_USE_OBJECT) > 0) 
            {
                if(this._useObjectType !== this._carryObjectType) 
                {
                    this._useObjectType = this._carryObjectType;
                    changed = true;
                }
            }
            else 
            {
                if(this._useObjectType !== 0) 
                {
                    this._useObjectType = 0;
                    changed = true;
                }
            }

            // Sleeping idle Z addition
            const idleAddition = this.getAddition(ADDITION_KEY_IDLE) as FloatingIdleZ | null;

            if(this._isSleeping) 
            {
                if(!idleAddition) 
                {
                    this.addAddition(new FloatingIdleZ(ADDITION_KEY_IDLE, this));
                }

                changed = true;
            }
            else 
            {
                if(idleAddition) 
                {
                    this.removeAddition(ADDITION_KEY_IDLE);
                }
            }

            // Muted bubble addition
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_IS_MUTED) > 0;
            const mutedAddition = this.getAddition(ADDITION_KEY_MUTED) as MutedBubble | null;

            if(boolValue) 
            {
                if(!mutedAddition) 
                {
                    this.addAddition(new MutedBubble(ADDITION_KEY_MUTED, this));
                }

                this.removeAddition(ADDITION_KEY_TYPING);
                changed = true;
            }
            else 
            {
                if(mutedAddition) 
                {
                    this.removeAddition(ADDITION_KEY_MUTED);
                    changed = true;
                }

                // Typing bubble addition (only if not muted)
                boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_IS_TYPING) > 0;
                const typingAddition = this.getAddition(ADDITION_KEY_TYPING) as TypingBubble | null;

                if(boolValue) 
                {
                    if(!typingAddition) 
                    {
                        this.addAddition(new TypingBubble(ADDITION_KEY_TYPING, this));
                    }

                    changed = true;
                }
                else 
                {
                    if(typingAddition) 
                    {
                        this.removeAddition(ADDITION_KEY_TYPING);
                    }
                }
            }

            // Guide status bubble addition
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_GUIDE_STATUS);

            if(numValue !== AvatarGuideStatus.NONE) 
            {
                this.removeAddition(ADDITION_KEY_GUIDE_STATUS);
                this.addAddition(new GuideStatusBubble(ADDITION_KEY_GUIDE_STATUS, this, numValue));
                changed = true;
            }
            else 
            {
                if(this.getAddition(ADDITION_KEY_GUIDE_STATUS) as GuideStatusBubble | null) 
                {
                    this.removeAddition(ADDITION_KEY_GUIDE_STATUS);
                    changed = true;
                }
            }

            // Game click target addition
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_IS_PLAYING_GAME) > 0;
            const gameAddition = this.getAddition(ADDITION_KEY_GAME_CLICK) as GameClickTarget | null;

            if(boolValue) 
            {
                if(!gameAddition) 
                {
                    this.addAddition(new GameClickTarget(ADDITION_KEY_GAME_CLICK));
                }

                changed = true;
            }
            else 
            {
                if(gameAddition) 
                {
                    this.removeAddition(ADDITION_KEY_GAME_CLICK);
                }
            }

            // Number bubble addition
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_NUMBER_VALUE);
            const numberAddition = this.getAddition(ADDITION_KEY_NUMBER) as NumberBubble | null;

            if(numValue > 0) 
            {
                if(!numberAddition) 
                {
                    this.addAddition(new NumberBubble(ADDITION_KEY_NUMBER, numValue, this));
                }

                changed = true;
            }
            else 
            {
                if(numberAddition) 
                {
                    this.removeAddition(ADDITION_KEY_NUMBER);
                }
            }

            // Expression addition
            numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_EXPRESSION);
            const expressionAddition = this.getAddition(ADDITION_KEY_EXPRESSION);

            if(numValue > 0) 
            {
                if(!expressionAddition) 
                {
                    const newExpression = ExpressionAdditionFactory.make(ADDITION_KEY_EXPRESSION, numValue, this);

                    if(newExpression) 
                    {
                        this.addAddition(newExpression);
                    }
                }
            }
            else 
            {
                if(expressionAddition) 
                {
                    this.removeAddition(ADDITION_KEY_EXPRESSION);
                }
            }

            this.validateActions(scale);

            // Gender
            strValue = model.getString(RoomObjectVariableEnum.AVATAR_GENDER);

            if(strValue !== this._gender) 
            {
                this._gender = strValue;
                changed = true;
            }

            // Figure
            const figureStr = model.getString(RoomObjectVariableEnum.AVATAR_FIGURE);

            if(this.updateFigure(figureStr)) 
            {
                changed = true;
            }

            // Sign
            if(model.hasNumber(RoomObjectVariableEnum.AVATAR_SIGN)) 
            {
                numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_SIGN);

                if(numValue !== this._signType) 
                {
                    changed = true;
                    this._signType = numValue;
                }
            }

            // Highlight enable
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_HIGHLIGHT_ENABLE) > 0;

            if(boolValue !== this._mouseHighlightEnabled) 
            {
                this._mouseHighlightEnabled = boolValue;
                changed = true;
            }

            // Highlight value
            if(this._mouseHighlightEnabled) 
            {
                numValue = model.getNumber(RoomObjectVariableEnum.AVATAR_MOUSE_HIGHLIGHT);

                if(numValue !== this._mouseHighlight) 
                {
                    this._mouseHighlight = numValue;
                    changed = true;
                }
            }

            // Own user
            boolValue = model.getNumber(RoomObjectVariableEnum.AVATAR_OWN_USER) > 0;

            if(boolValue !== this._isOwnAvatar) 
            {
                this._isOwnAvatar = boolValue;
                changed = true;
            }

            this._updateModelCounter = model.getUpdateID();

            return changed;
        }

        return false;
    }

    /**
     * Checks if the figure string changed and resets images if so.
     *
     * @param figure - The new figure string
     * @returns True if the figure changed
     */
    private updateFigure(figure: string): boolean 
    {
        if(this._figure !== figure) 
        {
            this._figure = figure;
            this.resetImages();

            return true;
        }

        return false;
    }

    /**
     * Disposes all cached avatar images and resets the active image.
     */
    private resetImages(): void 
    {
        for(const image of this._avatarImages.values()) 
        {
            if(image) 
            {
                image.dispose();
            }
        }

        for(const image of this._avatarImagesWithEffect.values()) 
        {
            if(image) 
            {
                image.dispose();
            }
        }

        this._avatarImages.clear();
        this._avatarImagesWithEffect.clear();
        this._activeAvatarImage = null;

        const mainSprite = this.getSprite(SPRITE_INDEX_AVATAR);

        if(mainSprite != null) 
        {
            mainSprite.texture = null;
            mainSprite.alpha = 255;
        }
    }

    /**
     * Validates and adjusts action-related properties based on scale and posture.
     *
     * @param scale - The current visualization scale
     */
    private validateActions(scale: number): void 
    {
        if(scale < 48) 
        {
            this._isBlinking = false;
        }

        if(this._posture === 'sit' || this._posture === 'lay') 
        {
            this._sitOffset = scale / 2;
        }
        else 
        {
            this._sitOffset = 0;
        }

        this._isLaying = false;
        this._isSittingManual = false;

        if(this._posture === 'lay') 
        {
            this._isSittingManual = true;
            const param = parseInt(this._postureParameter, 10);

            if(param < 0) 
            {
                this._isLaying = true;
            }
        }
    }

    /**
     * Gets or creates an avatar image for the given scale and effect type.
     * Caches images by scale key. Images with effects are cached separately
     * with a limited cache size.
     *
     * @param scale - The rendering scale
     * @param effectType - The avatar effect type (0 for none)
     * @returns The avatar image, or null if creation failed
     */
    private getAvatarImageForScale(scale: number, effectType: number): IAvatarImage | null 
    {
        let key = `avatarImage${scale}`;
        let image: IAvatarImage | null = null;

        if(effectType === 0) 
        {
            image = this._avatarImages.get(key) ?? null;
        }
        else 
        {
            key = `${key}-${effectType}`;
            image = this._avatarImagesWithEffect.get(key) ?? null;

            if(image) 
            {
                image.resetAnimationFrameCounter();
            }
        }

        if(image == null) 
        {
            image = this._visualizationData!.createAvatarImage(this._figure, scale, this._gender, this, this);

            if(image != null) 
            {
                if(effectType === 0) 
                {
                    this._avatarImages.set(key, image);
                }
                else 
                {
                    if(this._avatarImagesWithEffect.size >= MAX_AVATARS_WITH_EFFECT) 
                    {
                        const firstKey = this._avatarImagesWithEffect.keys().next().value;

                        if(firstKey !== undefined) 
                        {
                            const oldImage = this._avatarImagesWithEffect.get(firstKey);
                            this._avatarImagesWithEffect.delete(firstKey);

                            if(oldImage) 
                            {
                                oldImage.dispose();
                            }
                        }
                    }

                    this._avatarImagesWithEffect.set(key, image);
                }
            }
        }

        return image;
    }

    /**
     * Updates the body and head direction of the avatar based on the
     * room object direction and room geometry.
     *
     * @param roomObject - The room object
     * @param geometry - The room geometry
     * @param isFullUpdate - Whether a full update was requested
     * @param forceUpdate - Whether to force direction recalculation
     * @returns True if the direction changed
     */
    private updateObject(roomObject: IRoomObject, geometry: IRoomGeometry, isFullUpdate: boolean, forceUpdate: boolean = false): boolean 
    {
        if(forceUpdate || roomObject.getUpdateID() !== this._direction || this._geometryUpdateCounter !== geometry.updateId) 
        {
            let updated = isFullUpdate;

            let bodyAngle = roomObject.getDirection().x - geometry.direction.x;
            bodyAngle = ((bodyAngle % 360) + 360) % 360;

            if(this._posture === 'sit' && this._effectJustApplied) 
            {
                bodyAngle = bodyAngle - ((bodyAngle % 90) - 45);
            }

            let headAngle = this._currentHeadAngleDeg;

            if(this._posture === 'float') 
            {
                headAngle = bodyAngle;
            }
            else 
            {
                headAngle = headAngle - geometry.direction.x;
            }

            headAngle = ((headAngle % 360) + 360) % 360;

            if(this._posture === 'sit' && this._effectJustApplied) 
            {
                headAngle = headAngle - ((headAngle % 90) - 45);
            }

            if(bodyAngle !== this._angle || forceUpdate) 
            {
                updated = true;
                this._angle = bodyAngle;

                let dirAngle = bodyAngle - (135 - 22.5);
                dirAngle = (dirAngle + 360) % 360;

                this._activeAvatarImage!.setDirectionAngle(AvatarSetType.FULL, dirAngle);
            }

            if(headAngle !== this._currentHeadAngle || forceUpdate) 
            {
                updated = true;
                this._currentHeadAngle = headAngle;

                if(this._currentHeadAngle !== this._angle) 
                {
                    let dirAngle = headAngle - (135 - 22.5);
                    dirAngle = (dirAngle + 360) % 360;

                    this._activeAvatarImage!.setDirectionAngle(AvatarSetType.HEAD, dirAngle);
                }
            }

            this._direction = roomObject.getUpdateID();
            this._geometryUpdateCounter = geometry.updateId;

            return updated;
        }

        return false;
    }

    /**
     * Updates the shadow sprite based on the current posture and scale.
     *
     * @param scale - The current visualization scale
     */
    private updateShadow(scale: number): void 
    {
        const shadowSprite = this.getSprite(SPRITE_INDEX_SHADOW);

        this._shadowAssetName = null;

        const showShadow = (
            this._posture === 'mv' ||
            this._posture === 'std' ||
            (this._posture === 'sit' && this._effectJustApplied)
        );

        if(this._effectType === SNOWBOARDING_EFFECT || this._effectType === FREEZE_EFFECT) 
        {
            // Don't show shadow for specific effect type
            shadowSprite!.visible = false;
            return;
        }

        if(showShadow && shadowSprite) 
        {
            shadowSprite.visible = true;

            let offsetX = 0;
            let offsetY = 0;

            if(scale < 48) 
            {
                shadowSprite.libraryAssetName = 'sh_std_sd_1_0_0';
                this._shadowAssetName = shadowSprite.libraryAssetName;
                offsetX = -8;
                offsetY = this._effectJustApplied ? 6 : -3;
            }
            else 
            {
                shadowSprite.libraryAssetName = 'h_std_sd_1_0_0';
                this._shadowAssetName = shadowSprite.libraryAssetName;
                offsetX = -17;
                offsetY = this._effectJustApplied ? 10 : -7;
            }

            if(this._shadowAssetName != null) 
            {
                shadowSprite.offsetX = offsetX;
                shadowSprite.offsetY = offsetY;
                shadowSprite.alpha = 50;
                shadowSprite.relativeDepth = 1;
            }
            else 
            {
                shadowSprite.visible = false;
            }
        }
        else if(shadowSprite) 
        {
            this._shadowAssetName = null;
            shadowSprite.visible = false;
        }
    }

    /**
     * Applies all current action states (posture, gesture, dance, carry, etc.)
     * to the active avatar image and recalculates sprite counts.
     *
     * @param avatarImage - The avatar image to apply actions to
     */
    private updateActions(avatarImage: IAvatarImage): void 
    {
        if(avatarImage == null) 
        {
            return;
        }

        avatarImage.initActionAppends();
        avatarImage.appendAction(AvatarAction.POSTURE, this._posture, this._postureParameter);

        if(this._gesture > 0) 
        {
            avatarImage.appendAction(AvatarAction.GESTURE, AvatarAction.getGesture(this._gesture));
        }

        if(this._danceStyle > 0) 
        {
            avatarImage.appendAction(AvatarAction.DANCE, this._danceStyle);
        }

        if(this._signType > -1) 
        {
            avatarImage.appendAction(AvatarAction.SIGN, this._signType);
        }

        if(this._carryObjectType > 0) 
        {
            avatarImage.appendAction(AvatarAction.CARRY_OBJECT, this._carryObjectType);
        }

        if(this._useObjectType > 0) 
        {
            avatarImage.appendAction(AvatarAction.USE_OBJECT, this._useObjectType);
        }

        if(this._isTalking) 
        {
            avatarImage.appendAction(AvatarAction.TALK);
        }

        if(this._isSleeping || this._isBlinking) 
        {
            avatarImage.appendAction(AvatarAction.SLEEP);
        }

        if(this._expressionType > 0) 
        {
            const expression = AvatarAction.getExpression(this._expressionType);

            if(expression !== '') 
            {
                switch(expression) 
                {
                    case AvatarAction.DANCE:
                        avatarImage.appendAction(AvatarAction.DANCE, 2);
                        break;
                    default:
                        avatarImage.appendAction(expression);
                }
            }
        }

        if(this._effectType > 0) 
        {
            avatarImage.appendAction(AvatarAction.EFFECT, this._effectType);
        }

        avatarImage.endActionAppends();

        this._isAnimating = avatarImage.isAnimating();

        // Count needed sprites for extra animation layers
        let spriteCount = INITIAL_RESERVED_SPRITES;

        for(const spriteData of this._activeAvatarImage!.getSprites()) 
        {
            if(spriteData.id !== AVATAR) 
            {
                spriteCount++;
            }
        }

        if(spriteCount !== this.spriteCount) 
        {
            this.createSprites(spriteCount);
        }

        this._extraSpritesStartIndex = spriteCount;

        // Add sprites for additions
        if(this._additions) 
        {
            for(const _addition of this._additions.values()) 
            {
                this.addSprite();
            }
        }
    }

    /**
     * Updates the main avatar composite sprite (index 0) with the rendered
     * avatar image, position offsets, and depth.
     *
     * @param model - The room object model for highlight checking
     * @param geometry - The room geometry
     * @param offsets - The canvas offset array [x, y, z]
     * @param fullUpdate - Whether this is a full sprite update
     */
    private updateMainSprite(model: IRoomObjectModel, geometry: IRoomGeometry, offsets: number[], fullUpdate: boolean): void 
    {
        const mainSprite = this.getSprite(0);

        if(mainSprite == null) return;

        const scale = geometry.scale;
        const isHighlighted = (
            model.getNumber(RoomObjectVariableEnum.AVATAR_HIGHLIGHT_ENABLE) === 1 &&
            model.getNumber(RoomObjectVariableEnum.AVATAR_MOUSE_HIGHLIGHT) === 1
        );

        const image = this._activeAvatarImage!.getImage(AvatarSetType.FULL, isHighlighted);

        if(image != null) 
        {
            mainSprite.texture = image;
        }

        if(mainSprite.texture) 
        {
            mainSprite.offsetX = (((-1 * scale) / 2) + offsets[0]) - ((mainSprite.width - scale) / 2);
            mainSprite.offsetY = ((-mainSprite.height + (scale / 4)) + offsets[1]) + this._sitOffset;
        }

        if(this._isSittingManual) 
        {
            if(this._isLaying) 
            {
                mainSprite.relativeDepth = -0.5;
            }
            else 
            {
                mainSprite.relativeDepth = AVATAR_SPRITE_LAYING_DEPTH + offsets[2];
            }
        }
        else 
        {
            mainSprite.relativeDepth = AVATAR_SPRITE_DEFAULT_DEPTH + offsets[2];
        }

        if(this._isOwnAvatar) 
        {
            mainSprite.relativeDepth = mainSprite.relativeDepth - AVATAR_OWN_DEPTH_ADJUST;
            mainSprite.spriteType = RoomObjectSpriteType.AVATAR_OWN;
        }
        else 
        {
            mainSprite.spriteType = RoomObjectSpriteType.AVATAR;
        }

        // Update typing bubble depth
        const typingAddition = this.getAddition(ADDITION_KEY_TYPING) as TypingBubble | null;

        if(typingAddition) 
        {
            if(!this._isSittingManual) 
            {
                typingAddition.relativeDepth = (AVATAR_SPRITE_DEFAULT_DEPTH - 0.01) + offsets[2];
            }
            else 
            {
                typingAddition.relativeDepth = (AVATAR_SPRITE_LAYING_DEPTH - 0.01) + offsets[2];
            }
        }
    }

    /**
     * Updates extra animation layer sprites from the avatar image's
     * sprite data containers (effect animations, etc.).
     *
     * @param offsets - The canvas offset array [x, y, z]
     */
    private updateExtraSprites(offsets: number[]): void 
    {
        if(!this._activeAvatarImage) return;

        const scale = this._scale;
        let spriteIndex = INITIAL_RESERVED_SPRITES;
        const direction = this._activeAvatarImage.getDirection();

        for(const spriteData of this._activeAvatarImage.getSprites()) 
        {
            if(spriteData.id === AVATAR) 
            {
                // Avatar container offsets applied to main sprite
                const mainSprite = this.getSprite(0);
                const layerData = this._activeAvatarImage.getLayerData(spriteData);

                let dx = spriteData.getDirectionOffsetX(direction);
                let dy = spriteData.getDirectionOffsetY(direction);

                if(layerData != null) 
                {
                    dx = dx + layerData.dx;
                    dy = dy + layerData.dy;
                }

                if(scale < 48) 
                {
                    dx = Math.floor(dx / 2);
                    dy = Math.floor(dy / 2);
                }

                if(!this._effectJustApplied && mainSprite) 
                {
                    mainSprite.offsetX = mainSprite.offsetX + dx;
                    mainSprite.offsetY = mainSprite.offsetY + dy;
                }
            }
            else 
            {
                const sprite = this.getSprite(spriteIndex);

                if(sprite != null) 
                {
                    sprite.alphaTolerance = AlphaTolerance.MATCH_NOTHING;
                    sprite.visible = true;

                    const layerData = this._activeAvatarImage.getLayerData(spriteData);

                    let animFrame = 0;
                    let dx = spriteData.getDirectionOffsetX(direction);
                    let dy = spriteData.getDirectionOffsetY(direction);
                    const dz = spriteData.getDirectionOffsetZ(direction);
                    let dd = 0;

                    if(spriteData.hasDirections) 
                    {
                        dd = direction;
                    }

                    if(layerData != null) 
                    {
                        animFrame = layerData.animationFrame;
                        dx = dx + layerData.dx;
                        dy = dy + layerData.dy;
                        dd = dd + layerData.dd;
                    }

                    if(scale < 48) 
                    {
                        dx = Math.floor(dx / 2);
                        dy = Math.floor(dy / 2);
                    }

                    if(dd < 0) 
                    {
                        dd = dd + 8;
                    }
                    else if(dd > 7) 
                    {
                        dd = dd - 8;
                    }

                    const assetName = `${this._activeAvatarImage.getScale()}_${spriteData.member}_${dd}_${animFrame}`;
                    const asset = this._activeAvatarImage.getAsset(assetName);

                    if(asset == null) 
                    {
                        spriteIndex++;
                        continue;
                    }

                    sprite.assetName = assetName;

                    if(asset.offset) 
                    {
                        sprite.offsetX = (-asset.offset.x - (scale / 2)) + dx;
                        sprite.offsetY = -asset.offset.y + dy;
                    }
                    else 
                    {
                        sprite.offsetX = dx;
                        sprite.offsetY = dy;
                    }

                    if(spriteData.hasStaticY) 
                    {
                        sprite.offsetY = sprite.offsetY + ((this._verticalOffset * scale) / (2 * BASE_Y_SCALE));
                    }
                    else 
                    {
                        sprite.offsetY = sprite.offsetY + this._sitOffset;
                    }

                    if(this._isSittingManual) 
                    {
                        sprite.relativeDepth = AVATAR_SPRITE_LAYING_DEPTH - ((0.001 * this.spriteCount) * dz);
                    }
                    else 
                    {
                        sprite.relativeDepth = AVATAR_SPRITE_DEFAULT_DEPTH - ((0.001 * this.spriteCount) * dz);
                    }

                    if(spriteData.ink === 33) 
                    {
                        sprite.blendMode = 'add';
                    }
                    else 
                    {
                        sprite.blendMode = 'normal';
                    }
                }

                spriteIndex++;
            }
        }
    }
}
