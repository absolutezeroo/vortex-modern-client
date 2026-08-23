/**
 * The measurements and two text formats the chat-history tray is laid out with.
 *
 * Name DERIVED, not recovered: the class is `_SafeCls_2520` in the primary tree and `class_2964`
 * in `win63_version`, obfuscated in both, and it predates the 2016 build so PRODUCTION has no
 * counterpart. Every *member* name below is real.
 *
 * The two colours are AS3's ARGB literals with the alpha byte dropped, because canvas takes the
 * alpha separately and both are opaque: 4288716960 is #9C9C9C, 4294901760 is #FF0000.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/enum/_SafeCls_2520.as
 */
export interface IChatHistoryTextFormat
{
    // TS-only: the fields of `flash.text.TextFormat` these two formats actually set.
    font: string;
    size: number;
    color: string;
    bold: boolean;
    italic: boolean;
}

export class ChatHistoryVisualizationEnum
{
    // AS3: _SafeCls_2520.as::LEFT_MARGIN
    public static readonly LEFT_MARGIN: number = 3;

    /**
     * The column the timestamp sits in, and therefore the x the bubble starts at. Fixed rather
     * than measured so every row's bubble lines up regardless of how wide the clock renders.
     */
    // AS3: _SafeCls_2520.as::TIMESTAMP_FIXED_WIDTH
    public static readonly TIMESTAMP_FIXED_WIDTH: number = 62;

    // AS3: _SafeCls_2520.as::TRAY_HANDLE_INLET_LEFT
    public static readonly TRAY_HANDLE_INLET_LEFT: number = 0;

    // AS3: _SafeCls_2520.as::TRAY_TOOLBAR_BOTTOM_MARGIN
    public static readonly TRAY_TOOLBAR_BOTTOM_MARGIN: number = 50;

    // AS3: _SafeCls_2520.as::TRAY_HANDLE_OFFSET_FROM_BOTTOM
    public static readonly TRAY_HANDLE_OFFSET_FROM_BOTTOM: number = 215;

    // AS3: _SafeCls_2520.as::ENTRY_DEFAULT_BOTTOM_PADDING
    public static readonly ENTRY_DEFAULT_BOTTOM_PADDING: number = 300;

    // AS3: _SafeCls_2520.as::MAX_ENTRY_WIDTH
    public static readonly MAX_ENTRY_WIDTH: number = 415;

    // AS3: _SafeCls_2520.as::_SafeStr_11316 — name not recovered in any tree; the value is 8 and
    // ChatHistoryRoomChangeEntry adds it to the row height, so it is that row's vertical padding.
    public static readonly ROOM_CHANGE_ROW_PADDING: number = 8;

    // AS3: _SafeCls_2520.as::_SafeStr_11475 — name not recovered in any tree; the value is 3.
    public static readonly ENTRY_SPACING: number = 3;

    // AS3: _SafeCls_2520.as::TEXT_FORMAT_TIMESTAMP
    public static readonly TEXT_FORMAT_TIMESTAMP: IChatHistoryTextFormat = {
        font: 'Ubuntu',
        size: 12,
        color: '#9C9C9C',
        bold: false,
        italic: true,
    };

    // AS3: _SafeCls_2520.as::TEXT_FORMAT
    public static readonly TEXT_FORMAT: IChatHistoryTextFormat = {
        font: 'Ubuntu',
        size: 12,
        color: '#FF0000',
        bold: false,
        italic: false,
    };

    /**
     * Draws one line of text in one of the formats above, at a baseline derived from the format's
     * own size.
     *
     * TS-only: AS3 builds a `TextField`, assigns `defaultTextFormat` and draws the field through a
     * Matrix. There is no TextField here, and the field's four rendering knobs
     * (`thickness -15`, `sharpness 80`, `antiAliasType "advanced"`, `gridFitType "pixel"`) are
     * Flash font-rasteriser settings with no canvas equivalent at all — canvas has one text
     * rasteriser and no way to bias it. The glyphs land in the same place; they are anti-aliased
     * the browser's way.
     */
    // TS-only: the canvas stand-in for `BitmapData.draw(textField, matrix)`.
    public static drawText(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        format: IChatHistoryTextFormat,
        x: number,
        y: number
    ): void
    {
        const style = format.italic ? 'italic ' : '';
        const weight = format.bold ? 'bold ' : '';

        ctx.font = `${style}${weight}${format.size}px "${format.font}", sans-serif`;
        ctx.fillStyle = format.color;
        ctx.textBaseline = 'top';
        // Flash's TextField has a 2px gutter on each side that its own draw() includes; the caller's
        // matrix puts the field's *box* at x, so the glyphs start two pixels in.
        ctx.fillText(text, x + 2, y + 2);
    }

    /**
     * How wide `drawText()` would render this string.
     */
    // TS-only: AS3 reads `TextField.textWidth` after assigning the text.
    public static measureText(text: string, format: IChatHistoryTextFormat): number
    {
        const canvas = new OffscreenCanvas(1, 1);
        const ctx = canvas.getContext('2d');

        if(ctx === null) return 0;

        const style = format.italic ? 'italic ' : '';
        const weight = format.bold ? 'bold ' : '';

        ctx.font = `${style}${weight}${format.size}px "${format.font}", sans-serif`;

        return ctx.measureText(text).width;
    }
}
