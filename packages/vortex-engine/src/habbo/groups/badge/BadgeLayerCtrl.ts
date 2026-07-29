import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from '../HabboGroupsManager';
import {ColorGridCtrl} from '../ColorGridCtrl';
import type {BadgeEditorCtrl} from './BadgeEditorCtrl';
import {BadgeEditorPartItem} from './BadgeEditorPartItem';
import {BadgeLayerOptions} from './BadgeLayerOptions';

const log = Logger.getLogger('habbo.groups.badge.BadgeLayerCtrl');

/**
 * BadgeLayerCtrl
 *
 * One row of the badge editor: a preview button that opens the part picker, a colour
 * grid, and — for the four overlay layers — a 3x3 position picker. Layer 0 is the base
 * and fills the whole badge, so its position picker is hidden.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeLayerCtrl.as
 */
export class BadgeLayerCtrl
{
    // AS3: .../BadgeLayerCtrl.as::BASE_LAYER_INDEX
    public static readonly BASE_LAYER_INDEX: number = 0;
    // AS3: .../BadgeLayerCtrl.as::PARENT_CONTAINER_NAME
    public static readonly PARENT_CONTAINER_NAME: string = 'part_edit_list';

    /**
     * Pixel pitch of the 3x3 position grid — the picker is nudged by this per cell and
     * a click is divided by it to find the cell. AS3 inlines the literal at both sites.
     *
     * AS3: .../BadgeLayerCtrl.as::updatePositionPicker() / onPositionGridClick()
     */
    private static readonly POSITION_CELL_SIZE: number = 14;

    // AS3: .../BadgeLayerCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_4839
    private _editorCtrl: BadgeEditorCtrl | null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_6721
    private _layerIndex: number;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_4837
    private _layerOptions: BadgeLayerOptions;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_5424
    private _window: IWindowContainer | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_5945
    private _colorGrid: ColorGridCtrl | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_9900
    private _addPartImage: ImageBitmap | null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_6334
    private _partPreview: IBitmapWrapperWindow | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_8343
    private _partButton: IWindow | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_7001
    private _positionContainer: IWindowContainer | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_5976
    private _positionPicker: IBitmapWrapperWindow | null = null;
    // AS3: .../BadgeLayerCtrl.as::_SafeStr_6910
    private _positionGrid: IBitmapWrapperWindow | null = null;
    private _disposed: boolean = false;

    // AS3: .../BadgeLayerCtrl.as::BadgeLayerCtrl()
    constructor(groupsManager: HabboGroupsManager, editorCtrl: BadgeEditorCtrl, layerIndex: number)
    {
        this._groupsManager = groupsManager;
        this._editorCtrl = editorCtrl;
        this._layerIndex = layerIndex;
        this._layerOptions = new BadgeLayerOptions();
        this._layerOptions.layerIndex = layerIndex;
        this._addPartImage = groupsManager.getButtonImage('badge_part_add');
    }

    // AS3: .../BadgeLayerCtrl.as::createWindow()
    createWindow(): void
    {
        if(this._window !== null) return;

        const groupsManager = this._groupsManager;
        const editorCtrl = this._editorCtrl;

        if(!groupsManager || !editorCtrl) return;

        const list = editorCtrl.partEditContainer?.findChildByName(BadgeLayerCtrl.PARENT_CONTAINER_NAME) as IItemListWindow | null;

        if(!list)
        {
            log.warn(`createWindow: the badge editor has no "${BadgeLayerCtrl.PARENT_CONTAINER_NAME}" list`);

            return;
        }

        const window = groupsManager.getXmlWindow('badge_layer') as IWindowContainer | null;

        if(!window)
        {
            log.error('createWindow: getXmlWindow("badge_layer") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const previewContainer = window.findChildByName('preview_container') as IWindowContainer | null;

        if(previewContainer)
        {
            this._partPreview = previewContainer.findChildByName('part_preview') as IBitmapWrapperWindow | null;

            if(this._partPreview) this._partPreview.bitmap = groupsManager.getButtonImage('badge_part_add');

            this._partButton = previewContainer.findChildByName('part_button');

            if(this._partButton) this._partButton.procedure = this.onPartPreviewButtonClick;
        }

        this._positionContainer = window.findChildByName('position_container') as IWindowContainer | null;

        if(this._positionContainer)
        {
            this._positionPicker = this._positionContainer.findChildByName('position_picker') as IBitmapWrapperWindow | null;

            if(this._positionPicker) this._positionPicker.bitmap = groupsManager.getButtonImage('position_picker');

            this._positionGrid = this._positionContainer.findChildByName('position_grid') as IBitmapWrapperWindow | null;

            if(this._positionGrid) this._positionGrid.bitmap = groupsManager.getButtonImage('position_grid');
        }

        if(this._layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX)
        {
            if(this._positionGrid) this._positionGrid.visible = false;
            if(this._positionPicker) this._positionPicker.visible = false;
        }
        else if(this._positionGrid)
        {
            this._positionGrid.procedure = this.onPositionGridClick;
        }

        this._colorGrid = new ColorGridCtrl(groupsManager, this.onColorSelected);
        this._colorGrid.createAndAttach(window, 'color_selector', groupsManager.guildEditorData?.badgeColors ?? null);

        // The base layer sits at the bottom of the list and the overlays stack above it,
        // newest first - which is why every non-base layer inserts at index 0.
        if(this._layerOptions.layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX) list.addListItem(window);
        else list.addListItemAt(window, 0);
    }

    // AS3: .../BadgeLayerCtrl.as::setLayerOptions()
    setLayerOptions(options: BadgeLayerOptions): void
    {
        if(options.layerIndex !== this._layerOptions.layerIndex)
        {
            throw new Error('Tried to set layer option with invalid layerIndex value');
        }

        let changed: boolean = false;
        const previous = this._layerOptions;

        this._layerOptions = options.clone();

        if(!this._layerOptions.isGridEqual(previous))
        {
            this.updatePositionPicker(false);
            changed = true;
        }

        if(previous.colorIndex !== this._layerOptions.colorIndex && this._colorGrid)
        {
            this._colorGrid.setSelectedColorIndex(this._layerOptions.colorIndex, false);
            this._layerOptions.colorIndex = this._colorGrid.selectedColorIndex;
            changed = true;
        }

        if(changed || previous.partIndex !== this._layerOptions.partIndex) this.updateSelectedPart();
    }

    // AS3: .../BadgeLayerCtrl.as::get layerOptions()
    get layerOptions(): BadgeLayerOptions
    {
        return this._layerOptions;
    }

    // AS3: .../BadgeLayerCtrl.as::updateSelectedPart()
    updateSelectedPart(): void
    {
        let image: ImageBitmap | null = null;

        if(this._editorCtrl?.badgeSelectPartCtrl)
        {
            image = this._editorCtrl.badgeSelectPartCtrl.getPartItemImage(this.layerOptions);
        }

        if(image === null) image = this._addPartImage;

        if(this._partPreview)
        {
            this._partPreview.bitmap?.close();
            this._partPreview.bitmap = BadgeEditorPartItem.copyBitmap(image);
        }

        this._editorCtrl?.onPartChanged(this);
    }

    // AS3: .../BadgeLayerCtrl.as::updatePositionPicker()
    private updatePositionPicker(refreshPart: boolean = true): void
    {
        if(this._positionPicker)
        {
            this._positionPicker.x = this._layerOptions.gridX * BadgeLayerCtrl.POSITION_CELL_SIZE + 1;
            this._positionPicker.y = this._layerOptions.gridY * BadgeLayerCtrl.POSITION_CELL_SIZE + 1;
        }

        if(refreshPart) this.updateSelectedPart();
    }

    // AS3: .../BadgeLayerCtrl.as::onPositionGridClick()
    private onPositionGridClick = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._positionPicker) return;

        const mouseEvent = event as WindowMouseEvent;

        this._layerOptions.gridX = Math.min(2, Math.max(0, Math.floor(mouseEvent.localX / BadgeLayerCtrl.POSITION_CELL_SIZE)));
        this._layerOptions.gridY = Math.min(2, Math.max(0, Math.floor(mouseEvent.localY / BadgeLayerCtrl.POSITION_CELL_SIZE)));

        this.updatePositionPicker();
    };

    // AS3: .../BadgeLayerCtrl.as::onPartPreviewButtonClick()
    private onPartPreviewButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._editorCtrl?.onShowSelectPart(this);
    };

    // AS3: .../BadgeLayerCtrl.as::onColorSelected()
    onColorSelected = (colorGrid: ColorGridCtrl): void =>
    {
        if(this._layerOptions.colorIndex !== colorGrid.selectedColorIndex)
        {
            this._layerOptions.colorIndex = colorGrid.selectedColorIndex;
            this.updateSelectedPart();
        }
    };

    // AS3: .../BadgeLayerCtrl.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._colorGrid)
        {
            this._colorGrid.dispose();
            this._colorGrid = null;
        }

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._addPartImage?.close();
        this._addPartImage = null;
        this._partPreview = null;
        this._partButton = null;
        this._positionContainer = null;
        this._positionPicker = null;
        this._positionGrid = null;
        this._editorCtrl = null;
        this._groupsManager = null;
        this._disposed = true;
    }
}
