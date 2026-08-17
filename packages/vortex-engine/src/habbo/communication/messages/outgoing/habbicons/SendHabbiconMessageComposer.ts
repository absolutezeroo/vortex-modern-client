import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Post a habbicon into a messenger conversation. Header 1163, from WIN63's own registry
 * (`_composers[1163] = _SafeCls_2591`).
 *
 * **The name is DERIVED.** No tree and no emulator header carries this one — habbicons postdate
 * both `win63_version` and the emulator's table, the same reason `UserHabbiconsMessageEvent` gives.
 * It is named for its one call site, `MainView.onHabbiconSelected()`, and for the text twin it
 * mirrors argument-for-argument, `SendMsgMessageComposer`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1727/_SafeCls_2591.as
 */
export class SendHabbiconMessageComposer extends MessageComposer<[number, number, number]>
{
    // AS3: _SafeCls_2591.as::_SafeStr_4642
    private _data: [number, number, number];

    constructor(conversationId: number, habbiconId: number, clientMessageId: number)
    {
        super();

        this._data = [conversationId, habbiconId, clientMessageId];
    }

    // AS3: _SafeCls_2591.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
