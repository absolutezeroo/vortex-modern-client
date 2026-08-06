import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * GuildColorData
 *
 * One swatch of a guild colour palette — badge colours, guild primary colours or guild
 * secondary colours, all three of which `GuildEditorData` carries as lists of this.
 * The colour arrives on the wire as a hex *string* and is parsed to a number here,
 * exactly as AS3 does.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_2699` in WIN63,
 * `_Str_2792` in the 2016 PRODUCTION build), so the class name here is DERIVED from its
 * role; `id` / `color` / `red` / `green` / `blue` are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2699.as
 */
export class GuildColorData
{
    private _id: number;
    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_2699.as::_color
    private _color: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2699.as::_SafeCls_2699()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readInt();
        this._color = parseInt(wrapper.readString(), 16);
    }

    // AS3: .../_SafeCls_2699.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../_SafeCls_2699.as::get color()
    get color(): number
    {
        return this._color;
    }

    // AS3: .../_SafeCls_2699.as::get red()
    get red(): number
    {
        return (this._color >> 16) & 0xFF;
    }

    // AS3: .../_SafeCls_2699.as::get green()
    get green(): number
    {
        return (this._color >> 8) & 0xFF;
    }

    // AS3: .../_SafeCls_2699.as::get blue()
    get blue(): number
    {
        return (this._color >> 0) & 0xFF;
    }
}
