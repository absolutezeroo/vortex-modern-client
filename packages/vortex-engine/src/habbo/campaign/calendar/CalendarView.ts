/**
 * CalendarView — the campaign (advent) calendar window: a horizontal strip of day cells with the
 * selected one centred, and a heading that describes whatever state that day is in.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/calendar/CalendarView.as
 *
 * The strip is built once from the layout's first list item, cloned `campaignDays` times. Selection
 * is the only moving part: it scrolls the list so the chosen cell sits in the middle, redraws the
 * two fade panels either side of it, and re-labels the heading. Clicking the already-selected day
 * is what actually opens it — the first click only moves the selection there.
 *
 * Two deviations from AS3, both forced and both with precedent in this port:
 *
 * - AS3 reads the layout from `campaigns.assets.getAssetByName("campaign_calendar_xml")`. This port
 *   keeps layouts in the window manager's own registry, so the lookup goes through
 *   `buildModalWidgetLayout()` — the same substitution `AvatarEditorView` documents.
 * - AS3 listens for `Stage`'s `"resize"`. There is no `context.displayObjectContainer` here; the
 *   browser window is the stage, as `ChatViewController` already treats it.
 *
 * Field names come from `sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/calendar/CalendarView.as`, which is
 * unobfuscated; every method name is readable in the primary tree.
 */
import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
// AS3 types `btn_force_open` as `_SafeCls_2013`, declared `extends IInteractiveWindow`. This port
// has no `IButtonWindow`, and the three members used here (visible/enable/disable) are on the
// interface it extends, so that is what the cast lands on.
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {CampaignCalendarData} from '@habbo/communication/messages/parser/campaign/CampaignCalendarData';
import type {HabboCampaigns} from '../HabboCampaigns';
import {CalendarItem} from './CalendarItem';
import {CalendarSpinnerUtil} from './CalendarSpinnerUtil';

const log = Logger.getLogger('habbo.campaign.calendar.CalendarView');

export class CalendarView implements IGetImageListener
{
    /** Free space kept either side of the strip when sizing it to the stage. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::MARGIN
    private static readonly MARGIN: number = 75;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::_controller
    private _controller: HabboCampaigns | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::_modal
    private _modal: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::_selectedIndex
    private _selectedIndex: number = -1;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::_itemsOnScreen
    private _itemsOnScreen: number = 0;

    /**
     * TS-only: guards the async gradient redraw. `createGradients()` has to await two
     * `createImageBitmap()` calls, so a selection that moves meanwhile would otherwise apply an
     * older pair of panels on top of a newer one — the race the notification pass documents under
     * "fire-and-forget decoding is a race".
     */
    // TS-only: no AS3 counterpart; AS3's `createGradients()` is synchronous and needs no guard.
    private _gradientGeneration: number = 0;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::CalendarView()
    constructor(controller: HabboCampaigns, windowManager: IHabboWindowManager)
    {
        this._controller = controller;

        this._modal = windowManager.buildModalWidgetLayout('campaign_calendar_xml');

        if(!this._modal || !this._modal.rootWindow || !this.itemList)
        {
            log.warn('Campaign calendar layout could not be built — no window.');

            return;
        }

        const itemList = this.itemList!;
        const template = itemList.getListItemAt(0) as IWindowContainer | null;

        itemList.removeListItems();

        const days = this.calendarData?.campaignDays ?? 0;

        for(let day = 0; day < days; day++)
        {
            if(!template || !this.calendarData) break;

            const item = CalendarItem.populateItem(template, this.calendarData, day);

            item.procedure = this.onInput;
            itemList.addListItem(item);
        }

        globalThis.addEventListener('resize', this.onResize);

        this.window!.procedure = this.onInput;

        this.onResize();
        this.setSelectedIndex(this.calendarData?.currentDay ?? 0);
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::dispose()
    public dispose(): void
    {
        if(this._modal !== null)
        {
            globalThis.removeEventListener('resize', this.onResize);

            this._modal.dispose();
            this._modal = null;
        }
    }

    /**
     * The prize behind an opened door: its name goes in the heading, its picture in the cell.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::setReceivedProduct()
    public setReceivedProduct(product: IProductData, imageUrl: string | null = null): void
    {
        this.setInfoText('${campaign.calendar.heading.product.received}', product.name);
        this.updateThumbnail(imageUrl);
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::imageReady()
    public imageReady(_id: number, data: ImageBitmap | null): void
    {
        this.updateThumbnail(data);
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::imageFailed()
    public imageFailed(_id: number): void
    {
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::updateThumbnail()
    private updateThumbnail(image: string | ImageBitmap | null): void
    {
        const item = this.itemList?.getListItemAt(this._selectedIndex) as IWindowContainer | null;

        if(!item) return;

        CalendarItem.updateThumbnail(item, image);
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::hide()
    public hide(): void
    {
        this._controller?.hideCalendar();
    }

    /**
     * Sizes the strip to whole cells, then pins the two arrows and the scrollbar to the new width.
     * Re-selecting at the end is what re-centres the current day after a resize.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::onResize()
    private onResize = (): void =>
    {
        const window = this.window;

        if(!window || !this._modal?.rootWindow) return;

        const stageWidth = globalThis.innerWidth;

        this._itemsOnScreen = Math.floor(
            (stageWidth - CalendarView.MARGIN * 2) / (this.itemWidth + this.itemGap)
        );

        this._modal.rootWindow.width = this.calculateItemListWidth(this._itemsOnScreen);

        const forward = window.findChildByName('btn_forward');

        if(forward)
        {
            const back = window.findChildByName('btn_back');

            forward.x = this.scrollerWidth - (back?.x ?? 0) - forward.width;
        }

        const scrollbar = window.findChildByName('calendar_scrollbar');

        if(scrollbar)
        {
            scrollbar.width = this.scrollerWidth;
        }

        window.center();

        if(this._selectedIndex > -1)
        {
            this.setSelectedIndex(this._selectedIndex);
        }
    };

    /**
     * One procedure serves both the frame and every cell — `btn_present` arrives from a cell, the
     * rest from the frame. Clicking a cell that is not the selection only moves the selection;
     * clicking the selected one opens it.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::onInput()
    private onInput = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        switch(window.name)
        {
            case 'btn_present':
            {
                const parent = event.target?.parent ?? null;
                const index = parent && this.itemList ? this.itemList.getListItemIndex(parent) : -1;

                if(index < 0) return;

                if(index !== this._selectedIndex)
                {
                    this.setSelectedIndex(index);
                    break;
                }

                this._controller?.openPackage(this._selectedIndex);
                break;
            }

            case 'btn_back':
                this.setSelectedIndex(this._selectedIndex - 1);
                break;

            case 'btn_forward':
                this.setSelectedIndex(this._selectedIndex + 1);
                break;

            case 'btn_force_open':
                this._controller?.openPackageAsStaff(this._selectedIndex);
                break;

            case 'header_button_close':
                this.hide();
                break;
        }
    };

    /**
     * The staff "force open" button is only revealed to a room controller, and is disabled on a day
     * that is already unlocked — AS3 tests `state != STATE_UNLOCKED` to enable it.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::setSelectedIndex()
    private setSelectedIndex(index: number): void
    {
        const data = this.calendarData;
        const itemList = this.itemList;

        if(!data || !itemList) return;

        if(index < 0 || index >= data.campaignDays) return;

        this._selectedIndex = index;
        itemList.scrollH = this.calculateCenteredItemScrollH(this._selectedIndex);

        for(let day = 0; day < data.campaignDays; day++)
        {
            CalendarItem.updateState(
                itemList.getListItemAt(day) as IWindowContainer | null, data, day, index
            );
        }

        const generation = ++this._gradientGeneration;

        void CalendarSpinnerUtil.createGradients(
            this, this._selectedIndex, () => generation !== this._gradientGeneration
        );

        let forceOpen: IInteractiveWindow | null = null;

        if(this._controller?.isAnyRoomController)
        {
            forceOpen = (this.window?.findChildByName('btn_force_open') ?? null) as IInteractiveWindow | null;

            if(forceOpen) forceOpen.visible = true;
        }

        const state = CalendarItem.resolveDayState(data, index);

        // AS3 keeps this branch even though `index < 0` was rejected above; it is dead there too.
        if(this._selectedIndex < 0)
        {
            this.setInfoText(null, null);

            if(forceOpen) forceOpen.disable();

            return;
        }

        let body: string | null = null;

        switch(state)
        {
            case CalendarItem.STATE_UNLOCKED:
                body = '${campaign.calendar.info.unlocked}';
                break;

            case CalendarItem.STATE_LOCKED_AVAILABLE:
                body = '${campaign.calendar.info.available.desktop}';
                break;

            case CalendarItem.STATE_LOCKED_EXPIRED:
                body = '${campaign.calendar.info.expired}';
                break;

            case CalendarItem.STATE_LOCKED_FUTURE:
                body = '${campaign.calendar.info.future}';
                break;
        }

        const heading = (this._controller?.localizationManager?.getLocalizationWithParams(
            'campaign.calendar.heading.day', ''
        ) ?? '').replace('%number%', String(this._selectedIndex + 1));

        this.setInfoText(heading, body);

        if(forceOpen)
        {
            if(state !== CalendarItem.STATE_UNLOCKED)
            {
                forceOpen.enable();
            }
            else
            {
                forceOpen.disable();
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::setInfoText()
    private setInfoText(heading: string | null, body: string | null): void
    {
        const headingWindow = this.window?.findChildByName('info_heading') as ITextWindow | null;
        const bodyWindow = this.window?.findChildByName('info_body') as ITextWindow | null;

        if(headingWindow) headingWindow.text = heading || '';
        if(bodyWindow) bodyWindow.text = body || '';
    }

    /** Empty in AS3 too — the wiggle is started from `CalendarItem.updateState()` instead. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::startItemWiggle()
    private startItemWiggle(_index: number): void
    {
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get window()
    public get window(): IFrameWindow | null
    {
        return this._modal ? (this._modal.rootWindow as IFrameWindow | null) : null;
    }

    /** Declared by AS3 and called by nothing in this build. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::getItemIndexAt()
    private getItemIndexAt(x: number): number
    {
        const itemList = this.itemList;

        if(!itemList) return 0;

        return Math.floor(
            (itemList.scrollH * itemList.maxScrollH + x)
            / ((itemList.maxScrollH + this.scrollerWidth) / itemList.numListItems)
        );
    }

    /**
     * `scrollH` is a 0..1 ratio, so this is "how far into the strip the cell's left edge sits, less
     * half the visible width", expressed against `maxScrollH`.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::calculateCenteredItemScrollH()
    private calculateCenteredItemScrollH(index: number): number
    {
        const itemList = this.itemList;

        if(!itemList || itemList.maxScrollH === 0) return 0;

        return (this.calculateItemListWidth(index) - (this.scrollerWidth - this.itemWidth) * 0.5)
            / itemList.maxScrollH;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::calculateItemListWidth()
    public calculateItemListWidth(itemCount: number): number
    {
        return itemCount * this.itemWidth + Math.max(0, itemCount - 1) * this.itemGap;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get itemList()
    public get itemList(): IItemListWindow | null
    {
        return this.window
            ? (this.window.findChildByName('calendar_itemlist') as IItemListWindow | null)
            : null;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get itemWidth()
    public get itemWidth(): number
    {
        const itemList = this.itemList;

        return itemList && itemList.numListItems > 0 ? (itemList.getListItemAt(0)?.width ?? 0) : 0;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get itemGap()
    public get itemGap(): number
    {
        return this.itemList ? this.itemList.spacing : 0;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get scrollerWidth()
    public get scrollerWidth(): number
    {
        const window = this.window;

        return window && window.content ? window.content.width : 0;
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarView.as::get calendarData()
    private get calendarData(): CampaignCalendarData | null
    {
        return this._controller?.calendarData ?? null;
    }
}
