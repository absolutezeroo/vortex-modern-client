import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {HighScoreStuffData} from '@habbo/room/object/data/HighScoreStuffData';
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetHandler} from '../../../IRoomWidgetHandler';
import type {HighScoreDisplayWidgetHandler} from '../../../handler/HighScoreDisplayWidgetHandler';
import {RoomWidgetBase} from '../../RoomWidgetBase';

const log = Logger.getLogger('habbo.ui.widget.furniture.highscore.HighScoreDisplayWidget');

/**
 * The scoreboard bubble that floats over a high-score furni.
 *
 * It lives in a full-desktop container of its own rather than in the layout manager, because the
 * bubble is positioned in room coordinates: the handler pushes a new screen location every frame
 * and the bubble is offset from it by a fixed amount.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/highscore/HighScoreDisplayWidget.as
 */
export class HighScoreDisplayWidget extends RoomWidgetBase
{
    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::INVALID_ID
    public static readonly INVALID_ID: number = -1;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::RELATIVE_OFFSET_X
    private static readonly RELATIVE_OFFSET_X: number = -138;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::RELATIVE_OFFSET_Y
    private static readonly RELATIVE_OFFSET_Y: number = -400;

    /**
     * AS3: .../furniture/highscore/HighScoreDisplayWidget.as::SCORETYPE_LOCALIZATION_KEY_POSTFIX
     *
     * Five entries against only three declared `SCORETYPE_*` constants (0-2) — the last two,
     * `fastesttime` and `longesttime`, have no constant in any tree. They are the reason the
     * time formatting is selected by `indexOf("time") >= 0` on the postfix rather than by a
     * comparison against a score-type constant.
     */
    private static readonly SCORETYPE_LOCALIZATION_KEY_POSTFIX: string[] = [
        'perteam', 'mostwins', 'classic', 'fastesttime', 'longesttime'
    ];

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::CLEARTYPE_LOCALIZATION_KEY_POSTFIX
    private static readonly CLEARTYPE_LOCALIZATION_KEY_POSTFIX: string[] = [
        'alltime', 'daily', 'weekly', 'monthly'
    ];

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::SECONDS_TO_HOURS_DIVISORS
    // Name DERIVED: AS3 writes `[60, 60, 24]` inline — seconds→minutes, minutes→hours,
    // hours→days.
    private static readonly TIME_DIVISORS: number[] = [60, 60, 24];

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::HOUR_IN_SECONDS
    // Name DERIVED: the `3600` that decides between two and three time fields.
    private static readonly HOUR_IN_SECONDS: number = 3600;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_rootContainer
    private _rootContainer: IWindowContainer | null = null;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_bubble
    private _bubble: IWindowContainer | null = null;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_entryTemplate
    // The one row the layout ships, removed from the list and cloned per entry.
    private _entryTemplate: IWindowContainer | null = null;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_roomId
    private _roomId: number = HighScoreDisplayWidget.INVALID_ID;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_roomObjId
    private _roomObjId: number = HighScoreDisplayWidget.INVALID_ID;

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::_lastPosition
    // Kept across a close/open pair so a reopened bubble does not flash at the origin.
    private _lastPosition: {x: number; y: number} = {x: 0, y: 0};

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::HighScoreDisplayWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        // AS3 hands the widget to the handler here, as the area-hide widget does.
        (handler as unknown as HighScoreDisplayWidgetHandler).widget = this;

        this._rootContainer = windowManager.createWindow(
            'room_widget_highscore_background_container', '', 4, 0, 0, {x: 0, y: 0, width: 10, height: 10}
        ) as IWindowContainer | null;

        if(this._rootContainer === null || this._rootContainer === undefined)
        {
            log.warn('the high-score root container could not be created — no scoreboard will show');
            this._rootContainer = null;

            return;
        }

        this.resizeRootContainerToDesktop();
        this._rootContainer.addEventListener('WE_PARENT_RESIZED', this.resizeRootContainerToDesktop);
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::get mainWindow()
    // Unlike its siblings this one *does* expose a main window: the full-desktop container.
    override get mainWindow(): IWindow | null
    {
        return this._rootContainer;
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::get isOpen()
    get isOpen(): boolean
    {
        return this._bubble !== null && this._bubble.visible;
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::get roomObjId()
    get roomObjId(): number
    {
        return this._roomObjId;
    }

    /**
     * Rebuilds the whole bubble — an open while one is already up destroys it first, so the same
     * furni clicked twice redraws rather than stacking.
     *
     * The caption's two halves are registered as *parameters* rather than written: the localised
     * "high.score.display.caption" carries `%cleartype%`/`%scoretype%` and the layout resolves it.
     * Both are skipped entirely when either type is -1, which is the unconfigured furni.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/highscore/HighScoreDisplayWidget.as::open()
    open(roomObjId: number, roomId: number, data: HighScoreStuffData): void
    {
        if(this._bubble !== null) this.destroyWindow();

        const localization = this.handler?.container?.localization ?? null;

        let isTimeScore = false;

        if(data.clearType !== -1 && data.scoreType !== -1)
        {
            const scorePostfix = HighScoreDisplayWidget.SCORETYPE_LOCALIZATION_KEY_POSTFIX[data.scoreType] ?? '';

            isTimeScore = scorePostfix.indexOf('time') >= 0;

            const clearPostfix = HighScoreDisplayWidget.CLEARTYPE_LOCALIZATION_KEY_POSTFIX[data.clearType] ?? '';
            const clearText = localization?.getLocalization(`high.score.display.cleartype.${clearPostfix}`) ?? '';
            const scoreText = localization?.getLocalization(`high.score.display.scoretype.${scorePostfix}`) ?? '';

            localization?.registerParameter('high.score.display.caption', 'cleartype', clearText);
            localization?.registerParameter('high.score.display.caption', 'scoretype', scoreText);
        }

        this._roomId = roomId;
        this._roomObjId = roomObjId;

        this.createWindow();

        if(this._entryTemplate === null)
        {
            log.error("ERROR: 'entry_template' could not found from high score display's window XML");

            return;
        }

        if(this._bubble === null) return;

        const header = this._bubble.findChildByName('score_header') as ITextWindow | null;

        if(header !== null && header !== undefined)
        {
            header.caption = localization?.getLocalization(
                isTimeScore ? 'high.score.display.time.header' : 'high.score.display.score.header'
            ) ?? '';
            header.invalidate();
        }

        const entries = this._bubble.findChildByName('entries') as IItemListWindow | null;

        if(entries === null || entries === undefined) return;

        for(const entry of data.entries)
        {
            const row = this._entryTemplate.clone() as IWindowContainer;

            const usernames = row.getChildByName('usernames') as ITextWindow | null;

            if(usernames !== null && usernames !== undefined) usernames.caption = this.getUserNameList(entry.users);

            const score = row.getChildByName('score') as ITextWindow | null;

            if(score !== null && score !== undefined)
            {
                score.caption = isTimeScore
                    ? HighScoreDisplayWidget.scoreToTime(
                        entry.score,
                        entry.score >= HighScoreDisplayWidget.HOUR_IN_SECONDS ? 3 : 2
                    )
                    : entry.score.toString();
            }

            entries.addListItem(row);
        }

        entries.invalidate();
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::setRelativePositionToRoomObjectAt()
    // Called every frame by the handler while the bubble is open.
    setRelativePositionToRoomObjectAt(x: number, y: number): void
    {
        if(this._bubble === null) return;

        this._bubble.x = x + HighScoreDisplayWidget.RELATIVE_OFFSET_X;
        this._bubble.y = y + HighScoreDisplayWidget.RELATIVE_OFFSET_Y;
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::close()
    close(): void
    {
        this.destroyWindow();
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::dispose()
    override dispose(): void
    {
        if(this._bubble !== null) this.destroyWindow();

        if(this._rootContainer !== null)
        {
            this._rootContainer.removeEventListener('WE_PARENT_RESIZED', this.resizeRootContainerToDesktop);
            this._rootContainer.dispose();
            this._rootContainer = null;
        }

        super.dispose();
    }

    /**
     * AS3: .../furniture/highscore/HighScoreDisplayWidget.as::scoreToTime()
     *
     * Formats a second count as `[hh:]mm:ss`. `fieldCount` outside 1-3 returns the raw number, so
     * an unconfigured score type still shows something.
     *
     * The last field is the *whole* remaining value rather than a modulo, which is what lets an
     * hours field exceed 24 — the `24` divisor is only consumed when a fourth field is asked for,
     * and nothing asks.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/highscore/HighScoreDisplayWidget.as::scoreToTime()
    private static scoreToTime(score: number, fieldCount: number): string
    {
        const divisors = HighScoreDisplayWidget.TIME_DIVISORS;

        if(fieldCount < 1 || fieldCount > divisors.length) return `${score}`;

        let remaining = score;
        let result = '';

        for(let i = 0; i < fieldCount; i++)
        {
            let field: string;

            if(i === fieldCount - 1)
            {
                field = `${remaining}`;
            }
            else
            {
                field = `${remaining % (divisors[i] ?? 1)}`;
                // AS3 assigns a Number into an int parameter here, which truncates; the division
                // is integer division despite looking like a float one.
                remaining = Math.trunc(remaining / (divisors[i] ?? 1));
            }

            if(field.length < 2 && i < 2) field = `0${field}`;

            result = `${field}:${result}`;
        }

        return result.substring(0, result.length - 1);
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::getUserNameList()
    // Joins with ", " by appending and then cutting the trailing separator, so an empty list
    // yields an empty string rather than throwing.
    private getUserNameList(users: string[]): string
    {
        let result = '';

        for(const user of users)
        {
            result = `${result}${user}, `;
        }

        return result.substr(0, result.length - 2);
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::get handler()
    // AS3 casts `_handler` at each use; folded into one accessor here.
    private get handler(): HighScoreDisplayWidgetHandler | null
    {
        return (this._handler as unknown as HighScoreDisplayWidgetHandler | null) ?? null;
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::resizeRootContainerToDesktop()
    // The container tracks the whole desktop, because the bubble inside it is placed in room
    // coordinates and must be free to sit anywhere.
    private resizeRootContainerToDesktop = (): void =>
    {
        if(this._rootContainer === null || this._rootContainer.desktop === null) return;

        this._rootContainer.width = this._rootContainer.desktop.width;
        this._rootContainer.height = this._rootContainer.desktop.height;
    };

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::createWindow()
    // The template row is pulled *out* of the list before any entry is added, so the layout's
    // placeholder never shows.
    private createWindow(): void
    {
        const bubble = this.windowManager.buildWidgetLayout('high_score_display_xml') as IWindowContainer | null;

        if(bubble === null || bubble === undefined)
        {
            log.warn('high_score_display_xml did not build — the scoreboard cannot be shown');

            return;
        }

        this._entryTemplate = bubble.findChildByName('entry_template') as IWindowContainer | null;

        const entries = bubble.findChildByName('entries') as IItemListWindow | null;

        if(entries !== null && entries !== undefined && this._entryTemplate !== null)
        {
            entries.removeListItem(this._entryTemplate);
        }

        this._bubble = bubble;
        this._bubble.x = this._lastPosition.x;
        this._bubble.y = this._lastPosition.y;

        this._rootContainer?.addChild(bubble);
    }

    // AS3: .../furniture/highscore/HighScoreDisplayWidget.as::destroyWindow()
    // The position is saved before the disposal, which is what `_lastPosition` is for.
    private destroyWindow(): void
    {
        if(this._bubble === null) return;

        this._rootContainer?.removeChild(this._bubble);

        this._lastPosition = {x: this._bubble.x, y: this._bubble.y};

        this._bubble.dispose();
        this._bubble = null;
        this._roomId = HighScoreDisplayWidget.INVALID_ID;
        this._roomObjId = HighScoreDisplayWidget.INVALID_ID;
    }
}
