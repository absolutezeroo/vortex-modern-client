import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IHTMLTextWindow} from './IHTMLTextWindow';
import {TextFieldController} from './TextFieldController';
import {InteractiveController} from './InteractiveController';
import type {WindowEvent} from '../events/WindowEvent';
import type {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for HTML text windows with link support.
 *
 * Extends TextFieldController with HTML rendering, link event handling,
 * and CSS stylesheet support. In AS3, this is the richest text controller.
 *
 * @see sources/win63_version/core/window/components/HTMLTextController.as
 */
export class HTMLTextController extends TextFieldController implements IHTMLTextWindow
{
    private static readonly HTML_STYLESHEET_KEY: string = 'html_stylesheet';
    private _htmlContent: string = '';

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

        this.immediateClickMode = true;
    }

    private static _defaultLinkTarget: string = 'default';

    public static get defaultLinkTarget(): string
    {
        return HTMLTextController._defaultLinkTarget;
    }

    /**
	 * The default link target for all HTMLTextController instances.
	 */
    public static set defaultLinkTarget(value: string)
    {
        HTMLTextController._defaultLinkTarget = value;
    }

    /**
	 * The HTML content.
	 */
    public get html(): string
    {
        return this._htmlContent;
    }

    public set html(value: string)
    {
        if(value === null) return;

        this._htmlContent = value;
    }

    private _linkTarget: string = 'default';

    /**
	 * The link target for hyperlinks in this window.
	 */
    public get linkTarget(): string
    {
        return this._linkTarget === 'default' ? HTMLTextController._defaultLinkTarget : this._linkTarget;
    }

    public set linkTarget(value: string)
    {
        this._linkTarget = value;
    }

    private _htmlStyleSheetString: string | null = null;

    /**
	 * The CSS stylesheet string for HTML rendering.
	 */
    public get htmlStyleSheetString(): string | null
    {
        return this._htmlStyleSheetString;
    }

    public set htmlStyleSheetString(value: string | null)
    {
        this._htmlStyleSheetString = value;
    }

    /**
	 * Sets text content as HTML with link conversion.
	 */
    public override get text(): string
    {
        return super.text;
    }

    // AS3: sources/win63_version/core/window/components/HTMLTextController.as::set text()
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

        this._htmlContent = value;

        const plainText = HTMLTextController.convertHtmlToPlainText(HTMLTextController.convertLinksToEvents(value));

        this._text = plainText;
        this._htmlText = plainText;
        this.refreshTextImage();
    }

    // AS3: sources/win63_version/core/window/components/HTMLTextController.as::set localization()
    public override set localization(value: string)
    {
        if(value == null) return;

        this._htmlContent = value;

        const plainText = HTMLTextController.convertHtmlToPlainText(HTMLTextController.convertLinksToEvents(this.limitStringLength(value)));

        this._text = plainText;
        this._htmlText = plainText;
        this.refreshTextImage();
    }

    public override get properties(): unknown[]
    {
        const props = InteractiveController.writeInteractiveWindowProperties(this, super.properties);

        props.push(this.createProperty('editable', this.editable));
        props.push(this.createProperty('selectable', this.selectable));
        props.push(this.createProperty('display_as_password', this.displayAsPassword));
        props.push(this.createProperty('link_target', this._linkTarget));

        return props;
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            switch(prop.key)
            {
                case 'link_target':
                    this._linkTarget = prop.value as string;
                    break;
                case 'html_stylesheet':
                    this.htmlStyleSheetString = prop.value as string;
                    break;
            }
        }

        super.properties = value;
    }

    /**
	 * Converts link URLs to event: protocol for internal handling.
	 *
	 * In AS3, this replaced `<a href="http://...">` with `<a href="event:http://...">`.
	 */
    private static convertLinksToEvents(html: string): string
    {
        html = html.replace(/<a[^>]+(http:\/\/[^"']+)['"][^>]*>(.*?)<\/a>/gi, "<a href='event:$1'>$2</a>");
        html = html.replace(/<a[^>]+(https:\/\/[^"']+)['"][^>]*>(.*?)<\/a>/gi, "<a href='event:$1'>$2</a>");

        return html;
    }

    // TS-only: in AS3, `_field.htmlText = ...` hands the markup to Flash's
    // native TextField, which renders <br>/<b>/<a> as real rich text. Our
    // TextController only lays out plain strings (splitting on literal "\n" —
    // see TextController.ts::buildMeasureLines()), so HTML has to be reduced
    // to that before it reaches _text, or tags show up as literal characters.
    private static convertHtmlToPlainText(html: string): string
    {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');
    }
}
