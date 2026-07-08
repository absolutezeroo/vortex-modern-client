import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

/**
 * Static catalog-page promo tile (image + link to a configured catalog
 * page).
 *
 * NOTE: the decompiled AS3 for `setCustomLocalization()` has a `null.caption = ...`
 * line that is clearly a decompiler artifact (the receiver is obviously the
 * found child window, not literal null); ported here with the evident
 * correct intent.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as
 */
export class CatalogPromoWidget implements ILandingViewWidget, ISettingsAwareWidget
{
    protected _landingView: HabboLandingView | null;
    protected _container: IWindowContainer | null = null;
    private _targetCatalogPageName: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::CatalogPromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::get xmlAssetName()
    protected get xmlAssetName(): string
    {
        return 'catalog_promo';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow(this.xmlAssetName) as IWindowContainer | null;
        this._targetCatalogPageName = this._landingView!.getProperty('landing.view.catalog.promo.target');

        const picture = this._container?.findChildByName('picture') as IStaticBitmapWrapperWindow | null;

        if(picture) picture.assetUri = this._landingView!.getProperty('landing.view.catalog.promo.image.uri');

        const openPageButton = this._container?.findChildByName('open_page_button');

        if(openPageButton) openPageButton.procedure = this.onOpenPageButtonClicked;

        if(this._container)
        {
            this._container.visible = !(this._targetCatalogPageName === '' && (picture?.assetUri ?? '') === '');
        }

        const localizedCaptions: Record<string, string> = {
            catalog_promo_caption: 'landing.view.catalog.promo.caption',
            catalog_promo_info: 'landing.view.catalog.promo.info',
            open_page_button: 'landing.view.catalog.open.page',
            catalog_promo_picture_text: 'landing.view.catalog.promo.picture.text',
            catalog_promo_title: 'landing.view.catalog.promo.title',
        };

        for(const [childName, localizationKey] of Object.entries(localizedCaptions))
        {
            this.setCustomLocalization(childName, localizationKey, this._targetCatalogPageName);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::refresh()
    refresh(): void
    {
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;

        if(this._container)
        {
            this._container.dispose();
            this._container = null;
        }
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::onOpenPageButtonClicked()
    private onOpenPageButtonClicked = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.catalog?.openCatalogPage(this._targetCatalogPageName);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::setCustomLocalization()
    private setCustomLocalization(childName: string, localizationKey: string, targetPageName: string): void
    {
        const fullKey = `${localizationKey}.${targetPageName}`;
        const localization = this._landingView?.localization?.getLocalizationRaw(fullKey);

        if(localization)
        {
            const child = this._container?.findChildByName(childName);

            if(child)
            {
                child.caption = '${' + fullKey + '}';
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }
}
