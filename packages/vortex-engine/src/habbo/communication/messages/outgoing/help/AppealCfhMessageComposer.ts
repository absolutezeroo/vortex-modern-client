import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Appeals the sanction that came out of one of the player's own call-for-help reports (header
 * 3028). Sent by the appeal button in `MyReportStatus`, which is the only place it can be reached.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3470.as (the class
 * is obfuscated; identified by its only sender, `MyReportStatus.as::onClickAppeal()`, and by
 * `_composers[3028]` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.)
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/help/AppealCfhMessageComposer.as
 */
export class AppealCfhMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/AppealCfhMessageComposer.as::AppealCfhMessageComposer()
    constructor(cfhTopicId: number)
    {
        super();

        this._data = [cfhTopicId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/AppealCfhMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
