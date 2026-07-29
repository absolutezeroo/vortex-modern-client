import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from '../HabboGroupsManager';
import type {BadgeEditorCtrl} from './BadgeEditorCtrl';
import {BadgeEditorPartItem} from './BadgeEditorPartItem';
import {BadgeLayerCtrl} from './BadgeLayerCtrl';
import type {BadgeLayerOptions} from './BadgeLayerOptions';

const log = Logger.getLogger('habbo.groups.badge.BadgeSelectPartCtrl');

/**
 * BadgeSelectPartCtrl
 *
 * The part picker that replaces the layer list when a layer's preview button is
 * clicked. It owns the two part collections — bases for layer 0, overlays for layers
 * 1-4 — and fills the grid from whichever the layer being edited draws from.
 *
 * The overlay collection is offset by one because it is headed by an "empty" item that
 * clears the layer, which is why every index crossing into it is ±1.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeSelectPartCtrl.as
 */
export class BadgeSelectPartCtrl
{
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_4839
    private _editorCtrl: BadgeEditorCtrl | null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_5204
    private _layerItems: BadgeEditorPartItem[] | null = null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_5245
    private _baseItems: BadgeEditorPartItem[] | null = null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_4837
    private _layerOptions: BadgeLayerOptions | null = null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_4690
    private _hoveredItem: IWindowContainer | null = null;
    // AS3: .../BadgeSelectPartCtrl.as::_SafeStr_5545
    private _selectedMarker: IBitmapWrapperWindow | null = null;
    private _disposed: boolean = false;

    // AS3: .../BadgeSelectPartCtrl.as::BadgeSelectPartCtrl()
    constructor(groupsManager: HabboGroupsManager, editorCtrl: BadgeEditorCtrl)
    {
        this._groupsManager = groupsManager;
        this._editorCtrl = editorCtrl;
    }

    // AS3: .../BadgeSelectPartCtrl.as::get layerOptions()
    get layerOptions(): BadgeLayerOptions | null
    {
        return this._layerOptions;
    }

    // AS3: .../BadgeSelectPartCtrl.as::set layerOptions()
    set layerOptions(value: BadgeLayerOptions | null)
    {
        this._layerOptions = value;
    }

    // AS3: .../BadgeSelectPartCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../BadgeSelectPartCtrl.as::getSelectedPartIndex()
    getSelectedPartIndex(): number
    {
        let index = -1;

        const grid = this._editorCtrl?.partSelectGrid;

        if(this._layerOptions !== null && grid && this._hoveredItem !== null)
        {
            index = grid.getGridItemIndex(this._hoveredItem);

            if(index !== -1 && this._layerOptions.layerIndex !== BadgeLayerCtrl.BASE_LAYER_INDEX) index -= 1;
        }

        return index;
    }

    // AS3: .../BadgeSelectPartCtrl.as::loadData()
    loadData(): void
    {
        if(this._layerItems !== null || this._baseItems !== null) return;

        const groupsManager = this._groupsManager;
        const editorData = groupsManager?.guildEditorData;

        if(!groupsManager || !editorData) return;

        this._baseItems = [];

        for(const part of editorData.baseParts)
        {
            this._baseItems.push(new BadgeEditorPartItem(groupsManager, this, this._baseItems.length, BadgeEditorPartItem.BASE_PART, part));
        }

        this._layerItems = [];
        this._layerItems.push(new BadgeEditorPartItem(groupsManager, this, -1, BadgeEditorPartItem.LAYER_PART));

        for(const part of editorData.layerParts)
        {
            this._layerItems.push(new BadgeEditorPartItem(groupsManager, this, this._layerItems.length - 1, BadgeEditorPartItem.LAYER_PART, part));
        }
    }

    // AS3: .../BadgeSelectPartCtrl.as::updateGrid()
    updateGrid(): void
    {
        const grid = this._editorCtrl?.partSelectGrid;
        const currentOptions = this._editorCtrl?.currentLayerOptions;

        if(!grid || !currentOptions) return;

        this._hoveredItem = null;
        this._selectedMarker = null;
        this._layerOptions = currentOptions.clone();

        grid.destroyGridItems();

        const items = this._layerOptions.layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX ? this._baseItems : this._layerItems;

        if(!items) return;

        for(const item of items)
        {
            const gridItem = this.createGridItem(item);

            if(gridItem) grid.addGridItem(gridItem);
        }
    }

    // AS3: .../BadgeSelectPartCtrl.as::createGridItem()
    private createGridItem(item: BadgeEditorPartItem): IWindowContainer | null
    {
        const window = this._groupsManager?.getXmlWindow('badge_part_item') as IWindowContainer | null;

        if(!window)
        {
            log.warn('createGridItem: getXmlWindow("badge_part_item") returned null');

            return null;
        }

        window.procedure = this.onPartMouseEvent;
        this.setGridItemImage(window, item);

        return window;
    }

    // AS3: .../BadgeSelectPartCtrl.as::onBaseImageLoaded()
    onBaseImageLoaded(item: BadgeEditorPartItem): void
    {
        const grid = this._editorCtrl?.partSelectGrid;

        if(this._layerOptions !== null && this._layerOptions.layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX && this._editorCtrl?.partSelectContainer?.visible && grid)
        {
            const window = grid.getGridItemAt(item.partIndex) as IWindowContainer | null;

            if(window) this.setGridItemImage(window, item);
        }
    }

    // AS3: .../BadgeSelectPartCtrl.as::onLayerImageLoaded()
    onLayerImageLoaded(item: BadgeEditorPartItem): void
    {
        const grid = this._editorCtrl?.partSelectGrid;

        if(this._layerOptions !== null && this._layerOptions.layerIndex !== BadgeLayerCtrl.BASE_LAYER_INDEX && this._editorCtrl?.partSelectContainer?.visible && grid)
        {
            const window = grid.getGridItemAt(item.partIndex + 1) as IWindowContainer | null;

            if(window) this.setGridItemImage(window, item);
        }
    }

    // AS3: .../BadgeSelectPartCtrl.as::setGridItemImage()
    private setGridItemImage(window: IWindowContainer, item: BadgeEditorPartItem): void
    {
        const composite = item.getComposite(this._layerOptions);

        if(composite !== null)
        {
            const partImage = window.findChildByName('part') as IBitmapWrapperWindow | null;

            if(partImage) partImage.bitmap = BadgeEditorPartItem.copyBitmap(composite);
        }

        const selected = window.findChildByName('selected') as IBitmapWrapperWindow | null;

        if(!selected) return;

        selected.bitmap = this._groupsManager?.getButtonImage('badge_part_picker') ?? null;

        if(item.partIndex === this._layerOptions?.partIndex)
        {
            selected.visible = true;
            this._selectedMarker = selected;
        }
        else
        {
            selected.visible = false;
        }
    }

    // AS3: .../BadgeSelectPartCtrl.as::onPartMouseEvent()
    private onPartMouseEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_OVER')
        {
            if(this._hoveredItem !== window)
            {
                if(this._hoveredItem !== null)
                {
                    const previousBackground = this._hoveredItem.findChildByName('background');

                    if(previousBackground) previousBackground.color = 15329761;
                }

                this._hoveredItem = window as IWindowContainer;

                if(this._hoveredItem !== null)
                {
                    const background = this._hoveredItem.findChildByName('background');

                    if(background) background.color = 14210761;

                    if(this._layerOptions) this._layerOptions.partIndex = this.getSelectedPartIndex();

                    this._editorCtrl?.onPartHover(this);
                }
            }
        }

        if(event.type === 'WME_CLICK')
        {
            if(this._selectedMarker !== null) this._selectedMarker.visible = false;

            const container = window as IWindowContainer;

            if(container !== null)
            {
                this._selectedMarker = container.findChildByName('selected') as IBitmapWrapperWindow | null;

                if(this._selectedMarker) this._selectedMarker.visible = true;
            }

            this._editorCtrl?.onPartSelected(this);
        }
    };

    // AS3: .../BadgeSelectPartCtrl.as::getPartItemImage()
    getPartItemImage(options: BadgeLayerOptions | null): ImageBitmap | null
    {
        if(options === null || options.partIndex < 0) return null;

        if(options.layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX)
        {
            if(this._baseItems !== null && options.partIndex < this._baseItems.length)
            {
                return this._baseItems[options.partIndex].getComposite(options);
            }
        }
        else if(this._layerItems !== null && options.partIndex + 1 < this._layerItems.length)
        {
            return this._layerItems[options.partIndex + 1].getComposite(options);
        }

        return null;
    }

    // AS3: .../BadgeSelectPartCtrl.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        const grid = this._editorCtrl?.partSelectGrid;

        if(grid && grid.numGridItems > 0) grid.destroyGridItems();

        if(this._layerItems)
        {
            for(const item of this._layerItems) item.dispose();

            this._layerItems = null;
        }

        if(this._baseItems)
        {
            for(const item of this._baseItems) item.dispose();

            this._baseItems = null;
        }

        this._layerOptions = null;
        this._selectedMarker = null;
        this._hoveredItem = null;
        this._editorCtrl = null;
        this._groupsManager = null;
        this._disposed = true;
    }
}
