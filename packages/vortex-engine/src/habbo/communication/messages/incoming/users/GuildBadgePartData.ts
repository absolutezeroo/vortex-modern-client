import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * GuildBadgePartData
 *
 * One selectable badge part in the badge editor — a base (the shield behind the badge)
 * or a layer (a symbol drawn over it). `maskFileName` is the alpha the editor uses when
 * recolouring the part.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_3106` in WIN63,
 * `_Str_3740` in the 2016 PRODUCTION build), so the class name here is DERIVED from its
 * role in `GuildEditorData.baseParts` / `.layerParts`; every member name is recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3106.as
 */
export class GuildBadgePartData
{
    private _id: number;
    private _fileName: string;
    private _maskFileName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3106.as::_SafeCls_3106()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readInt();
        this._fileName = wrapper.readString();
        this._maskFileName = wrapper.readString();
    }

    // AS3: .../_SafeCls_3106.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../_SafeCls_3106.as::get fileName()
    get fileName(): string
    {
        return this._fileName;
    }

    // AS3: .../_SafeCls_3106.as::get maskFileName()
    get maskFileName(): string
    {
        return this._maskFileName;
    }
}
