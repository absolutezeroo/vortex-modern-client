import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';
import type {CatalogPageWithEarliestExpiryMessageEventParser} from '@habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser';
import {CatalogPageWithEarliestExpiryMessageEvent} from '@habbo/communication/messages/incoming/catalog/CatalogPageWithEarliestExpiryMessageEvent';
import {GetCatalogPageWithEarliestExpiryComposer} from '@habbo/communication/messages/outgoing/catalog/GetCatalogPageWithEarliestExpiryComposer';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

/**
 * Compact variant of `ExpiringCatalogPageWidget` - AS3 duplicates this logic
 * rather than subclassing, so it's ported as its own standalone class too.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as
 */
export class ExpiringCatalogPageSmallWidget implements ILandingViewWidget, ISettingsAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::REFRESH_PERIOD_IN_MILLIS
    private static readonly REFRESH_PERIOD_IN_MILLIS: number = 30000;

    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _pageName: string = '';
    private _secondsToExpiry: number = 0;
    private _lastRequestTime: number | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::ExpiringCatalogPageSmallWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('expiring_catalog_page_small') as IWindowContainer | null;

        const openCatalogButton = this._container?.findChildByName('open_catalog_button');

        if(openCatalogButton) openCatalogButton.procedure = this.onOpenCatalogButton;
        if(this._container) this._container.visible = false;

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(
            new CatalogPageWithEarliestExpiryMessageEvent(this.onCatalogPage)
        );
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::refresh()
    refresh(): void
    {
        const now = Date.now();

        if(this._lastRequestTime === null || this._lastRequestTime + ExpiringCatalogPageSmallWidget.REFRESH_PERIOD_IN_MILLIS < now)
        {
            this._landingView?.send(new GetCatalogPageWithEarliestExpiryComposer());
            this._lastRequestTime = now;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::refreshContent()
    private refreshContent(): void
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

        if(pageHeaderTxt) pageHeaderTxt.caption = this.getText('landing.view.pageexpiry.page.' + this._pageName + '.header');
        if(pageDescTxt) pageDescTxt.caption = this.getText('landing.view.pageexpiry.page.' + this._pageName + '.desc');

        const promoBitmap = this._container.findChildByName('promo_bitmap') as IStaticBitmapWrapperWindow | null;

        if(promoBitmap) promoBitmap.assetUri = '${image.library.url}reception/catalog_teaser_' + this._pageName + '.png';

        this.refreshTimer();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::getText()
    private getText(key: string): string
    {
        return '${' + key + '}';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::onOpenCatalogButton()
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::refreshTimer()
    private refreshTimer(): void
    {
        const countdown = this._container?.findChildByName('countdown_widget') as IWidgetWindow | null;
        const widget = (countdown?.widget ?? null) as CountdownWidget | null;

        if(!widget) return;

        widget.seconds = this._secondsToExpiry;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::onCatalogPage()
    private onCatalogPage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CatalogPageWithEarliestExpiryMessageEventParser | null;

        if(!parser) return;

        this._pageName = parser.pageName;
        this._secondsToExpiry = parser.secondsToExpiry;
        this.refreshContent();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/ExpiringCatalogPageSmallWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }
}
