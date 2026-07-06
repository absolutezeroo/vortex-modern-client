import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IHTMLTextWindow} from '@core/window/components/IHTMLTextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('LocalizationCatalogWidget');

/**
 * Applies a page's PageLocalization text/image fields (and the catalog main window's
 * category header title/description/icon) to the actual window elements.
 *
 * TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::
 * initLinks()'s per-layoutCode click-handler switch (frontpage3/info_pixels/club_buy/monkey/...)
 * isn't ported - link elements get click-armed (setParamFlag/mouseThreshold) but clicking them
 * does nothing yet, since none of those legacy special pages are exercised by the ported catalog
 * pages. retrieveCatalogImage()'s network image fallback (for assets not already in the local
 * library) also isn't ported - setElementImage() just logs and skips instead.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as
 */
export class LocalizationCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    private _imageElementMap: Map<string, string> = new Map();

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onProductSelected);
        this._catalog = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.initLocalizables();
        this.initStaticImages();
        this.initLinks();
        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onProductSelected);

        return true;
    }

    private onProductSelected = (_event: SelectProductEvent): void =>
    {
    };

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::initLinks()
    // TODO(AS3): the per-layoutCode click destination switch (onClickLink()) isn't ported - see
    // class doc comment.
    private initLinks(): void
    {
        if(!this.page.hasLinks) return;

        for(const linkName of this.page.links)
        {
            const linkWindow = this.window.findChildByName(linkName);

            if(linkWindow != null)
            {
                linkWindow.setParamFlag(1);
                linkWindow.mouseThreshold = 0;
                linkWindow.addEventListener('WME_CLICK', this.onClickLink);
            }
        }
    }

    private onClickLink = (event: WindowMouseEvent): void =>
    {
        const target = event.target as unknown as IWindow;

        log.debug(`[Localization Catalog Widget] Unhandled link clicked ${[this.page.layoutCode, target?.name]}`);
    };

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::initStaticImages()
    private initStaticImages(): void
    {
        const staticImages: IWindow[] = [];

        this.window.groupChildrenWithTag('STATIC_IMAGE', staticImages, 10);

        for(const child of staticImages)
        {
            const bitmapWrapper = child as unknown as IBitmapWrapperWindow;

            if(bitmapWrapper == null) continue;

            const name = child.name;

            this._imageElementMap.set(name, name);

            if(this._catalog!.assets!.hasAsset(name))
            {
                this.setElementImage(name, name);
            }
            else
            {
                this.retrieveCatalogImage(name);
            }
        }
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::initLocalizables()
    private initLocalizables(): void
    {
        this._imageElementMap.clear();

        const headerDescription = this._catalog!.mainContainer?.findChildByName('catalog.header.description');

        if(headerDescription != null)
        {
            headerDescription.caption = '';
        }

        const localization = this.page.localization;

        for(let i = 0; i < localization.textCount; i++)
        {
            const elementName = localization.getTextElementName(i, this.page.layoutCode);
            const content = localization.getTextElementContent(i);

            const target = elementName === 'catalog.header.description'
                ? this._catalog!.mainContainer?.findChildByName(elementName) ?? null
                : this.window.findChildByName(elementName);

            if(target != null)
            {
                target.caption = content.replace(/\r\n/g, '\n');

                const htmlText = target as unknown as IHTMLTextWindow;

                if(htmlText != null && 'styleSheet' in htmlText)
                {
                    target.addEventListener('WE_LINK', this.onClickHtmlLink);
                    this.setLinkStyle(htmlText);
                }
            }
            else
            {
                log.debug(`[Localization Catalog Widget] Could not place text in layout: element: ${elementName}, content: ${content}`);
            }
        }

        for(let i = 0; i < localization.imageCount; i++)
        {
            const elementName = localization.getImageElementName(i, this.page.layoutCode);
            const content = localization.getImageElementContent(i);

            if(elementName !== '' && content !== '')
            {
                this._imageElementMap.set(content, elementName);

                if(this._catalog!.assets!.hasAsset(content))
                {
                    this.setElementImage(elementName, content);
                }
                else
                {
                    this.retrieveCatalogImage(content);
                }
            }
        }

        const node = this._catalog!.currentCatalogNavigator?.getNodeById(this.page.pageId) ?? null;
        const headerTitle = this._catalog!.mainContainer?.findChildByName('catalog.header.title');
        const headerIcon = this._catalog!.mainContainer?.findChildByName('catalog.header.icon') as unknown as IStaticBitmapWrapperWindow | null;

        if(headerTitle != null)
        {
            headerTitle.caption = node != null ? node.localization : (this.page.mode === 1 ? '${catalog.search.header}' : '${catalog.header}');
        }

        if(headerIcon != null && node != null)
        {
            headerIcon.assetUri = this.page.mode === 1
                ? 'common_small_pen'
                : (this._catalog!.catalogType === 'BUILDERS_CLUB'
                    ? `${this._catalog!.imageGalleryHost}icon_193.png`
                    : `${this._catalog!.imageGalleryHost}${node.iconName}.png`);
        }
    }

    private onClickHtmlLink = (_event: unknown): void =>
    {
    };

    private setLinkStyle(_target: IHTMLTextWindow): void
    {
        // TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::setLinkStyle()
        // Needs flash.text.StyleSheet-equivalent CSS-in-caption support on ITextWindow/IHTMLTextWindow,
        // which isn't ported.
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::setElementImage()
    private setElementImage(elementName: string, assetName: string): void
    {
        if(this.window == null || this.window.disposed) return;

        const target = elementName === 'catalog.header.image'
            ? this._catalog!.mainContainer?.findChildByName(elementName) ?? null
            : this.window.findChildByName(elementName);

        if(target == null) return;

        const bitmapWrapper = target as unknown as IBitmapWrapperWindow;

        if('bitmap' in bitmapWrapper)
        {
            const asset = this._catalog!.assets!.getAssetByName(assetName);

            if(asset == null)
            {
                log.debug(`[Localization Catalog Widget] Asset does not exist (Bitmap window): ${[elementName, assetName]}`);

                return;
            }

            bitmapWrapper.bitmap = asset.content as ImageBitmap;

            return;
        }

        const staticBitmapWrapper = target as unknown as IStaticBitmapWrapperWindow;

        if('assetUri' in staticBitmapWrapper)
        {
            staticBitmapWrapper.assetUri = `${this._catalog!.getProperty('image.library.catalogue.url')}${assetName}.gif`;

            return;
        }

        log.debug(`[Localization Catalog Widget] Could not find element: ${elementName}`);
    }

    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/LocalizationCatalogWidget.as::retrieveCatalogImage()
    // Needs assets.loadAssetFromFile() + AssetLoaderEvent wiring for a network image fallback -
    // not ported; missing local assets are just logged and skipped.
    private retrieveCatalogImage(assetName: string): void
    {
        log.debug(`[Localization Catalog Widget] Missing local asset, network fallback not ported: ${assetName}`);
    }
}
