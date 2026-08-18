/**
 * RewardTrackTheme — the five colour schemes a track can be painted in, and the recursive walk
 * that applies one.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/theme/RewardTrackTheme.as
 *
 * Recolouring is driven by **window tags**, not names: any window tagged `RECOLORABLE_LIGHT`,
 * `RECOLORABLE_MEDIUM` or `RECOLORABLE_DARK` anywhere in the subtree gets the matching colour, and
 * everything else is left alone. That is why `applyTo()` walks every child rather than reaching for
 * a known set of windows — the layout decides what is themeable.
 *
 * `resolve()` falls through to blue for any unknown key, so a track whose theme string the client
 * does not know still renders.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';

export class RewardTrackTheme
{
    // AS3: RewardTrackTheme.as::BLUE
    private static readonly BLUE: string = 'blue';

    // AS3: RewardTrackTheme.as::ORANGE
    private static readonly ORANGE: string = 'orange';

    // AS3: RewardTrackTheme.as::FOREST_GREEN
    private static readonly FOREST_GREEN: string = 'forest_green';

    // AS3: RewardTrackTheme.as::RED
    private static readonly RED: string = 'red';

    // AS3: RewardTrackTheme.as::CYAN
    private static readonly CYAN: string = 'cyan';

    // AS3: RewardTrackTheme.as::RECOLORABLE_LIGHT
    private static readonly RECOLORABLE_LIGHT: string = 'RECOLORABLE_LIGHT';

    // AS3: RewardTrackTheme.as::RECOLORABLE_MEDIUM
    private static readonly RECOLORABLE_MEDIUM: string = 'RECOLORABLE_MEDIUM';

    // AS3: RewardTrackTheme.as::RECOLORABLE_DARK
    private static readonly RECOLORABLE_DARK: string = 'RECOLORABLE_DARK';

    // AS3: RewardTrackTheme.as::_key
    private _key: string;

    // AS3: RewardTrackTheme.as::_darkColor
    private _darkColor: number;

    // AS3: RewardTrackTheme.as::_mediumColor
    private _mediumColor: number;

    // AS3: RewardTrackTheme.as::_lightColor
    private _lightColor: number;

    // AS3: RewardTrackTheme.as::_activeColor
    private _activeColor: number;

    // AS3: RewardTrackTheme.as::RewardTrackTheme()
    constructor(key: string, darkColor: number, mediumColor: number, lightColor: number, activeColor: number)
    {
        this._key = key;
        this._darkColor = darkColor;
        this._mediumColor = mediumColor;
        this._lightColor = lightColor;
        this._activeColor = activeColor;
    }

    /** AS3 writes the twenty colours as decimal `uint`s; they are the same values in hex here. */
    // AS3: RewardTrackTheme.as::resolve()
    public static resolve(key: string): RewardTrackTheme
    {
        switch(key)
        {
            case RewardTrackTheme.ORANGE:
                return new RewardTrackTheme(RewardTrackTheme.ORANGE, 0xC97918, 0xFFDFB2, 0xFFEFD6, 0xFFCF91);

            case RewardTrackTheme.FOREST_GREEN:
                return new RewardTrackTheme(RewardTrackTheme.FOREST_GREEN, 0x3F8A45, 0xCDEACB, 0xE1F3DF, 0xB8DFB6);

            case RewardTrackTheme.RED:
                return new RewardTrackTheme(RewardTrackTheme.RED, 0xB84B4B, 0xF1CCCC, 0xF8DDDD, 0xE7B8B8);

            case RewardTrackTheme.CYAN:
                return new RewardTrackTheme(RewardTrackTheme.CYAN, 0x1F9EB3, 0xC7EFF5, 0xDCF7FB, 0xB5E9F1);

            default:
                return new RewardTrackTheme(RewardTrackTheme.BLUE, 0x3576B9, 0xCFE2F9, 0xDDEBF9, 0xBDD6EF);
        }
    }

    // AS3: RewardTrackTheme.as::applyTo()
    public applyTo(window: IWindow | null): void
    {
        if(window === null) return;

        this.applyColor(window);

        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren !== 'number') return;

        for(let index = 0; index < container.numChildren; index++)
        {
            this.applyTo(container.getChildAt(index));
        }
    }

    // AS3: RewardTrackTheme.as::applyColor()
    private applyColor(window: IWindow): void
    {
        const tags = window.tags;

        if(tags.indexOf(RewardTrackTheme.RECOLORABLE_LIGHT) >= 0)
        {
            window.color = this._lightColor;
        }
        else if(tags.indexOf(RewardTrackTheme.RECOLORABLE_MEDIUM) >= 0)
        {
            window.color = this._mediumColor;
        }
        else if(tags.indexOf(RewardTrackTheme.RECOLORABLE_DARK) >= 0)
        {
            window.color = this._darkColor;
        }
    }

    // AS3: RewardTrackTheme.as::get key()
    get key(): string
    {
        return this._key;
    }

    // AS3: RewardTrackTheme.as::get darkColor()
    get darkColor(): number
    {
        return this._darkColor;
    }

    // AS3: RewardTrackTheme.as::get lightColor()
    get lightColor(): number
    {
        return this._lightColor;
    }

    // AS3: RewardTrackTheme.as::get activeColor()
    get activeColor(): number
    {
        return this._activeColor;
    }
}
