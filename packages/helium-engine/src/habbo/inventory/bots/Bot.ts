/**
 * Bot data model
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.bots.class_1726
 */
export class Bot
{
    constructor(
        id: number,
        name: string,
        motto: string,
        figure: string,
        gender: string
    )
    {
        this._id = id;
        this._name = name;
        this._motto = motto;
        this._figure = figure;
        this._gender = gender;
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _name: string;

    get name(): string
    {
        return this._name;
    }

    private _motto: string;

    get motto(): string
    {
        return this._motto;
    }

    private _figure: string;

    get figure(): string
    {
        return this._figure;
    }

    private _gender: string;

    get gender(): string
    {
        return this._gender;
    }

    private _isSelected: boolean = false;

    get isSelected(): boolean
    {
        return this._isSelected;
    }

    set isSelected(value: boolean)
    {
        this._isSelected = value;
    }

    private _isUnseen: boolean = false;

    get isUnseen(): boolean
    {
        return this._isUnseen;
    }

    set isUnseen(value: boolean)
    {
        this._isUnseen = value;
    }

    dispose(): void
    {
        // Nothing to clean up
    }
}
