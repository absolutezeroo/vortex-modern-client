/**
 * CalendarItem — the per-day cell of the campaign calendar, and the state machine behind it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/calendar/CalendarItem.as
 *
 * Every method is static: the cell itself is a `btn_slot` container cloned out of the layout's
 * first list item, and this class only ever reaches into it by child name. There is no instance
 * state, which is why `CalendarView` keeps the selected index rather than the cells doing so.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {CampaignCalendarData} from '@habbo/communication/messages/parser/campaign/CampaignCalendarData';
import {CalendarItemWiggle} from './CalendarItemWiggle';

export class CalendarItem
{
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::STATE_UNLOCKED
    public static readonly STATE_UNLOCKED: number = 1;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::STATE_LOCKED_AVAILABLE
    public static readonly STATE_LOCKED_AVAILABLE: number = 2;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::STATE_LOCKED_EXPIRED
    public static readonly STATE_LOCKED_EXPIRED: number = 3;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::STATE_LOCKED_FUTURE
    public static readonly STATE_LOCKED_FUTURE: number = 4;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::IMAGE_CLOSED
    private static readonly IMAGE_CLOSED: string = 'campaign_calendar_day_generic_button';

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::IMAGE_ACTIVATED
    private static readonly IMAGE_ACTIVATED: string = 'campaign_calendar_day_generic_activated';

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::IMAGE_OPENED_BG
    private static readonly IMAGE_OPENED_BG: string = 'campaign_calendar_opened';

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::ICON_LOCKED
    private static readonly ICON_LOCKED: string = 'campaign_calendar_generic_lock';

    /**
     * Declared by AS3 and read by nothing in this build — the offsets a stacked package image
     * would have been drawn at. Kept because the declaration exists; see the class-level note in
     * `.claude/rules/30-as3-traceability.md` on never silently dropping an AS3 member.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::PACKAGE_IMAGE_OFFSETS
    private static readonly PACKAGE_IMAGE_OFFSETS: ReadonlyArray<{x: number; y: number}> = [
        {x: -2, y: -5},
        {x: 3, y: -4},
        {x: -3, y: -3}
    ];

    /**
     * Clones the layout's template cell and dresses it for `dayIndex`.
     *
     * The three states collapse to two images: an opened day gets the "activated" background plus
     * the `bitmap_opened_bg` overlay and no padlock; everything else gets the plain button, with a
     * padlock only when the day cannot be opened. Note the asymmetry AS3 has here and this port
     * keeps — the available branch clears the padlock with `null` where the unlocked branch uses
     * `''`.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::populateItem()
    public static populateItem(
        template: IWindowContainer,
        data: CampaignCalendarData,
        dayIndex: number
    ): IWindowContainer
    {
        const item = template.clone() as IWindowContainer;
        const background = item.findChildByName('bitmap_bg') as IStaticBitmapWrapperWindow | null;
        const openedBackground = item.findChildByName('bitmap_opened_bg') as IStaticBitmapWrapperWindow | null;
        const lock = item.findChildByName('bitmap_lock') as IStaticBitmapWrapperWindow | null;

        switch(CalendarItem.resolveDayState(data, dayIndex))
        {
            case CalendarItem.STATE_UNLOCKED:
                if(background) background.assetUri = CalendarItem.IMAGE_ACTIVATED;
                if(lock) lock.assetUri = '';
                if(openedBackground) openedBackground.visible = true;
                break;

            case CalendarItem.STATE_LOCKED_AVAILABLE:
                if(background) background.assetUri = CalendarItem.IMAGE_CLOSED;
                if(lock) lock.assetUri = null as unknown as string;
                if(openedBackground) openedBackground.visible = false;
                break;

            case CalendarItem.STATE_LOCKED_EXPIRED:
            case CalendarItem.STATE_LOCKED_FUTURE:
                if(background) background.assetUri = CalendarItem.IMAGE_CLOSED;
                if(lock) lock.assetUri = CalendarItem.ICON_LOCKED;
                if(openedBackground) openedBackground.visible = false;
                break;
        }

        return item;
    }

    /**
     * Called for every cell whenever the selection moves, but only the newly selected cell reacts,
     * and only while it is still openable — that is the whole of AS3's body here.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::updateState()
    public static updateState(
        item: IWindowContainer | null,
        data: CampaignCalendarData,
        dayIndex: number,
        selectedIndex: number
    ): void
    {
        const background = item?.findChildByName('bitmap_bg') as IStaticBitmapWrapperWindow | null;

        if(!background) return;

        if(dayIndex === selectedIndex)
        {
            if(CalendarItem.resolveDayState(data, dayIndex) === CalendarItem.STATE_LOCKED_AVAILABLE)
            {
                CalendarItem.showWiggleEffect(background);
            }
        }
    }

    /**
     * Flips a cell to its opened look and drops the prize picture into it.
     *
     * `image` is a string when the prize came with a gallery URL and an `ImageBitmap` when it was
     * rendered by the room engine — the two land in different windows (`bitmap_icon` is asset-URI
     * driven, `bitmap_icon2` is a programmatic bitmap), which is why AS3 clears whichever one it is
     * not using.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::updateThumbnail()
    public static updateThumbnail(item: IWindowContainer, image: string | ImageBitmap | null): void
    {
        const background = item.findChildByName('bitmap_bg') as IStaticBitmapWrapperWindow | null;
        const openedBackground = item.findChildByName('bitmap_opened_bg') as IStaticBitmapWrapperWindow | null;
        const icon = item.findChildByName('bitmap_icon') as IStaticBitmapWrapperWindow | null;
        const icon2 = item.findChildByName('bitmap_icon2') as IBitmapWrapperWindow | null;

        if(background) background.assetUri = CalendarItem.IMAGE_ACTIVATED;

        // AS3 assigns both in one chained statement, which the decompiler splits through a temp.
        if(icon) icon.y = -6;
        if(icon2) icon2.y = -6;

        if(openedBackground) openedBackground.visible = true;

        if(typeof image === 'string')
        {
            if(icon) icon.assetUri = image;
            if(icon2) icon2.bitmap = null;
            if(icon) CalendarItem.showWiggleEffect(icon);
        }

        if(image !== null && typeof image !== 'string')
        {
            if(icon) icon.assetUri = '';
            if(icon2) icon2.bitmap = image;
            if(icon) CalendarItem.showWiggleEffect(icon);
            if(icon2) CalendarItem.showWiggleEffect(icon2);
        }
    }

    /**
     * AS3 constructs the wiggle and keeps no reference to it — it disposes itself once its bounce
     * count runs out.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::showWiggleEffect()
    public static showWiggleEffect(window: IWindow | null): void
    {
        new CalendarItemWiggle(window);
    }

    /**
     * Opened wins over everything. Past-or-present days are available unless the server listed them
     * as missed; everything after `currentDay` is in the future.
     *
     * The primary tree renders AS3's `!` as `… !== true`, so the two negated tests read backwards
     * at a glance: `param2 > currentDay !== true` is `!(dayIndex > currentDay)`.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItem.as::resolveDayState()
    public static resolveDayState(data: CampaignCalendarData, dayIndex: number): number
    {
        if(data.openedDays.indexOf(dayIndex) > -1)
        {
            return CalendarItem.STATE_UNLOCKED;
        }

        if(!(dayIndex > data.currentDay))
        {
            if(!(data.missedDays.indexOf(dayIndex) > -1))
            {
                return CalendarItem.STATE_LOCKED_AVAILABLE;
            }

            return CalendarItem.STATE_LOCKED_EXPIRED;
        }

        return CalendarItem.STATE_LOCKED_FUTURE;
    }
}
