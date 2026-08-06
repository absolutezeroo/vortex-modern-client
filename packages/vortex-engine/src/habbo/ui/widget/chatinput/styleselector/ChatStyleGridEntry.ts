/**
 * ChatStyleGridEntry
 *
 * A single grid-cell entry in the chat style selector popup - a style id
 * paired with its already-decoded preview thumbnail.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as
 */
export class ChatStyleGridEntry
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as::ChatStyleGridEntry()
    constructor(private readonly _id: number, private readonly _bitmap: ImageBitmap)
    {
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as::get bitmap()
    get bitmap(): ImageBitmap
    {
        return this._bitmap;
    }
}
