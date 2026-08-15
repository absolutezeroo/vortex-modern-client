import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {
    TradeRequirementRule
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';

/**
 * What a completed wired transaction paid out, if anything.
 *
 * **Most of this message is optional.** Only `transactionSuccessTypeId` is always present; the
 * reward block is read solely when that id is {@link TYPE_REWARD} *and* the buffer still has bytes.
 * A transaction of any other type therefore leaves `rewardContents` null, which is exactly what
 * `RewardNotificationController` tests before showing anything.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/WiredTransactionSuccessContents.as
 * (the class and every accessor kept their real names)
 */
export class WiredTransactionSuccessContents
{
    /**
	 * The only success type that carries a reward. **Name derived** — the identifier is obfuscated
	 * and the constant is used exactly once, as the guard on the reward block.
	 */
    // AS3: WiredTransactionSuccessContents.as::_SafeStr_11000 (name derived)
    static readonly TYPE_REWARD: number = 2;

    // AS3: WiredTransactionSuccessContents.as::internalId
    private _internalId: number;

    // AS3: WiredTransactionSuccessContents.as::transactionSuccessTypeId
    private _transactionSuccessTypeId: number = 0;

    // AS3: WiredTransactionSuccessContents.as::rewardContents
    private _rewardContents: TradeRequirementRule | null = null;

    // AS3: WiredTransactionSuccessContents.as::rewardText
    private _rewardText: string = '';

    // AS3: WiredTransactionSuccessContents.as::openByDefault
    private _openByDefault: boolean = false;

    /**
	 * `internalId` is **not on the wire** — the parser hands in a client-side counter, so the
	 * controller can key its map and its `wiredrewards/open/<id>` link on something stable.
	 */
    // AS3: WiredTransactionSuccessContents.as::WiredTransactionSuccessContents()
    constructor(internalId: number, wrapper: IMessageDataWrapper)
    {
        this._internalId = internalId;
        this._transactionSuccessTypeId = wrapper.readInt();

        if(this._transactionSuccessTypeId === WiredTransactionSuccessContents.TYPE_REWARD && wrapper.bytesAvailable > 0)
        {
            this._rewardContents = TradeRequirementRule.readFromMessage(wrapper);
            this._rewardText = wrapper.readString();
            this._openByDefault = wrapper.readBoolean();
        }
    }

    // AS3: WiredTransactionSuccessContents.as::get internalId()
    get internalId(): number
    {
        return this._internalId;
    }

    // AS3: WiredTransactionSuccessContents.as::get transactionSuccessTypeId()
    get transactionSuccessTypeId(): number
    {
        return this._transactionSuccessTypeId;
    }

    // AS3: WiredTransactionSuccessContents.as::get rewardContents()
    get rewardContents(): TradeRequirementRule | null
    {
        return this._rewardContents;
    }

    // AS3: WiredTransactionSuccessContents.as::get rewardText()
    get rewardText(): string
    {
        return this._rewardText;
    }

    /**
	 * Whether the reward window pops by itself. False means the notification is stored and only
	 * opened if the player follows the link.
	 */
    // AS3: WiredTransactionSuccessContents.as::get openByDefault()
    get openByDefault(): boolean
    {
        return this._openByDefault;
    }
}
