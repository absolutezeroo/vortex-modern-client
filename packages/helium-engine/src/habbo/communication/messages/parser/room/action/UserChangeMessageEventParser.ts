/**
 * UserChangeMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.UserChangeMessageEventParser
 *
 * Parses user figure/info changes (different from UserUpdateMessageParser which handles position)
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class UserChangeMessageEventParser implements IMessageParser
{
    private _id: number = 0;

    get id(): number
    {
        return this._id;
    }

    private _figure: string = '';

    get figure(): string
    {
        return this._figure;
    }

    private _sex: string = '';

    get sex(): string
    {
        return this._sex;
    }

    private _customInfo: string = '';

    get customInfo(): string
    {
        return this._customInfo;
    }

    private _achievementScore: number = 0;

    get achievementScore(): number
    {
        return this._achievementScore;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_2646.as::badgesRank
    private _badgesRank: number = 0;

    get badgesRank(): number
    {
        return this._badgesRank;
    }

    flush(): boolean
    {
        this._id = 0;
        this._figure = '';
        this._sex = '';
        this._customInfo = '';
        this._achievementScore = 0;
        this._badgesRank = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._id = wrapper.readInt();
        this._figure = wrapper.readString();
        this._sex = wrapper.readString();
        this._customInfo = wrapper.readString();
        this._achievementScore = wrapper.readInt();
        // AS3 reads an unused string here, then a count-prefixed list of unused
        // int triplets (_SafePkg_2184/_SafeCls_2646.as::parse()) before badgesRank.
        wrapper.readString();

        const skippedCount = wrapper.readInt();

        for(let i = 0; i < skippedCount; i++)
        {
            wrapper.readInt();
            wrapper.readInt();
            wrapper.readInt();
        }

        this._badgesRank = wrapper.readInt();

        if(this._sex)
        {
            this._sex = this._sex.toUpperCase();
        }

        return true;
    }
}
