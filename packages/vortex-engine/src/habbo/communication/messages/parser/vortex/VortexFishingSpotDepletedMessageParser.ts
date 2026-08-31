import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The spot ran dry and the session is over.
 *
 * Reconstructed from Habbo Origins. Header 8110. See `docs/vortex-original/fishing.md` §1.
 *
 * **This is the ordinary end of a session, not an error.** Origins depletes a spot after an
 * unpredictable number of catches — "one fish or several" — and the player relocates to another
 * shadow. It replaces an earlier `CatchFailed`, which modelled a per-cast miss that Origins does not
 * appear to have: catches simply keep coming until there are none left.
 *
 * `catches` is what the session actually yielded, so the panel can say what happened rather than
 * just going quiet.
 */
export class VortexFishingSpotDepletedMessageParser implements IMessageParser
{
    // TS-only: which spot ran out, so the client can clear its shadow.
    private _spotItemId: number = 0;

    // TS-only: how many fish the session yielded in total.
    private _catches: number = 0;

    // TS-only: Vortex-only accessor.
    get spotItemId(): number
    {
        return this._spotItemId;
    }

    // TS-only: Vortex-only accessor.
    get catches(): number
    {
        return this._catches;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._spotItemId = 0;
        this._catches = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._spotItemId = wrapper.readInt();
        this._catches = wrapper.readInt();

        return true;
    }
}
