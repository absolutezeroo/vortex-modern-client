/**
 * Key-value property struct for custom window properties.
 *
 * @see sources/win63_version/core/window/utils/PropertyStruct.as
 */
export class PropertyStruct
{
    public static readonly HEX: string = 'hex';
    public static readonly INT: string = 'int';
    public static readonly UINT: string = 'uint';
    public static readonly NUMBER: string = 'Number';
    public static readonly BOOLEAN: string = 'Boolean';
    public static readonly STRING: string = 'String';
    public static readonly POINT: string = 'Point';
    public static readonly RECTANGLE: string = 'Rectangle';
    public static readonly ARRAY: string = 'Array';
    public static readonly MAP: string = 'Map';

    private _key: string;
    private _value: unknown;
    private _type: string;
    private _valid: boolean;
    private _range: string[] | null;

    constructor(key: string, value: unknown, type: string = PropertyStruct.STRING, valid: boolean = false, range: string[] | null = null)
    {
        this._key = key;
        this._value = value;
        this._type = type;
        this._valid = valid;
        this._range = range;
    }

    public get key(): string
    {
        return this._key;
    }

    public get value(): unknown
    {
        return this._value;
    }

    public set value(value: unknown)
    {
        this._value = value;
    }

    public get type(): string
    {
        return this._type;
    }

    public get valid(): boolean
    {
        return this._valid;
    }

    public get range(): string[] | null
    {
        return this._range;
    }

    public withValue(newValue: unknown): PropertyStruct
    {
        let changed = true;

        switch(this._type)
        {
            case PropertyStruct.UINT:
            case PropertyStruct.HEX:
                changed = ((this._value as number) >>> 0) !== ((newValue as number) >>> 0);
                break;
            case PropertyStruct.INT:
                changed = ((this._value as number) | 0) !== ((newValue as number) | 0);
                break;
            case PropertyStruct.NUMBER:
                changed = (this._value as number) !== (newValue as number);
                break;
            case PropertyStruct.BOOLEAN:
                changed = !!(this._value) !== !!(newValue);
                break;
            case PropertyStruct.STRING:
                changed = String(this._value) !== String(newValue);
                break;
        }

        if(changed)
        {
            return new PropertyStruct(this._key, newValue, this._type, true, this._range);
        }

        return this;
    }

    public withNameSpace(namespace: string): PropertyStruct
    {
        return new PropertyStruct(`${namespace}:${this._key}`, this._value, this._type, this._valid, this._range);
    }

    public withoutNameSpace(): PropertyStruct
    {
        return new PropertyStruct(this._key.replace(/.*:/, ''), this._value, this._type, this._valid, this._range);
    }

    public clone(): PropertyStruct
    {
        return new PropertyStruct(this._key, this._value, this._type, this._valid, this._range);
    }

    public toString(): string
    {
        switch(this._type)
        {
            case PropertyStruct.HEX:
                return '0x' + ((this._value as number) >>> 0).toString(16);
            case PropertyStruct.BOOLEAN:
                return this._value ? 'true' : 'false';
            default:
                return String(this._value);
        }
    }
}
