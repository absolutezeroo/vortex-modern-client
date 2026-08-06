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

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::_index
    private _index: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get index()
    get index(): number
    {
        return this._index;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::_userId
    private _userId: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    private _text: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::_selected
    private _selected: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::_chatTime
    private _chatTime: Date;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/instantmessage/InstantMessageRegistryItem.as::get chatTime()
    get chatTime(): Date
    {
        return this._chatTime;
    }
}
