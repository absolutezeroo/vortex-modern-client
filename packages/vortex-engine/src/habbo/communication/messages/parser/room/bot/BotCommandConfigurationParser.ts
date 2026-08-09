import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The stored configuration of one bot skill (header 2463) — the answer to
 * `GetBotCommandConfigurationDataComposer`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2401/_SafeCls_4437.as
 * (obfuscated; `_SafeStr_4546[2463] = _SafeCls_2595` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1407,
 * consumed by `BotSkillConfigurationViewBase.onBotCommandConfigurationEvent()`).
 */
export class BotCommandConfigurationParser implements IMessageParser
{
    // AS3: .../_SafeCls_4437.as::_SafeStr_6226
    private _botId: number = -1;
    // AS3: .../_SafeCls_4437.as::_SafeStr_7819
    private _commandId: number = -1;
    // AS3: .../_SafeCls_4437.as::_SafeStr_4556
    private _data: string = '';

    // AS3: .../_SafeCls_4437.as::get botId()
    get botId(): number
    {
        return this._botId;
    }

    // AS3: .../_SafeCls_4437.as::get commandId()
    get commandId(): number
    {
        return this._commandId;
    }

    // AS3: .../_SafeCls_4437.as::get data()
    get data(): string
    {
        return this._data;
    }

    // AS3: .../_SafeCls_4437.as::flush()
    flush(): boolean
    {
        this._botId = -1;
        this._commandId = -1;
        this._data = '';

        return true;
    }

    // AS3: .../_SafeCls_4437.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._botId = wrapper.readInt();
        this._commandId = wrapper.readInt();
        this._data = wrapper.readString();

        return true;
    }
}
