import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {ConcurrentUsersGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/ConcurrentUsersGoalProgressMessageParser';
import {ConcurrentUsersGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/ConcurrentUsersGoalProgressMessageEvent';
import {GetConcurrentUsersGoalProgressMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetConcurrentUsersGoalProgressMessageComposer';
import {GetConcurrentUsersRewardMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetConcurrentUsersRewardMessageComposer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {TextElementHandler} from './TextElementHandler';

const STATE_DISABLED = 0;
const STATE_ACTIVE = 1;
const STATE_REDEEM = 2;
const STATE_REWARDED = 3;
const UPDATE_INTERVAL_MS = 5000;

/**
 * Concurrent-users challenge info card: shows progress toward a concurrent
 * users goal, polls for updates while the landing view is visible, and lets
 * the user redeem the reward once achieved.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/ConcurrentUsersInfoElementHandler.as
 */
export class ConcurrentUsersInfoElementHandler implements IElementHandler, IDisposable
{
    private _landingView: HabboLandingView | null = null;
    private _ownerWidget: GenericWidget | null = null;
    private _localizationKey: string = '';
    private _state: number = -1;
    private _userCount: number = -1;
    private _userCountGoal: number = -1;
    private _window: IWindowContainer | null = null;
    private _updateIntervalId: ReturnType<typeof setInterval> | null = null;
    private _disposed: boolean = false;

    constructor()
    {
        this._updateIntervalId = setInterval(this.onUpdateTimer, UPDATE_INTERVAL_MS);
    }

    private onUpdateTimer = (): void =>
    {
        if(!this._window || !this._window.visible || !this._landingView?.isLandingViewVisible) return;

        this.refresh();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/ConcurrentUsersInfoElementHandler.as::dispose()
    dispose(): void
    {
        if(this._updateIntervalId !== null)
        {
            clearInterval(this._updateIntervalId);
            this._updateIntervalId = null;
        }

        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/ConcurrentUsersInfoElementHandler.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        this._ownerWidget = ownerWidget;
        this._landingView = landingView;
        this._window = window as IWindowContainer;
        this._localizationKey = params[1];

        const usersDesc = this._window.findChildByName('users_desc');

        if(usersDesc)
        {
            usersDesc.caption = '${' + this._localizationKey + '}';
        }

        const badgeImage = this._window.findChildByName('badge_image') as IStaticBitmapWrapperWindow | null;
        const badgeName = params.length > 2 ? params[2] : 'ConcurrentUsersReward';

        if(badgeImage)
        {
            // AS3's crypted tree says ".png" here, but the unobfuscated 2016 PRODUCTION
            // tree says ".gif", and real badge assets are gifs (confirmed empirically) -
            // the crypted decompiler corrupted this literal (same bug in BadgeImageWidget,
            // RewardBadgeElementHandler, FurnitureBadgeDisplayVisualization).
            badgeImage.assetUri = '${image.library.url}album1584/' + badgeName + '.gif';
        }

        this.updateLocalization();

        window.procedure = this.onButton;

        landingView.communicationManager?.addHabboConnectionMessageEvent(new ConcurrentUsersGoalProgressMessageEvent(this.onConcurrentUsersGoalProgress));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/ConcurrentUsersInfoElementHandler.as::refresh()
    refresh(): void
    {
        this._landingView?.send(new GetConcurrentUsersGoalProgressMessageComposer());
    }

    private updateLocalization(): void
    {
        if(!this._landingView || !this._window) return;

        let captionKey = 'landing.view.concurrentusers.caption';
        let bodyTextKey = 'landing.view.concurrentusers.bodytext';

        this._landingView.windowManager?.registerLocalizationParameter(this._localizationKey, 'userCount', this._userCount.toString());
        this._landingView.windowManager?.registerLocalizationParameter(this._localizationKey, 'userGoal', this._userCountGoal.toString());
        this._landingView.windowManager?.registerLocalizationParameter('landing.view.concurrentusers.bodytext', 'userCount', this._userCount.toString());
        this._landingView.windowManager?.registerLocalizationParameter('landing.view.concurrentusers.bodytext', 'userGoal', this._userCountGoal.toString());
        this._landingView.windowManager?.registerLocalizationParameter(
            'landing.view.concurrentusers.bodytext',
            'domain',
            this._landingView.localization?.getLocalization('landing.view.hotel.domain', 'Habbo') ?? 'Habbo'
        );

        switch(this._state)
        {
            case STATE_DISABLED:
            case STATE_ACTIVE:
            {
                this.setVisible('state.active', true);
                this.setVisible('state.achieved', false);
                break;
            }
            case STATE_REDEEM:
            {
                if(this._updateIntervalId !== null)
                {
                    clearInterval(this._updateIntervalId);
                    this._updateIntervalId = null;
                }

                captionKey += '.success';
                bodyTextKey += '.success';
                this.setVisible('state.active', false);
                this._window.findChildByName('state.active')?.enable();
                this.setVisible('state.achieved', true);
                this.setVisible('action_button', true);
                break;
            }
            case STATE_REWARDED:
            {
                if(this._updateIntervalId !== null)
                {
                    clearInterval(this._updateIntervalId);
                    this._updateIntervalId = null;
                }

                captionKey += '.success';
                bodyTextKey += '.success';
                this.setVisible('state.active', false);
                this.setVisible('state.achieved', true);
                this.setVisible('action_button', false);
                break;
            }
        }

        const bodyText = (this._ownerWidget?.getElementByName('bodytext') ?? null) as TextElementHandler | null;

        if(bodyText)
        {
            bodyText.localizationKey = bodyTextKey;
        }

        const caption = (this._ownerWidget?.getElementByName('caption') ?? null) as TextElementHandler | null;

        if(caption)
        {
            caption.localizationKey = captionKey;
        }
    }

    private setVisible(name: string, visible: boolean): void
    {
        const child = this._window?.findChildByName(name);

        if(child)
        {
            child.visible = visible;
        }
    }

    private onConcurrentUsersGoalProgress = (event: IMessageEvent): void =>
    {
        const parser = event.parser as ConcurrentUsersGoalProgressMessageParser | null;

        if(!parser) return;

        this._state = parser.state;
        this._userCount = parser.userCount;
        this._userCountGoal = parser.userCountGoal;
        this.updateLocalization();
    };

    private onButton = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.onClick();
        }
    };

    private onClick(): void
    {
        this._landingView?.send(new GetConcurrentUsersRewardMessageComposer());
        this._landingView?.send(new GetConcurrentUsersGoalProgressMessageComposer());
        this._window?.findChildByName('state.active')?.disable();
    }
}
