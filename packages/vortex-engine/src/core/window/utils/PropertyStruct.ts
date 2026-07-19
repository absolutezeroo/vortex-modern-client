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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/PropertyStruct.as::toXMLString()
    // Debug-only XML dump of a single property; has no current caller (reached only through
    // WindowParser.windowToXMLString()'s own <variables> block, itself uncalled).
    public toXMLString(): string
    {
        switch(this._type)
        {
            case PropertyStruct.MAP:
            {
                const map = this._value as { length: number; getKey(i: number): unknown; getWithIndex(i: number): unknown } | null;
                let xml = `<var key="${this._key}">\r<value>\r<${this._type}>\r`;

                if(map)
                {
                    for(let i = 0; i < map.length; i++)
                    {
                        const entryValue = map.getWithIndex(i);

                        xml += `<var key="${map.getKey(i)}" value="${entryValue}" type="${typeof entryValue}" />\r`;
                    }
                }

                return xml + `</${this._type}>\r</value>\r</var>`;
            }

            case PropertyStruct.ARRAY:
            {
                const arr = (this._value as unknown[] | null) ?? [];
                let xml = `<var key="${this._key}">\r<value>\r<${this._type}>\r`;

                for(let i = 0; i < arr.length; i++)
                {
                    xml += `<var key="${i}" value="${arr[i]}" type="${typeof arr[i]}" />\r`;
                }

                return xml + `</${this._type}>\r</value>\r</var>`;
            }

            case PropertyStruct.POINT:
            {
                const point = this._value as { x: number; y: number };

                return `<var key="${this._key}">\r<value>\r<${this._type}>\r` +
                    `<var key="x" value="${point.x}" type="int" />\r` +
                    `<var key="y" value="${point.y}" type="int" />\r` +
                    `</${this._type}>\r</value>\r</var>`;
            }

            case PropertyStruct.RECTANGLE:
            {
                const rect = this._value as { x: number; y: number; width: number; height: number };

                return `<var key="${this._key}">\r<value>\r<${this._type}>\r` +
                    `<var key="x" value="${rect.x}" type="int" />\r` +
                    `<var key="y" value="${rect.y}" type="int" />\r` +
                    `<var key="width" value="${rect.width}" type="int" />\r` +
                    `<var key="height" value="${rect.height}" type="int" />\r` +
                    `</${this._type}>\r</value>\r</var>`;
            }

            case PropertyStruct.HEX:
                return `<var key="${this._key}" value="0x${((this._value as number) >>> 0).toString(16)}" type="${this._type}" />`;

            default:
                return `<var key="${this._key}" value="${this._value}" type="${this._type}" />`;
        }
    }
}
