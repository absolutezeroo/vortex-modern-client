/**
 * NikoTrophyView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/NikoTrophyView.as
 *
 * The two Niko trophies (silver = view type 10, gold = 20) get their own promotional frame:
 * a fixed description, a dated line, a preview image, and an app-store link.
 *
 * Takes the concrete TrophyFurniWidget rather than ITrophyFurniWidget — AS3 does the same,
 * because this view also reads `localizations` and `configuration`, neither of which is on
 * the interface.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextLinkWindow} from '@core/window/components/ITextLinkWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {ITrophyView} from './ITrophyView';
import type {TrophyFurniWidget} from './TrophyFurniWidget';

export class NikoTrophyView implements ITrophyView
{
    private _viewType: number;
    private _widget: TrophyFurniWidget | null;
    private _window: IWindowContainer | null = null;

    // AS3: NikoTrophyView.as::NikoTrophyView()
    constructor(widget: TrophyFurniWidget, viewType: number)
    {
        this._widget = widget;
        this._viewType = viewType;
    }

    /**
     * AS3: NikoTrophyView.as::showInterface()
     *
     * As in TrophyView, AS3's `getAssetByName("niko_trophy")` + `buildFromXML()` collapse into
     * this port's `buildWidgetLayout('niko_trophy')`.
     */
    public showInterface(): boolean
    {
        if(!this._widget) return false;

        if(this._window === null)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('niko_trophy') as IWindowContainer | null;

            if(this._window === null) return false;
        }

        this._window.center();

        const close = this._window.findChildByName('header_button_close');

        if(close !== null) close.procedure = this.onCloseElem;

        const textbox = this._window.findChildByName('html_textbox') as ITextWindow | null;

        if(textbox !== null)
        {
            // AS3 switches on viewType - 10, so only the two Niko types match; any other value
            // leaves the description untouched rather than defaulting to one of them.
            switch(this._viewType - 10)
            {
                case 0:
                    textbox.text = this._widget.localizations?.getLocalization('niko.trophy.description.silver') ?? '';
                    break;
                case 10:
                    textbox.text = this._widget.localizations?.getLocalization('niko.trophy.description.gold') ?? '';
                    break;
            }
        }

        const storeLink = this._window.findChildByName('store_link') as ITextLinkWindow | null;

        if(storeLink !== null) storeLink.procedure = this.onAppstoreLink;

        const date = this._window.findChildByName('date') as ITextWindow | null;

        if(date !== null)
        {
            // AS3 registers the parameter then reads the localization back; this port's
            // getLocalizationWithParams() is exactly that pair.
            date.text = this._widget.localizations?.getLocalizationWithParams(
                'trophy.niko.date', '', 'date', this._widget.date
            ) ?? '';
        }

        const preview = this._window.findChildByName('preview_image') as IStaticBitmapWrapperWindow | null;

        if(preview !== null)
        {
            // AS3 compares against the literal 20 here rather than its own VIEW_NIKO_GOLD
            // constant; kept literal so this file needs only a type-import of
            // TrophyFurniWidget, which is what keeps the two out of an import cycle.
            preview.assetUri = this._viewType === 20
                ? '${image.library.url}niko/niko_trophy_gold.png'
                : '${image.library.url}niko/niko_trophy_silver.png';
        }

        const storeImage = this._window.findChildByName('store_image') as IStaticBitmapWrapperWindow | null;

        if(storeImage !== null)
        {
            const image = this._widget.configuration?.getProperty('niko.trophy.appstore.image') ?? '';

            storeImage.assetUri = `\${image.library.url}niko/${image}.png`;
        }

        const appstoreRegion = this._window.findChildByName('appstore_region') as IRegionWindow | null;

        if(appstoreRegion !== null) appstoreRegion.procedure = this.onAppstoreLink;

        return true;
    }

    // AS3: NikoTrophyView.as::disposeInterface()
    public disposeInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: NikoTrophyView.as::onAppstoreLink()
    private onAppstoreLink = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const url = this._widget?.configuration?.getProperty('niko.appstore.link.url') ?? '';

        HabboWebTools.openWebPage(url, 'habboMain');
    };

    // AS3: NikoTrophyView.as::onCloseElem()
    private onCloseElem = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.disposeInterface();
        }
    };

    // AS3: NikoTrophyView.as::dispose()
    public dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._widget = null;
    }
}
