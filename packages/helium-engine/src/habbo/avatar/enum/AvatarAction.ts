/**
 * Avatar action identifiers and utility methods for expressions/gestures.
 *
 * @see sources/win63_version/habbo/avatar/enum/class_3584.as (AvatarAction)
 */
export class AvatarAction
{
    public static readonly SIGN: string = 'sign';
    public static readonly SLEEP: string = 'Sleep';
    public static readonly CARRY_OBJECT: string = 'cri';
    public static readonly USE_OBJECT: string = 'usei';
    public static readonly EFFECT: string = 'fx';
    public static readonly TALK: string = 'talk';
    public static readonly GESTURE: string = 'gest';
    public static readonly EXPRESSION: string = 'expression';
    public static readonly VOTE: string = 'vote';
    public static readonly DANCE: string = 'dance';
    public static readonly TYPING: string = 'typing';
    public static readonly MUTED: string = 'muted';
    public static readonly PLAYING_GAME: string = 'playing_game';
    public static readonly GUIDE_STATUS: string = 'guide';
    public static readonly EXPRESSION_RESPECT: string = 'respect';
    public static readonly EXPRESSION_WAVE: string = 'wave';
    public static readonly EXPRESSION_BLOW_A_KISS: string = 'blow';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/enum/AvatarAction.as::EXPRESSION_67
    public static readonly EXPRESSION_67: string = '67';
    public static readonly EXPRESSION_LAUGH: string = 'laugh';
    public static readonly EXPRESSION_CRY: string = 'cry';
    public static readonly EXPRESSION_IDLE: string = 'idle';
    public static readonly EXPRESSION_SNOWBOARD_OLLIE: string = 'sbollie';
    public static readonly EXPRESSION_SNOWBORD_360: string = 'sb360';
    public static readonly EXPRESSION_RIDE_JUMP: string = 'ridejump';
    public static readonly GESTURE_SMILE: string = 'sml';
    public static readonly GESTURE_AGGRAVATED: string = 'agr';
    public static readonly GESTURE_SURPRISED: string = 'srp';
    public static readonly GESTURE_SAD: string = 'sad';
    public static readonly PET_GESTURE_JOY: string = 'joy';
    public static readonly PET_GESTURE_CRAZY: string = 'crz';
    public static readonly PET_GESTURE_TONGUE: string = 'tng';
    public static readonly PET_GESTURE_BLINK: string = 'eyb';
    public static readonly PET_GESTURE_MISERABLE: string = 'mis';
    public static readonly PET_GESTURE_PUZZLED: string = 'puz';
    public static readonly POSTURE: string = 'posture';
    public static readonly POSTURE_STAND: string = 'std';
    public static readonly POSTURE_SIT: string = 'sit';
    public static readonly POSTURE_WALK: string = 'mv';
    public static readonly POSTURE_LAY: string = 'lay';
    public static readonly POSTURE_SWIM: string = 'swim';
    public static readonly POSTURE_FLOAT: string = 'float';
    public static readonly SNOWWAR_RUN: string = 'swrun';
    public static readonly SNOWWAR_DIE_FRONT: string = 'swdiefront';
    public static readonly SNOWWAR_DIE_BACK: string = 'swdieback';
    public static readonly SNOWWAR_PICK: string = 'swpick';
    public static readonly SNOWWAR_THROW: string = 'swthrow';

    private static readonly GESTURE_MAP: string[] = [
        '', 'sml', 'agr', 'srp', 'sad', 'joy', 'crz', 'tng', 'eyb', 'mis', 'puz'
    ];

    private static readonly EXPRESSION_MAP: string[] = [
        '', 'wave', 'blow', 'laugh', 'cry', 'idle', 'dance', 'respect', 'sbollie', 'sb360', 'ridejump'
    ];

    /**
	 * Gets the expression display time in milliseconds.
	 *
	 * @param id - The expression identifier
	 * @returns Duration in milliseconds
	 */
    public static getExpressionTime(id: number): number
    {
        switch(id)
        {
            case 1:
                return 5000;
            case 2:
                return 1400;
            case 67:
                return 990;
            case 3:
                return 2000;
            case 4:
                return 2000;
            case 5:
                return 0;
            case 6:
                return 700;
            case 7:
                return 2000;
            case 8:
                return 1500;
            case 9:
                return 1500;
            case 10:
                return 1500;
            default:
                return 0;
        }
    }

    /**
	 * Gets the expression id from its string name.
	 *
	 * @param expression - The expression string
	 * @returns The expression id, or -1 if not found
	 */
    public static getExpressionId(expression: string): number
    {
        if(expression === AvatarAction.EXPRESSION_67)
        {
            return 67;
        }

        return AvatarAction.EXPRESSION_MAP.indexOf(expression);
    }

    /**
	 * Gets the expression string from its id.
	 *
	 * @param expressionId - The expression id
	 * @returns The expression string, or empty string if not found
	 */
    public static getExpression(expressionId: number): string
    {
        if(expressionId === 67)
        {
            return AvatarAction.EXPRESSION_67;
        }

        if(expressionId < AvatarAction.EXPRESSION_MAP.length)
        {
            return AvatarAction.EXPRESSION_MAP[expressionId];
        }

        return '';
    }

    /**
	 * Gets the gesture id from its string name.
	 *
	 * @param gesture - The gesture string
	 * @returns The gesture id, or -1 if not found
	 */
    public static getGestureId(gesture: string): number
    {
        return AvatarAction.GESTURE_MAP.indexOf(gesture);
    }

    /**
	 * Gets the gesture string from its id.
	 *
	 * @param gestureId - The gesture id
	 * @returns The gesture string, or empty string if not found
	 */
    public static getGesture(gestureId: number): string
    {
        if(gestureId < AvatarAction.GESTURE_MAP.length)
        {
            return AvatarAction.GESTURE_MAP[gestureId];
        }

        return '';
    }
}
