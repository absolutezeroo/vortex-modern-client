import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether this account holds `room.furni.edit`, sent once during the handshake.
 *
 * NOT ported from AS3 — Vortex-only staff tool, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8004.
 *
 * A UI hint only: it decides whether the editor's button is drawn. The server re-checks the
 * capability on every read and every write, so a client that fakes this flag gains nothing.
 */
export class VortexFurniEditorRightsMessageParser implements IMessageParser
{
    private _canEdit: boolean = false;

    get canEdit(): boolean
    {
        return this._canEdit;
    }

    flush(): boolean
    {
        this._canEdit = false;

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._canEdit = wrapper.readBoolean();

        return true;
    }
}
