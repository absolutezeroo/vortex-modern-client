import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {TextController} from './TextController';
import type {WindowEvent} from '../events/WindowEvent';
import {parseHtmlFormatting} from '../utils/HtmlFormatting';

/**
 * Controller for formatted (HTML) text windows.
 *
 * Extends TextController and overrides `set text` to use htmlText
 * instead of plain text. In AS3, this set `_field.htmlText` on the
 * underlying TextField.
 *
 * @see sources/win63_version/core/window/components/FormattedTextController.as
 */
export class FormattedTextController extends TextController
{
    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
    }

    /**
	 * Sets text content as HTML.
	 *
	 * In AS3 this mirrors TextController localization flow but writes html text.
	 */
    // `text` returns the rendered plain text (Flash's TextField.text strips
    // markup); `htmlText` (inherited getter) keeps the raw markup, matching
    // Flash's own text/htmlText distinction.
    public override get text(): string
    {
        return this._text;
    }

    public override set text(value: string)
    {
        if(value == null) return;

        if(this._localized)
        {
            this.removeLocalizationListenerForCaption();
            this._localized = false;
        }

        this._caption = value;

        if(!this._displayRaw && this.isLocalizationKey(this._caption))
        {
            this._localized = true;
            this.registerLocalizationListenerForCaption();

            return;
        }

        this.applyHtmlFormatting(this._caption);
    }

    public set localization(value: string)
    {
        if(value == null) return;

        this.applyHtmlFormatting(this.limitStringLength(value));
    }

    // TS-only: shared by set text()/set localization() — see HtmlFormatting.ts.
    private applyHtmlFormatting(html: string): void
    {
        const {text, runs} = parseHtmlFormatting(html);

        this._htmlText = html;
        this._text = text;
        this._formatRuns = runs;
        this.refreshTextImage();
    }
}
