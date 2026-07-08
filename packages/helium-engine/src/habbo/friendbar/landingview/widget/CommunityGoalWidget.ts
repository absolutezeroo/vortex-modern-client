import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {CommunityGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent';
import type {CommunityGoalProgressData} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressData';
import type {CommunityGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressMessageParser';
import {GetCommunityGoalProgressMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalProgressMessageComposer';

/**
 * Community-goal meter widget: shows aggregate/personal contribution
 * progress toward a campaign goal, with an animated needle that "builds up"
 * from 0 to its target frame on first load.
 *
 * NOTE: `CommunityGoalProgressMessageEvent`/`GetCommunityGoalProgressMessageComposer`
 * are ported but not yet registered in HabboMessages.ts (pre-existing gap,
 * outside this widget's scope) - send()/listen() are harmless no-ops until
 * that registration lands.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as
 */
export class CommunityGoalWidget implements IUpdateReceiver, ILandingViewWidget, ISettingsAwareWidget
{
    private static readonly METER_INITIAL_DELAY_MS: number = 1500;
    private static readonly METER_BUILDUP_TIME_MS: number = 1000;
    private static readonly CHALLENGE_LEVEL_NEEDLE_BASE_FRAMES: number[] = [0, 8, 16, 23];

    protected _landingView: HabboLandingView | null;
    protected _container: IWindowContainer | null = null;
    private _meterNeedle: IStaticBitmapWrapperWindow | null = null;
    protected _communityProgress: CommunityGoalProgressData | null = null;
    private _progressRequestPending: boolean = false;
    private _updateElapsed: number = 0;
    private _buildupProgress: number = 0;
    private _localizationsInitialized: boolean = false;
    private _catalogButtonInteractive: boolean = true;
    private _votingMode: boolean;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::CommunityGoalWidget()
    constructor(landingView: HabboLandingView, votingMode: boolean = false)
    {
        this._landingView = landingView;
        this._votingMode = votingMode;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::dispose()
    dispose(): void
    {
        if(this._landingView?.windowManager)
        {
            this._landingView.windowManager.removeUpdateReceiver(this);
        }

        this._landingView = null;
        this._container = null;
        this._communityProgress = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::initialize()
    initialize(): void
    {
        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(
            new CommunityGoalProgressMessageEvent(this.onCommunityGoalProgress)
        );

        this._container = (this._votingMode
            ? this._landingView!.getXmlWindow('community_goal_voting')
            : this._landingView!.getXmlWindow('community_goal')) as IWindowContainer | null;

        if(!this._container) return;

        this._meterNeedle = this._container.findChildByName('meter_needle') as IStaticBitmapWrapperWindow | null;

        if(!this._votingMode)
        {
            const catalogButton = this._container.findChildByName('community_catalog_button');

            this._catalogButtonInteractive = this._landingView!.getBoolean('landing.view.community.interactive');

            if(catalogButton)
            {
                catalogButton.visible = this._catalogButtonInteractive;
                catalogButton.procedure = this.onCommunityCatalogButtonClick;
            }
        }

        HabboLandingView.positionAfterAndStretch(this._container, 'community_title', 'hdr_line');
    }

    private campaignizeMeterElementAssetUri(element: IWindow | null): void
    {
        if(!element || !this._communityProgress) return;

        const bitmap = element as IStaticBitmapWrapperWindow;
        const extIndex = bitmap.assetUri.indexOf('.png');

        bitmap.assetUri = bitmap.assetUri.substr(0, extIndex) + '_' + this._communityProgress.goalCode + '.png';
    }

    protected setCampaignLocalization(elementName: string, localizationKey: string): void
    {
        if(!this._container || !this._communityProgress) return;

        const element = this._container.findChildByName(elementName);

        if(element)
        {
            element.caption = '${' + localizationKey + '.' + this._communityProgress.goalCode + '}';
        }
    }

    protected getCurrentNeedleFrame(): number
    {
        if(!this._communityProgress) return 0;

        const frames = CommunityGoalWidget.CHALLENGE_LEVEL_NEEDLE_BASE_FRAMES;

        if(this._communityProgress.communityHighestAchievedLevel >= frames.length - 1)
        {
            return frames[frames.length - 1];
        }

        const baseFrame = frames[this._communityProgress.communityHighestAchievedLevel];
        const frameSpan = frames[this._communityProgress.communityHighestAchievedLevel + 1] - baseFrame;

        return baseFrame + Math.floor(this._communityProgress.percentCompletionTowardsNextLevel * (frameSpan + 0.001) / 100);
    }

    private initializeLocalizations(): void
    {
        if(!this._container || !this._communityProgress || this._communityProgress.goalCode == null) return;

        const frames = CommunityGoalWidget.CHALLENGE_LEVEL_NEEDLE_BASE_FRAMES;

        for(let i = 0; i < frames.length; i++)
        {
            this.campaignizeMeterElementAssetUri(this._container.findChildByName('meter_level_' + i));

            if(i > 0)
            {
                this.campaignizeMeterElementAssetUri(this._container.findChildByName('meter_level_' + i + '_icon'));
                this.campaignizeMeterElementAssetUri(this._container.findChildByName('meter_level_' + i + '_icon_locked'));
            }
        }

        this.setCampaignLocalization('community_title', 'landing.view.community.headline');
        this.setCampaignLocalization('goal_caption', 'landing.view.community.caption');
        this.setCampaignLocalization('goal_info', 'landing.view.community.info');
        this.setCampaignLocalization('community_catalog_button', 'landing.view.community_catalog_button.text');
        this._localizationsInitialized = true;
    }

    private refreshContent(): void
    {
        if(!this._container) return;

        if(!this._communityProgress)
        {
            this._container.visible = false;
            return;
        }

        if(!this._localizationsInitialized)
        {
            this.initializeLocalizations();
        }

        const frames = CommunityGoalWidget.CHALLENGE_LEVEL_NEEDLE_BASE_FRAMES;

        for(let i = 1; i < frames.length; i++)
        {
            const level = this._container.findChildByName('meter_level_' + i);
            const icon = this._container.findChildByName('meter_level_' + i + '_icon');
            const iconLocked = this._container.findChildByName('meter_level_' + i + '_icon_locked');

            if(level) level.visible = false;
            if(icon) icon.visible = false;
            if(iconLocked) iconLocked.visible = false;
        }

        const localization = this._landingView!.localization;

        localization?.registerParameter('landing.view.community.meter', 'userRank', this._communityProgress.personalContributionRank.toString());
        localization?.registerParameter('landing.view.community.meter', 'userAmount', this._communityProgress.personalContributionScore.toString());
        localization?.registerParameter('landing.view.community.meter', 'totalAmount', this._communityProgress.communityTotalScore.toString());

        if(this._communityProgress.goalCode != null)
        {
            localization?.registerParameter(
                'landing.view.community.meter.' + this._communityProgress.goalCode,
                'totalAmount',
                this._communityProgress.communityTotalScore.toString()
            );
            this.setCampaignLocalization('community_total_status', 'landing.view.community.meter');

            if(this._votingMode)
            {
                this.setCampaignLocalization('community_vote_one_button', 'landing.view.vote_one_button.text');
                this.setCampaignLocalization('community_vote_two_button', 'landing.view.vote_two_button.text');
            }
        }

        const goalInfo = this._container.findChildByName('goal_info') as ITextWindow | null;

        if(goalInfo)
        {
            goalInfo.height = goalInfo.textHeight + 6;
        }

        if(!this._votingMode)
        {
            const catalogButton = this._container.findChildByName('community_catalog_button');

            if(catalogButton) catalogButton.visible = this._catalogButtonInteractive;
        }

        this._container.visible = true;
        this._container.invalidate();
    }

    protected updateMeter(frame: number, animateLevels: boolean = true): void
    {
        if(!this._container) return;

        const frames = CommunityGoalWidget.CHALLENGE_LEVEL_NEEDLE_BASE_FRAMES;

        for(let i = 1; i < frames.length; i++)
        {
            const reached = animateLevels && frame >= frames[i];
            const level = this._container.findChildByName('meter_level_' + i);
            const icon = this._container.findChildByName('meter_level_' + i + '_icon');
            const iconLocked = this._container.findChildByName('meter_level_' + i + '_icon_locked');

            if(level) level.visible = reached;
            if(icon) icon.visible = reached;
            if(iconLocked) iconLocked.visible = !reached;
        }

        if(this._meterNeedle)
        {
            this._meterNeedle.assetUri = 'landing_view_needle_meter_needle' + frame;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::refresh()
    refresh(): void
    {
        this.requestCommunityGoalProgress();
        this.refreshContent();
    }

    private requestCommunityGoalProgress(): void
    {
        if(!this._progressRequestPending)
        {
            this._landingView!.send(new GetCommunityGoalProgressMessageComposer());
            this._progressRequestPending = true;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::update()
    update(elapsedTime: number): void
    {
        this._updateElapsed += elapsedTime;

        if(this._updateElapsed > CommunityGoalWidget.METER_INITIAL_DELAY_MS)
        {
            this._buildupProgress += elapsedTime / 1000;

            if(this._buildupProgress > 1)
            {
                this._buildupProgress = 1;
                this._landingView?.windowManager?.removeUpdateReceiver(this);
            }

            this.updateMeter(Math.floor(this.getCurrentNeedleFrame() * this._buildupProgress));
        }
    }

    private onCommunityGoalProgress = (event: IMessageEvent): void =>
    {
        this._communityProgress = (event.parser as CommunityGoalProgressMessageParser | null)?.data ?? null;
        this._progressRequestPending = false;
        this.refreshContent();
        this._landingView?.windowManager?.registerUpdateReceiver(this, 10);
    };

    private onCommunityCatalogButtonClick = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            const target = this._landingView!.getProperty('landing.view.community.catalog.target');

            this._landingView!.catalog?.openCatalogPage(target);
            this._landingView!.tracking?.trackGoogle('landingView', 'click_communityCatalogTarget');
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }

    protected get communityProgress(): CommunityGoalProgressData | null
    {
        return this._communityProgress;
    }
}
