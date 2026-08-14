import {Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {LoadingIcon} from '@habbo/utils/LoadingIcon';
import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {
    VariableList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableList';
import {
    WiredSetUserPermanentVariableComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/WiredSetUserPermanentVariableComposer';
import {
    RequestVariableManagementDetailComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestVariableManagementDetailComposer';
import {Util} from '../../../Util';
import {VariableValueTableObject} from '../../tabs/tab_inspection/VariableValueTableObject';
import {NewVariablePicker} from '../../../wired_setup/uibuilder/presets/newvariablepicker/NewVariablePicker';
import {WiredInputSourcePicker} from '../../../wired_setup/inputsources/WiredInputSourcePicker';
import {PermanentVariableHolderPreviewer} from './PermanentVariableHolderPreviewer';
import type {VariableManagementDetailController} from './VariableManagementDetailController';

const log = Logger.getLogger('habbo.roomevents.wired_menu.VariableManagementDetailView');

/**
 * The per-holder permanent-variable editor: a table of the holder's variables, a portrait of who
 * they belong to, and a bubble for adding one.
 *
 * All three write operations — edit a value, create a variable, delete one — go out as the same
 * message, {@link WiredSetUserPermanentVariableComposer}, distinguished only by its `mode`. Each
 * one raises the loading icon and waits; the refreshed list arrives as a separate push, so nothing
 * here mutates the table optimistically.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/detail/VariableManagementDetailView.as
 */
export class VariableManagementDetailView
{
    /**
	 * The desktop layer this window lives on. AS3 passes 1 to both `buildFromXML()` and
	 * `getDesktop()`, so the window is built into, and attached to, the same layer.
	 */
    // AS3: VariableManagementDetailView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /**
	 * AS3 declares both as `public static var`, not `const`, but nothing anywhere assigns them —
	 * `readonly` here matches the behaviour and the sibling `WiredMenuInspectionTab`, which carries
	 * its own identical pair (that is AS3's duplication, not this port's).
	 */
    // AS3: VariableManagementDetailView.as::VARIABLES_COLUMN_VARIABLE
    static readonly VARIABLES_COLUMN_VARIABLE: string = 'variable';

    // AS3: VariableManagementDetailView.as::VARIABLES_COLUMN_VALUE
    static readonly VARIABLES_COLUMN_VALUE: string = 'value';

    // AS3: VariableManagementDetailView.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableManagementDetailView.as::_controller (obfuscated `_SafeStr_4593`)
    private _controller: VariableManagementDetailController | null;

    // AS3: VariableManagementDetailView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: VariableManagementDetailView.as::_loadingIcon
    private _loadingIcon: LoadingIcon | null;

    // AS3: VariableManagementDetailView.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: VariableManagementDetailView.as::_tableView (obfuscated `_SafeStr_5103`)
    private _tableView: TableView | null = null;

    // AS3: VariableManagementDetailView.as::_variablePicker (obfuscated `_SafeStr_6148`)
    private _variablePicker: NewVariablePicker | null = null;

    // AS3: VariableManagementDetailView.as::_previewer (obfuscated `_SafeStr_5561`)
    private _previewer: PermanentVariableHolderPreviewer | null = null;

    // AS3: VariableManagementDetailView.as::VariableManagementDetailView()
    constructor(controller: VariableManagementDetailController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const xml = controller.assets?.getAssetByName('variables_management_detail_xml')?.content ?? null;

        if(!xml)
        {
            // AS3 dereferences the asset unguarded and would throw here; this port warns instead,
            // because a missing layout is a shipping problem rather than a code one.
            log.warn('variables_management_detail_xml is not in the asset library — detail view not built');

            this._loadingIcon = null;

            return;
        }

        this._window = windowManager.buildFromXML(
            xml as string,
            VariableManagementDetailView.DESKTOP_WINDOW_LAYER
        ) as IFrameWindow;

        this._loadingIcon = new LoadingIcon();
        this._tableView = new TableView(windowManager, this.variableValuesTableContainer as IWindowContainer);
        this._previewer = new PermanentVariableHolderPreviewer(
            this.previewWindow as IWindowContainer,
            controller.roomEvents.wiredMenu
        );

        this.createVariableValuesTable();
        this.createCreateVariableBubble();

        this.refreshButton?.addEventListener('WME_CLICK', this.onRefreshClick);
        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
        this.deleteVariableButton?.addEventListener('WME_CLICK', this.onDeleteVariableClicked);
        this.addVariableButton?.addEventListener('WME_CLICK', this.onAddVariableClicked);
        this.createVariableButton?.addEventListener('WME_CLICK', this.onCreateVariableClicked);

        if(this._window) this._window.procedure = this.windowProcedure;

        // AS3 builds the window shown and hides it immediately, rather than building it hidden.
        this.hide();
    }

    /**
	 * Re-ask the server for this holder's list. The refresh button is the only path that re-sends
	 * the *fetch*; every write relies on the server pushing the new list unprompted.
	 */
    // AS3: VariableManagementDetailView.as::onRefreshClick()
    private onRefreshClick = (): void =>
    {
        const data = this._controller?.data;

        if(!data) return;

        this._controller?.send(new RequestVariableManagementDetailComposer(data.entityType, data.entityId));
        this.setLoading(true);
    };

    // AS3: VariableManagementDetailView.as::onClose()
    private onClose = (): void =>
    {
        this.hide();
    };

    // AS3: VariableManagementDetailView.as::hide()
    hide(): void
    {
        if(!this.isShowing()) return;

        // `getDesktop()` is typed `IWindow`; the desktop is a container, and this is the cast every
        // other view in this module already makes (PagedTableView, WiredErrorInfoView).
        const desktop = this._windowManager?.getDesktop(VariableManagementDetailView.DESKTOP_WINDOW_LAYER) as unknown as IWindowContainer | null;

        if(desktop && this._window) desktop.removeChild(this._window);
    }

    // AS3: VariableManagementDetailView.as::show()
    show(): void
    {
        if(this.isShowing()) return;

        // `getDesktop()` is typed `IWindow`; the desktop is a container, and this is the cast every
        // other view in this module already makes (PagedTableView, WiredErrorInfoView).
        const desktop = this._windowManager?.getDesktop(VariableManagementDetailView.DESKTOP_WINDOW_LAYER) as unknown as IWindowContainer | null;

        if(desktop && this._window)
        {
            desktop.addChild(this._window);
            this._window.center();
        }
    }

    /**
	 * AS3 asks the window whether it has a parent — attaching and detaching from the desktop *is*
	 * the show/hide, so there is no separate visibility flag to consult.
	 */
    // AS3: VariableManagementDetailView.as::isShowing()
    isShowing(): boolean
    {
        return this._window?.parent != null;
    }

    // AS3: VariableManagementDetailView.as::createVariableValuesTable()
    private createVariableValuesTable(): void
    {
        const localization = this._controller?.localizationManager ?? null;

        const columns: TableColumn[] = [
            new TableColumn(
                VariableManagementDetailView.VARIABLES_COLUMN_VARIABLE,
                localization?.getLocalization('wiredmenu.inspection.variables.variable') ?? '',
                0.65,
                'left'
            ),
            new TableColumn(
                VariableManagementDetailView.VARIABLES_COLUMN_VALUE,
                localization?.getLocalization('wiredmenu.inspection.variables.value') ?? '',
                0.35,
                'right'
            ),
        ];

        this._tableView?.initialize(columns);

        if(this._tableView)
        {
            this._tableView.onCellEditCallback = this.onCellEdit;
            this._tableView.onRowSelectedCallback = this.onRowSelected;
        }
    }

    // AS3: VariableManagementDetailView.as::createCreateVariableBubble()
    private createCreateVariableBubble(): void
    {
        const roomEvents = this._controller?.roomEvents ?? null;
        const presetManager = roomEvents?.wiredCtrl?.presetManager ?? null;
        const container = this.variablePickerContainer;

        if(!roomEvents || !presetManager || !container) return;

        const layout = presetManager.createLayout('search_tree_dropdown') as IWindowContainer | null;

        if(!layout) return;

        container.addChild(layout);

        this._variablePicker = new NewVariablePicker(
            roomEvents,
            layout,
            this.variableFilter,
            this.onChangeCreateVariable
        );

        this._variablePicker.width = container.width;

        const bubble = this.createVariableBubble;

        if(bubble) bubble.visible = false;
    }

    /**
	 * The value box is only meaningful for a variable that holds one, and there is nothing to
	 * create until a variable is picked — AS3 greys both out rather than hiding them.
	 */
    // AS3: VariableManagementDetailView.as::onChangeCreateVariable()
    private onChangeCreateVariable = (variable: WiredVariable | null): void =>
    {
        const valueSetting = this.valueSettingContainer;
        const createButton = this.createVariableButton;

        if(valueSetting) Util.disableSection(valueSetting, variable != null && !variable.hasValue);
        if(createButton) Util.disableSection(createButton, variable == null);
    };

    /**
	 * Which variables the create picker may offer: creatable, persisted, and not already on this
	 * holder. The membership test is what `WiredUserPermanentVariablesList.variableIds` exists for.
	 */
    // AS3: VariableManagementDetailView.as::variableFilter()
    private variableFilter = (variable: WiredVariable): boolean =>
    {
        const data = this._controller?.data ?? null;

        return variable.canCreateAndDelete
            && (data == null || !data.variableIds.has(variable.variableId))
            && variable.isPersisted;
    };

    /**
	 * A value typed into the table. AS3 refuses silently on three counts — wrong column, no write
	 * permission, or a variable that cannot take a value — and again if the text is not an integer:
	 * `getIntFromString` returns the sentinel and nothing is sent.
	 */
    // AS3: VariableManagementDetailView.as::onCellEdit()
    private onCellEdit = (object: ITableObject, columnId: string, text: string): void =>
    {
        if(columnId !== VariableManagementDetailView.VARIABLES_COLUMN_VALUE) return;

        const row = object as VariableValueTableObject;
        const variable = row.variable;

        if(!this.hasWritePermission || !variable.hasValue || !variable.canWriteValue) return;

        const data = this._controller?.data ?? null;

        if(!data) return;

        // AS3's sentinel is int.MIN_VALUE: "the text was not a number", distinct from a legitimate 0.
        const value = Util.getIntFromString(text, -2147483648, true);

        if(value === -2147483648) return;

        this._controller?.send(
            new WiredSetUserPermanentVariableComposer(data.entityType, data.entityId, variable.variableId, value, 0)
        );
        this.setLoading(true);
    };

    // AS3: VariableManagementDetailView.as::get hasWritePermission()
    private get hasWritePermission(): boolean
    {
        return this._controller?.roomEvents?.wiredMenu?.hasWritePermission === true;
    }

    /**
	 * The add button toggles: an open bubble closes, a closed one re-fetches the variable catalogue
	 * before opening, so the picker cannot offer a stale list.
	 */
    // AS3: VariableManagementDetailView.as::onAddVariableClicked()
    private onAddVariableClicked = (): void =>
    {
        const bubble = this.createVariableBubble;

        if(!bubble) return;

        if(bubble.visible)
        {
            bubble.visible = false;

            return;
        }

        this._controller?.roomEvents?.variablesSynchronizer?.getAllVariables(this.initializeCreateVariableBubble, true);
    };

    /**
	 * Click-outside-to-close for the bubble. AS3 excludes the add button itself — otherwise the
	 * button's own click would close the bubble it had just opened — and any window inside it.
	 */
    // AS3: VariableManagementDetailView.as::windowProcedure()
    private windowProcedure = (event: {type: string}, window: IWindow): void =>
    {
        const bubble = this.createVariableBubble;

        if(event.type !== 'WME_CLICK' || !bubble?.visible) return;

        if(window.name !== 'add_var_btn' && !Util.windowIsChild(bubble as unknown as IWindow, window))
        {
            bubble.visible = false;
        }
    };

    // AS3: VariableManagementDetailView.as::initializeCreateVariableBubble()
    private initializeCreateVariableBubble = (variables: WiredVariable[]): void =>
    {
        // AS3 copies the vector into a plain Array before wrapping it; the copy is what keeps the
        // picker's list independent of the synchroniser's.
        this._variablePicker?.init(new VariableList([...variables]), '', WiredInputSourcePicker.USER_SOURCE);

        const createButton = this.createVariableButton;
        const bubble = this.createVariableBubble;

        if(createButton) Util.disableSection(createButton, true);
        if(bubble) bubble.visible = true;
    };

    // AS3: VariableManagementDetailView.as::onDeleteVariableClicked()
    private onDeleteVariableClicked = (): void =>
    {
        const data = this._controller?.data ?? null;

        if(!data) return;

        const row = this._tableView?.selected as VariableValueTableObject | null;

        if(!row) return;

        const variable = row.variable;

        if(!this.hasWritePermission || !variable.canCreateAndDelete) return;

        // Mode 2 is delete; AS3 still sends a value, and sends 0.
        this._controller?.send(
            new WiredSetUserPermanentVariableComposer(data.entityType, data.entityId, variable.variableId, 0, 2)
        );
        this.setLoading(true);
    };

    // AS3: VariableManagementDetailView.as::onCreateVariableClicked()
    private onCreateVariableClicked = (): void =>
    {
        const data = this._controller?.data ?? null;

        if(!data) return;

        const variable = this._variablePicker?.selected ?? null;

        if(!variable) return;

        this._variablePicker?.finalize();

        // A variable that holds no value is created with 0 rather than with the box's contents.
        const value = variable.hasValue ? Util.getIntFromString(this.valueInput?.text ?? '', 0) : 0;

        this._controller?.send(
            new WiredSetUserPermanentVariableComposer(data.entityType, data.entityId, variable.variableId, value, 1)
        );
        this.setLoading(true);

        const bubble = this.createVariableBubble;

        if(bubble) bubble.visible = false;
        if(this.valueInput) this.valueInput.text = '0';
    };

    // AS3: VariableManagementDetailView.as::onRowSelected()
    private onRowSelected = (_object: ITableObject | null): void =>
    {
        this.updateButtonsUI();
    };

    /**
	 * Add is available to anyone who may write; delete additionally needs a selected row whose
	 * variable is one the player is allowed to remove.
	 */
    // AS3: VariableManagementDetailView.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        let canDelete = false;
        let canAdd = false;

        if(this.hasWritePermission)
        {
            const row = this._tableView?.selected as VariableValueTableObject | null;

            if(row?.variable?.canCreateAndDelete) canDelete = true;

            canAdd = true;
        }

        const deleteButton = this.deleteVariableButton;
        const addButton = this.addVariableButton;

        if(deleteButton) Util.disableSection(deleteButton, !canDelete);
        if(addButton) Util.disableSection(addButton, !canAdd);
    }

    // AS3: VariableManagementDetailView.as::displayNewData()
    displayNewData(): void
    {
        if(!this._controller?.data) return;

        this.updateTableviewUI();
        this.updatePreviewUI();
        this.updateInfoBoxUI();
        this.updateButtonsUI();
        this.setLoading(false);
        this._tableView?.scrollToTop();
        this._window?.activate();
    }

    /**
	 * Entity type 2 is a pet; everything else — user (1) and bot (4) — draws an avatar. Only the
	 * non-pet branch passes an id, which is what makes the portrait clickable.
	 */
    // AS3: VariableManagementDetailView.as::updatePreviewUI()
    private updatePreviewUI(): void
    {
        const data = this._controller?.data ?? null;

        if(!data)
        {
            this._previewer?.clearPreviewer();

            return;
        }

        if(data.entityType === 2)
        {
            this._previewer?.setPetPreview(data.entityFigure);
        }
        else
        {
            this._previewer?.setUserPreview(data.entityFigure, data.entityId);
        }
    }

    /**
	 * One localization key per entity type. The pet and bot ones take the owner as well, which is
	 * exactly the block `WiredUserPermanentVariablesList` only reads for non-users.
	 */
    // AS3: VariableManagementDetailView.as::updateInfoBoxUI()
    private updateInfoBoxUI(): void
    {
        const infoBox = this.infoBoxText;

        if(!infoBox) return;

        const data = this._controller?.data ?? null;
        const localization = this._controller?.localizationManager ?? null;

        if(!data || !localization)
        {
            infoBox.text = '';

            return;
        }

        if(data.entityType === 1)
        {
            infoBox.text = localization.getLocalizationWithParams(
                'wiredmenu.variable_management_detail.info.user',
                '',
                'name', data.entityName,
                'id', String(data.entityId)
            );
        }
        else if(data.entityType === 2)
        {
            infoBox.text = localization.getLocalizationWithParams(
                'wiredmenu.variable_management_detail.info.pet',
                '',
                'name', data.entityName,
                'id', String(data.entityId),
                'owner_name', data.ownerName,
                'owner_id', String(data.ownerId)
            );
        }
        else if(data.entityType === 4)
        {
            infoBox.text = localization.getLocalizationWithParams(
                'wiredmenu.variable_management_detail.info.bot',
                '',
                'name', data.entityName,
                'id', String(data.entityId),
                'owner_name', data.ownerName,
                'owner_id', String(data.ownerId)
            );
        }
    }

    /**
	 * The wire gives variable ids and values; the *definitions* come from the controller's
	 * `variablesById`, built from the synchroniser. A stored value whose definition is unknown is
	 * dropped rather than rendered, and invisible variables never reach the table at all.
	 */
    // AS3: VariableManagementDetailView.as::updateTableviewUI()
    updateTableviewUI(): void
    {
        const data = this._controller?.data ?? null;

        if(!data) return;

        const variables: WiredVariable[] = [];
        const values = new OrderedMap<string, number>();

        for(const stored of data.variableStorage)
        {
            if(stored.variableId === null) continue;

            const variable = this._controller?.variablesById.get(stored.variableId) ?? null;

            if(variable !== null)
            {
                variables.push(variable);
                values.add(stored.variableId, stored.value);
            }
        }

        Util.sortVariables(variables);

        const rows: ITableObject[] = [];

        for(const variable of variables)
        {
            if(variable.isInvisible) continue;

            const canModify = this.hasWritePermission && variable.hasValue && variable.canWriteValue;

            rows.push(new VariableValueTableObject(
                variable,
                values.getValue(variable.variableId) ?? 0,
                canModify,
                false,
                this._controller!.roomEvents
            ));
        }

        this._tableView?.setObjects(rows);
    }

    /**
	 * TS-only: the loading icon and its window are fetched together at four call sites, and the
	 * icon window is null whenever the layout failed to build.
	 */
    private setLoading(visible: boolean): void
    {
        const icon = this.loadingIconWindow;

        if(icon) this._loadingIcon?.setVisible(icon, visible);
    }

    // AS3: VariableManagementDetailView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VariableManagementDetailView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._variablePicker?.dispose();
        this._variablePicker = null;
        this._loadingIcon?.dispose();
        this._loadingIcon = null;
        this._tableView?.dispose();
        this._tableView = null;
        this._window?.dispose();
        this._window = null;
        this._controller = null;
        this._windowManager = null;
        this._previewer?.dispose();
        this._previewer = null;
        this._disposed = true;
    }

    // AS3: VariableManagementDetailView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: VariableManagementDetailView.as::get refreshButton()
    private get refreshButton(): IWindow | null
    {
        return this._window?.findChildByName('refresh_btn') ?? null;
    }

    // AS3: VariableManagementDetailView.as::get loadingIconWindow()
    private get loadingIconWindow(): IIconWindow | null
    {
        return (this._window?.findChildByName('searching_icon') as IIconWindow | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get previewWindow()
    private get previewWindow(): IWindowContainer | null
    {
        return (this._window?.findChildByName('info_box') as IWindowContainer | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get infoBoxText()
    private get infoBoxText(): ITextWindow | null
    {
        return (this._window?.findChildByName('info_box_text') as ITextWindow | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get variableValuesTableContainer()
    private get variableValuesTableContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('variable_values_table_container') as IWindowContainer | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get deleteVariableButton()
    private get deleteVariableButton(): IWindow | null
    {
        return this._window?.findChildByName('delete_var_btn') ?? null;
    }

    // AS3: VariableManagementDetailView.as::get addVariableButton()
    private get addVariableButton(): IWindow | null
    {
        return this._window?.findChildByName('add_var_btn') ?? null;
    }

    // AS3: VariableManagementDetailView.as::get createVariableBubble()
    private get createVariableBubble(): IWindowContainer | null
    {
        return (this._window?.findChildByName('create_var_bubble') as IWindowContainer | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get variablePickerContainer()
    private get variablePickerContainer(): IWindowContainer | null
    {
        return (this.createVariableBubble?.findChildByName('var_picker_container') as IWindowContainer | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get valueInput()
    private get valueInput(): ITextWindow | null
    {
        return (this.createVariableBubble?.findChildByName('value_input') as ITextWindow | null) ?? null;
    }

    // AS3: VariableManagementDetailView.as::get createVariableButton()
    private get createVariableButton(): IWindow | null
    {
        return this.createVariableBubble?.findChildByName('create_var_btn') ?? null;
    }

    // AS3: VariableManagementDetailView.as::get valueSettingContainer()
    private get valueSettingContainer(): IWindow | null
    {
        return this.createVariableBubble?.findChildByName('value_setting') ?? null;
    }
}
