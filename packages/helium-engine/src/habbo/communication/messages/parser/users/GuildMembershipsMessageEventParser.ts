import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GuildMembership} from '../../incoming/users/GuildMembership';

/**
 * AS3: sources/win63_version/habbo/communication/messages/parser/users/GuildMembershipsMessageEventParser.as
 */
export class GuildMembershipsMessageEventParser implements IMessageParser
{
    private _guilds: GuildMembership[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/users/GuildMembershipsMessageEventParser.as::flush()
    flush(): boolean
    {
        this._guilds = [];

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/users/GuildMembershipsMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._guilds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._guilds.push(new GuildMembership(wrapper));
        }

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/users/GuildMembershipsMessageEventParser.as::get guilds()
    get guilds(): GuildMembership[]
    {
        return this._guilds;
    }
}
