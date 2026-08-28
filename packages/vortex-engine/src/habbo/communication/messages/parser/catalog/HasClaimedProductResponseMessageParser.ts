import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the player has already taken a free claim, header 787.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message and the emulator declares no
 * constant for 787. Named after its only handler,
 * `SpecialItemsController.onHasClaimedProductResponse()`, and its two readable getters.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2953/_SafeCls_2952.as
 */
export class HasClaimedProductResponseMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2952.as::_SafeStr_8227 (backing field of claimId)
    private _claimId: string = '';

    // AS3: _SafeCls_2952.as::_SafeStr_8087 (backing field of hasClaimed)
    private _hasClaimed: boolean = false;

    // AS3: _SafeCls_2952.as::get claimId()
    get claimId(): string
    {
        return this._claimId;
    }

    // AS3: _SafeCls_2952.as::get hasClaimed()
    get hasClaimed(): boolean
    {
        return this._hasClaimed;
    }

    // AS3: _SafeCls_2952.as::flush()
    flush(): boolean
    {
        this._claimId = '';
        this._hasClaimed = false;

        return true;
    }

    // AS3: _SafeCls_2952.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._claimId = wrapper.readString();
        this._hasClaimed = wrapper.readBoolean();

        return true;
    }
}
