import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleItem} from './CollectibleItem';

/**
 * An NFT reward box being opened, somewhere in the hotel: the animation's start and finish, who is
 * opening it, and what came out.
 *
 * The same message carries both halves — `state` 0 is the box starting to open, 1 is the reveal —
 * and the reward is present in both. `CollectiblesController` only raises the notification on
 * `finish`.
 *
 * `flush()` resets state and opener to **-1**, not 0, because 0 is a meaningful state; a flushed
 * parser therefore reports neither start nor finish.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectiblesController.as::onRedeemLootBoxStateEvent()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_2605.as
 */
export class RedeemNftLootBoxStateMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2605.as::_SafeStr_4597 (from `get state()`)
    private _state: number = -1;

    // AS3: _SafeCls_2605.as::_SafeStr_8243 (from `get openerAvatarId()`)
    private _openerAvatarId: number = -1;

    // AS3: _SafeCls_2605.as::_SafeStr_6811 (from `get reward()`)
    private _reward: CollectibleItem | null = null;

    // AS3: _SafeCls_2605.as::flush()
    flush(): boolean
    {
        this._state = -1;
        this._openerAvatarId = -1;
        this._reward = null;

        return true;
    }

    // AS3: _SafeCls_2605.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._state = wrapper.readShort();
        this._openerAvatarId = wrapper.readInt();
        this._reward = new CollectibleItem(wrapper);

        return true;
    }

    // AS3: _SafeCls_2605.as::get start()
    get start(): boolean
    {
        return this._state === 0;
    }

    // AS3: _SafeCls_2605.as::get finish()
    get finish(): boolean
    {
        return this._state === 1;
    }

    // AS3: _SafeCls_2605.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: _SafeCls_2605.as::get openerAvatarId()
    get openerAvatarId(): number
    {
        return this._openerAvatarId;
    }

    // AS3: _SafeCls_2605.as::get reward()
    get reward(): CollectibleItem | null
    {
        return this._reward;
    }
}
