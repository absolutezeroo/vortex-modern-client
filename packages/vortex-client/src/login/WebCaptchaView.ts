/**
 * WebCaptchaView
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/WebCaptchaView.as
 *
 * The captcha the web API demands after a failed or suspicious login. AS3 opens
 * `<web.api>/api/public/captcha` in a `StageWebView` — AIR's embedded browser — and watches its
 * `locationChange` events for a redirect carrying `token=`, which it hands back to the provider.
 *
 * The port's `StageWebView` is an iframe. The one thing that does not carry over is
 * `locationChange`: a browser will not tell a page where a cross-origin frame navigated to. So the
 * frame's location is polled inside a try/catch — which reads the redirect when the captcha is
 * served from the client's own origin (the normal setup, since `web.api` is the same host), and
 * throws harmlessly when it is not. If it is cross-origin, the token cannot be recovered and the
 * flow falls back to `showCaptchaError()` after the user closes the view, exactly as it does when
 * `createCaptchaView()` returns null.
 */
import {Logger} from '@core/utils/Logger';
import type {ICaptchaHandler} from '@habbo/communication/login/ICaptchaHandler';
import type {ICaptchaView} from '@habbo/communication/login/ICaptchaView';

const log = Logger.getLogger('client.login.WebCaptchaView');

export class WebCaptchaView implements ICaptchaView
{
    // AS3: CAPTCHA_ENDPOINT
    private static readonly CAPTCHA_ENDPOINT: string = '/api/public/captcha';

    // AS3: TOKEN_KEY
    private static readonly TOKEN_KEY: string = 'token=';

    // AS3: _webView — the single shared StageWebView
    private static _webView: HTMLIFrameElement | null = null;

    // AS3: _handler
    private _handler: ICaptchaHandler | null;

    /** TS-only: the poll that stands in for AS3's `locationChange` event. */
    private _pollHandle: number = 0;

    /** TS-only: the last location read off the frame, so the token is only handled once. */
    private _lastLocation: string = '';

    // AS3: WebCaptchaView(_arg_1:ICaptchaHandler)
    constructor(handler: ICaptchaHandler)
    {
        this._handler = handler;
    }

    /**
     * AS3: static resolveToken(_arg_1:String):String
     */
    // AS3: .../src/login/WebCaptchaView.as::resolveToken()
    private static resolveToken(location: string): string | null
    {
        const index = location != null ? location.indexOf(WebCaptchaView.TOKEN_KEY) : -1;

        if(index < 0) return null;

        return location.substr(index + WebCaptchaView.TOKEN_KEY.length);
    }

    /**
     * AS3: onAddedToStage(_arg_1:Event)
     *
     * AS3 sizes the view to the stage and puts the web view below the top 100px, where the close
     * button sits.
     */
    public mount(container: HTMLElement): void
    {
        if(!this._handler) return;

        const url = `${this._handler.getProperty('web.api') ?? ''}${WebCaptchaView.CAPTCHA_ENDPOINT}`;

        log.debug(`Initialize url: ${url}`);

        if(WebCaptchaView._webView == null)
        {
            const frame = document.createElement('iframe');

            frame.style.position = 'absolute';
            frame.style.left = '0';
            frame.style.top = '100px';
            frame.style.width = '100%';
            frame.style.height = 'calc(100% - 100px)';
            frame.style.border = 'none';
            frame.style.zIndex = '10002';
            frame.src = url;
            container.appendChild(frame);
            WebCaptchaView._webView = frame;
            this._pollHandle = window.setInterval(this._onPollLocation, 250);
        }
    }

    /**
     * TS-only: stands in for `onLocationChange(_arg_1:LocationChangeEvent)`.
     */
    private _onPollLocation = (): void =>
    {
        const frame = WebCaptchaView._webView;

        if(!frame) return;

        let location: string;

        try
        {
            location = frame.contentWindow?.location.href ?? '';
        }
        catch
        {
            // Cross-origin captcha: the redirect is unreadable from here. See the class header.
            return;
        }

        if(!location || location === this._lastLocation) return;

        this._lastLocation = location;

        const token = WebCaptchaView.resolveToken(location);

        if(token != null)
        {
            this._handler?.handleCaptchaResult(token);
        }
    };

    // AS3: dispose()
    public dispose(): void
    {
        this._handler = null;

        if(this._pollHandle)
        {
            window.clearInterval(this._pollHandle);
            this._pollHandle = 0;
        }

        if(WebCaptchaView._webView)
        {
            WebCaptchaView._webView.remove();
            WebCaptchaView._webView = null;
        }
    }
}
