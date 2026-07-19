import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';

/**
 * Talent-track promo tile - "go" button tracks the click and opens the
 * current talent track.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as
 */
export class HabboTalentsPromoWidget implements ILandingViewWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::HabboTalentsPromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('habbo_talents_promo') as IWindowContainer | null;

        const goButton = this._container?.findChildByName('go_button');

        if(goButton)
        {
            goButton.procedure = this.onGoButton;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::refresh()
    refresh(): void
    {
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboTalentsPromoWidget.as::onGoButton()
    private onGoButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const landingView = this._landingView;

        if(!landingView) return;

        const currentTalentTrack = landingView.sessionData?.currentTalentTrack ?? '';

        landingView.tracking?.trackTalentTrackOpen(currentTalentTrack, 'landingpagepromo');
        landingView.send(new GetTalentTrackMessageComposer(currentTalentTrack));
    };
}
