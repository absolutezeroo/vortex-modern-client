/**
 * TypingBubble
 *
 * Avatar addition that shows a typing bubble icon above the avatar
 * when the user is typing a chat message.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/additions/TypingBubble.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IAvatarAddition} from './IAvatarAddition';
import type {AvatarVisualization} from '../AvatarVisualization';

export class TypingBubble implements IAvatarAddition 
{
    private _assetName: string | null = null;
    private _avatar: AvatarVisualization;

    constructor(id: number, avatar: AvatarVisualization) 
    {
        this._id = id;
        this._avatar = avatar;
    }

    private _id: number = -1;

    get id(): number 
    {
        return this._id;
    }

    private _relativeDepth: number = 0;

    set relativeDepth(value: number) 
    {
        this._relativeDepth = value;
    }

    get disposed(): boolean 
    {
        return this._avatar == null;
    }

    /**
     * Animates the typing bubble (keeps asset updated).
     *
     * @param sprite - The sprite to animate
     * @returns Always false (no dynamic animation)
     */
    animate(sprite: IRoomObjectSprite | null): boolean 
    {
        if(this._assetName && sprite) 
        {
            sprite.assetName = this._assetName;
        }

        return false;
    }

    /**
     * Updates the typing bubble position and asset based on scale and posture.
     *
     * @param sprite - The sprite to update
     * @param scale - The current visualization scale
     */
    update(sprite: IRoomObjectSprite | null, scale: number): void 
    {
        if(!sprite) 
        {
            return;
        }

        let offsetX: number;
        let offsetY: number;

        sprite.visible = true;
        sprite.relativeDepth = this._relativeDepth;
        sprite.alpha = 255;

        let fullSize = 64;

        if(scale < 48) 
        {
            this._assetName = 'user_typing_small_png';
            offsetX = 3;
            offsetY = -42;
            fullSize = 32;
        }
        else 
        {
            this._assetName = 'user_typing_png';
            offsetX = 14;
            offsetY = -83;
        }

        if(this._avatar.posture === 'sit') 
        {
            offsetY = offsetY + (fullSize / 2);
        }
        else if(this._avatar.posture === 'lay') 
        {
            offsetY = offsetY + fullSize;
        }

        if(this._assetName != null) 
        {
            sprite.assetName = this._assetName;
            sprite.offsetX = offsetX;
            sprite.offsetY = offsetY;
            sprite.relativeDepth = -0.02;
        }
    }

    /**
     * Disposes of this addition and releases references.
     */
    dispose(): void 
    {
        this._avatar = null!;
        this._assetName = null;
    }
}
