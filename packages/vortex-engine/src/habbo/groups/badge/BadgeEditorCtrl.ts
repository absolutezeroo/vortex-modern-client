import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {GuildBadgePartSetting} from '@habbo/communication/messages/incoming/users/GuildBadgePartSetting';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from '../HabboGroupsManager';
import {HabboGroupsEditorData} from '../events/HabboGroupsEditorData';
import {BadgeEditorPartItem} from './BadgeEditorPartItem';
import {BadgeLayerCtrl} from './BadgeLayerCtrl';
import {BadgeLayerOptions} from './BadgeLayerOptions';
import {BadgeSelectPartCtrl} from './BadgeSelectPartCtrl';

const log = Logger.getLogger('habbo.groups.badge.BadgeEditorCtrl');

/**
 * BadgeEditorCtrl
 *
 * Step 2 of the group wizard (and edit tab 2): five stacked layers, a live preview of
 * the badge they compose to, and the part picker they share.
 *
 * The window can only be built once the guild editor data has arrived, so the
 * constructor also subscribes to it — whichever of the two comes second triggers the
 * build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeEditorCtrl.as
 */
export class BadgeEditorCtrl
{
    /**
     * Number of badge layers: one base plus four overlays. AS3 pushes five
     * `BadgeLayerCtrl`s by hand and later walks `_badgePreviewImages` over the same five
     * `layer_N` children; the count is named here rather than repeated.
     */
    // AS3: .../badge/BadgeEditorCtrl.as::BadgeEditorCtrl() (the five BadgeLayerCtrl pushes)
    private static readonly LAYER_COUNT: number = 5;

    // AS3: .../BadgeEditorCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../BadgeEditorCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_7580
    private _parentWindow: IWindowContainer | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_5846
    private _badgeSettings: GuildBadgePartSetting[] | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_5356
    private _selectPartCtrl: BadgeSelectPartCtrl | null;
    // AS3: .../BadgeEditorCtrl.as::_layers
    private _layers: BadgeLayerCtrl[] | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_5428
    private _currentLayerOptions: BadgeLayerOptions | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_5004
    private _partSelectContainer: IWindowContainer | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_6608
    private _partSelectGrid: IItemGridWindow | null = null;
    // AS3: .../BadgeEditorCtrl.as::_SafeStr_5416
    private _partEditContainer: IWindowContainer | null = null;
    // AS3: .../BadgeEditorCtrl.as::_badgePreviewImages
    private _badgePreviewImages: IBitmapWrapperWindow[] | null = null;
    // AS3: .../badge/BadgeEditorCtrl.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../BadgeEditorCtrl.as::BadgeEditorCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
        this._groupsManager.events.on(HabboGroupsEditorData.EDIT_INFO, this.onHabboGroupsEditorData);
        this._selectPartCtrl = new BadgeSelectPartCtrl(groupsManager, this);
        this._layers = [];

        for(let i = 0; i < BadgeEditorCtrl.LAYER_COUNT; i++)
        {
            this._layers.push(new BadgeLayerCtrl(groupsManager, this, i));
        }
    }

    // AS3: .../BadgeEditorCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../BadgeEditorCtrl.as::get partEditContainer()
    get partEditContainer(): IWindowContainer | null
    {
        return this._partEditContainer;
    }

    // AS3: .../BadgeEditorCtrl.as::get partSelectContainer()
    get partSelectContainer(): IWindowContainer | null
    {
        return this._partSelectContainer;
    }

    // AS3: .../BadgeEditorCtrl.as::get partSelectGrid()
    get partSelectGrid(): IItemGridWindow | null
    {
        return this._partSelectGrid;
    }

    // AS3: .../BadgeEditorCtrl.as::get currentLayerOptions()
    get currentLayerOptions(): BadgeLayerOptions | null
    {
        return this._currentLayerOptions;
    }

    // AS3: .../BadgeEditorCtrl.as::get badgeSelectPartCtrl()
    get badgeSelectPartCtrl(): BadgeSelectPartCtrl | null
    {
        return this._selectPartCtrl;
    }

    // AS3: .../BadgeEditorCtrl.as::get isIntialized()
    get isIntialized(): boolean
    {
        return this._window !== null && this._badgeSettings !== null;
    }

    // AS3: .../BadgeEditorCtrl.as::onHabboGroupsEditorData()
    private onHabboGroupsEditorData = (): void =>
    {
        this._selectPartCtrl?.loadData();
        this.createWindow(null, null);
    };

    // AS3: .../BadgeEditorCtrl.as::createWindow()
    createWindow(parentWindow: IWindowContainer | null, badgeSettings: GuildBadgePartSetting[] | null): void
    {
        if(this._window !== null || this._disposed) return;

        if(parentWindow !== null) this._parentWindow = parentWindow;

        if(badgeSettings !== null) this._badgeSettings = badgeSettings;

        if(this._parentWindow === null || this._badgeSettings === null || this._groupsManager === null || this._groupsManager.guildEditorData === null)
        {
            return;
        }

        const window = this._groupsManager.getXmlWindow('badge_editor') as IWindowContainer | null;

        if(!window)
        {
            log.error('createWindow: getXmlWindow("badge_editor") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const badgeContainer = window.findChildByName('guild_badge') as IWindowContainer | null;

        this._badgePreviewImages = [];

        for(let i = 0; i < BadgeEditorCtrl.LAYER_COUNT; i++)
        {
            const layerImage = badgeContainer?.findChildByName(`layer_${i}`) as IBitmapWrapperWindow | null;

            if(layerImage) this._badgePreviewImages.push(layerImage);
        }

        this._partEditContainer = window.findChildByName('part_edit') as IWindowContainer | null;
        this._partSelectContainer = window.findChildByName('part_select') as IWindowContainer | null;

        if(this._partSelectContainer)
        {
            this._partSelectContainer.visible = false;
            this._partSelectGrid = this._partSelectContainer.findChildByName('part_select_grid') as IItemGridWindow | null;
        }

        if(this._layers)
        {
            for(const layer of this._layers) layer.createWindow();
        }

        this.resetLayerOptions(this._badgeSettings);

        this._parentWindow.addChild(window);
    }

    // AS3: .../BadgeEditorCtrl.as::resetLayerOptions()
    resetLayerOptions(badgeSettings: GuildBadgePartSetting[]): void
    {
        if(!this.isIntialized) return;

        this._badgeSettings = badgeSettings;
        this._currentLayerOptions = null;

        if(this._partEditContainer) this._partEditContainer.visible = true;
        if(this._partSelectContainer) this._partSelectContainer.visible = false;

        this._selectPartCtrl?.loadData();

        if(!this._layers) return;

        for(let i = 0; i < this._layers.length; i++)
        {
            this._layers[i].setLayerOptions(this.createLayerOption(i));
            this._layers[i].updateSelectedPart();
        }
    }

    // AS3: .../BadgeEditorCtrl.as::createLayerOption()
    private createLayerOption(layerIndex: number): BadgeLayerOptions
    {
        const setting = this._badgeSettings?.[layerIndex] ?? null;
        const options = new BadgeLayerOptions();

        options.layerIndex = layerIndex;
        options.colorIndex = 0;

        if(!setting) return options;

        options.setGrid(setting.position);

        const editorData = this._groupsManager?.guildEditorData;

        if(!editorData) return options;

        for(let i = 0; i < editorData.badgeColors.length; i++)
        {
            if(editorData.badgeColors[i].id === setting.colorId)
            {
                options.colorIndex = i;
                break;
            }
        }

        const parts = layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX ? editorData.baseParts : editorData.layerParts;

        for(let i = 0; i < parts.length; i++)
        {
            if(parts[i].id === setting.partId)
            {
                options.partIndex = i;
                break;
            }
        }

        return options;
    }

    // AS3: .../BadgeEditorCtrl.as::onPartSelected()
    onPartSelected(selectPartCtrl: BadgeSelectPartCtrl): void
    {
        if(!this._currentLayerOptions || !this._layers) return;

        this._currentLayerOptions.partIndex = selectPartCtrl.getSelectedPartIndex();
        this._layers[this._currentLayerOptions.layerIndex].setLayerOptions(this._currentLayerOptions);

        if(this._partEditContainer) this._partEditContainer.visible = true;
        if(this._partSelectContainer) this._partSelectContainer.visible = false;
    }

    // AS3: .../BadgeEditorCtrl.as::onPartHover()
    onPartHover(selectPartCtrl: BadgeSelectPartCtrl): void
    {
        this.updatePreviewImage(selectPartCtrl.layerOptions);
    }

    // AS3: .../BadgeEditorCtrl.as::onPartChanged()
    onPartChanged(layer: BadgeLayerCtrl): void
    {
        this.updatePreviewImage(layer.layerOptions);
    }

    // AS3: .../BadgeEditorCtrl.as::updatePreviewImage()
    updatePreviewImage(options: BadgeLayerOptions | null): void
    {
        if(!options || !this._badgePreviewImages) return;

        const preview = this._badgePreviewImages[options.layerIndex];

        if(!preview) return;

        const image = this._selectPartCtrl?.getPartItemImage(options) ?? null;

        if(image !== null)
        {
            preview.bitmap = BadgeEditorPartItem.copyBitmap(image);
            preview.visible = true;
        }
        else
        {
            preview.visible = false;
        }
    }

    // AS3: .../BadgeEditorCtrl.as::onShowSelectPart()
    onShowSelectPart(layer: BadgeLayerCtrl): void
    {
        const previous = this._currentLayerOptions;

        this._currentLayerOptions = layer.layerOptions.clone();

        // Same part list and same tint as last time means the grid is still correct; only
        // the picker's idea of which cell is selected has to catch up.
        if(!layer.layerOptions.equalVisuals(previous)) this._selectPartCtrl?.updateGrid();
        else if(this._selectPartCtrl) this._selectPartCtrl.layerOptions = this._currentLayerOptions.clone();

        if(this._partEditContainer) this._partEditContainer.visible = false;
        if(this._partSelectContainer) this._partSelectContainer.visible = true;
    }

    // AS3: .../BadgeEditorCtrl.as::onViewChange()
    onViewChange(): void
    {
        if(this.isIntialized && this._partSelectContainer?.visible)
        {
            this.updatePreviewImage(this._currentLayerOptions);

            if(this._partEditContainer) this._partEditContainer.visible = true;

            this._partSelectContainer.visible = false;
        }
    }

    /**
     * The badge as the wire wants it: a flat run of (part, colour, position) triplets,
     * skipping any layer that has no part or no colour chosen.
     */
    // AS3: .../badge/BadgeEditorCtrl.as::getBadgeSettings()
    getBadgeSettings(): number[]
    {
        const settings: number[] = [];

        if(!this._layers) return settings;

        for(const layer of this._layers)
        {
            const partId = this.getLayerPartId(layer.layerOptions);

            if(partId < 0) continue;

            const colorId = this.getLayerColorId(layer.layerOptions);

            if(colorId < 0) continue;

            settings.push(partId);
            settings.push(colorId);
            settings.push(layer.layerOptions.position);
        }

        return settings;
    }

    /**
     * The colour of the last filled-in layer, which is what the wizard offers as the
     * guild's primary colour on step 3.
     */
    // AS3: .../badge/BadgeEditorCtrl.as::get primaryColorIndex()
    get primaryColorIndex(): number
    {
        if(this._layers === null) return 0;

        let colorIndex: number = 0;

        for(const layer of this._layers)
        {
            if(this.getLayerPartId(layer.layerOptions) >= 0 && this.getLayerColorId(layer.layerOptions) >= 0)
            {
                colorIndex = layer.layerOptions.colorIndex;
            }
        }

        return colorIndex;
    }

    /**
     * The base layer's colour, offered as the guild's secondary colour.
     */
    // AS3: .../badge/BadgeEditorCtrl.as::get secondaryColorIndex()
    get secondaryColorIndex(): number
    {
        if(this._layers !== null && this._layers.length > 0) return this._layers[0].layerOptions.colorIndex;

        return 0;
    }

    /**
     * The five preview layers flattened into one image, for the confirmation step.
     *
     * AS3 seeds the surface with the opaque 15329761 (0xE9E9E1) the window's background
     * uses, then copies each visible layer over it.
     */
    // AS3: .../badge/BadgeEditorCtrl.as::getBadgeBitmap()
    getBadgeBitmap(): ImageBitmap | null
    {
        if(typeof OffscreenCanvas === 'undefined') return null;

        const canvas = new OffscreenCanvas(BadgeEditorPartItem.IMAGE_WIDTH, BadgeEditorPartItem.IMAGE_HEIGHT);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.fillStyle = '#E9E9E1';
        context.fillRect(0, 0, BadgeEditorPartItem.IMAGE_WIDTH, BadgeEditorPartItem.IMAGE_HEIGHT);

        if(this._badgePreviewImages)
        {
            for(const preview of this._badgePreviewImages)
            {
                if(preview.visible && preview.bitmap) context.drawImage(preview.bitmap, 0, 0);
            }
        }

        return canvas.transferToImageBitmap();
    }

    // AS3: .../BadgeEditorCtrl.as::getLayerPartId()
    private getLayerPartId(options: BadgeLayerOptions): number
    {
        const editorData = this._groupsManager?.guildEditorData;

        if(!editorData || options.partIndex < 0) return -1;

        const parts = options.layerIndex === BadgeLayerCtrl.BASE_LAYER_INDEX ? editorData.baseParts : editorData.layerParts;

        if(options.partIndex >= parts.length) return -1;

        return parts[options.partIndex].id;
    }

    // AS3: .../BadgeEditorCtrl.as::getLayerColorId()
    private getLayerColorId(options: BadgeLayerOptions): number
    {
        const editorData = this._groupsManager?.guildEditorData;

        if(!editorData || options.colorIndex < 0 || options.colorIndex >= editorData.badgeColors.length) return -1;

        return editorData.badgeColors[options.colorIndex].id;
    }

    // AS3: .../BadgeEditorCtrl.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._groupsManager?.events.off(HabboGroupsEditorData.EDIT_INFO, this.onHabboGroupsEditorData);

        if(this._layers)
        {
            for(const layer of this._layers) layer.dispose();

            this._layers = null;
        }

        if(this._selectPartCtrl)
        {
            this._selectPartCtrl.dispose();
            this._selectPartCtrl = null;
        }

        this._partSelectContainer?.dispose();
        this._partSelectContainer = null;
        this._partSelectGrid = null;
        this._partEditContainer?.dispose();
        this._partEditContainer = null;
        this._badgePreviewImages = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._badgeSettings = null;
        this._currentLayerOptions = null;
        this._parentWindow = null;
        this._groupsManager = null;
        this._disposed = true;
    }
}
