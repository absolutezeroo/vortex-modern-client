import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import {CommunityGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent';
import type {CommunityGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressMessageParser';
import {GetCommunityGoalProgressMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalProgressMessageComposer';

/**
 * "Habbo Way" community promo - shows the current community total score,
 * opens the Habbo Way help page on click.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as
 */
export class HabboWayPromoWidget implements ILandingViewWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _communityTotalScore: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::HabboWayPromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('habbo_way_promo') as IWindowContainer | null;

        const goButton = this._container?.findChildByName('go_button');

        if(goButton)
        {
            goButton.procedure = this.onGoButton;
        }

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(
            new CommunityGoalProgressMessageEvent(this.onCommunityGoalProgress)
        );
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::refresh()
    refresh(): void
    {
        this._landingView?.send(new GetCommunityGoalProgressMessageComposer());
        this.refreshContent();
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::onGoButton()
    private onGoButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.habboHelp?.showHabboWay();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::onCommunityGoalProgress()
    private onCommunityGoalProgress = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CommunityGoalProgressMessageParser | null;

        this._communityTotalScore = parser?.data?.communityTotalScore ?? 0;
        this.refreshContent();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/HabboWayPromoWidget.as::refreshContent()
    private refreshContent(): void
    {
        let counterText = String(this._communityTotalScore);

        while(counterText.length < 8)
        {
            counterText = '0' + counterText;
        }

        const counterTxt = this._container?.findChildByName('counter_txt');

        if(counterTxt)
        {
            counterTxt.caption = counterText;
        }
    }
}
