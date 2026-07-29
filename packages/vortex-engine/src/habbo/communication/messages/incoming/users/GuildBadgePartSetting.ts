import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * GuildBadgePartSetting
 *
 * One badge layer of a guild badge: which part, in which colour, at which position.
 * Read as a flat triplet both in the creation-info and the edit-info payloads.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_2551` in WIN63) and it
 * did not exist in the 2016 PRODUCTION build, so the class name here is DERIVED from its
 * three members; `partId` / `colorId` / `position` are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2551.as
 */
export class GuildBadgePartSetting
{
    private _partId: number;
    private _colorId: number;
    private _position: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2551.as::_SafeCls_2551()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._partId = wrapper.readInt();
        this._colorId = wrapper.readInt();
        this._position = wrapper.readInt();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2551.as::get partId()
    get partId(): number
    {
        return this._partId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2551.as::get colorId()
    get colorId(): number
    {
        return this._colorId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2551.as::get position()
    get position(): number
    {
        return this._position;
    }
}
