import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a page of forums. `listCode` selects which list — most active, the user's own groups, and so on.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetForumsListMessageComposer.as
 * (`_SafeCls_2791` in the primary tree; header 488 from its registry)
 */
export class GetForumsListMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(listCode: number, startIndex: number, amount: number)
    {
        super();

        this._data = [listCode, startIndex, amount];
    }

    // AS3: .../groupforums/GetForumsListMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
