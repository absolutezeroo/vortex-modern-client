import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {Component} from '@core/runtime/Component';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ICountdownWidget} from '@habbo/window/widgets/ICountdownWidget';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {HabboNotifications} from '../HabboNotifications';
import {SecondsUntilMessageEvent} from '@habbo/communication/messages/incoming/competition/SecondsUntilMessageEvent';
import type {
    SecondsUntilMessageEventParser
} from '@habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser';
import {
    GetSecondsUntilMessageComposer
} from '@habbo/communication/messages/outgoing/competition/GetSecondsUntilMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {ColorConverter} from '@room/utils/ColorConverter';

/**
 * The configurable "new feature" toolbar promo
 *
 * Everything about one of these — which layout it uses, its image, its border colour, its links,
 * whether it expires and what it counts down to — comes from hotel properties keyed by the
 * feature's name, so a hotel can add one without a client change.
 *
 * The three variants share this class: `normal` has a cancel link, `promo` and `countdown` make
 * the whole window the hover region, and `countdown` additionally drives a countdown widget from
 * a server-supplied deadline.
 *
 * **Construction is asynchronous when a time is involved.** An expiry or a countdown target is a
 * *timing code*, not a timestamp: the client asks the server how many seconds are left
 * (`GetSecondsUntilMessageComposer`) and waits for the reply before building anything — an expiry
 * already in the past disposes the notification instead. With neither configured, `init()` runs
 * straight from the constructor.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/NewFeatureNotification.as
 */
export class NewFeatureNotification implements IDisposable
{
    // AS3: .../notifications/singular/NewFeatureNotification.as::FEATURE_TYPE_NORMAL
    private static readonly FEATURE_TYPE_NORMAL: string = 'normal';

    // AS3: .../notifications/singular/NewFeatureNotification.as::FEATURE_TYPE_PROMO
    private static readonly FEATURE_TYPE_PROMO: string = 'promo';

    // Name DERIVED (`_SafeStr_10808`): obfuscated in every tree; the third feature type, whose
    // value `"countdown"` is what the layout name and the widget branch both key off.
    // AS3: .../notifications/singular/NewFeatureNotification.as::_SafeStr_10808
    private static readonly FEATURE_TYPE_COUNTDOWN: string = 'countdown';

    // AS3: .../notifications/singular/NewFeatureNotification.as::BG_COLOR_NORMAL
    private static readonly BG_COLOR_NORMAL: string = '#686661';

    // AS3: .../notifications/singular/NewFeatureNotification.as::LINK_COLOR_NORMAL
    private static readonly LINK_COLOR_NORMAL: number = 16777215;

    // AS3: .../notifications/singular/NewFeatureNotification.as::LINK_COLOR_HIGHLIGHT
    private static readonly LINK_COLOR_HIGHLIGHT: number = 12247545;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_toolbar
    private _toolbar: IHabboToolbar | null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_link (the hovered text)
    private _link: ITextWindow | null = null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_key
    private _key: string;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_initialized
    private _initialized: boolean = false;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_secondsUntilEvent
    private _secondsUntilEvent: SecondsUntilMessageEvent | null = null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_notifications
    private _notifications: HabboNotifications | null;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_expiryCode
    private _expiryCode: string = '';

    // AS3: .../notifications/singular/NewFeatureNotification.as::_countDownToCode
    private _countDownToCode: string = '';

    // AS3: .../notifications/singular/NewFeatureNotification.as::_awaitingExpiry
    private _awaitingExpiry: boolean = false;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_awaitingCountDown
    private _awaitingCountDown: boolean = false;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_countDownSeconds
    private _countDownSeconds: number = 0;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_featureType
    private _featureType: string = NewFeatureNotification.FEATURE_TYPE_NORMAL;

    // AS3: .../notifications/singular/NewFeatureNotification.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../notifications/singular/NewFeatureNotification.as::NewFeatureNotification()
    constructor(
        windowManager: IHabboWindowManager | null,
        toolbar: IHabboToolbar | null,
        localization: IHabboLocalizationManager | null,
        notifications: HabboNotifications | null,
        key: string
    )
    {
        this._key = key;
        this._toolbar = toolbar;
        this._localization = localization;
        this._windowManager = windowManager;
        this._notifications = notifications;

        if(windowManager === null) return;

        this._featureType = this.getString('notifications.new_feature.type.' + this._key);

        if(this._featureType.length === 0) this._featureType = NewFeatureNotification.FEATURE_TYPE_NORMAL;

        this._expiryCode = this.getString('notifications.new_feature.expiry.' + this._key);
        this._countDownToCode = this.getString('notifications.new_feature.count_down_to.' + this._key);

        this._awaitingExpiry = this._expiryCode.length > 0;
        this._awaitingCountDown = this._featureType === NewFeatureNotification.FEATURE_TYPE_COUNTDOWN
            && this._countDownToCode.length > 0;

        if(!this._awaitingExpiry && !this._awaitingCountDown)
        {
            this._initialized = true;
            this.init();

            return;
        }

        const communication = notifications?.communication ?? null;

        this._secondsUntilEvent = new SecondsUntilMessageEvent((event: IMessageEvent) => this.onTime(event));
        communication?.addHabboConnectionMessageEvent(this._secondsUntilEvent);

        if(this._awaitingExpiry) communication?.connection?.send(new GetSecondsUntilMessageComposer(this._expiryCode));
        if(this._awaitingCountDown) communication?.connection?.send(new GetSecondsUntilMessageComposer(this._countDownToCode));
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * One reply carries one timing code, so both requests land here and are told apart by it
	 */
    // AS3: .../notifications/singular/NewFeatureNotification.as::onTime()
    private onTime(event: IMessageEvent): void
    {
        if(this._disposed) return;

        const parser = event.parser as SecondsUntilMessageEventParser | null;

        if(parser === null) return;

        const code = parser.timeStr;
        const seconds = parser.secondsUntil;

        if(this._awaitingExpiry && code === this._expiryCode)
        {
            this._awaitingExpiry = false;

            if(seconds <= 0)
            {
                this.dispose();

                return;
            }
        }

        if(this._awaitingCountDown && code === this._countDownToCode)
        {
            this._awaitingCountDown = false;
            this._countDownSeconds = Math.max(0, seconds);
        }

        this.tryInitialize();
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::tryInitialize()
    private tryInitialize(): void
    {
        if(this._initialized || this._awaitingExpiry || this._awaitingCountDown) return;

        this._initialized = true;

        if(this._secondsUntilEvent !== null)
        {
            this._notifications?.communication?.removeHabboConnectionMessageEvent(this._secondsUntilEvent);
            this._secondsUntilEvent = null;
        }

        this.init();
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::init()
    private init(): void
    {
        const layout = this._featureType === NewFeatureNotification.FEATURE_TYPE_NORMAL
            ? 'new_feature_notification_xml'
            : 'new_feature_notification_' + this._featureType + '_xml';

        this._window = (this._windowManager?.buildWidgetLayout(layout) ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;
        this._toolbar?.extensionView?.attachExtension('new_feature_' + this._key, this._window);

        let region: IWindow | null = null;

        if(this._featureType === NewFeatureNotification.FEATURE_TYPE_NORMAL)
        {
            this._link = this._window.findChildByName('cancel_link') as unknown as ITextWindow | null;
            region = this._window.findChildByName('cancel_link_region');
        }
        else if(this._featureType === NewFeatureNotification.FEATURE_TYPE_PROMO
            || this._featureType === NewFeatureNotification.FEATURE_TYPE_COUNTDOWN)
        {
            this._link = this._window.findChildByName('desc') as unknown as ITextWindow | null;
            region = this._window as unknown as IWindow;
        }

        if(region !== null)
        {
            region.addEventListener('WME_OVER', this.onMouseOver);
            region.addEventListener('WME_OUT', this.onMouseOut);
        }

        if(this._featureType === NewFeatureNotification.FEATURE_TYPE_COUNTDOWN)
        {
            const cancel = this._window.findChildByName('cancel_link_region');

            if(cancel !== null && !cancel.visible) cancel.visible = true;
        }

        this.initLayout();
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::initLayout()
    private initLayout(): void
    {
        if(this._window === null) return;

        const image = this.getString('notifications.new_feature.image.' + this._key);
        let colorText = this.getString('notifications.new_feature.color.' + this._key);

        if(colorText === '') colorText = NewFeatureNotification.BG_COLOR_NORMAL;

        const desc = this._window.findChildByName('desc') as unknown as ITextWindow | null;

        if(desc !== null)
        {
            desc.text = this._localization?.getLocalization('notifications.new_feature.' + this._key + '.desc') ?? '';
        }

        const bitmap = this._window.findChildByName('static_bitmap') as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap !== null) bitmap.assetUri = image;

        const color = ColorConverter.hexToUint(colorText);
        const border = this._window.findChildByName('border') ?? (this._window as unknown as IWindow);

        border.color = color;

        // The button takes a lightened version of the border colour: halve the distance from the
        // border's lightness to full, keeping hue and saturation.
        const hsl = ColorConverter.rgbToHSL(color);
        const button = this._window.findChildByName('open_button');

        if(button !== null)
        {
            const lightened = (255 - Math.trunc((255 - (hsl & 0xFF)) / 2)) | (hsl & 0xFFFF00);

            button.color = ColorConverter.hslToRGB(lightened);
        }

        if(this._featureType !== NewFeatureNotification.FEATURE_TYPE_COUNTDOWN) return;

        const widgetWindow = this._window.findChildByName('countdown_widget') as unknown as IWidgetWindow | null;
        const countdown = (widgetWindow?.widget ?? null) as ICountdownWidget | null;

        if(countdown === null) return;

        countdown.seconds = this._countDownSeconds;
        countdown.running = true;
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::getString()
    private getString(key: string): string
    {
        return (this._toolbar as unknown as Component | null)?.getProperty(key) ?? '';
    }

    // TODO(AS3): .../notifications/singular/NewFeatureNotification.as::getBoolean() reads the same
    // property store as a boolean. It is private and nothing in the class calls it.

    // AS3: .../notifications/singular/NewFeatureNotification.as::eventHandler()
    private eventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'open_button':
            case 'main_region':
            {
                this.openConfiguredLink();

                // Following the link reveals the dismiss control, which the promo layouts start
                // with hidden so the first click cannot be an accidental dismissal.
                const cancel = this._window?.findChildByName('cancel_link_region') ?? null;

                if(cancel !== null && !cancel.visible) cancel.visible = true;

                break;
            }

            case 'cancel_link_region':
            case 'cancel_link':
                this.dispose();
                break;
        }
    };

    // AS3: .../notifications/singular/NewFeatureNotification.as::openConfiguredLink()
    private openConfiguredLink(): void
    {
        const internal = this.getString('notifications.new_feature.internal_link.' + this._key);

        if(internal !== '')
        {
            (this._toolbar as unknown as Component | null)?.context?.createLinkEvent(internal);

            return;
        }

        const external = this.getString('notifications.new_feature.external_link.' + this._key);

        if(external !== '') HabboWebTools.openWebPage(external, 'habboMain');
    }

    // AS3: .../notifications/singular/NewFeatureNotification.as::onMouseOver()
    private onMouseOver = (): void =>
    {
        if(this._link !== null) this._link.textColor = NewFeatureNotification.LINK_COLOR_HIGHLIGHT;
    };

    // AS3: .../notifications/singular/NewFeatureNotification.as::onMouseOut()
    private onMouseOut = (): void =>
    {
        if(this._link !== null) this._link.textColor = NewFeatureNotification.LINK_COLOR_NORMAL;
    };

    // AS3: .../notifications/singular/NewFeatureNotification.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._secondsUntilEvent !== null)
        {
            this._notifications?.communication?.removeHabboConnectionMessageEvent(this._secondsUntilEvent);
            this._secondsUntilEvent = null;
        }

        // Only detach what was attached: with a pending expiry still unanswered there is no
        // extension under this key, and detaching a missing one would drop a sibling's slot.
        if(this._toolbar !== null && this._initialized)
        {
            this._toolbar.extensionView?.detachExtension('new_feature_' + this._key);
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._windowManager = null;
        this._link = null;
        this._toolbar = null;
        this._notifications = null;
        this._localization = null;
        this._disposed = true;
    }
}
