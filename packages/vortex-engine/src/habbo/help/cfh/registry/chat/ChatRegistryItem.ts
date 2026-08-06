/**
 * Chat message data model for CFH reports
 *
 * Stores a single chat message with metadata for use in the
 * Call For Help reporting flow.
 *
 * @see source_as_win63/habbo/help/cfh/registry/chat/ChatRegistryItem.as
 */
export class ChatRegistryItem
{
    constructor(index: number, roomId: number, roomName: string, userId: number, userName: string, text: string)
    {
        this._index = index;
        this._roomId = roomId;
        this._roomName = roomName;
        this._userId = userId;
        this._userName = userName;
        this._text = text;
        this._chatTime = new Date();
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_index
    private _index: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get index()
    get index(): number
    {
        return this._index;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_userId
    private _userId: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_userName
    private _userName: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_text
    private _text: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_roomId
    private _roomId: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_roomName
    private _roomName: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_selected
    private _selected: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::_chatTime
    private _chatTime: Date;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatRegistryItem.as::get chatTime()
    get chatTime(): Date
    {
        return this._chatTime;
    }
}
