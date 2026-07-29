import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuildColorData} from '@habbo/communication/messages/incoming/users/GuildColorData';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.ColorGridCtrl');

/**
 * ColorGridCtrl
 *
 * A grid of colour swatches. Each cell is three stacked bitmaps from the shipped
 * assets — an unchanged background, a foreground tinted to the swatch's colour, and a
 * selection ring shown on the current cell only. Used three times over: the guild
 * primary and secondary grids on step 3 of the creation wizard, and once per badge
 * layer inside the badge editor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/ColorGridCtrl.as
 */
export class ColorGridCtrl
{
    // AS3: .../ColorGridCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../ColorGridCtrl.as::_parentCallback
    private _parentCallback: ((ctrl: ColorGridCtrl) => void) | null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_7580
    private _parentWindow: IWindowContainer | null = null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_5941
    private _colors: GuildColorData[] | null = null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_5334
    private _grid: IItemGridWindow | null = null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_5635
    private _selectedColorIndex: number = -1;
    // AS3: .../ColorGridCtrl.as::_SafeStr_6619
    private _selectedBitmap: ImageBitmap | null = null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_5237
    private _backgroundBitmap: ImageBitmap | null = null;
    // AS3: .../ColorGridCtrl.as::_SafeStr_6799
    private _foregroundBitmap: ImageBitmap | null = null;
    private _disposed: boolean = false;

    // AS3: .../ColorGridCtrl.as::ColorGridCtrl()
    constructor(groupsManager: HabboGroupsManager, parentCallback: ((ctrl: ColorGridCtrl) => void) | null)
    {
        this._groupsManager = groupsManager;
        this._parentCallback = parentCallback;
    }

    // AS3: .../ColorGridCtrl.as::get selectedColorIndex()
    get selectedColorIndex(): number
    {
        return this._selectedColorIndex;
    }

    // AS3: .../ColorGridCtrl.as::get isInitialized()
    get isInitialized(): boolean
    {
        return this._colors !== null && this._grid !== null;
    }

    // AS3: .../ColorGridCtrl.as::createAndAttach()
    createAndAttach(parentWindow: IWindowContainer | null, gridName: string, colors: GuildColorData[] | null): void
    {
        if(this._grid !== null || parentWindow === null || gridName === null || colors === null) return;

        this._parentWindow = parentWindow;
        this._colors = colors;
        this._grid = this._parentWindow.findChildByName(gridName) as IItemGridWindow | null;

        if(!this._grid)
        {
            log.warn(`createAndAttach: no grid named "${gridName}" in the parent window`);

            return;
        }

        this._backgroundBitmap = this.getBitmap('color_chooser_bg');
        this._foregroundBitmap = this.getBitmap('color_chooser_fg');
        this._selectedBitmap = this.getBitmap('color_chooser_selected');

        for(const color of this._colors)
        {
            const item = this._groupsManager?.getXmlWindow('badge_color_item') as IWindowContainer | null;

            if(!item) continue;

            item.procedure = this.onClick;
            item.background = true;
            item.color = 4290689957;

            if(this._backgroundBitmap)
            {
                item.width = this._backgroundBitmap.width;
                item.height = this._backgroundBitmap.height;
            }

            this.setGridItemBitmap(item, 'background', this._backgroundBitmap, true, null);
            this.setGridItemBitmap(item, 'foreground', this._foregroundBitmap, true, color);
            this.setGridItemBitmap(item, 'selected', this._selectedBitmap, false, null);

            this._grid.addGridItem(item);
        }
    }

    // AS3: .../ColorGridCtrl.as::setGridItemBitmap()
    private setGridItemBitmap(item: IWindowContainer, childName: string, source: ImageBitmap | null, visible: boolean, tint: GuildColorData | null): void
    {
        const target = item.findChildByName(childName) as IBitmapWrapperWindow | null;

        if(!target || !source) return;

        const copy = ColorGridCtrl.cloneBitmap(source, tint);

        if(!copy) return;

        target.bitmap = copy;
        target.visible = visible;
    }

    /**
     * AS3 clones the source BitmapData and, for the foreground layer, runs a
     * `ColorTransform(red/255, green/255, blue/255)` over it — a per-channel multiply.
     * `globalCompositeOperation = 'multiply'` over an opaque fill is the same operation,
     * and `destination-in` puts the source's alpha back afterwards so the swatch keeps
     * its rounded edge.
     *
     * AS3: .../ColorGridCtrl.as::setGridItemBitmap() (the ColorTransform branch)
     */
    private static cloneBitmap(source: ImageBitmap, tint: GuildColorData | null): ImageBitmap | null
    {
        if(typeof OffscreenCanvas === 'undefined' || source.width < 1 || source.height < 1) return null;

        const canvas = new OffscreenCanvas(source.width, source.height);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.drawImage(source, 0, 0);

        if(tint)
        {
            context.globalCompositeOperation = 'multiply';
            context.fillStyle = `rgb(${tint.red}, ${tint.green}, ${tint.blue})`;
            context.fillRect(0, 0, source.width, source.height);
            context.globalCompositeOperation = 'destination-in';
            context.drawImage(source, 0, 0);
        }

        return canvas.transferToImageBitmap();
    }

    // AS3: .../ColorGridCtrl.as::setSelectedColorIndex()
    setSelectedColorIndex(index: number, notifyParent: boolean = true): void
    {
        if(index < 0) index = 0;

        if(this._grid && this._selectedColorIndex !== index && index < this._grid.numGridItems)
        {
            this.setSelectedItemVisibility(this._selectedColorIndex, false);
            this._selectedColorIndex = index;
            this.setSelectedItemVisibility(this._selectedColorIndex, true);
        }

        if(notifyParent && this._parentCallback !== null) this._parentCallback(this);
    }

    // AS3: .../ColorGridCtrl.as::setSelectedColorById()
    setSelectedColorById(colorId: number): void
    {
        if(!this.isInitialized) return;

        const colors = this._colors as GuildColorData[];

        for(let i = 0; i < colors.length; i++)
        {
            if(colors[i].id === colorId)
            {
                this.setSelectedColorIndex(i);

                return;
            }
        }

        this.setSelectedColorIndex(0);
    }

    // AS3: .../ColorGridCtrl.as::getSelectedColorId()
    getSelectedColorId(): number
    {
        return this.getSelectedColorData()?.id ?? 0;
    }

    // AS3: .../ColorGridCtrl.as::getSelectedColorData()
    getSelectedColorData(): GuildColorData | null
    {
        if(this._colors !== null && this._selectedColorIndex >= 0 && this._selectedColorIndex < this._colors.length)
        {
            return this._colors[this._selectedColorIndex];
        }

        return null;
    }

    /**
     * AS3 throws when the asset is missing. It is reached once per grid construction
     * from three shipped images, so a miss is a packaging fault rather than a runtime
     * condition; logging and carrying on leaves the grid readable instead of tearing
     * down the whole window.
     *
     * AS3: .../ColorGridCtrl.as::getBitmap()
     */
    private getBitmap(name: string): ImageBitmap | null
    {
        const bitmap = (this._groupsManager?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;

        if(!bitmap) log.warn(`getBitmap: failed to load bitmap asset "${name}" in ColorGridCtrl`);

        return bitmap;
    }

    // AS3: .../ColorGridCtrl.as::setSelectedItemVisibility()
    private setSelectedItemVisibility(index: number, visible: boolean): void
    {
        if(!this._grid || index < 0 || index >= this._grid.numGridItems) return;

        const item = this._grid.getGridItemAt(index) as IWindowContainer | null;

        if(!item) return;

        const selected = item.findChildByName('selected');

        if(selected) selected.visible = visible;
    }

    // AS3: .../ColorGridCtrl.as::onClick()
    private onClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._grid) return;

        this.setSelectedColorIndex(this._grid.getGridItemIndex(window));
    };

    // AS3: .../ColorGridCtrl.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._grid)
        {
            this._grid.destroyGridItems();
            this._grid = null;
        }

        this._backgroundBitmap?.close();
        this._backgroundBitmap = null;
        this._foregroundBitmap?.close();
        this._foregroundBitmap = null;
        this._selectedBitmap?.close();
        this._selectedBitmap = null;
        this._groupsManager = null;
        this._parentWindow = null;
        this._parentCallback = null;
        this._disposed = true;
    }
}
