/**
 * Instant message data model for CFH reports
 *
 * Stores a single instant message with metadata for use in the
 * Call For Help reporting flow.
 *
 * @see source_as_win63/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as
 */
export class InstantMessageRegistryItem
{
    constructor(index: number, userId: number, userName: string, text: string)
    {
        this._index = index;
        this._userId = userId;
        this._userName = userName;
        this._text = text;
        this._chatTime = new Date();
    }

    private _index: number;

    get index(): number
    {
        return this._index;
    }

    private _userId: number;

    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    get userName(): string
    {
        return this._userName;
    }

    private _text: string;

    get text(): string
    {
        return this._text;
    }

    private _selected: boolean = false;

    get selected(): boolean
    {
        return this._selected;
    }

    set selected(value: boolean)
    {
        this._selected = value;
    }

    private _chatTime: Date;

    get chatTime(): Date
    {
        return this._chatTime;
    }
}
