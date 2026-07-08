import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';
import {Logger} from '@core/utils/Logger';
import {CommunityGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent';
import type {CommunityGoalProgressData} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressData';
import type {CommunityGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressMessageParser';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import {UserChangeMessageEvent} from '@habbo/communication/messages/incoming/room/action/UserChangeMessageEvent';
import type {UserChangeMessageEventParser} from '@habbo/communication/messages/parser/room/action/UserChangeMessageEventParser';

const log = Logger.getLogger('CommunityGoalPrizesWidget');

/**
 * Rank-tier prize breakdown for the active community goal (top 1/2/3 reward
 * bands) plus the current user's personal rank/points and avatar preview.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as
 */
export class CommunityGoalPrizesWidget implements ILandingViewWidget, ISettingsAwareWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _communityProgress: CommunityGoalProgressData | null = null;
    private _ownFigure: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::CommunityGoalPrizesWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
        this._communityProgress = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('achievement_competition_prizes') as IWindowContainer | null;

        const communicationManager = this._landingView!.communicationManager;

        communicationManager?.addHabboConnectionMessageEvent(new CommunityGoalProgressMessageEvent(this.onCommunityGoalProgress));
        communicationManager?.addHabboConnectionMessageEvent(new UserChangeMessageEvent(this.onUserChange));
        communicationManager?.addHabboConnectionMessageEvent(new UserObjectMessageEvent(this.onUserObject));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::refresh()
    refresh(): void
    {
        this.refreshContent();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    private refreshContent(): void
    {
        if(!this._container) return;

        if(!this._communityProgress)
        {
            this._container.visible = false;
            return;
        }

        this._container.visible = true;
        this.setPrizeRankLimits(1);
        this.setPrizeRankLimits(2);
        this.setPrizeRankLimits(3);

        const progress = this._communityProgress;
        const localization = this._landingView!.localization;

        localization?.registerParameter(this.getCompetitionSpecificKey('yourrankinfo'), 'points', '' + progress.personalContributionScore);

        this.setCaption('caption_txt', this.getCompetitionSpecificText('caption'));
        this.setCaption('info_txt', this.getCompetitionSpecificText('info'));
        this.setCaption('reward_name_txt', this.getCompetitionSpecificText('rewardname'));
        this.setCaption('reward_info_txt', this.getCompetitionSpecificText('rewardinfo'));
        this.setCaption('rank_1_txt', this.getCompetitionSpecificText('rank1'));
        this.setCaption('rank_2_txt', this.getCompetitionSpecificText('rank2'));
        this.setCaption('rank_3_txt', this.getCompetitionSpecificText('rank3'));

        const userRankBorder = this._container.findChildByName('user_rank_border');

        if(userRankBorder)
        {
            userRankBorder.visible = !progress.hasGoalExpired || progress.personalContributionRank > 0;
        }

        const rankKey = progress.hasGoalExpired
            ? 'yourfinalrank'
            : (progress.personalContributionRank > 0 ? 'yourrank' : 'youarenotranked');

        localization?.registerParameter(this.getKey(rankKey), 'rank', '' + progress.personalContributionRank);
        this.setCaption('user_rank_txt', this.getText(rankKey));

        const userRankInfoText = this._container.findChildByName('user_rank_info_txt');

        if(userRankInfoText)
        {
            userRankInfoText.visible = !progress.hasGoalExpired;
            userRankInfoText.caption = this.getCompetitionSpecificText(progress.personalContributionRank > 0 ? 'yourrankinfo' : 'youarenotrankedinfo');
        }

        const rewardImage = this._container.findChildByName('reward_image') as IStaticBitmapWrapperWindow | null;

        if(rewardImage)
        {
            rewardImage.assetUri = '${image.library.url}reception/' + progress.goalCode + 'Reward.png';
        }
    }

    private setCaption(elementName: string, caption: string): void
    {
        const element = this._container?.findChildByName(elementName);

        if(element) element.caption = caption;
    }

    private setPrizeRankLimits(rankTier: number): void
    {
        let startRank = 1;

        for(let i = 0; i < rankTier; i++)
        {
            startRank += this.resolveStartRank(rankTier - i);
        }

        let endRank = 0;

        for(let i = 0; i < rankTier; i++)
        {
            endRank += this.resolveEndRank(rankTier - i);
        }

        const key = startRank === endRank ? this.getKey('rank') : this.getKey('ranks');
        const caption = this._landingView!.localization?.getLocalizationWithParams(key, '', 'start', String(startRank), 'end', String(endRank)) ?? '';

        this.setCaption('rank_' + rankTier + '_info_txt', caption);
    }

    private resolveStartRank(rankTier: number): number
    {
        return this._communityProgress?.rewardUserLimits[rankTier - 2] ?? 0;
    }

    private resolveEndRank(rankTier: number): number
    {
        return this._communityProgress?.rewardUserLimits[rankTier - 1] ?? 0;
    }

    private onCommunityGoalProgress = (event: IMessageEvent): void =>
    {
        this._communityProgress = (event.parser as CommunityGoalProgressMessageParser | null)?.data ?? null;
        this.refreshContent();
    };

    private getKey(suffix: string): string
    {
        return 'landing.view.competition.prizes.' + suffix;
    }

    private getCompetitionSpecificKey(suffix: string): string
    {
        const key = this.getKey((this._communityProgress?.goalCode ?? '') + '.' + suffix);

        log.debug('foobar: ' + key);
        return key;
    }

    private getCompetitionSpecificText(suffix: string): string
    {
        return '${' + this.getCompetitionSpecificKey(suffix) + '}';
    }

    private getText(key: string): string
    {
        return '${' + this.getKey(key) + '}';
    }

    private onUserObject = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserObjectMessageParser | null;

        if(!parser) return;

        this._ownFigure = parser.figure;
        this.refreshAvatarInfo();
    };

    private onUserChange = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserChangeMessageEventParser | null;

        if(parser && parser.id === -1)
        {
            this._ownFigure = parser.figure;
            this.refreshAvatarInfo();
        }
    };

    private refreshAvatarInfo(): void
    {
        const avatarWidgetWindow = this._container?.findChildByName('avatar_image') as IWidgetWindow | null;
        const avatarWidget = (avatarWidgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(avatarWidget)
        {
            avatarWidget.figure = this._ownFigure;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalPrizesWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }
}
