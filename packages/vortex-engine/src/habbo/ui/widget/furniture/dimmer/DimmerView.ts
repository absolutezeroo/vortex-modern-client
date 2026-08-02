import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {DimmerFurniWidget} from './DimmerFurniWidget';
import {DimmerViewAlphaSlider} from './DimmerViewAlphaSlider';
import {DimmerViewColorGrid} from './DimmerViewColorGrid';

/**
 * DimmerView
 *
 * The moodlight window: three preset tabs, the colour grid, the brightness slider, a
 * whole-room / background-only checkbox, and Apply.
 *
 * Switching tabs is not a read-only action — `onTabClick` saves the preset being left
 * (without applying it) before loading the one being entered, which is how an edit survives
 * tabbing away without pressing Apply.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/dimmer/DimmerView.as
 */
export class DimmerView
{
    // AS3: .../dimmer/DimmerView.as::DimmerView()
    constructor(widget: DimmerFurniWidget)
    {
        this._widget = widget;
    }

    // AS3: .../dimmer/DimmerView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../dimmer/DimmerView.as::_tabContext
    private _tabContext: ITabContextWindow | null = null;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_4549
    private _widget: DimmerFurniWidget | null;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_5334
    private _colorGrid: DimmerViewColorGrid | null = null;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_5455
    private _alphaSlider: DimmerViewAlphaSlider | null = null;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_7073
    private _selectedBrightness: number = 0;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_5635
    private _selectedColorIndex: number = 0;

    // AS3: .../dimmer/DimmerView.as::_SafeStr_7433
    private _selectedType: number = 0;

    // AS3: .../dimmer/DimmerView.as::get selectedBrightness()
    public get selectedBrightness(): number
    {
        return this._selectedBrightness;
    }

    // AS3: .../dimmer/DimmerView.as::get selectedColorIndex()
    public get selectedColorIndex(): number
    {
        return this._selectedColorIndex;
    }

    // AS3: .../dimmer/DimmerView.as::get selectedType()
    public get selectedType(): number
    {
        return this._selectedType;
    }

    // AS3: .../dimmer/DimmerView.as::get colors()
    public get colors(): number[]
    {
        return this._widget?.colors ?? [];
    }

    // AS3: .../dimmer/DimmerView.as::showInterface()
    public showInterface(): void
    {
        if(this._window === null)
        {
            this.createWindow();
        }

        this.selectPreset(this._widget?.selectedPresetIndex ?? 0);
        this.update();
    }

    /**
     * Re-reads the on/off state: an off moodlight hides the whole tabbed editor behind the
     * "switch me on" panel and disables Apply.
     */
    // AS3: .../dimmer/DimmerView.as::update()
    public update(): void
    {
        if(this._window === null || this._widget === null) return;

        const isOn = this._widget.isOn;

        const onOffButton = this._window.findChildByName('on_off_button');

        if(onOffButton !== null)
        {
            onOffButton.caption = isOn ? '${widget.dimmer.button.off}' : '${widget.dimmer.button.on}';
        }

        const tabbedView = this._window.findChildByName('tabbedview');

        if(tabbedView !== null)
        {
            tabbedView.visible = isOn;
        }

        const applyButton = this._window.findChildByName('apply_button');

        if(applyButton !== null)
        {
            if(isOn)
            {
                applyButton.enable();
            }
            else
            {
                applyButton.disable();
            }
        }

        const offBorder = this._window.findChildByName('off_border');

        if(offBorder !== null)
        {
            offBorder.visible = !isOn;
        }
    }

    /** Closing previews the *stored* setting again, so an unapplied edit does not linger on the room. */
    // AS3: .../dimmer/DimmerView.as::hideInterface()
    public hideInterface(): void
    {
        this._widget?.removePreview();

        if(this._colorGrid !== null)
        {
            this._colorGrid.dispose();
            this._colorGrid = null;
        }

        if(this._alphaSlider !== null)
        {
            this._alphaSlider.dispose();
            this._alphaSlider = null;
        }

        this._tabContext = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../dimmer/DimmerView.as::createWindow()
    private createWindow(): void
    {
        if(this._widget === null || this._widget.windowManager === null) return;

        this._window = this._widget.windowManager.buildWidgetLayout('dimmer_ui') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.center();

        const closeButton = this._window.findChildByTag('close');

        if(closeButton !== null)
        {
            closeButton.procedure = this.onWindowClose;
        }

        const gridContainer = this._window.findChildByName('color_grid_container') as IWindowContainer | null;

        if(gridContainer !== null)
        {
            const grid = gridContainer.findChildByName('color_grid') as IItemGridWindow | null;

            if(grid !== null)
            {
                this._colorGrid = new DimmerViewColorGrid(this, grid, this._widget.windowManager, this._widget.assets);
            }
        }

        const brightnessContainer = this._window.findChildByName('brightness_container') as IWindowContainer | null;

        if(brightnessContainer !== null)
        {
            this._alphaSlider = new DimmerViewAlphaSlider(this, brightnessContainer, this._widget.assets);
        }

        this._tabContext = this._window.findChildByName('tab_context') as ITabContextWindow | null;

        this.selectTab(this._widget.selectedPresetIndex);

        if(this._tabContext !== null)
        {
            for(let i = 0; i < this._tabContext.numTabItems; i += 1)
            {
                const tab = this._tabContext.getTabItemAt(i);

                if(tab === null) continue;

                tab.setParamFlag(1, true);
                tab.procedure = this.onTabClick;
            }
        }

        for(const name of ['type_checkbox', 'apply_button', 'on_off_button'])
        {
            this._window.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseEvent);
        }

        const offImage = this._window.findChildByName('off_image') as IBitmapWrapperWindow | null;
        const infoAsset = this._widget.assets?.getAssetByName('dimmer_info') as BitmapDataAsset | null;

        if(offImage !== null && infoAsset !== null)
        {
            offImage.bitmap = infoAsset.content as ImageBitmap | null;
        }
    }

    // AS3: .../dimmer/DimmerView.as::onMouseEvent()
    private onMouseEvent = (event: WindowMouseEvent): void =>
    {
        const target = event.target as IWindow | null;

        if(target === null || this._widget === null) return;

        switch(target.name)
        {
            case 'type_checkbox':
            {
                const checkbox = target as ISelectableWindow;

                this.selectedType = checkbox.isSelected ? 2 : 1;

                this._widget.previewCurrentSetting();
                break;
            }
            case 'apply_button':
                this._widget.storeCurrentSetting(true);
                break;
            case 'cancel':
            case 'close':
                this.hideInterface();
                break;
            case 'on_off_button':
                this._widget.changeRoomDimmerState();
                break;
        }
    };

    // AS3: .../dimmer/DimmerView.as::onTabClick()
    private onTabClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_SELECTED') return;

        this._widget?.storeCurrentSetting(false);

        this.selectPreset(window.id);
    };

    // AS3: .../dimmer/DimmerView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hideInterface();
    };

    /** Loads a preset into the controls and previews it — selecting a tab shows the room what it holds. */
    // AS3: .../dimmer/DimmerView.as::selectPreset()
    private selectPreset(index: number): void
    {
        const presets = this._widget?.presets ?? null;

        if(this._widget === null || presets === null || index < 0 || index >= presets.length) return;

        this._widget.selectedPresetIndex = index;

        const preset = presets[index] ?? null;

        if(preset === null) return;

        this.selectTab(index);

        this._selectedBrightness = preset.light;
        this._alphaSlider?.setValue(this._selectedBrightness);

        this._selectedColorIndex = this.colors.indexOf(preset.color);
        this._colorGrid?.setSelectedColorIndex(this._selectedColorIndex);

        this.selectedType = preset.type;

        this._widget.previewCurrentSetting();
    }

    // AS3: .../dimmer/DimmerView.as::selectTab()
    private selectTab(index: number): void
    {
        if(this._tabContext === null) return;

        const tab = this._tabContext.getTabItemAt(index);

        if(tab !== null)
        {
            this._tabContext.selector?.setSelected(tab as unknown as ISelectableWindow);
        }
    }

    /**
     * Type 1 tints the whole room, type 2 only the background. Anything else is ignored —
     * AS3 returns before touching the checkbox, so an unknown type leaves the UI alone.
     */
    // AS3: .../dimmer/DimmerView.as::set selectedType()
    public set selectedType(value: number)
    {
        if(value !== 1 && value !== 2) return;

        this._selectedType = value;

        const checkbox = this._window?.findChildByName('type_checkbox') as ISelectableWindow | null;

        if(checkbox !== null && checkbox !== undefined)
        {
            if(value === 2)
            {
                checkbox.select();
            }
            else
            {
                checkbox.unselect();
            }
        }

        if(this._alphaSlider !== null && this._widget !== null)
        {
            this._alphaSlider.min = this._widget.minLights[value - 1] ?? 0;
        }
    }

    // AS3: .../dimmer/DimmerView.as::set selectedColorIndex()
    public set selectedColorIndex(value: number)
    {
        this._selectedColorIndex = value;

        this._colorGrid?.setSelectedColorIndex(value);
        this._widget?.previewCurrentSetting();
    }

    // AS3: .../dimmer/DimmerView.as::set selectedBrightness()
    public set selectedBrightness(value: number)
    {
        this._selectedBrightness = value;

        this._alphaSlider?.setValue(value);
        this._widget?.previewCurrentSetting();
    }

    // AS3: .../dimmer/DimmerView.as::dispose()
    public dispose(): void
    {
        this.hideInterface();

        this._widget = null;
    }
}
