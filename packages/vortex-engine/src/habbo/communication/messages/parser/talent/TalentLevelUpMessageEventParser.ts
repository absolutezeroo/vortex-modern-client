import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TalentTrackRewardPerk} from './TalentTrackRewardPerk';
import {TalentTrackRewardProduct} from './TalentTrackRewardProduct';

/**
 * A talent-track level was just completed, and this is what it paid out.
 *
 * Name from `sources/win63_version/habbo/communication/messages/parser/talent/
 * TalentLevelUpMessageEventParser.as`, corroborated by the emulator's
 * `TalentLevelUpMessageComposer = 1564`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4418.as
 */
export class TalentLevelUpMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4418.as::_SafeStr_7576
    private _talentTrackName: string = '';

    // AS3: _SafeCls_4418.as::_SafeStr_6012
    private _level: number = 0;

    // AS3: _SafeCls_4418.as::_SafeStr_7153
    private _rewardPerks: TalentTrackRewardPerk[] = [];

    // AS3: _SafeCls_4418.as::_SafeStr_7269
    private _rewardProducts: TalentTrackRewardProduct[] = [];

    // AS3: _SafeCls_4418.as::get talentTrackName()
    get talentTrackName(): string
    {
        return this._talentTrackName;
    }

    // AS3: _SafeCls_4418.as::get level()
    get level(): number
    {
        return this._level;
    }

    // AS3: _SafeCls_4418.as::get rewardPerks()
    get rewardPerks(): TalentTrackRewardPerk[]
    {
        return this._rewardPerks;
    }

    // AS3: _SafeCls_4418.as::get rewardProducts()
    get rewardProducts(): TalentTrackRewardProduct[]
    {
        return this._rewardProducts;
    }

    // AS3: _SafeCls_4418.as::flush()
    flush(): boolean
    {
        this._talentTrackName = '';
        this._rewardPerks = [];
        this._rewardProducts = [];

        return true;
    }

    // AS3: _SafeCls_4418.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._talentTrackName = wrapper.readString();
        this._level = wrapper.readInt();

        this._rewardPerks = [];

        let count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._rewardPerks.push(new TalentTrackRewardPerk(wrapper));
        }

        this._rewardProducts = [];

        count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._rewardProducts.push(new TalentTrackRewardProduct(wrapper));
        }

        return true;
    }
}
