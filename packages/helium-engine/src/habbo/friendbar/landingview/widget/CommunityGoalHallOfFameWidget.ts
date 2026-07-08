import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboLandingView} from '../HabboLandingView';
import type {HallOfFameEntryData} from '@habbo/communication/messages/parser/quest/HallOfFameEntryData';
import {UserListWidget} from './UserListWidget';
import type {CommunityGoalHallOfFameData} from '@habbo/communication/messages/parser/quest/CommunityGoalHallOfFameData';
import {CommunityGoalHallOfFameMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameMessageEvent';
import type {CommunityGoalHallOfFameMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalHallOfFameMessageParser';
import {GetCommunityGoalHallOfFameMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalHallOfFameMessageComposer';
import {CurrentTimingCodeMessageEvent} from '@habbo/communication/messages/incoming/competition/CurrentTimingCodeMessageEvent';
import type {CurrentTimingCodeMessageEventParser} from '@habbo/communication/messages/parser/competition/CurrentTimingCodeMessageEventParser';
import {GetCurrentTimingCodeMessageComposer} from '@habbo/communication/messages/outgoing/competition/GetCurrentTimingCodeMessageComposer';
import {ForwardToACompetitionRoomMessageComposer} from '@habbo/communication/messages/outgoing/competition/ForwardToACompetitionRoomMessageComposer';

/**
 * Top-10 leaderboard for the active community goal, in the 6th dynamic
 * slot. Content is scheduled: it polls the current timing code for its
 * configured schedule string and re-requests hall-of-fame data (with
 * per-campaign avatar-list layout overrides) whenever the code changes.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalHallOfFameWidget.as
 */
export class CommunityGoalHallOfFameWidget extends UserListWidget
{
    private _hallOfFameData: CommunityGoalHallOfFameData | null = null;
    private _schedulingStr: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalHallOfFameWidget.as::CommunityGoalHallOfFameWidget()
    constructor(landingView: HabboLandingView)
    {
        super(landingView);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalHallOfFameWidget.as::initialize()
    override initialize(): void
    {
        super.initialize();
        this._schedulingStr = this.landingView?.getProperty('landing.view.dynamic.slot.6.conf') ?? '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalHallOfFameWidget.as::registerMessageListeners()
    protected override registerMessageListeners(): void
    {
        this.landingView?.communicationManager?.addHabboConnectionMessageEvent(
            new CommunityGoalHallOfFameMessageEvent(this.onCommunityGoalHallOfFame)
        );
        this.landingView?.communicationManager?.addHabboConnectionMessageEvent(
            new CurrentTimingCodeMessageEvent(this.onTimingCode)
        );
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalHallOfFameWidget.as::refresh()
    override refresh(): void
    {
        this.landingView?.send(new GetCurrentTimingCodeMessageComposer(this._schedulingStr));
    }

    protected override get users(): HallOfFameEntryData[] | null
    {
        return this._hallOfFameData?.hof ?? null;
    }

    protected override refreshPopup(entry: HallOfFameEntryData, popup: IWindowContainer): void
    {
        const userNameText = popup.findChildByName('user_name_txt');

        if(userNameText) userNameText.caption = entry.userName;

        this.landingView?.localization?.registerParameter('landing.view.competition.hof.points', 'points', '' + entry.currentScore);

        const scoreText = popup.findChildByName('score_txt');

        if(scoreText) scoreText.caption = this.getText('landing.view.competition.hof.points');

        const rankDescText = popup.findChildByName('rank_desc_txt');

        if(rankDescText && this._hallOfFameData)
        {
            rankDescText.caption = this.getText('landing.view.competition.hof.' + this._hallOfFameData.goalCode + '.rankdesc.leader');
        }
    }

    protected override getPopupXml(): string
    {
        return 'competition_user_popup';
    }

    private onCommunityGoalHallOfFame = (event: IMessageEvent): void =>
    {
        this._hallOfFameData = (event.parser as CommunityGoalHallOfFameMessageParser | null)?.data ?? null;
        this.refreshContent();
    };

    protected override hasExtraLink(): boolean
    {
        return this.landingView?.getBoolean('landing.view.communitygoalhof.hasroomlink') ?? false;
    }

    protected override extraLinkClicked(entry: HallOfFameEntryData): void
    {
        if(!this._hallOfFameData) return;

        this.landingView?.send(new ForwardToACompetitionRoomMessageComposer(this._hallOfFameData.goalCode, entry.userId));
    }

    private onTimingCode = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CurrentTimingCodeMessageEventParser | null;

        if(!parser) return;

        const code = parser.code;

        if(parser.schedulingStr === this._schedulingStr && code !== '' && !this.disposed)
        {
            this.loadConfigurationOverrides(code);
            this.landingView?.send(new GetCommunityGoalHallOfFameMessageComposer(code));
        }
    };

    private loadConfigurationOverrides(code: string): void
    {
        const landingView = this.landingView;

        if(!landingView) return;

        const yOffsetsKey = 'landing.view.' + code + '.avatarlist.yoffsets.array';

        if(landingView.propertyExists(yOffsetsKey))
        {
            this.avatarOffsetsY = landingView.getProperty(yOffsetsKey).split(',').map((value) => parseInt(value, 10));
        }

        const widthsKey = 'landing.view.' + code + '.avatarlist.widths.array';

        if(landingView.propertyExists(widthsKey))
        {
            this.avatarContainerWidths = landingView.getProperty(widthsKey).split(',').map((value) => parseInt(value, 10));
        }

        const startOffsetKey = 'landing.view.' + code + '.avatarlist.startoffset';

        if(landingView.propertyExists(startOffsetKey))
        {
            this.startOffset = parseInt(landingView.getProperty(startOffsetKey), 10);
        }
    }
}
