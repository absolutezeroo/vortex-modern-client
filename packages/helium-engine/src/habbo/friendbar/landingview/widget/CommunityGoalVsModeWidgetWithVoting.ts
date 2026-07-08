import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../HabboLandingView';
import {CommunityGoalVsModeWidget} from './CommunityGoalVsModeWidget';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {CommunityVoteReceivedEvent} from '@habbo/communication/messages/incoming/landingview/votes/CommunityVoteReceivedEvent';
import type {CommunityVoteReceivedEventParser} from '@habbo/communication/messages/parser/landingview/votes/CommunityVoteReceivedEventParser';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

/**
 * "Versus" community-goal widget with two vote buttons, wired to
 * `HabboLandingView.communityGoalVote()` and `CommunityVoteReceivedEvent`
 * (both registered in HabboMessages.ts with win63_version's real header
 * ids - see CommunityGoalVoteMessageComposer.ts).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidgetWithVoting.as
 */
export class CommunityGoalVsModeWidgetWithVoting extends CommunityGoalVsModeWidget
{
    private _voteOneButton: IWindow | null = null;
    private _voteTwoButton: IWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidgetWithVoting.as::CommunityGoalVsModeWidgetWithVoting()
    constructor(landingView: HabboLandingView)
    {
        super(landingView, true);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidgetWithVoting.as::initialize()
    override initialize(): void
    {
        super.initialize();

        this._voteOneButton = this._container?.findChildByName('community_vote_one_button') ?? null;

        if(this._voteOneButton) this._voteOneButton.procedure = this.onVoteOptionOneClick;

        this._voteTwoButton = this._container?.findChildByName('community_vote_two_button') ?? null;

        if(this._voteTwoButton) this._voteTwoButton.procedure = this.onVoteOptionTwoClick;

        this._landingView?.communicationManager?.addHabboConnectionMessageEvent(new CommunityVoteReceivedEvent(this.onInfo));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidgetWithVoting.as::refresh()
    override refresh(): void
    {
        super.refresh();

        const progress = this.communityProgress;

        if(progress)
        {
            if(this._voteOneButton)
            {
                this._voteOneButton.visible = progress.personalContributionScore === 0;
            }

            if(this._voteTwoButton)
            {
                this._voteTwoButton.visible = progress.personalContributionScore === 0;
            }
        }
    }

    private onVoteOptionOneClick = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.hideVoteButtons();
            this._landingView?.communityGoalVote(1);
            this._landingView?.tracking?.trackGoogle('landingView', 'click_voteoption_one');
        }
    };

    private onVoteOptionTwoClick = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.hideVoteButtons();
            this._landingView?.communityGoalVote(2);
            this._landingView?.tracking?.trackGoogle('landingView', 'click_voteoption_two');
        }
    };

    private onInfo = (event: IMessageEvent): void =>
    {
        if((event.parser as CommunityVoteReceivedEventParser | null)?.acknowledged)
        {
            this.hideVoteButtons();
        }
    };

    private hideVoteButtons(): void
    {
        if(this._voteOneButton) this._voteOneButton.visible = false;
        if(this._voteTwoButton) this._voteTwoButton.visible = false;
    }
}
