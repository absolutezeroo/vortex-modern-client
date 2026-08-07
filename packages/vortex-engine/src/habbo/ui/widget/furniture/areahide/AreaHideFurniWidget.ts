import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomAreaSelectionManager} from '@habbo/room/IRoomAreaSelectionManager';
import {Logger} from '@core/utils/Logger';
import {SetAreaHideDataMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/SetAreaHideDataMessageComposer';
import {UseFurnitureMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import type {IRoomWidgetHandler} from '../../../IRoomWidgetHandler';
import type {FurnitureAreaHideWidgetHandler} from '../../../handler/FurnitureAreaHideWidgetHandler';
import {RoomWidgetBase} from '../../RoomWidgetBase';

const log = Logger.getLogger('habbo.ui.widget.furniture.areahide.AreaHideFurniWidget');

/**
 * Configures an area-hide furni: the rectangle it covers, and the three flags deciding what
 * disappears inside it.
 *
 * The rectangle is picked on the room floor, not in the window — the widget drives the room's
 * area-selection manager, and the picked corners come back through `onAreaSelected`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as
 */
export class AreaHideFurniWidget extends RoomWidgetBase
{
    /**
     * `true` in the shipped client, which makes the Apply button dead weight: it is hidden on
     * creation and `onClickApply()` returns immediately. Every settings change saves itself.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::AUTO_SAVE
    private static readonly AUTO_SAVE: boolean = true;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_textNames
    // The labels dimmed alongside the controls when the area is switched on.
    private static readonly TEXT_NAMES: string[] = [
        'hidearea_info',
        'areaselection_title',
        'areaselection_info',
        'options_title',
        'invisibility_txt',
        'invisibility_info',
        'wallitems_txt',
        'invert_txt',
        'invert_info'
    ];

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_areaSelectionManager
    private _areaSelectionManager: IRoomAreaSelectionManager | null;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_objectId
    private _objectId: number = -1;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_isOn
    // Name DERIVED (`_SafeStr_6008`): the furni's state 0, and what `updateStatus()` compares.
    private _isOn: boolean = false;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_rootX
    private _rootX: number = 0;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_rootY
    private _rootY: number = 0;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_width
    private _width: number = 0;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_length
    private _length: number = 0;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_isDirty
    // Name DERIVED (`_SafeStr_6404`): set by every settings change, cleared by a save; it is what
    // enables the Apply button in the non-auto-save build.
    private _isDirty: boolean = false;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_isSelecting
    // Name DERIVED (`_SafeStr_6486`): raised while the user is dragging a rectangle on the floor,
    // which is what greys the Select button out until the pick lands.
    private _isSelecting: boolean = false;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::_isAreaSelectionActive
    // Name DERIVED (`_SafeStr_5364`): whether *this* widget currently owns the selection manager.
    private _isAreaSelectionActive: boolean = false;

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::AreaHideFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        roomEngine: IRoomEngine | null
    )
    {
        super(handler, windowManager, assets, localizations);

        // AS3 hands itself to the handler in the constructor — the handler calls straight into
        // `open()`/`updateStatus()` rather than going through the widget event bus.
        this.handler.widget = this;

        this._areaSelectionManager = roomEngine?.areaSelectionManager ?? null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get handler()
    get handler(): FurnitureAreaHideWidgetHandler
    {
        return this._handler as unknown as FurnitureAreaHideWidgetHandler;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get mainWindow()
    // Not overridden in AS3 — this window centres itself and is never placed by the layout manager.
    override get mainWindow(): IWindow | null
    {
        return null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::dispose()
    override dispose(): void
    {
        this.destroyWindow();

        super.dispose();
    }

    /**
     * Called directly by the handler, not through the event bus. The three checkboxes are set
     * *before* `updateAreaSelecting()` so that the highlight reflects the saved rectangle.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::open()
    open(
        objectId: number,
        isOn: boolean,
        rootX: number,
        rootY: number,
        width: number,
        length: number,
        invisibility: boolean,
        wallItems: boolean,
        invert: boolean
    ): void
    {
        this._objectId = objectId;
        this._isOn = isOn;
        this._rootX = rootX;
        this._rootY = rootY;
        this._width = width;
        this._length = length;

        this.createWindow();

        const invisibilityCheckbox = this.invisibilityCheckbox;
        const wallItemsCheckbox = this.wallItemsEnabledCheckbox;
        const invertCheckbox = this.invertEnabledCheckbox;

        if(invisibilityCheckbox !== null) invisibilityCheckbox.isSelected = invisibility;

        if(wallItemsCheckbox !== null) wallItemsCheckbox.isSelected = wallItems;

        if(invertCheckbox !== null) invertCheckbox.isSelected = invert;

        this._isDirty = false;
        this._isSelecting = false;

        this.updateAreaSelecting();
        this.refreshUI();
    }

    /**
     * The server confirming a toggle. Three conditions, all required: the window is up, it is
     * *this* object, and the state actually changed — a repeat is dropped rather than redrawn.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::updateStatus()
    updateStatus(objectId: number, isOn: boolean): void
    {
        if(this.isActive && objectId === this._objectId && isOn !== this._isOn)
        {
            this._isOn = isOn;

            this.updateAreaSelecting();
            this.refreshUI();
        }
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get isActive()
    private get isActive(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    /**
     * The floor selection is only offered while the area is **off**: once it is hiding things,
     * the manager is released. Note the highlight is set on every call, not only on activation,
     * so a rectangle change while off is reflected immediately.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::updateAreaSelecting()
    private updateAreaSelecting(): void
    {
        if(this._areaSelectionManager === null) return;

        if(!this._isOn)
        {
            if(!this._isAreaSelectionActive)
            {
                this._isAreaSelectionActive = this._areaSelectionManager.activate(this.onAreaSelected, 'highlight_darken');
            }

            if(this._isAreaSelectionActive)
            {
                this._areaSelectionManager.setHighlight(this._rootX, this._rootY, this._width, this._length);
            }
        }
        else if(this._isAreaSelectionActive)
        {
            this._areaSelectionManager.deactivate();
            this._isAreaSelectionActive = false;
        }
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::createWindow()
    // Re-opening an existing window only makes it visible again — the state is reapplied by the
    // `open()` call around this one.
    private createWindow(): void
    {
        if(this._window !== null)
        {
            this._window.visible = true;

            return;
        }

        this._window = this.windowManager.buildWidgetLayout('area_hide_ui_xml') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('area_hide_ui_xml did not build — the area-hide furni cannot be configured');
            this._window = null;

            return;
        }

        this._window.procedure = this.windowProcedure;

        for(const checkbox of [this.invisibilityCheckbox, this.wallItemsEnabledCheckbox, this.invertEnabledCheckbox])
        {
            if(checkbox === null) continue;

            checkbox.addEventListener('WE_SELECTED', this.onSettingsChanged);
            checkbox.addEventListener('WE_UNSELECTED', this.onSettingsChanged);
        }

        const apply = this.applyButton;

        if(apply !== null) apply.visible = !AreaHideFurniWidget.AUTO_SAVE;

        this._window.center();
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::hideWindow()
    // Hides rather than destroys, and clears the whole selection back to "no object".
    private hideWindow(): void
    {
        if(this._window === null) return;

        this._window.visible = false;

        if(this._isAreaSelectionActive)
        {
            this._areaSelectionManager?.deactivate();
            this._isAreaSelectionActive = false;
        }

        this._objectId = -1;
        this._isOn = false;
        this._rootX = 0;
        this._rootY = 0;
        this._width = 0;
        this._length = 0;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::destroyWindow()
    private destroyWindow(): void
    {
        this.hideWindow();

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
     * While the area is on, everything is dimmed and the button says "off". While it is off, the
     * three action buttons each have their own condition: Apply needs unsaved changes, Select
     * needs the manager and no pick in flight, Clear just needs the manager.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::refreshUI()
    private refreshUI(): void
    {
        const onOff = this.onOffButton;

        if(this._isOn)
        {
            if(onOff !== null)
            {
                onOff.caption = this.localizations?.getLocalization('widget.areahide.button.off') ?? '';
            }

            this.disableContents(true);

            return;
        }

        if(onOff !== null)
        {
            onOff.caption = this.localizations?.getLocalization('widget.areahide.button.on') ?? '';
        }

        this.disableContents(false);

        AreaHideFurniWidget.disableElement(!this._isDirty, this.applyButton);
        AreaHideFurniWidget.disableElement(this._isSelecting || !this._isAreaSelectionActive, this.selectButton);
        AreaHideFurniWidget.disableElement(!this._isAreaSelectionActive, this.clearButton);
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::disableContents()
    // The checkboxes and labels are half-faded as well as disabled; the buttons only disabled.
    private disableContents(disabled: boolean): void
    {
        const blend = disabled ? 0.5 : 1;

        AreaHideFurniWidget.disableElement(disabled, this.selectButton);
        AreaHideFurniWidget.disableElement(disabled, this.clearButton);
        AreaHideFurniWidget.disableElement(disabled, this.applyButton);

        for(const checkbox of [this.invisibilityCheckbox, this.wallItemsEnabledCheckbox, this.invertEnabledCheckbox])
        {
            AreaHideFurniWidget.disableElement(disabled, checkbox);

            if(checkbox !== null) checkbox.blend = blend;
        }

        for(const name of AreaHideFurniWidget.TEXT_NAMES)
        {
            const label = this._window?.findChildByName(name) as ITextWindow | null;

            if(label !== null && label !== undefined) label.blend = blend;
        }
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::disableElement()
    private static disableElement(disabled: boolean, element: IWindow | null): void
    {
        if(element === null) return;

        if(disabled)
        {
            element.disable();
        }
        else
        {
            element.enable();
        }
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onAreaSelected()
    // The pick landing on the floor counts as a settings change, so auto-save sends it.
    private onAreaSelected = (x: number, y: number, width: number, length: number): void =>
    {
        this._rootX = x;
        this._rootY = y;
        this._width = width;
        this._length = length;
        this._isSelecting = false;

        this.onSettingsChanged();
    };

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onClickSelect()
    private onClickSelect(): void
    {
        this._isSelecting = true;
        this._areaSelectionManager?.startSelecting();
        this.refreshUI();
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onClickClear()
    // Clears the highlight only — it does not save, and does not refresh the UI either.
    private onClickClear(): void
    {
        this._areaSelectionManager?.clearHighlight();
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onClickOnOff()
    // Toggling is a plain furni use; the answer comes back as RETWE_UPDATE_STATE_AREA_HIDE.
    private onClickOnOff(): void
    {
        this.handler.container?.connection?.send(new UseFurnitureMessageComposer(this._objectId));
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onClickApply()
    // Dead while AUTO_SAVE is true, which it is — the button is hidden on creation.
    private onClickApply(): void
    {
        if(!this._isDirty || AreaHideFurniWidget.AUTO_SAVE) return;

        this.updateData();
        this.applyButton?.disable();
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::updateData()
    private updateData(): void
    {
        this.handler.container?.connection?.send(new SetAreaHideDataMessageComposer(
            this._objectId,
            this._rootX,
            this._rootY,
            this._width,
            this._length,
            this.invisibilityCheckbox?.isSelected ?? false,
            this.wallItemsEnabledCheckbox?.isSelected ?? false,
            this.invertEnabledCheckbox?.isSelected ?? false
        ));

        this._isDirty = false;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::onSettingsChanged()
    private onSettingsChanged = (): void =>
    {
        this._isDirty = true;

        if(AreaHideFurniWidget.AUTO_SAVE) this.updateData();

        this.refreshUI();
    };

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::windowProcedure()
    // The close button hides rather than destroys, so re-opening skips the rebuild.
    private windowProcedure = (event: {type: string}, target: {name: string} | null): void =>
    {
        if(target === null || event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'apply_button':
                this.onClickApply();
                break;

            case 'on_off_button':
                this.onClickOnOff();
                break;

            case 'select_button':
                this.onClickSelect();
                break;

            case 'clear_button':
                this.onClickClear();
                break;

            case 'header_button_close':
                this.hideWindow();
                break;
        }
    };

    /**
     * The `deactivate()` on the window is AS3's, and only on this one getter of the seven —
     * it drops keyboard focus every time the Select button is looked up, which is on every
     * `refreshUI()`. Kept: it is load-bearing for the floor pick, which needs the room to have
     * focus rather than the window.
     *
     * The four button getters are typed `ITextWindow` rather than AS3's button-window type,
     * which this port does not declare — `caption` (needed by `onOffButton`) and
     * `enable()`/`disable()` are what they are used for, and both live there.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/areahide/AreaHideFurniWidget.as::get selectButton()
    private get selectButton(): ITextWindow | null
    {
        if(this._window === null) return null;

        this._window.deactivate();

        return this._window.findChildByName('select_button') as ITextWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get clearButton()
    private get clearButton(): ITextWindow | null
    {
        return (this._window?.findChildByName('clear_button') ?? null) as ITextWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get applyButton()
    private get applyButton(): ITextWindow | null
    {
        return (this._window?.findChildByName('apply_button') ?? null) as ITextWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get onOffButton()
    private get onOffButton(): ITextWindow | null
    {
        return (this._window?.findChildByName('on_off_button') ?? null) as ITextWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get invisibilityCheckbox()
    // The layout misspells it "invisiblity"; the lookup has to match the XML, not the getter.
    private get invisibilityCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('invisiblity_checkbox') ?? null) as ISelectableWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get wallItemsEnabledCheckbox()
    private get wallItemsEnabledCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('wallitems_checkbox') ?? null) as ISelectableWindow | null;
    }

    // AS3: .../furniture/areahide/AreaHideFurniWidget.as::get invertEnabledCheckbox()
    private get invertEnabledCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('invert_checkbox') ?? null) as ISelectableWindow | null;
    }
}
