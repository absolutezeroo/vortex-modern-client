import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Applies the saved "snapshot" of a wired action to its target (WIN63 header 2790). Carries only the
 * wired furni's stuff id.
 *
 * Name recovered from PRODUCTION 2016 (unobfuscated): ApplySnapshotMessageComposer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_3118.as
 */
export class ApplySnapshotMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_3118.as::_SafeCls_3118()
    constructor(stuffId: number)
    {
        super();
        this._data = [stuffId];
    }

    // AS3: _SafeCls_3118.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
