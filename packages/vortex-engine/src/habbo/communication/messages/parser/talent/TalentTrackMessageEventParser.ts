import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TalentTrack} from './TalentTrack';

/**
 * The whole talent track, sent in answer to `GetTalentTrackMessageComposer`.
 *
 * Name from `sources/win63_version/habbo/communication/messages/parser/talent/
 * TalentTrackMessageEventParser.as`, corroborated by the emulator's
 * `TalentTrackMessageComposer = 3909`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4217.as
 */
export class TalentTrackMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4217.as::_talentTrack
    private _talentTrack: TalentTrack | null = null;

    // AS3: _SafeCls_4217.as::flush()
    flush(): boolean
    {
        this._talentTrack = null;

        return true;
    }

    // AS3: _SafeCls_4217.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._talentTrack = new TalentTrack();
        this._talentTrack.parse(wrapper);

        return true;
    }

    // AS3: _SafeCls_4217.as::getTalentTrack()
    getTalentTrack(): TalentTrack | null
    {
        return this._talentTrack;
    }
}
