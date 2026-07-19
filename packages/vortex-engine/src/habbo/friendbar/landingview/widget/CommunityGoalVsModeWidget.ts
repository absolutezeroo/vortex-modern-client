import type {HabboLandingView} from '../HabboLandingView';
import {CommunityGoalWidget} from './CommunityGoalWidget';

/**
 * "Versus" variant of the community-goal meter: the needle moves across a
 * 7-level ±3 scale instead of the base 0-3 scale, and never auto-builds up
 * (jumps straight to its target frame every `update()` tick).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidget.as
 */
export class CommunityGoalVsModeWidget extends CommunityGoalWidget
{
    private static readonly NEEDLE_LEVELS: number[] = [-3, -2, -1, 0, 1, 2, 3];
    private static readonly NEEDLE_FRAMES: number[] = [0, 0, 4.75, 11.5, 16.25, 23, 23];

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidget.as::CommunityGoalVsModeWidget()
    constructor(landingView: HabboLandingView, votingMode: boolean = false)
    {
        super(landingView, votingMode);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidget.as::getCurrentNeedleFrame()
    protected override getCurrentNeedleFrame(): number
    {
        const levels = CommunityGoalVsModeWidget.NEEDLE_LEVELS;
        const frames = CommunityGoalVsModeWidget.NEEDLE_FRAMES;
        const progress = this.communityProgress;

        if(!progress) return 0;

        if(progress.communityHighestAchievedLevel <= levels[0])
        {
            return Math.round(frames[0]);
        }

        if(progress.communityHighestAchievedLevel >= levels[levels.length - 1])
        {
            return Math.round(frames[levels.length - 1]);
        }

        const direction = progress.scoreRemainingUntilNextLevel < 0 ? -1 : 1;
        const currentLevel = progress.communityHighestAchievedLevel;
        const baseFrame = frames[levels.indexOf(currentLevel)];
        const frameSpan = Math.abs(frames[levels.indexOf(currentLevel + direction)] - frames[levels.indexOf(currentLevel)]);

        return Math.round(baseFrame + (progress.percentCompletionTowardsNextLevel / 100) * frameSpan * direction);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidget.as::update()
    override update(_elapsedTime: number): void
    {
        this.updateMeter(Math.floor(this.getCurrentNeedleFrame()), false);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CommunityGoalVsModeWidget.as::initialize()
    override initialize(): void
    {
        super.initialize();

        const totalStatus = this._container?.findChildByName('community_total_status');

        if(totalStatus) totalStatus.visible = false;
    }
}
