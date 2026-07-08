import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';
import type {CatalogPageWithEarliestExpiryMessageEventParser} from '@habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser';
import {CatalogPageWithEarliestExpiryMessageEvent} from '@habbo/communication/messages/incoming/catalog/CatalogPageWithEarliestExpiryMessageEvent';
import {GetCatalogPageWithEarliestExpiryComposer} from '@habbo/communication/messages/outgoing/catalog/GetCatalogPageWithEarliestExpiryComposer';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';
import {HabboLandingView} from '../HabboLandingView';

/**
 * Shows the catalog page with the soonest-expiring offer, with a countdown
 * to expiry. Client-side refresh throttled to once per 30s.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as
 */
export class ExpiringCatalogPageWidget implements ILandingViewWidget, ISettingsAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::REFRESH_PERIOD_IN_MILLIS
    private static readonly REFRESH_PERIOD_IN_MILLIS: number = 30000;

    protected _landingView: HabboLandingView | null;
    protected _container: IWindowContainer | null = null;
    protected _pageName: string = '';
    protected _secondsToExpiry: number = 0;
    private _lastRequestTime: number | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::ExpiringCatalogPageWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    protected get xmlAssetName(): string
    {
        return 'expiring_catalog_page';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow(this.xmlAssetName) as IWindowContainer | null;

        const openCatalogButton = this._container?.findChildByName('open_catalog_button');

        if(openCatalogButton) openCatalogButton.procedure = this.onOpenCatalogButton;
        if(this._container) this._container.visible = false;

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(
            new CatalogPageWithEarliestExpiryMessageEvent(this.onCatalogPage)
        );

        if(this._container)
        {
            HabboLandingView.positionAfterAndStretch(this._container, 'page_expiry_title', 'hdr_line');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::refresh()
    refresh(): void
    {
        const now = Date.now();

        if(this._lastRequestTime === null || this._lastRequestTime + ExpiringCatalogPageWidget.REFRESH_PERIOD_IN_MILLIS < now)
        {
            this._landingView?.send(new GetCatalogPageWithEarliestExpiryComposer());
            this._lastRequestTime = now;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::refreshContent()
    protected refreshContent(): void
    {
        if(!this._container) return;

        if(this._pageName === '')
        {
            this._container.visible = false;
            return;
        }

        this._container.visible = true;

        const pageHeaderTxt = this._container.findChildByName('page_header_txt');
        const pageDescTxt = this._container.findChildByName('page_desc_txt');

        if(pageHeaderTxt) pageHeaderTxt.caption = this.getText('landing.view.pageexpiry', 'page.' + this._pageName, 'header');
        if(pageDescTxt) pageDescTxt.caption = this.getText('landing.view.pageexpiry', 'page.' + this._pageName, 'desc');

        const promoBitmap = this._container.findChildByName('promo_bitmap') as IStaticBitmapWrapperWindow | null;

        if(promoBitmap) promoBitmap.assetUri = '${image.library.url}reception/catalog_teaser_' + this._pageName + '.png';

        this.refreshTimer();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::refreshTimer()
    protected refreshTimer(): void
    {
        const countdown = this._container?.findChildByName('countdown_widget') as IWidgetWindow | null;
        const widget = (countdown?.widget ?? null) as CountdownWidget | null;

        if(!widget) return;

        widget.seconds = this._secondsToExpiry;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::getText()
    private getText(prefix: string, pageKey: string, suffix: string): string
    {
        const key = `${prefix}${this.useDefaultLocalization ? '' : '.' + pageKey}.${suffix}`;

        return '${' + key + '}';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::get useDefaultLocalization()
    protected get useDefaultLocalization(): boolean
    {
        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::onOpenCatalogButton()
    private onOpenCatalogButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.catalog?.openCatalogPage(this._pageName);
        this._landingView?.tracking?.trackGoogle('landingView', 'click_goToExpiringCatalogPage');
    };

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::onCatalogPage()
    private onCatalogPage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CatalogPageWithEarliestExpiryMessageEventParser | null;

        if(!parser) return;

        this._pageName = parser.pageName;
        this._secondsToExpiry = parser.secondsToExpiry;
        this.refreshContent();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }
}
