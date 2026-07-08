import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WidgetContainerLayout} from './WidgetContainerLayout';
import type {CommonWidgetSettings} from './CommonWidgetSettings';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('DynamicLayoutManager');

const SLOT_COUNT = 6;

/**
 * The 6-slot dynamic grid layout engine for the landing view.
 *
 * Manages a top full-width item list, a left/center/right pane row (slots
 * 1-2), and a bottom row (slots 3-4), rebalancing slot heights and list
 * spacing on every resize. Slot 5 is allocated but not touched by the
 * balance methods below - ported exactly as decompiled, not "fixed".
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as
 */
export class DynamicLayoutManager implements IDisposable
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::PLACEHOLDER_NAME
    public static readonly PLACEHOLDER_NAME: string = 'placeholder_dynamic_widget_slots';
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::CONTENT_AREA_START_X
    public static readonly CONTENT_AREA_START_X: number = 230;
    private static readonly NUMBER_OF_SLOTS: number = 5;
    private static readonly RESIZE_TOLERANCE_SCROLLBAR_VISIBILITY: number = 6;
    private static readonly ABSOLUTE_MINIMUM_HEIGHT: number = 360;

    private _layout: WidgetContainerLayout | null;
    private _topItemList: IItemListWindow;
    private _centerSlotsContainer: IWindowContainer;
    private _centerScrollableList: IItemListWindow;
    private _leftPaneList: IItemListWindow;
    private _rightPaneList: IItemListWindow;
    private _rightSlotsContainer: IWindowContainer;
    private _bottomLeftSlotList: IItemListWindow;
    private _bottomRightSlotList: IItemListWindow;
    private _separatorTemplate: IWindow;
    private _window: IWindowContainer | null;
    private _slots: Array<IWindowContainer | null> = new Array(SLOT_COUNT).fill(null);
    private _ignoreBottomRightSlot: boolean = false;
    private _settings: CommonWidgetSettings | null;

    private readonly _leftRightPaneMinSpacing: number = 10;
    private readonly _leftRightPaneMaxSpacing: number = 50;
    private readonly _topListMinSpacing: number = 10;
    private readonly _topListMaxSpacing: number = 80;
    private readonly _centerListMinSpacing: number = 10;
    private readonly _centerListMaxSpacing: number = 60;

    private _topItemListInitialHeightCache: number = -1;
    private _topItemListInitialWidthCache: number = -1;
    private _verticalSizeApplied: boolean = false;
    private _resizingWindow: IWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::DynamicLayoutManager()
    constructor(layout: WidgetContainerLayout, settings: CommonWidgetSettings)
    {
        this._layout = layout;
        this._settings = settings;

        this._window = layout.landingView!.getXmlWindow('dynamic_widget_grid') as IWindowContainer;

        const placeholder = layout.window!.findChildByName(DynamicLayoutManager.PLACEHOLDER_NAME)!;
        const placeholderParent = placeholder.parent as IWindowContainer;

        placeholderParent.addChildAt(this._window, placeholderParent.getChildIndex(placeholder));
        placeholderParent.removeChild(placeholder);

        this._topItemList = this._window.findChildByName('widgetlist_fromtop') as IItemListWindow;
        this._centerSlotsContainer = this._window.findChildByName('center_slots_container') as IWindowContainer;
        this._centerScrollableList = this._window.findChildByName('widget_slots_center_scrollable') as IItemListWindow;
        this._leftPaneList = this._window.findChildByName('widget_slots_center_left') as IItemListWindow;
        this._rightPaneList = this._window.findChildByName('widget_slots_center_right') as IItemListWindow;
        this._rightSlotsContainer = this._window.findChildByName('widget_slots_right') as IWindowContainer;
        this._bottomLeftSlotList = this._window.findChildByName('widget_slot_4_root') as IItemListWindow;
        this._bottomRightSlotList = this._window.findChildByName('widget_slot_5_root') as IItemListWindow;
        this._separatorTemplate = layout.landingView!.getXmlWindow('dynamic_widget_grid_separator')!;

        for(let i = 0; i < SLOT_COUNT; i++)
        {
            const slot = this._window.findChildByName('widget_slot_' + (i + 1)) as IWindowContainer | null;

            this._slots[i] = slot;

            if(slot)
            {
                slot.addEventListener(WindowEvent.WE_RESIZED, this.contractCenterContainer);
            }
        }

        const leftPaneWidth = layout.landingView!.dynamicLayoutLeftPaneWidth;
        const rightPaneWidth = layout.landingView!.dynamicLayoutRightPaneWidth;

        this._leftPaneList.width = leftPaneWidth;
        this._leftPaneList.limits.maxWidth = leftPaneWidth;
        this._bottomLeftSlotList.width = leftPaneWidth;
        this._rightPaneList.width = rightPaneWidth;
        this._rightSlotsContainer.width = rightPaneWidth;
        this._rightSlotsContainer.limits.maxWidth = rightPaneWidth;
        this._bottomRightSlotList.width = rightPaneWidth;
        this._centerScrollableList.arrangeListItems();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        for(let i = 0; i < SLOT_COUNT; i++)
        {
            if(this._slots[i])
            {
                this._slots[i]!.dispose();
            }

            this._slots[i] = null;
        }

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._layout = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::get disposed()
    get disposed(): boolean
    {
        return this._layout === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::getDynamicSlotContainer()
    getDynamicSlotContainer(index: number): IWindowContainer | null
    {
        return this._slots[index];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::enableSeparator()
    enableSeparator(slotNumber: number, titleKey: string): void
    {
        let targetList: IItemListWindow | null;

        switch(slotNumber - 4)
        {
            case 0: targetList = this._bottomLeftSlotList; break;
            case 1: targetList = this._bottomRightSlotList; break;
            default: targetList = null;
        }

        if(!targetList) return;

        if(targetList.numListItems < 2)
        {
            targetList.addListItemAt(this._separatorTemplate.clone(), 0);
        }

        const separatorItem = targetList.getListItemAt(0) as IItemListWindow;
        const titleText = separatorItem.getListItemByName('separator_title') as ITextWindow;

        titleText.caption = '${' + titleKey + '}';

        if(this._settings)
        {
            if(this._settings.isTextColorSet)
            {
                titleText.textColor = this._settings.textColor;
            }

            if(this._settings.isEtchingColorSet)
            {
                titleText.etchingColor = this._settings.etchingColor;
            }

            if(this._settings.isEtchingPositionSet)
            {
                titleText.etchingPosition = this._settings.etchingPosition;
            }
        }
    }

    private isSlotOccupied(index: number): boolean
    {
        return (this._slots[index]?.numChildren ?? 0) > 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::resizeTo()
    resizeTo(width: number, height: number): void
    {
        this._topItemList.height = Math.min(height, this.topItemListInitialHeight);
        this._topItemList.height = Math.max(DynamicLayoutManager.ABSOLUTE_MINIMUM_HEIGHT, this._topItemList.height);
        this._topItemList.width = Math.min(width, this.topItemListInitialWidth);
        this.applyVerticalSize();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::get topItemListInitialHeight()
    get topItemListInitialHeight(): number
    {
        if(this._topItemListInitialHeightCache === -1)
        {
            this._topItemListInitialHeightCache = this._topItemList.height;
        }

        return this._topItemListInitialHeightCache;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::get topItemListInitialWidth()
    get topItemListInitialWidth(): number
    {
        if(this._topItemListInitialWidthCache === -1)
        {
            this._topItemListInitialWidthCache = this._topItemList.width;
        }

        return this._topItemListInitialWidthCache;
    }

    private applyVerticalSize(): void
    {
        this.clearEmptySlotsForSpace();
        this.alignTopWidgetRow();
        this.alignBottomWidgetRow();
        this.resetToMaximumSpacing();
        this.setVerticalSpacing(this.topItemListContentHeight - this._topItemList.height);
        this.contractCenterContainer();
        this.setHorizontalSpacing();

        if(!this._verticalSizeApplied)
        {
            for(let i = 0; i < SLOT_COUNT; i++)
            {
                this._slots[i]?.addEventListener(WindowEvent.WE_RESIZED, this.updateLayout);
            }
        }

        this._verticalSizeApplied = true;
        this._resizingWindow = null;
    }

    private updateLayout = (event?: WindowEvent): void =>
    {
        if(this._resizingWindow === null)
        {
            this._resizingWindow = event?.window ?? null;
            this.applyVerticalSize();
        }
    };

    private clearEmptySlotsForSpace(): void
    {
        if(!this.isSlotOccupied(0) && this._slots[0])
        {
            this._slots[0].height = 0;
        }

        for(let i = 1; i <= 4; i++)
        {
            if(!this.isSlotOccupied(i) && this._slots[i])
            {
                this._slots[i]!.height = 1;
            }
        }
    }

    private alignBottomWidgetRow(): void
    {
        if(this.isSlotOccupied(3) || this.isSlotOccupied(4))
        {
            const maxHeight = Math.max(this._slots[3]!.height, this._slots[4]!.height);

            this._slots[3]!.height = maxHeight;
            this._slots[4]!.height = maxHeight;

            if(this.isSlotOccupied(3))
            {
                const child = this._slots[3]!.getChildAt(0);

                if(child) child.y = 0;

                this._slots[3]!.width = this._layout!.landingView!.dynamicLayoutLeftPaneWidth;
            }

            if(this.isSlotOccupied(4))
            {
                const child = this._slots[4]!.getChildAt(0);

                if(child) child.y = 0;

                this._slots[4]!.width = this._layout!.landingView!.dynamicLayoutRightPaneWidth;
            }
        }
    }

    private alignTopWidgetRow(): number
    {
        let maxHeight = 0;

        if(this.isSlotOccupied(1) || this.isSlotOccupied(2))
        {
            if(!this._ignoreBottomRightSlot)
            {
                maxHeight = Math.max(this._slots[1]!.height, this._slots[2]!.height);
                this._slots[1]!.height = maxHeight;
                this._slots[2]!.height = maxHeight;
            }

            if(this.isSlotOccupied(1))
            {
                const child = this._slots[1]!.getChildAt(0);

                if(child) child.y = 0;

                this._slots[1]!.width = this._layout!.landingView!.dynamicLayoutLeftPaneWidth;
            }

            if(this.isSlotOccupied(2))
            {
                const child = this._slots[2]!.getChildAt(0);

                if(child) child.y = 0;

                this._slots[2]!.width = this._layout!.landingView!.dynamicLayoutRightPaneWidth;
            }
        }

        return maxHeight;
    }

    private setHorizontalSpacing(): void
    {
        const diff = this.topItemListInitialWidth - this._topItemList.width;

        if(diff > this._centerListMaxSpacing - this._centerListMinSpacing)
        {
            this._centerScrollableList.spacing = this._centerListMinSpacing;
        }
        else
        {
            this._centerScrollableList.spacing = Math.min(this._centerListMaxSpacing, this._centerListMaxSpacing - diff);
        }
    }

    private setVerticalSpacing(contentOverflow: number): void
    {
        const leftRightRange = this._leftRightPaneMaxSpacing - this._leftRightPaneMinSpacing;
        const topListRange = this._topListMaxSpacing - this._topListMinSpacing;

        contentOverflow += this._leftRightPaneMinSpacing + this._topListMinSpacing;

        if(contentOverflow <= 0)
        {
            this._topItemList.spacing = this._topListMinSpacing;
            this._leftPaneList.spacing = this._leftRightPaneMaxSpacing;
            this._rightPaneList.spacing = this._leftRightPaneMaxSpacing;
        }
        else if(contentOverflow < leftRightRange)
        {
            this._topItemList.spacing = this._topListMinSpacing;
            this._leftPaneList.spacing = this._leftRightPaneMaxSpacing - contentOverflow;
            this._rightPaneList.spacing = this._leftRightPaneMaxSpacing - contentOverflow;
        }
        else if(contentOverflow < leftRightRange + topListRange)
        {
            this._topItemList.spacing = this._topListMinSpacing;
            this._leftPaneList.spacing = this._leftRightPaneMinSpacing;
            this._rightPaneList.spacing = this._leftRightPaneMinSpacing;
        }
        else
        {
            // AS3 quirk preserved verbatim: this branch is identical to the one
            // above (see DynamicLayoutManager.as::setVerticalSpacing()).
            this._topItemList.spacing = this._topListMinSpacing;
            this._leftPaneList.spacing = this._leftRightPaneMinSpacing;
            this._rightPaneList.spacing = this._leftRightPaneMinSpacing;
        }
    }

    private resetToMaximumSpacing(): void
    {
        this._centerScrollableList.spacing = this._centerListMaxSpacing;
        this._leftPaneList.spacing = this._leftRightPaneMaxSpacing;
        this._rightPaneList.spacing = this._leftRightPaneMaxSpacing;
        this._topItemList.spacing = this._topListMaxSpacing;
        this._leftPaneList.invalidate();
        this._rightPaneList.invalidate();
        this._centerScrollableList.invalidate();
        this._topItemList.invalidate();
        this._centerSlotsContainer.invalidate();
    }

    private get topItemListContentHeight(): number
    {
        let total = 0;

        for(let i = 0; i < this._topItemList.numListItems; i++)
        {
            const item = this._topItemList.getListItemAt(i);

            total += item?.height ?? 0;

            if(i > 0)
            {
                total += this._topItemList.spacing;
            }
        }

        return total;
    }

    private contractCenterContainer = (event?: WindowEvent): void =>
    {
        if(event != null && !this._verticalSizeApplied) return;

        this._leftPaneList.invalidate();
        this._rightPaneList.invalidate();

        const maxHeight = Math.max(this._leftPaneList.height, this._rightPaneList.height);

        this._centerScrollableList.height = maxHeight;
        this._centerSlotsContainer.height = maxHeight;
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/DynamicLayoutManager.as::set ignoreBottomRightSlot()
    set ignoreBottomRightSlot(value: boolean)
    {
        this._ignoreBottomRightSlot = value;
    }

    private logFinalPositions(): void
    {
        log.debug('***** Final positions *****');

        const rect = {x: 0, y: 0, width: 0, height: 0};

        this._window!.getGlobalRectangle(rect);
        log.debug('Window rect: ', {...rect});

        this._topItemList.getGlobalRectangle(rect);
        log.debug('All items list rect: ', {...rect});

        this._centerSlotsContainer.getGlobalRectangle(rect);
        log.debug('Center container itemlist rect: ', {...rect});

        this._centerScrollableList.getGlobalRectangle(rect);
        log.debug('Center itemlist rect: ', {...rect});

        this._leftPaneList.getGlobalRectangle(rect);
        log.debug('Left pane itemlist rect: ', {...rect});

        this._rightPaneList.getGlobalRectangle(rect);
        log.debug('Right pane itemlist rect: ', {...rect});

        this._rightSlotsContainer.getGlobalRectangle(rect);
        log.debug('Right pane container rect: ', {...rect});

        for(let i = 0; i < 5; i++)
        {
            this._slots[i]?.getGlobalRectangle(rect);
            log.debug(`Slot ${i} rect: `, {...rect});
        }
    }
}
