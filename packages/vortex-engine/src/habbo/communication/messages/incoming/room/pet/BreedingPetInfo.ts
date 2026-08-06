import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One of the two parents shown in the breeding-confirmation window, carried by
 * ConfirmBreedingRequestEvent (1477).
 *
 * The class name is this port's — AS3 obfuscates it in every tree (`_SafeCls_4162` in the primary,
 * `class_3828` in the secondary) — but every member below is an AS3 public getter's own name, and so
 * is recovered rather than invented. Like every DTO in this package it parses itself out of the
 * wrapper in its constructor, in AS3's read order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as
 * (= sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3828.as)
 */
export class BreedingPetInfo
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::_SafeCls_4162()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._webId = wrapper.readInt();
        this._name = wrapper.readString();
        this._level = wrapper.readInt();
        this._figure = wrapper.readString();
        this._owner = wrapper.readString();
    }

    private _webId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::get webId()
    get webId(): number
    {
        return this._webId;
    }

    // AS3: .../src/unknowns/_SafePkg_1735/_SafeCls_4162.as::_name
    private _name: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::get name()
    get name(): string
    {
        return this._name;
    }

    private _level: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::get level()
    get level(): number
    {
        return this._level;
    }

    private _figure: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    private _owner: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::get owner()
    get owner(): string
    {
        return this._owner;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4162.as::dispose()
    dispose(): void
    {
        this._webId = 0;
        this._name = '';
        this._level = 0;
        this._figure = '';
        this._owner = '';
    }
}
