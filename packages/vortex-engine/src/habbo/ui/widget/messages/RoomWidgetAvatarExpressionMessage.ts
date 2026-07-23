/**
 * RoomWidgetAvatarExpressionMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetAvatarExpressionMessage.as
 *
 * Sent by the own-avatar bubble to play an expression (wave/laugh/blow/idle/67).
 * The wire payload is the enum's `ordinal`.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';
import type {AvatarExpressionEnum} from '../enums/AvatarExpressionEnum';

export class RoomWidgetAvatarExpressionMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetAvatarExpressionMessage.as::AVATAR_EXPRESSION
    public static readonly AVATAR_EXPRESSION: string = 'RWCM_MESSAGE_AVATAR_EXPRESSION';

    private _animation: AvatarExpressionEnum;

    // AS3: RoomWidgetAvatarExpressionMessage.as::RoomWidgetAvatarExpressionMessage()
    constructor(animation: AvatarExpressionEnum)
    {
        super(RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION);
        this._animation = animation;
    }

    // AS3: RoomWidgetAvatarExpressionMessage.as::get animation()
    public get animation(): AvatarExpressionEnum
    {
        return this._animation;
    }
}
