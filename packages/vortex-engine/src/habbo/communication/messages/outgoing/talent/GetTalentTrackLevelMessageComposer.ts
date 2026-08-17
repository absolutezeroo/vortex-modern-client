import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask only for a track's current level, without pulling the whole track. Header 2280, from WIN63's
 * own registry.
 *
 * Name from `sources/win63_version/habbo/communication/messages/outgoing/talent/
 * GetTalentTrackLevelMessageComposer.as`, corroborated by the emulator's
 * `GetTalentTrackLevelMessageEvent = 2280`. The emulator's handler for it is an empty stub, so
 * nothing answers this today.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2206/_SafeCls_3223.as
 */
export class GetTalentTrackLevelMessageComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3223.as::_SafeStr_4556
    private _data: [string];

    constructor(talentTrackName: string)
    {
        super();

        this._data = [talentTrackName];
    }

    // AS3: _SafeCls_3223.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
