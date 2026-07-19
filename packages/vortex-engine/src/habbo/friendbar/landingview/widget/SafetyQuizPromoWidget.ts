import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {AvatarImageWidget as GenericAvatarImageWidget} from '@habbo/window/widgets/AvatarImageWidget';

/**
 * Safety-quiz promo with an avatar preview, opens the safety booklet on
 * click.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as
 */
export class SafetyQuizPromoWidget implements ILandingViewWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _disposed: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as::SafetyQuizPromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('safety_quiz_promo') as IWindowContainer | null;

        if(this._container) this._container.procedure = this.widgetProcedure;

        this.refresh();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as::widgetProcedure()
    private widgetProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && window.name === 'safety_quiz_button')
        {
            this._landingView?.habboHelp?.showSafetyBooklet();
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as::refresh()
    refresh(): void
    {
        if(!this._container || this._container.disposed) return;

        const avatarWindow = this._container.findChildByName('avatar') as IWidgetWindow | null;
        const avatarWidget = avatarWindow?.widget as GenericAvatarImageWidget | null;

        if(avatarWidget && this._landingView?.sessionData)
        {
            avatarWidget.figure = this._landingView.sessionData.figure;
        }
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/SafetyQuizPromoWidget.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._container)
        {
            this._container.dispose();
            this._container = null;
        }

        this._landingView = null;
        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }
}
