import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Select, deselect, or clear every avatar effect. One class for all three because the payload is
 * the same — and `UNSELECT_ALL_EFFECTS` simply leaves `effectType` at its −1 default.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetSelectEffectMessage.as
 */
export class RoomWidgetSelectEffectMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::SELECT_EFFECT
    // Name DERIVED (`_SafeStr_11133`), from its value.
    public static readonly SELECT_EFFECT: string = 'RWCM_MESSAGE_SELECT_EFFECT';

    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::UNSELECT_EFFECT
    // Name DERIVED (`_SafeStr_11607`), from its value.
    public static readonly UNSELECT_EFFECT: string = 'RWCM_MESSAGE_UNSELECT_EFFECT';

    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::UNSELECT_ALL_EFFECTS
    // Name DERIVED (`_SafeStr_11526`), from its value.
    public static readonly UNSELECT_ALL_EFFECTS: string = 'RWCM_MESSAGE_UNSELECT_ALL_EFFECTS';

    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::_effectType
    // Name DERIVED (`_SafeStr_5773`): the field behind `get effectType()`.
    private _effectType: number;

    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::RoomWidgetSelectEffectMessage()
    constructor(type: string, effectType: number = -1)
    {
        super(type);

        this._effectType = effectType;
    }

    // AS3: .../widget/messages/RoomWidgetSelectEffectMessage.as::get effectType()
    public get effectType(): number
    {
        return this._effectType;
    }
}
