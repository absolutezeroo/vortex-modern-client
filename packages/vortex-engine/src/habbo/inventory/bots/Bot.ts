import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One bot in the player's hand — the DTO every bot-inventory message carries.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3095/_SafeCls_3143.as
 * (obfuscated in every tree; it is the class `BotsModel.items` stores and
 * `BotGridItem.data` returns, identified by its five getters id/name/motto/figure/gender).
 *
 * Note the read order: gender is read BEFORE figure even though the getters list figure first.
 */
export class Bot
{
    // AS3: .../_SafeCls_3143.as::_SafeCls_3143() — reads id, name, motto, gender, figure in order.
    static parse(wrapper: IMessageDataWrapper): Bot
    {
        const id = wrapper.readInt();
        const name = wrapper.readString();
        const motto = wrapper.readString();
        const gender = wrapper.readString();
        const figure = wrapper.readString();

        return new Bot(id, name, motto, gender, figure);
    }

    constructor(
        id: number,
        name: string,
        motto: string,
        gender: string,
        figure: string
    )
    {
        this._id = id;
        this._name = name;
        this._motto = motto;
        this._gender = gender;
        this._figure = figure;
    }

    // AS3: .../_SafeCls_3143.as::_SafeStr_4872
    private _id: number;

    // AS3: .../_SafeCls_3143.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../_SafeCls_3143.as::_name
    private _name: string;

    // AS3: .../_SafeCls_3143.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../_SafeCls_3143.as::_SafeStr_7860
    private _motto: string;

    // AS3: .../_SafeCls_3143.as::get motto()
    get motto(): string
    {
        return this._motto;
    }

    // AS3: .../_SafeCls_3143.as::_SafeStr_4645
    private _gender: string;

    // AS3: .../_SafeCls_3143.as::get gender()
    get gender(): string
    {
        return this._gender;
    }

    // AS3: .../_SafeCls_3143.as::_SafeStr_5551
    private _figure: string;

    // AS3: .../_SafeCls_3143.as::get figure()
    get figure(): string
    {
        return this._figure;
    }
}
