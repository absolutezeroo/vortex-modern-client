import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import {HabboLandingView as HabboLandingViewClass} from '../HabboLandingView';

/**
 * Static moderation-team promo tile.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as
 */
export class HabboModerationPromoWidget implements ILandingViewWidget
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::_landingView
    private _landingView: HabboLandingView | null;
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::_container
    private _container: IWindowContainer | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::HabboModerationPromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('habbo_moderation_promo') as IWindowContainer | null;

        if(this._container)
        {
            HabboLandingViewClass.positionAfterAndStretch(this._container, 'title_txt', 'hdr_line');
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::refresh()
    refresh(): void
    {
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/HabboModerationPromoWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }
}
