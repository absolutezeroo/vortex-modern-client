/**
 * TalentProgressMeter — the progress bar across the top of the talent-track window, with the
 * user's own avatar as the needle.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/TalentProgressMeter.as
 *
 * One divider is cloned per level boundary and named `progress_divider_level_<n>`; `resize()`
 * re-places them and swaps each one's art depending on whether it sits behind or ahead of the
 * filled portion. The meter owns no layout of its own — every window it touches belongs to the
 * track window, which is why `dispose()` drops references instead of disposing them (the one
 * exception being the divider template it lifted out).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {TalentTrack} from '@habbo/communication/messages/parser/talent/TalentTrack';
import {MathUtils} from '@habbo/utils/MathUtils';
import type {HabboTalent} from './HabboTalent';
import type {TalentTrackController} from './TalentTrackController';

export class TalentProgressMeter
{
    // AS3: TalentProgressMeter.as::ACHIEVED_DIVIDER
    private static readonly ACHIEVED_DIVIDER: string = 'talent_achieved_div';

    // AS3: TalentProgressMeter.as::UNACHIEVED_DIVIDER
    private static readonly UNACHIEVED_DIVIDER: string = 'talent_unachieved_div';

    // AS3: TalentProgressMeter.as::DIVIDER_WINDOW_PREFIX
    private static readonly DIVIDER_WINDOW_PREFIX: string = 'progress_divider_level_';

    // AS3: TalentProgressMeter.as::AVATAR_GLOW_RADIUS
    private static readonly AVATAR_GLOW_RADIUS: number = 10;

    // AS3: TalentProgressMeter.as::_disposed
    private _disposed: boolean = false;

    // AS3: TalentProgressMeter.as::_habboTalent
    private _habboTalent: HabboTalent | null;

    /** Derived name — `_SafeStr_4593`: the track controller that owns the window. */
    // AS3: TalentProgressMeter.as::_SafeStr_4593
    private _controller: TalentTrackController | null;

    // AS3: TalentProgressMeter.as::_talentTrack
    private _talentTrack: TalentTrack | null;

    /** Derived name — `_SafeStr_4976`: the `progress_container` everything below lives in. */
    // AS3: TalentProgressMeter.as::_SafeStr_4976
    private _container: IWindowContainer | null = null;

    // AS3: TalentProgressMeter.as::_divider
    private _divider: IStaticBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_5030`: the avatar needle. */
    // AS3: TalentProgressMeter.as::_SafeStr_5030
    private _needle: IWidgetWindow | null = null;

    /** Derived name — `_SafeStr_7869`: the filled part of the bar. */
    // AS3: TalentProgressMeter.as::_SafeStr_7869
    private _achievedMid: IStaticBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_7900`: the unfilled part. */
    // AS3: TalentProgressMeter.as::_SafeStr_7900
    private _unachievedMid: IStaticBitmapWrapperWindow | null = null;

    // AS3: TalentProgressMeter.as::TalentProgressMeter()
    constructor(habboTalent: HabboTalent, controller: TalentTrackController)
    {
        this._habboTalent = habboTalent;
        this._controller = controller;
        this._talentTrack = controller.talentTrack;

        this.createMeter();
    }

    // AS3: TalentProgressMeter.as::get width()
    public get width(): number
    {
        return (this._controller?.window as unknown as IWindow | null)?.width ?? 0;
    }

    // AS3: TalentProgressMeter.as::get progressPerLevelWidth()
    public get progressPerLevelWidth(): number
    {
        return Math.trunc(Math.floor(MathUtils.lerp(this._talentTrack?.progressPerLevel ?? 0, 0, this.width)));
    }

    // AS3: TalentProgressMeter.as::createMeter()
    private createMeter(): void
    {
        const window = this._controller?.window ?? null;

        if(window === null) return;

        this._container = window.findChildByName('progress_container') as IWindowContainer | null;

        if(this._container === null) return;

        const template = this._container.findChildByName('progress_level_divider');

        this._divider = (template !== null
            ? this._container.removeChild(template)
            : null) as IStaticBitmapWrapperWindow | null;

        this._achievedMid = this._container.findChildByName('achieved_mid') as IStaticBitmapWrapperWindow | null;
        this._unachievedMid = this._container.findChildByName('unachieved_mid') as IStaticBitmapWrapperWindow | null;

        const levels = this._talentTrack?.levels.length ?? 0;

        for(let index = 1; index < levels; index++)
        {
            if(this._divider === null) break;

            const divider = (this._divider as unknown as IWindow).clone() as unknown as IStaticBitmapWrapperWindow;

            (divider as unknown as IWindow).name = TalentProgressMeter.DIVIDER_WINDOW_PREFIX + index;
            this._container.addChild(divider as unknown as IWindow);
        }

        this._needle = this._container.findChildByName('progress_needle') as unknown as IWidgetWindow | null;

        if(this._needle !== null)
        {
            const avatar = this._needle.widget as unknown as IAvatarImageWidget | null;

            if(avatar !== null)
            {
                avatar.figure = this._habboTalent?.sessionManager?.figure ?? '';
            }

            this._container.setChildIndex(
                this._needle as unknown as IWindow, this._container.numChildren - 1
            );
        }
    }

    // AS3: TalentProgressMeter.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Re-lays the whole meter against the current window width: the fill, the needle, the glow that
     * follows it, the balloon above it, and every level divider.
     */
    // AS3: TalentProgressMeter.as::resize()
    public resize(): void
    {
        const container = this._container;
        const needle = this._needle as unknown as IWindow | null;

        if(container === null || needle === null || this._talentTrack === null) return;

        const width = this.width;
        const filled = Math.floor(MathUtils.lerp(this._talentTrack.totalProgress, 0, width));

        (container as unknown as IWindow).width = width;

        if(this._unachievedMid) (this._unachievedMid as unknown as IWindow).width = width;
        if(this._achievedMid) (this._achievedMid as unknown as IWindow).width = filled;

        needle.x = MathUtils.clamp(filled - Math.trunc(needle.width / 2), 0, width - needle.width);

        const glow = container.findChildByName('avatar_glow');

        if(glow !== null)
        {
            glow.x = needle.x - TalentProgressMeter.AVATAR_GLOW_RADIUS;
            glow.y = needle.y - TalentProgressMeter.AVATAR_GLOW_RADIUS;
            glow.width = needle.width + 2 * TalentProgressMeter.AVATAR_GLOW_RADIUS;
            glow.height = needle.height + 2 * TalentProgressMeter.AVATAR_GLOW_RADIUS;
        }

        const balloon = container.findChildByName('progress_balloon');

        if(balloon !== null)
        {
            balloon.x = needle.x + Math.floor(needle.width / 2) - Math.floor(balloon.width / 2) + 5;
        }

        for(let index = 1; index < this._talentTrack.levels.length; index++)
        {
            const divider = container.findChildByName(
                TalentProgressMeter.DIVIDER_WINDOW_PREFIX + index
            ) as IStaticBitmapWrapperWindow | null;

            if(divider === null) continue;

            const dividerWindow = divider as unknown as IWindow;

            dividerWindow.x = index * this.progressPerLevelWidth;

            divider.assetUri = dividerWindow.x < filled
                ? TalentProgressMeter.ACHIEVED_DIVIDER
                : TalentProgressMeter.UNACHIEVED_DIVIDER;

            dividerWindow.visible = true;
        }

        (container as unknown as IWindow).invalidate();
    }

    // AS3: TalentProgressMeter.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._divider !== null)
        {
            (this._divider as unknown as IWindow).dispose();
            this._divider = null;
        }

        this._achievedMid = null;
        this._unachievedMid = null;
        this._needle = null;
        this._container = null;
        this._talentTrack = null;
        this._controller = null;
        this._habboTalent = null;
        this._disposed = true;
    }
}
