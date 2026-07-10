/**
 * ChatStyleGridEntry
 *
 * A single grid-cell entry in the chat style selector popup - a style id
 * paired with its already-decoded preview thumbnail.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as
 */
export class ChatStyleGridEntry
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/chatinput/styleselector/ChatStyleGridEntry.as::ChatStyleGridEntry()
    constructor(private readonly _id: number, private readonly _bitmap: ImageBitmap)
    {
    }

    get id(): number
    {
        return this._id;
    }

    get bitmap(): ImageBitmap
    {
        return this._bitmap;
    }
}
