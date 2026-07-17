import type {IWindow} from '../../IWindow';
import {WindowType} from '../../enum/WindowType';
import {buildCanvasFontString} from '../../utils/CanvasFontString';
import {SkinRenderer} from './SkinRenderer';

/**
 * Duck-typed view of the `TextController` properties this renderer reads.
 *
 * AS3 casts the window to `ITextWindow`/`ITextFieldContainer` and reads the
 * same members off it; this port has no equivalent runtime cast, so the shape
 * is spelled out here.
 */
interface ITextWindowShape
{
    textColor?: number;
    fontSize?: number;
    fontFace?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    multiline?: boolean;
    wordWrap?: boolean;
    etchingColor?: number;
    etchingPosition?: string;
    autoSize?: string;
    _autoSize?: string;
    spacing?: number;
    _spacing?: number;
    leading?: number;
    _leading?: number;
    marginLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    _marginLeft?: number;
    _marginTop?: number;
    _marginRight?: number;
    _marginBottom?: number;
}

/**
 * A per-range TextFormat override, as produced by `TextController.setTextFormat()`.
 */
interface ITextFormatRun
{
    start: number;
    end: number;
    format: { color?: number | null; underline?: boolean | null; bold?: boolean | null; italic?: boolean | null };
}

/**
 * Draws a text window's content: the etched copy first, then the text itself.
 *
 * Ported from AS3 `TextSkinRenderer`, mapped by the game's own element
 * description (`window-skins/habbo_element_description_xml.xml`) onto the
 * `text`, `formatted_text`, `password` and `link` window types.
 *
 * The port is a behavioural one, not a line-for-line one, and the reason is
 * structural: AS3 does no text layout here at all. Flash's `TextField` has
 * already measured, wrapped and rendered the glyphs by the time `draw()` runs,
 * so AS3's whole method is two `BitmapData.draw()` calls that blit that
 * TextField — once through a flattening ColorTransform for the etch, once for
 * the text. Canvas2D has no TextField, so measuring, wrapping and stroking
 * glyphs has to happen here. Everything below `draw()` therefore has no AS3
 * counterpart to trace to; what is traceable is the order (etch, then text),
 * the etch offsets (`SkinRenderer.ETCHING_POSITION`), the alpha-gated etch
 * (`(etchingColor & 0xFF000000) != 0`), and `isStateDrawable()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/TextSkinRenderer.as
 */
export class TextSkinRenderer extends SkinRenderer
{
    /**
	 * Flash reserves a 2px gutter at the top of every TextField, which the
	 * layouts' Y coordinates were authored against.
	 */
    // AS3: sources/win63_version/core/window/components/TextController.as::_field
    protected static readonly FLASH_TEXT_FIELD_TOP_GUTTER: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/TextSkinRenderer.as::isStateDrawable()
    public override isStateDrawable(state: number): boolean
    {
        return state === 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/TextSkinRenderer.as::draw()
    public override draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        _state: number,
        _colorize: boolean
    ): void
    {
        const absX = rect.x;
        const absY = rect.y;
        const w = rect.width;
        const h = rect.height;

        const type = window.type;
        const typedWindow = window as unknown as { text?: string };
        const text = typedWindow.text ?? window.caption;

        if(!text) return;

        const tw = window as unknown as ITextWindowShape;

        const fontSize = tw.fontSize ?? 12;
        const fontFace = tw.fontFace || 'Ubuntu, Arial, sans-serif';
        const isBold = tw.bold ?? false;
        const isItalic = tw.italic ?? false;

        // Text color from TextController.textColor (defaults to 0x000000 = black)
        const textColor = tw.textColor ?? 0x000000;
        const r = (textColor >> 16) & 0xFF;
        const g = (textColor >> 8) & 0xFF;
        const b = textColor & 0xFF;

        // Build CSS font string
        const fontStr = buildCanvasFontString(fontSize, fontFace, isBold, isItalic);

        ctx.font = fontStr;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.textBaseline = 'top';

        // Margins from TextController
        const marginL = tw.marginLeft ?? tw._marginLeft ?? 2;
        const isDropListTitleText = window.name === '_DROPLIST_TITLETEXT';
        const isDropListButtonText = window.name === '_BTN_TEXT'
			&& (window.parent?.type === WindowType.DROPMENU_ITEM || window.parent?.type === WindowType.DROPLIST_ITEM);
        const isCompactDropListText = isDropListTitleText || isDropListButtonText;
        const marginT = isCompactDropListText
            ? 0
            : tw.marginTop ?? tw._marginTop ?? 2;
        const marginR = tw.marginRight ?? tw._marginRight ?? 2;
        const marginB = isCompactDropListText
            ? 0
            : tw.marginBottom ?? tw._marginBottom ?? 2;
        const autoSize = (tw.autoSize ?? tw._autoSize ?? 'none').toLowerCase();
        const spacing = tw.spacing ?? tw._spacing ?? 0;
        const leading = tw.leading ?? tw._leading ?? 0;
        const maxWidth = w - marginL - marginR;
        const flashTextFieldTopGutter = isCompactDropListText
            ? 0
            : TextSkinRenderer.FLASH_TEXT_FIELD_TOP_GUTTER;

        if(maxWidth <= 0) return;

        // Determine display text
        let displayText = text;

        if(type === WindowType.PASSWORD)
        {
            displayText = '•'.repeat(text.length);
        }

        if(isCompactDropListText)
        {
            ctx.textBaseline = 'alphabetic';
        }

        // Etching (shadow text) support for il_* styles. AS3 gates on the etch
        // colour's alpha byte: `(etchingColor & 0xFF000000) != 0`.
        const etchColor = tw.etchingColor ?? 0;
        const hasEtching = etchColor !== 0 && ((etchColor >>> 24) & 0xFF) > 0;

        // Underline support for link windows
        if(type === WindowType.LINK || tw.underline)
        {
            ctx.save();

            const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
            const textW = Math.min(measuredWidth, maxWidth);
            const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
            const textY = absY + marginT + flashTextFieldTopGutter;

            if(hasEtching)
            {
                this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing);
            }

            this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing);

            // Draw underline
            const underlineY = textY + fontSize + 1;

            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(textX, underlineY);
            ctx.lineTo(textX + textW, underlineY);
            ctx.stroke();
            ctx.restore();

            return;
        }

        // Multiline / word-wrap rendering
        if((tw.multiline || tw.wordWrap) && (type === WindowType.TEXT || type === WindowType.FORMATTED_TEXT || type === WindowType.HTML))
        {
            this.compositeTextMultiline(
                ctx,
                displayText,
                absX + marginL,
                absY + marginT + flashTextFieldTopGutter,
                maxWidth,
                h - marginT - marginB - flashTextFieldTopGutter,
                fontSize,
                tw.wordWrap ?? false,
                hasEtching ? etchColor : 0,
                tw.etchingPosition,
                spacing,
                leading,
                autoSize
            );

            return;
        }

        const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
        const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
        const textY = isCompactDropListText
            ? this.resolveCompactDropListTextY(ctx, displayText, absY, h, fontSize)
            : absY + marginT + flashTextFieldTopGutter;
        const clipY = isCompactDropListText ? absY : undefined;
        const clipHeight = isCompactDropListText ? h : undefined;

        if(hasEtching)
        {
            this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing, clipY, clipHeight);
        }

        // Duck-type per-range TextFormat overrides from TextController
        // (chat-message links, and <b>/<i>/<u> runs from FormattedTextController's
        // HTML-lite parser — see TextController.setTextFormat()).
        const formatRuns = (window as unknown as { formatRuns?: ReadonlyArray<ITextFormatRun> }).formatRuns;

        if(formatRuns && formatRuns.length > 0)
        {
            this.drawTextLineWithRuns(ctx, displayText, formatRuns, textX, textY, maxWidth, spacing, fontSize, fontFace, isBold, isItalic, `rgb(${r},${g},${b})`, clipY, clipHeight);
        }
        else
        {
            this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing, clipY, clipHeight);
        }
    }

    /**
	 * Renders multiline text with optional word wrapping.
	 *
	 * TS-only: Flash's TextField wraps its own text before AS3's draw() ever
	 * sees it.
	 */
    protected compositeTextMultiline(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number,
        fontSize: number,
        wordWrap: boolean,
        etchingColor: number = 0,
        etchingPosition?: string,
        spacing: number = 0,
        leading: number = 0,
        autoSize: string = 'none'
    ): void
    {
        const lineHeight = Math.max(1, fontSize + 2 + leading);
        const lines = text.split('\n');
        let currentY = y;
        const hasEtching = etchingColor !== 0 && ((etchingColor >>> 24) & 0xFF) > 0;

        for(const line of lines)
        {
            if(currentY + lineHeight > y + maxHeight)
            {
                break;
            }

            if(wordWrap && this.measureTextWidth(ctx, line, spacing) > maxWidth)
            {
                for(const wrappedLine of this.wrapLine(ctx, line, maxWidth, spacing))
                {
                    if(currentY + lineHeight > y + maxHeight)
                    {
                        break;
                    }

                    const measuredWidth = this.measureTextWidth(ctx, wrappedLine, spacing);
                    const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

                    if(hasEtching)
                    {
                        this.drawEtching(ctx, wrappedLine, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
                    }

                    this.drawTextLine(ctx, wrappedLine, drawX, currentY, maxWidth, spacing);
                    currentY += lineHeight;
                }
            }
            else
            {
                const measuredWidth = this.measureTextWidth(ctx, line, spacing);
                const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

                if(hasEtching)
                {
                    this.drawEtching(ctx, line, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
                }

                this.drawTextLine(ctx, line, drawX, currentY, maxWidth, spacing);
                currentY += lineHeight;
            }
        }
    }

    /**
	 * Resolves the X of a line under AS3's `autoSize` alignment.
	 *
	 * AS3 does this inline in draw() against the TextField's own measured
	 * width: `tx = floor(width - textField.width - margins.right)` for "right",
	 * `tx = floor(width/2 - textField.width/2)` for "center".
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/TextSkinRenderer.as::draw()
    protected resolveAlignedTextX(
        baseX: number,
        maxWidth: number,
        textWidth: number,
        autoSize: string
    ): number
    {
        if(autoSize === 'center')
        {
            return baseX + Math.max(0, Math.floor((maxWidth - textWidth) / 2));
        }

        if(autoSize === 'right')
        {
            return baseX + Math.max(0, Math.floor(maxWidth - textWidth));
        }

        return baseX;
    }

    // TS-only: Flash's TextField measures itself; Canvas2D has to be asked.
    protected measureTextWidth(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        spacing: number
    ): number
    {
        if(!text)
        {
            return 0;
        }

        const width = ctx.measureText(text).width;

        if(spacing === 0 || text.length <= 1)
        {
            return width;
        }

        return width + ((text.length - 1) * spacing);
    }

    // TS-only: compensates for Flash TextField's internal padding on the
    // compact droplist rows, which the layouts were authored around.
    protected resolveCompactDropListTextY(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        top: number,
        height: number,
        fontSize: number
    ): number
    {
        const metrics = ctx.measureText(text || 'Hg');
        const ascent = metrics.actualBoundingBoxAscent || Math.ceil(fontSize * 0.75);
        const descent = metrics.actualBoundingBoxDescent || Math.ceil(fontSize * 0.25);
        const textHeight = ascent + descent;
        const safeHeight = Math.max(1, height);

        if(textHeight <= safeHeight)
        {
            const flashTextFieldInnerOffset = 2;
            const centeredBaseline = top + ((safeHeight - textHeight) / 2) + ascent;
            const bottomSafeBaseline = top + safeHeight - descent;

            return Math.floor(Math.min(centeredBaseline + flashTextFieldInnerOffset, bottomSafeBaseline));
        }

        return Math.floor(top + safeHeight - descent);
    }

    // TS-only: replaces Flash's own glyph stroking.
    protected drawTextLine(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        spacing: number,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        if(!text)
        {
            return;
        }

        const resolvedClipY = clipY ?? y - 2;
        const resolvedClipHeight = clipHeight ?? 4096;

        if(spacing === 0)
        {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
            ctx.clip();
            ctx.fillText(text, x, y);
            ctx.restore();

            return;
        }

        let drawX = x;
        const maxX = x + maxWidth;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
        ctx.clip();

        for(let i = 0; i < text.length; i++)
        {
            const char = text.charAt(i);
            const charWidth = ctx.measureText(char).width;

            if(drawX + charWidth > maxX)
            {
                break;
            }

            ctx.fillText(char, drawX, y);
            drawX += charWidth + spacing;
        }

        ctx.restore();
    }

    /**
	 * Per-character variant of drawTextLine() that applies a per-range color/
	 * underline override where a format run covers the character, and the
	 * base fill style everywhere else. Always walks character-by-character
	 * (unlike drawTextLine()'s spacing===0 fast path) since every char needs
	 * an independent run lookup.
	 *
	 * Driven by RoomChatItem.applyMessageLinks()'s TextController.setTextFormat()
	 * calls (AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::renderView(),
	 * the links/var_1993 branch).
	 */
    // TS-only: no AS3 equivalent — Flash's native TextField renders per-range
    // TextFormat runs itself; this is the Canvas2D port's replacement.
    protected drawTextLineWithRuns(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        runs: ReadonlyArray<ITextFormatRun>,
        x: number,
        y: number,
        maxWidth: number,
        spacing: number,
        fontSize: number,
        fontFace: string,
        baseBold: boolean,
        baseItalic: boolean,
        baseFillStyle: string,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        if(!text) return;

        const resolvedClipY = clipY ?? y - 2;
        const resolvedClipHeight = clipHeight ?? 4096;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
        ctx.clip();

        let drawX = x;
        const maxX = x + maxWidth;
        const baseFontStr = buildCanvasFontString(fontSize, fontFace, baseBold, baseItalic);
        let currentFontStr = baseFontStr;

        ctx.font = currentFontStr;

        for(let i = 0; i < text.length; i++)
        {
            const char = text.charAt(i);
            const run = runs.find((r) => i >= r.start && i < r.end);
            const runFontStr = run
                ? buildCanvasFontString(fontSize, fontFace, run.format.bold ?? baseBold, run.format.italic ?? baseItalic)
                : baseFontStr;

            if(runFontStr !== currentFontStr)
            {
                ctx.font = runFontStr;
                currentFontStr = runFontStr;
            }

            const charWidth = ctx.measureText(char).width;

            if(drawX + charWidth > maxX) break;

            const fillStyle = (run?.format.color != null) ? this.colorToRgbString(run.format.color) : baseFillStyle;

            ctx.fillStyle = fillStyle;
            ctx.fillText(char, drawX, y);

            if(run?.format.underline)
            {
                ctx.strokeStyle = fillStyle;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(drawX, y + fontSize + 1);
                ctx.lineTo(drawX + charWidth, y + fontSize + 1);
                ctx.stroke();
            }

            drawX += charWidth + spacing;
        }

        ctx.restore();
    }

    // TS-only: small ARGB->CSS helper shared by drawTextLineWithRuns().
    protected colorToRgbString(color: number): string
    {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        return `rgb(${r},${g},${b})`;
    }

    // TS-only: Flash's TextField wraps its own text.
    protected wrapLine(
        ctx: OffscreenCanvasRenderingContext2D,
        line: string,
        maxWidth: number,
        spacing: number
    ): string[]
    {
        if(!line)
        {
            return [''];
        }

        const words = line.split(' ');
        const out: string[] = [];
        let current = '';

        for(const word of words)
        {
            const candidate = current ? `${current} ${word}` : word;

            if(this.measureTextWidth(ctx, candidate, spacing) <= maxWidth || !current)
            {
                current = candidate;
            }
            else
            {
                out.push(current);
                current = word;
            }

            if(this.measureTextWidth(ctx, current, spacing) > maxWidth)
            {
                const broken = this.wrapLongWord(ctx, current, maxWidth, spacing);

                if(broken.length > 0)
                {
                    out.push(...broken.slice(0, broken.length - 1));
                    current = broken[broken.length - 1];
                }
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    // TS-only: Flash's TextField breaks its own over-long words.
    protected wrapLongWord(
        ctx: OffscreenCanvasRenderingContext2D,
        word: string,
        maxWidth: number,
        spacing: number
    ): string[]
    {
        const out: string[] = [];
        let current = '';

        for(let i = 0; i < word.length; i++)
        {
            const next = current + word.charAt(i);

            if(this.measureTextWidth(ctx, next, spacing) <= maxWidth || !current)
            {
                current = next;
            }
            else
            {
                out.push(current);
                current = word.charAt(i);
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    /**
	 * Draws the etched (embossed) copy of the text, offset by the entry
	 * `SkinRenderer.ETCHING_POSITION` holds for `position`.
	 *
	 * AS3 achieves this by blitting the same TextField a second time through a
	 * `ColorTransform(0,0,0,1,255,255,255,0)` — RGB multipliers zeroed, offsets
	 * set to the etch colour — which flattens the glyphs to a single-colour
	 * silhouette. Canvas2D reaches the same result by re-stroking the text in
	 * the etch colour, so the transform has no counterpart here.
	 *
	 * Skipping when the position is not a known key is AS3's behaviour too
	 * (`if(_loc9_ != null)`), not a defensive guard: an unrecognised
	 * etching-position name means no etch at all, not a fallback direction.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/TextSkinRenderer.as::draw()
    protected drawEtching(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        color: number,
        position?: string,
        spacing: number = 0,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        const offset = TextSkinRenderer.ETCHING_POSITION[position ?? ''];

        if(!offset) return;

        const a = ((color >>> 24) & 0xFF) / 255;
        const er = (color >> 16) & 0xFF;
        const eg = (color >> 8) & 0xFF;
        const eb = color & 0xFF;

        const prevFill = ctx.fillStyle;

        ctx.fillStyle = `rgba(${er},${eg},${eb},${a})`;
        this.drawTextLine(ctx, text, x + offset.x, y + offset.y, maxWidth, spacing, clipY, clipHeight);
        ctx.fillStyle = prevFill;
    }
}
