import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Just the level a track stands at — what the promo widget shows without pulling the whole track.
 *
 * Name from `sources/win63_version/habbo/communication/messages/parser/talent/
 * TalentTrackLevelMessageEventParser.as`, corroborated by the emulator's
 * `TalentTrackLevelMessageComposer = 2210`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4079.as
 */
export class TalentTrackLevelMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4079.as::_SafeStr_7576
    private _talentTrackName: string = '';

    // AS3: _SafeCls_4079.as::_SafeStr_6012
    private _level: number = 0;

    // AS3: _SafeCls_4079.as::_SafeStr_8797
    private _maxLevel: number = 0;

    // AS3: _SafeCls_4079.as::get talentTrackName()
    get talentTrackName(): string
    {
        return this._talentTrackName;
    }

    // AS3: _SafeCls_4079.as::get level()
    get level(): number
    {
        return this._level;
    }

    // AS3: _SafeCls_4079.as::get maxLevel()
    get maxLevel(): number
    {
        return this._maxLevel;
    }

    /** AS3 clears only the name here; the two ints are overwritten by the next `parse()`. */
    // AS3: _SafeCls_4079.as::flush()
    flush(): boolean
    {
        this._talentTrackName = '';

        return true;
    }

    // AS3: _SafeCls_4079.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._talentTrackName = wrapper.readString();
        this._level = wrapper.readInt();
        this._maxLevel = wrapper.readInt();

        return true;
    }
}
