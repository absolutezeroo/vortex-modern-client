/**
 * Mystery box keys update event
 *
 * @see source_as_win63/habbo/session/events/MysteryBoxKeysUpdateEvent.as
 */
export class MysteryBoxKeysUpdateEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/MysteryBoxKeysUpdateEvent.as::MYSTERY_BOX_KEYS_UPDATE
    public static readonly MYSTERY_BOX_KEYS_UPDATE = 'mbke_update';

    constructor(boxColor: string, keyColor: string)
    {
        this._boxColor = boxColor;
        this._keyColor = keyColor;
    }

    // AS3: .../src/com/sulake/habbo/session/events/MysteryBoxKeysUpdateEvent.as::_boxColor
    private _boxColor: string;

    // AS3: .../src/com/sulake/habbo/session/events/MysteryBoxKeysUpdateEvent.as::get boxColor()
    get boxColor(): string
    {
        return this._boxColor;
    }

    // AS3: .../src/com/sulake/habbo/session/events/MysteryBoxKeysUpdateEvent.as::_keyColor
    private _keyColor: string;

    // AS3: .../src/com/sulake/habbo/session/events/MysteryBoxKeysUpdateEvent.as::get keyColor()
    get keyColor(): string
    {
        return this._keyColor;
    }
}
