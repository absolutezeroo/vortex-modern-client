import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from a selfie (header 201).
 *
 * The five fields were previously named `(message, topicId, reportedUserId, photoId, roomId)`,
 * which is wrong in four of the five positions — the types still lined up
 * (`string, int, int, string, int`), so nothing failed to compile and the mistake was invisible.
 *
 * The real order is fixed by the composer's only AS3 construction site,
 * `CallForHelpManager.as::reportSelfie()`, which shuffles its own arguments on the way out:
 * `new _SafeCls_3116(param1, param3, param4, param2, param5)`. Reading that against the only
 * *caller* of `reportSelfie()` — `ExternalImageWidget.as:690`, which passes
 * `(shareUrl, description, roomEngine.activeRoomId, creatorId, objectId)` — gives
 * `(extraDataId, roomId, photoAuthorId, message, roomObjectId)`.
 *
 * The server agrees field for field: `vortex-emulator`'s
 * `Revision20260701/Parsers/Help/CallForHelpFromSelfieMessageParser.cs` pops
 * `url, roomId, photoAuthorId, message, furniId` in exactly that order.
 *
 * There is no `topicId` on this message at all — the selfie report carries a free-text message
 * where the photo report (1964) carries a topic id.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3116.as
 * (obfuscated in the primary dump; `_composers[201] = _SafeCls_3116` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/CallForHelpFromSelfieMessageComposer.as).
 */
export class CallForHelpFromSelfieMessageComposer extends MessageComposer<ConstructorParameters<typeof CallForHelpFromSelfieMessageComposer>>
{
    // AS3: _SafeCls_3116.as::_SafeStr_4642
    private _data: ConstructorParameters<typeof CallForHelpFromSelfieMessageComposer>;

    // AS3: _SafeCls_3116.as::CallForHelpFromSelfieMessageComposer()
    constructor(extraDataId: string, roomId: number, photoAuthorId: number, message: string, roomObjectId: number)
    {
        super();
        this._data = [extraDataId, roomId, photoAuthorId, message, roomObjectId];
    }

    // AS3: _SafeCls_3116.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
