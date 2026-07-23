import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {ActionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ActionDefinition';
import {ConditionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ConditionDefinition';
import {QuantifierType} from '@habbo/communication/messages/incoming/userdefinedroomevents/QuantifierType';
import {SelectorDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/SelectorDefinition';
import {TriggerDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/TriggerDefinition';
import {AddonDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/AddonDefinition';
import {VariableDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/VariableDefinition';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {UpdateTriggerMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateTriggerMessageComposer';
import {UpdateActionMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateActionMessageComposer';
import {UpdateConditionMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateConditionMessageComposer';
import {UpdateAddonMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateAddonMessageComposer';
import {UpdateVariableMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateVariableMessageComposer';
import {UpdateSelectorMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/UpdateSelectorMessageComposer';
import {ApplySnapshotMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/ApplySnapshotMessageComposer';

import type {IUserDefinedRoomEventsCtrl} from './IUserDefinedRoomEventsCtrl';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import type {IWiredTypeHolder} from './IWiredTypeHolder';
import type {IWiredElement} from './IWiredElement';
import {DefaultElement} from './DefaultElement';
import {RoomObjectHighLighter} from './RoomObjectHighLighter';
import {PresetManager} from './uibuilder/PresetManager';
import {WiredUIBuilder} from './uibuilder/WiredUIBuilder';
import type {WiredStyle} from './uibuilder/styles/WiredStyle';
import {VolterWiredStyle} from './uibuilder/styles/VolterWiredStyle';
import {IlluminaWiredStyle} from './uibuilder/styles/IlluminaWiredStyle';
import {VolterYellowWiredStyle} from './uibuilder/styles/VolterYellowWiredStyle';
import {VolterBlueWiredStyle} from './uibuilder/styles/VolterBlueWiredStyle';
import {VolterGreenWiredStyle} from './uibuilder/styles/VolterGreenWiredStyle';
import {UbuntuWiredStyle} from './uibuilder/styles/UbuntuWiredStyle';
import {TriggerConfs} from './triggerconfs/TriggerConfs';
import {ConditionTypes} from './conditions/ConditionTypes';
import {SelectorTypes} from './selectors/SelectorTypes';
import {ActionTypes} from './actiontypes/ActionTypes';
import {AddonTypes} from './addons/AddonTypes';
import {VariableTypes} from './variables/VariableTypes';
import type {IActionType} from './actiontypes/IActionType';
import {CheckboxOptionParam} from './uibuilder/params/CheckboxOptionParam';
import {TextParam} from './uibuilder/params/TextParam';
import {SliderSection} from './uibuilder/presets/sections/SliderSection';
import type {FramePreset} from './uibuilder/presets/main_layout/FramePreset';
import type {HeaderPreset} from './uibuilder/presets/main_layout/HeaderPreset';
import type {InputSourceSection} from './uibuilder/presets/main_layout/InputSourceSection';
import type {AdvancedSettingsWrapperPreset} from './uibuilder/presets/main_layout/AdvancedSettingsWrapperPreset';
import {WiredInputSourcePicker} from './inputsources/WiredInputSourcePicker';
import {ClipboardWiredEntry} from './ClipboardWiredEntry';
import type {RadioGroupPreset} from './uibuilder/presets/RadioGroupPreset';
import {RadioButtonParam} from './uibuilder/params/RadioButtonParam';
import type {WiredUIPreset} from './uibuilder/presets/WiredUIPreset';
import type {FooterPreset} from './uibuilder/presets/main_layout/FooterPreset';
import type {SectionPreset} from './uibuilder/presets/SectionPreset';
import type {CheckboxGroupPreset} from './uibuilder/presets/CheckboxGroupPreset';

const log = Logger.getLogger('UserDefinedRoomEventsCtrl');

/**
 * UserDefinedRoomEventsCtrl — the core wired-setup controller ("wiredCtrl"): owns the wired
 * configuration dialog (pick furni, triggers/actions/conditions/selectors/variables/addons), the
 * registries, the UI builder and the show/close flow.
 *
 * This is the Bloc C DISPLAY PATH: `prepareForUpdate(def)` resolves the def's registry, gets the
 * matching element by code, builds the dialog via WiredUIBuilder (header + inputs + selector options
 * + furni picks + delay + footer) and shows the FramePreset on desktop layer 1. onEditStart seeds the
 * form from the def.
 *
 * TODO(AS3) — NOT yet ported (stubbed with faithful no-ops so the dialog still shows):
 * - RoomObjectHighLighter (furni-selection highlights) — skipped.
 * - WiredVariablesSynchronizer (synchronizeTriggerable) — treated as "no sync needed".
 * - createAdvancedSections / createAdvancedInputSources — the input-source advanced rows AND the
 *   condition quantifier section are now built and wired (InputSourceSection + WiredInputSourcePicker +
 *   updateSourceContainer/setMergedSourceType + quantifier radio/resolveQuantifier); only
 *   fixQuantifierNames (invert-driven relabel) remains a minor TODO.
 * - WiredConfigurationCache (useCache) — caching disabled (useCache = false).
 * - The copy/paste clipboard is now ported (createClipboardCopy / pasteFromClipboard /
 *   hasCurrentElementInClipboard, keyed by holder+code). Network save is done; the remaining gaps are
 *   the merged-source common-UI refinements and the config cache.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/UserDefinedRoomEventsCtrl.as
 */
export class UserDefinedRoomEventsCtrl implements IUserDefinedRoomEventsCtrl
{
    // AS3: UserDefinedRoomEventsCtrl.as::STYLE_DEFAULT
    public static readonly STYLE_DEFAULT: string = 'illumina';

    // AS3: UserDefinedRoomEventsCtrl.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: UserDefinedRoomEventsCtrl.as::_confs (trigger registry)
    private _triggerConfs: TriggerConfs = new TriggerConfs();

    // AS3: UserDefinedRoomEventsCtrl.as::_actionTypes
    private _actionTypes: ActionTypes = new ActionTypes();

    // AS3: UserDefinedRoomEventsCtrl.as::_conditionTypes
    private _conditionTypes: ConditionTypes = new ConditionTypes();

    // AS3: UserDefinedRoomEventsCtrl.as::_addonTypes
    private _addonTypes: AddonTypes = new AddonTypes();

    // AS3: UserDefinedRoomEventsCtrl.as::_selectorTypes
    private _selectorTypes: SelectorTypes = new SelectorTypes();

    // AS3: UserDefinedRoomEventsCtrl.as::_variableTypes
    private _variableTypes: VariableTypes = new VariableTypes();

    // AS3: UserDefinedRoomEventsCtrl.as::_wiredStyles
    private _wiredStyles: OrderedMap<string, WiredStyle> = new OrderedMap<string, WiredStyle>();

    // AS3: UserDefinedRoomEventsCtrl.as::_activeStyle (current)
    private _wiredStyle!: WiredStyle;

    // AS3: UserDefinedRoomEventsCtrl.as::_defaultStyle
    private _defaultStyle!: WiredStyle;

    // AS3: UserDefinedRoomEventsCtrl.as::_presetManager
    private _presetManager: PresetManager;

    // AS3: UserDefinedRoomEventsCtrl.as::_currentDef
    private _currentDef: Triggerable | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_currentElement
    private _currentElement: IWiredElement | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_frame
    private _frame: FramePreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_headerPreset
    private _headerPreset: HeaderPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_footerPreset
    private _footerPreset: FooterPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_selectorOptionsPreset
    private _selectorOptionsPreset: CheckboxGroupPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_furniPicksSection
    private _furniPicksSection: SectionPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_delaySection
    private _delaySection: SliderSection | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_4793 (name derived: the advanced input-source rows)
    private _advancedInputSources: InputSourceSection[] = [];

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_5845 (name derived: the advanced-settings wrapper)
    private _advancedSettingsWrapper: AdvancedSettingsWrapperPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_5080 (name derived: the quantifier radio group)
    private _quantifierRadio: RadioGroupPreset | null = null;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_8055 (name derived: the copy/paste clipboard, keyed
    // by "<holderKey>-<elementCode>")
    private _clipboard: Map<string, ClipboardWiredEntry> = new Map<string, ClipboardWiredEntry>();

    // AS3: UserDefinedRoomEventsCtrl.as::_initialWidth
    private _initialWidth: number = -1;

    // AS3: UserDefinedRoomEventsCtrl.as::_savedX
    private _savedX: number = -2147483648;

    // AS3: UserDefinedRoomEventsCtrl.as::_savedY
    private _savedY: number = -2147483648;

    // AS3: UserDefinedRoomEventsCtrl.as::activeFurniPicks (backing field)
    private _activeFurniPicks: number = 1;

    // AS3: UserDefinedRoomEventsCtrl.as::_stuffs1 (Dictionary of selected furni ids, source set 1)
    private _stuffs1: Set<number> = new Set<number>();

    // AS3: UserDefinedRoomEventsCtrl.as::_stuffs2 (Dictionary of selected furni ids, source set 2)
    private _stuffs2: Set<number> = new Set<number>();

    // AS3: UserDefinedRoomEventsCtrl.as::_updateMode (0 = save+close, 1 = save+notify, 2 = paste+notify)
    private _updateMode: number = 0;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_9888 (non-owner change already confirmed this session)
    private _confirmed: boolean = false;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_5372 (RoomObjectHighLighter)
    private _highlighter: RoomObjectHighLighter;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_6372 (merged-source dual-picking mode; false = single set)
    // TODO(AS3): driven by the input-source picker (setMergedSourceType) — advanced sources not ported,
    // so this stays false and the active set is always _stuffs1.
    private _mergedSourceMode: boolean = false;

    // AS3: UserDefinedRoomEventsCtrl.as::_SafeStr_5819 (active source slot: 1 = set 1, 2 = set 2)
    private _activeSourceSlot: number = 1;

    // AS3: UserDefinedRoomEventsCtrl.as::UserDefinedRoomEventsCtrl()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._highlighter = new RoomObjectHighLighter(roomEvents);
        this._presetManager = new PresetManager(roomEvents);
        this._wiredStyles.add('volter', new VolterWiredStyle(roomEvents));
        this._wiredStyles.add('illumina', new IlluminaWiredStyle(roomEvents));
        this._wiredStyles.add('volter_yellow', new VolterYellowWiredStyle(roomEvents));
        this._wiredStyles.add('volter_blue', new VolterBlueWiredStyle(roomEvents));
        this._wiredStyles.add('volter_green', new VolterGreenWiredStyle(roomEvents));
        this._wiredStyles.add('ubuntu', new UbuntuWiredStyle(roomEvents));
        this._defaultStyle = this._wiredStyles.getValue('illumina')!;
        this._wiredStyle = this._wiredStyles.getValue('volter')!;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::prepareForUpdate()
    prepareForUpdate(def: Triggerable): void
    {
        // TODO(AS3): copy-into mode + synchronizeTriggerable (variable synchronizer) skipped — Bloc C.
        if(this._frame != null)
        {
            this.close();
        }

        this._currentDef = def;
        const holder = this.resolveHolderFor(def);

        if(holder == null)
        {
            log.warn('prepareForUpdate: no registry for def code ' + def.code);
            this._currentDef = null;

            return;
        }

        this._currentElement = holder.getElementByCode(def.code);

        if(this._currentElement == null)
        {
            log.warn('prepareForUpdate: no ported element for code ' + def.code + ' in ' + holder.getKey());
            this._currentDef = null;

            return;
        }

        this._wiredStyle = this.determineActiveWiredStyle();

        if(!this.createWindow(holder))
        {
            this._currentDef = null;
            this._currentElement = null;

            return;
        }

        log.debug('Opened wired config: ' + holder.getKey() + ' code ' + def.code);

        // AS3: seed the picked-furni sets from the def's existing wired stuffs (drives the
        // "${wiredfurni.pickfurnis.caption}" count) and grey-highlight them in-room.
        this._stuffs1 = new Set<number>(def.stuffIds);
        this._stuffs2 = new Set<number>(def.stuffIds2);

        // AS3: highlightActiveWired(def.id) + showAll(_stuffs1/_stuffs2). Merged dual-picking (set 2)
        // is not ported, so single-set slot 0.
        this._highlighter.highlightActiveWired(def.id);

        if(this._mergedSourceMode)
        {
            this._highlighter.showAll(this._stuffs1, true, 1);
            this._highlighter.showAll(this._stuffs2, true, 2);
        }
        else
        {
            this._highlighter.showAll(this._stuffs1, false, 0);
        }

        this._currentElement.onEditStart(def);
        this.onEditStartUpdateCommonUI();
        this._currentElement.onEditInitialized();
        this.restorePositionAndActivate();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveHolder()
    private resolveHolder(): IWiredTypeHolder | null
    {
        return this._currentDef == null ? null : this.resolveHolderFor(this._currentDef);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveHolderFor()
    private resolveHolderFor(def: Triggerable): IWiredTypeHolder | null
    {
        if(def instanceof TriggerDefinition)
        {
            return this._triggerConfs;
        }

        if(def instanceof ActionDefinition)
        {
            return this._actionTypes;
        }

        if(def instanceof ConditionDefinition)
        {
            return this._conditionTypes;
        }

        if(def instanceof AddonDefinition)
        {
            return this._addonTypes;
        }

        if(def instanceof SelectorDefinition)
        {
            return this._selectorTypes;
        }

        if(def instanceof VariableDefinition)
        {
            return this._variableTypes;
        }

        return null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::determineActiveWiredStyle()
    private determineActiveWiredStyle(): WiredStyle
    {
        if(this._currentDef == null || this._currentElement == null)
        {
            return this._wiredStyles.getValue('volter')!;
        }

        const data = this._roomEvents.sessionDataManager?.getFloorItemData(this._currentDef.stuffTypeId) ?? null;

        if(data != null)
        {
            const className = data.className;

            if(className === 'wf_ltdproto_act_toggle_state')
            {
                return this._wiredStyles.getValue('volter_yellow')!;
            }

            if(className === 'wf_proto_trg_at_given_time')
            {
                return this._wiredStyles.getValue('volter_blue')!;
            }

            if(className === 'wf_proto_cnd_trggrer_on_frn')
            {
                return this._wiredStyles.getValue('volter_green')!;
            }
        }

        return this._defaultStyle;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createWindow()
    private createWindow(holder: IWiredTypeHolder): boolean
    {
        if(this._frame != null)
        {
            return false;
        }

        if(this._currentDef == null || this._currentElement == null)
        {
            return false;
        }

        const builder = new WiredUIBuilder(this._presetManager, this._closeHandler, holder.getKey(), this._currentElement.code, this.isResizeEnabled);
        this.createHeader(holder, builder);
        this.createInputs(builder);
        this.createSelectorOptions(builder);
        this.createFurniPicks(builder);
        this.createDelaySection(builder);
        this.createAdvancedSections(builder);
        this.createFooter(builder);
        builder.build(this._currentElement.widthModifier, this._currentElement.allowScrolling);
        this._frame = builder.frame;
        this._initialWidth = builder.initialWidth;
        this._currentElement.onInit(this._roomEvents);
        this.showFrame();

        return true;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createHeader()
    private createHeader(holder: IWiredTypeHolder, builder: WiredUIBuilder): void
    {
        // TODO(AS3): button modes 2 (wired-menu variable) / 3 (write-to-logs) need wiredMenu + _SafeCls_3593.
        const buttonMode = this._currentElement!.hasStateSnapshot ? 1 : 0;
        this._headerPreset = this._presetManager.createHeaderPreset(this.getElementName(this._currentDef!.stuffTypeId), holder, buttonMode, this._applySnapshot, this._viewVariableInMenu, this._viewLogs);
        builder.addElements(this._headerPreset);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createInputs()
    private createInputs(builder: WiredUIBuilder): void
    {
        if(this._currentElement!.inputMode === DefaultElement.INPUTS_TYPE_UI_BUILDER)
        {
            this._currentElement!.setRoomEvents(this._roomEvents);
            this._currentElement!.buildInputs(this._presetManager, this._wiredStyle, builder);
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createSelectorOptions()
    private createSelectorOptions(builder: WiredUIBuilder): void
    {
        if(!(this._currentDef instanceof SelectorDefinition))
        {
            return;
        }

        this._selectorOptionsPreset = this._presetManager.createCheckboxGroup([
            new CheckboxOptionParam('${wiredfurni.params.selector_option.0}'),
            new CheckboxOptionParam('${wiredfurni.params.selector_option.1}')
        ]);
        const section = this._presetManager.createSection('${wiredfurni.params.selector_options_selector}', this._selectorOptionsPreset);
        builder.addElements(section);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createFurniPicks()
    private createFurniPicks(builder: WiredUIBuilder): void
    {
        if(!this.isStuffSelectionMode() || this.hidePickFurniInstructions)
        {
            return;
        }

        const param = new TextParam(1, false);
        param.textColor = this._wiredStyle.softTextColor;
        this._furniPicksSection = this._presetManager.createSection('${wiredfurni.pickfurnis.caption}', this._presetManager.createText('${wiredfurni.pickfurnis.desc}', param));
        builder.addElements(this._furniPicksSection);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createDelaySection()
    private createDelaySection(builder: WiredUIBuilder): void
    {
        if(!(this._currentDef instanceof ActionDefinition))
        {
            return;
        }

        if(!(this._currentElement as unknown as IActionType).allowDelaying)
        {
            return;
        }

        this._delaySection = this._presetManager.createSliderSection('wiredfurni.params.delay', 'seconds', SliderSection.CONVERTER_PULSES, 0, 20, 1, false);
        builder.addElements(this._delaySection);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createFooter()
    private createFooter(builder: WiredUIBuilder): void
    {
        this._footerPreset = this._presetManager.createFooterPreset(this._saveHandler, this._closeHandler);
        builder.addElements(this._footerPreset);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::showFrame()
    private showFrame(): void
    {
        const desktop = this._roomEvents.windowManager?.getDesktop(1) ?? null;

        if(desktop != null && this._frame != null)
        {
            (desktop as unknown as IWindowContainer).addChild(this._frame.window);
        }

        this._frame?.window.center();
        this._frame?.window.activate();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hideFrame()
    private hideFrame(): void
    {
        if(this._frame != null)
        {
            const desktop = this._roomEvents.windowManager?.getDesktop(1) ?? null;

            if(desktop != null)
            {
                (desktop as unknown as IWindowContainer).removeChild(this._frame.window);
            }
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onEditStartUpdateCommonUI()
    private onEditStartUpdateCommonUI(): void
    {
        this._headerPreset?.updateName(this.getElementName(this._currentDef!.stuffTypeId));

        if(this._selectorOptionsPreset != null && this._currentDef instanceof SelectorDefinition)
        {
            this._selectorOptionsPreset.optionById(0).selected = this._currentDef.isFilter;
            this._selectorOptionsPreset.optionById(1).selected = this._currentDef.isInvert;
        }

        // TODO(AS3): header buttonVisible for variable types (initialVariableName + wiredMenu.isEnabled)
        // — belongs here (AS3 order), deferred with the variable-menu common UI.
        this.onStuffsChanged();

        if(this._delaySection != null && this._currentDef instanceof ActionDefinition)
        {
            this._delaySection.value = this._currentDef.delayInPulses;
        }

        const useAdvancedSettings = this._currentDef!.advancedMode && (this.isUsingAdvancedSettings || this._currentElement!.advancedAlwaysVisible());

        if(this._advancedSettingsWrapper != null)
        {
            this._advancedSettingsWrapper.expanded = useAdvancedSettings;
        }

        if(this._currentDef instanceof ConditionDefinition && this._currentDef.quantifierType !== QuantifierType.NONE && this._quantifierRadio !== null)
        {
            this._quantifierRadio.selected = this._currentDef.quantifierCode;
            // TODO(AS3): fixQuantifierNames() (re-derive the radio labels on invert change) needs a
            // RadioGroupPreset option accessor; labels are already correct for the current def at build.
        }

        for(const section of this._advancedInputSources)
        {
            section.refresh(this._currentDef!, this._currentElement!);

            if(section.baseSourceType === WiredInputSourcePicker.MERGED_SOURCE)
            {
                section.sourceType = this._currentElement!.getMergedType(section.id);
            }
        }

        // TODO(AS3): wired-menu button-visible common UI — deferred.
        if(this._footerPreset != null)
        {
            this._footerPreset.saveButtonDisabled = !this._roomEvents.wiredMenu.hasWritePermission;
        }

        this._frame?.refreshForNewTriggerable();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onStuffsChanged()
    // Registers the live count/limit parameters on the pick-furnis caption localization key. The
    // section title window is a registered listener of that key (TextController), so registering the
    // params re-resolves "${wiredfurni.pickfurnis.caption}" from raw "%count%/%limit%" to real values.
    private onStuffsChanged(): void
    {
        if(this._currentDef == null || this._frame == null)
        {
            return;
        }

        const count = this.getStuffIds().length;
        const limit = this._currentDef.furniLimit;

        this._roomEvents.localization.registerParameter('wiredfurni.pickfurnis.caption', 'count', '' + count);
        this._roomEvents.localization.registerParameter('wiredfurni.pickfurnis.caption', 'limit', '' + limit);

        for(const section of this._advancedInputSources)
        {
            section.refresh(this._currentDef, this._currentElement!);
        }

        this._frame.updateButtonDisabledStates();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createAdvancedSections()
    private createAdvancedSections(builder: WiredUIBuilder): void
    {
        const def = this._currentDef!;
        const element = this._currentElement!;
        const conf = def.inputSourcesConf;
        const hasQuantifier = def instanceof ConditionDefinition && def.quantifierType !== QuantifierType.NONE;

        if(!(def.advancedMode && (conf.amountFurniSelections > 0 || conf.amountUserSelections > 0 || hasQuantifier)))
        {
            return;
        }

        const sections: WiredUIPreset[] = [];

        if(hasQuantifier)
        {
            const key = this.getQuantifierKey(def as ConditionDefinition);
            this._quantifierRadio = this._presetManager.createRadioGroup([new RadioButtonParam(0, '${' + key + '0}'), new RadioButtonParam(1, '${' + key + '1}')]);
            sections.push(this._presetManager.createSection('${wiredfurni.params.quantifier_selection}', this._quantifierRadio));
        }

        this.createAdvancedInputSources();

        for(const section of this._advancedInputSources)
        {
            sections.push(section);
        }

        this._advancedSettingsWrapper = this._presetManager.createAdvancedSettingsWrapperPreset(sections, element.advancedAlwaysVisible());
        builder.addElements(this._advancedSettingsWrapper);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getQuantifierKey()
    private getQuantifierKey(def: ConditionDefinition): string
    {
        const type = def.quantifierType;
        let key = type === QuantifierType.FURNI ? 'furni' : (type === QuantifierType.USERS ? 'users' : (type === QuantifierType.VARIABLES ? 'variables' : ''));
        key = key + (def.isInvert ? '.neg.' : '.');
        return 'wiredfurni.params.quantifier.' + key;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createAdvancedInputSources()
    private createAdvancedInputSources(): void
    {
        const def = this._currentDef!;
        const element = this._currentElement!;
        const conf = def.inputSourcesConf;
        this._advancedInputSources = [];

        const mergedSelections = element.mergedSelections();
        const furniMergedSlots: number[] = [];
        const userMergedSlots: number[] = [];

        for(const selection of mergedSelections)
        {
            furniMergedSlots.push(selection[0]);
            userMergedSlots.push(selection[1]);
        }

        for(let i = 0; i < conf.amountFurniSelections; i++)
        {
            if(furniMergedSlots.indexOf(i) === -1)
            {
                const title = '${' + element.furniSelectionTitle(i) + '}';
                this._advancedInputSources.push(this._presetManager.createInputSourceSection(title, WiredInputSourcePicker.FURNI_SOURCE, i, null, false, conf.isDualFurniPickingMode()));
            }
        }

        for(let i = 0; i < conf.amountUserSelections; i++)
        {
            if(userMergedSlots.indexOf(i) === -1)
            {
                const title = '${' + element.userSelectionTitle(i) + '}';
                this._advancedInputSources.push(this._presetManager.createInputSourceSection(title, WiredInputSourcePicker.USER_SOURCE, i));
            }
        }

        for(let i = 0; i < mergedSelections.length; i++)
        {
            const title = '${' + element.mergedSelectionTitle(i) + '}';
            this._advancedInputSources.push(this._presetManager.createInputSourceSection(title, WiredInputSourcePicker.MERGED_SOURCE, i, element.mergedSourceOptions(i), element.hasCustomTypePicker(i), conf.isDualFurniPickingMode()));
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::isStuffSelectionMode()
    private isStuffSelectionMode(): boolean
    {
        if(this._currentDef == null || this._currentElement == null)
        {
            return false;
        }

        return this._currentDef.inputSourcesConf.allowFurniSelection() || this._currentElement.forceFurniSelection;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getElementName()
    private getElementName(stuffTypeId: number): string
    {
        const data = this._roomEvents.sessionDataManager?.getFloorItemData(stuffTypeId) ?? null;

        if(data == null)
        {
            log.warn('COULD NOT FIND FURNIDATA FOR ' + stuffTypeId);

            return 'NAME: ' + stuffTypeId;
        }

        return data.localizedName;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::savePosition()
    private savePosition(): void
    {
        if(this._frame == null)
        {
            return;
        }

        this._savedX = this._frame.window.x;
        this._savedY = this._frame.window.y;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::restorePositionAndActivate()
    private restorePositionAndActivate(): void
    {
        if(this._frame == null)
        {
            return;
        }

        if(this._savedX === -2147483648)
        {
            this._frame.window.center();
        }
        else
        {
            this._frame.window.x = this._savedX;
            this._frame.window.y = this._savedY;
        }

        this._frame.window.activate();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::close()
    close(): void
    {
        if(this._currentDef != null && this._currentElement != null)
        {
            this._highlighter.unhighlightActiveWired(this._currentDef.id);
            this._currentElement.onEditEnd();
            this._currentDef = null;
            this._currentElement = null;
        }

        // AS3: hideFurniHighlights() then clear the sets — un-greys every picked furni on close.
        this.hideFurniHighlights();
        this._stuffs1 = new Set<number>();
        this._stuffs2 = new Set<number>();

        if(this._frame != null)
        {
            this.savePosition();
            this.hideFrame();
            this._headerPreset = null;
            this._selectorOptionsPreset = null;
            this._furniPicksSection = null;
            this._delaySection = null;
            this._footerPreset = null;
            this._advancedSettingsWrapper = null;
            this._advancedInputSources = [];
            this._quantifierRadio = null;
            this._initialWidth = -1;
            this._frame.dispose();
            this._frame = null;
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::applySnapshot()
    private _applySnapshot = (): void =>
    {
        if(this._currentDef == null)
        {
            return;
        }

        this._roomEvents.send(new ApplySnapshotMessageComposer(this._currentDef.id));
    };

    // AS3: UserDefinedRoomEventsCtrl.as::viewVariableInMenu()
    private _viewVariableInMenu = (): void =>
    {
        // TODO(AS3): Bloc C — open the wired menu variable overview.
    };

    // AS3: UserDefinedRoomEventsCtrl.as::viewLogs()
    private _viewLogs = (): void =>
    {
        // TODO(AS3): Bloc C — open the wired menu logs.
    };

    // AS3: UserDefinedRoomEventsCtrl.as::save() (the footer's save button handler)
    private _saveHandler = (): void =>
    {
        this.save();
    };

    // AS3: UserDefinedRoomEventsCtrl.as::save()
    private save(): void
    {
        if(this._currentDef == null || this._frame == null)
        {
            return;
        }

        if(this._currentDef instanceof SelectorDefinition && this.isSelectorInvert() && !this.isSelectorFilter())
        {
            this._roomEvents.windowManager?.confirm('${wiredfurni.danger.1.change.confirm.title}', '${wiredfurni.danger.1.change.confirm.body}', 0, this._confirmCallback);
        }
        else if(!this.isOwner(this._currentDef.id) && !this._confirmed)
        {
            this._roomEvents.windowManager?.confirm('${wiredfurni.nonowner.change.confirm.title}', '${wiredfurni.nonowner.change.confirm.body}', 0, this._confirmCallback);
        }
        else
        {
            const confirmation = this._currentElement?.requireConfirmation as { title: string; body: string } | null;

            if(confirmation != null)
            {
                this._roomEvents.windowManager?.confirm(confirmation.title, confirmation.body, 0, this._confirmCallback);
            }
            else
            {
                this.update();
            }
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::confirmCallback()
    private _confirmCallback = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this._confirmed = true;

            if(this.isEditing())
            {
                this.update();
            }
        }
    };

    // AS3: UserDefinedRoomEventsCtrl.as::close (handler)
    private _closeHandler = (): void =>
    {
        this.close();
    };

    // AS3: UserDefinedRoomEventsCtrl.as::resizeFrame()
    resizeFrame(): void
    {
        if(this._frame != null && this._currentElement != null)
        {
            this._frame.resizeToWidth(this._currentElement.widthModifier * this._initialWidth);
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get isResizeEnabled()
    private get isResizeEnabled(): boolean
    {
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get wiredStyle()
    get wiredStyle(): WiredStyle
    {
        return this._wiredStyle;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get presetManager()
    get presetManager(): PresetManager
    {
        return this._presetManager;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStyleByName()
    getStyleByName(name: string): WiredStyle
    {
        return this._wiredStyles.getValue(name)!;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get hidePickFurniInstructions()
    get hidePickFurniInstructions(): boolean
    {
        if(this._currentDef == null || this._currentElement == null)
        {
            return false;
        }

        if(this._currentElement.forceHidePickFurniInstructions)
        {
            return true;
        }

        return !this._currentDef.inputSourcesConf.isFurniSelectionDefault() && !this._currentElement.forceFurniSelection;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hasUIOpen()
    hasUIOpen(): boolean
    {
        return this._frame != null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get activeFurniPicks()
    get activeFurniPicks(): number
    {
        return this._activeFurniPicks;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::set activeFurniPicks()
    set activeFurniPicks(value: number)
    {
        this._activeFurniPicks = value;

        for(const section of this._advancedInputSources)
        {
            section.activeFurniPicksChanged();
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearCache()
    clearCache(): void
    {
        this.close();
    }

    // ---- The methods below remain Bloc C stubs (furni picking, clipboard, network save, guilds). ----

    // AS3: UserDefinedRoomEventsCtrl.as::get activeStuffsDictionary() / get activeStuffsArray()
    // The set the furni picks toggle against: source set 1 by default; set 2 only in merged
    // dual-picking mode with slot 2 active (advanced sources, not ported → always set 1).
    private activeStuffs(): Set<number>
    {
        if(!this._mergedSourceMode || this._activeSourceSlot === 1)
        {
            return this._stuffs1;
        }

        return this._stuffs2;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hideFurniHighlights()
    private hideFurniHighlights(): void
    {
        this._highlighter.hideAll(this._stuffs1, true, 1);
        this._highlighter.hideAll(this._stuffs2, true, 2);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffAdded()
    stuffAdded(id: number): void
    {
        if(this.activeStuffs().has(id))
        {
            this._highlighter.show(id, this._mergedSourceMode, this._activeSourceSlot);
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffSelected()
    stuffSelected(id: number): void
    {
        if(this._frame == null || this._currentDef == null)
        {
            return;
        }

        if(this._frame.isCopyingIntoMode)
        {
            return;
        }

        if(!this.isStuffSelectionMode() || (!this._currentDef.allowWallFurni && id < 0))
        {
            return;
        }

        const active = this.activeStuffs();

        if(active.has(id))
        {
            active.delete(id);
            this._highlighter.hide(id, this._mergedSourceMode, this._activeSourceSlot);
        }
        else if(active.size < this._currentDef.furniLimit)
        {
            active.add(id);
            this._highlighter.show(id, this._mergedSourceMode, this._activeSourceSlot);
        }

        this.onStuffsChanged();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffRemoved()
    stuffRemoved(_id: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds()
    getStuffIds(): number[]
    {
        return Array.from(this._stuffs1);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds2()
    getStuffIds2(): number[]
    {
        return Array.from(this._stuffs2);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearStuffPicks()
    clearStuffPicks(): void
    {
        // TODO(AS3): hideFurniHighlights() (RoomObjectHighLighter — Bloc C stub) precedes the reset.
        this._stuffs1 = new Set<number>();
        this._stuffs2 = new Set<number>();
        this.onStuffsChanged();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resetToDefault()
    resetToDefault(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createClipboardCopy()
    createClipboardCopy(): void
    {
        const holder = this.resolveHolder();

        if(holder === null)
        {
            return;
        }

        const key = holder.getKey() + '-' + this._currentElement!.code;
        const entry = new ClipboardWiredEntry(this._currentElement!.readIntParamsFromForm(), this._currentElement!.readStringParamFromForm(), this._currentElement!.readVariableIdsFromForm(), this.getStuffIds(), this.getStuffIds2(), [...this._currentDef!.furniSourceTypes], [...this._currentDef!.userSourceTypes]);

        if(this._currentDef instanceof ActionDefinition)
        {
            entry.delayInPulses = this.getActionDelay();
        }

        if(this._currentDef instanceof ConditionDefinition)
        {
            entry.quantifierCode = this.resolveQuantifier();
        }

        if(this._currentDef instanceof SelectorDefinition)
        {
            entry.isFilter = this.isSelectorFilter();
            entry.isInvert = this.isSelectorInvert();
        }

        this._clipboard.set(key, entry);
        this._frame?.updateButtonDisabledStates();
        // TODO(AS3): AS3 passes a {time_display: 2500} options object the port's addItem lacks.
        this._roomEvents.notifications.addItem('${notification.wired.copied}', 'wired');
    }

    // AS3: UserDefinedRoomEventsCtrl.as::pasteFromClipboard()
    pasteFromClipboard(): void
    {
        const holder = this.resolveHolder();

        if(holder === null)
        {
            return;
        }

        const key = holder.getKey() + '-' + this._currentElement!.code;
        const entry = this._clipboard.get(key);

        if(entry === undefined)
        {
            return;
        }

        this.savePosition();
        const def = this._currentDef!;
        def.intParams = [...entry.intParams];
        def.stringParam = entry.stringParam;
        def.variableIds = [...entry.variableIds];
        def.stuffIds = [...entry.stuffIds];
        def.stuffIds2 = [...entry.stuffIds2];
        def.furniSourceTypes = [...entry.furniSourceTypes];
        def.userSourceTypes = [...entry.userSourceTypes];

        if(def instanceof ActionDefinition)
        {
            def.delayInPulses = entry.delayInPulses;
        }

        if(def instanceof ConditionDefinition)
        {
            def.quantifierCode = entry.quantifierCode;
        }

        if(def instanceof SelectorDefinition)
        {
            def.isFilter = entry.isFilter;
            def.isInvert = entry.isInvert;
        }

        this.prepareForUpdate(def);
        this.restorePositionAndActivate();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hasCurrentElementInClipboard()
    hasCurrentElementInClipboard(): boolean
    {
        const holder = this.resolveHolder();

        if(holder === null)
        {
            return false;
        }

        return this._clipboard.has(holder.getKey() + '-' + this._currentElement!.code);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::setMergedSourceType()
    setMergedSourceType(id: number, type: number): void
    {
        for(const section of this._advancedInputSources)
        {
            if(section.id === id && section.baseSourceType === WiredInputSourcePicker.MERGED_SOURCE)
            {
                section.sourceType = type;
            }
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::updateSourceContainer()
    updateSourceContainer(sourceType: number, id: number): void
    {
        for(const section of this._advancedInputSources)
        {
            if(section.baseSourceType === sourceType && section.id === id)
            {
                section.refresh(this._currentDef!, this._currentElement!);
            }
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get isUsingAdvancedSettings()
    get isUsingAdvancedSettings(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::setPreferredWiredStyleByName()
    setPreferredWiredStyleByName(_name: string): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onSaveFailure()
    onSaveFailure(): void
    {
        if(this._updateMode === 1)
        {
            this._updateMode = 0;
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onSaveSuccess()
    onSaveSuccess(): void
    {
        if(this._updateMode === 0)
        {
            this.close();
        }
        else if(this._updateMode === 1)
        {
            // TODO(AS3): AS3 passes a {time_display: 2500} options object the port's addItem lacks.
            this._roomEvents.notifications.addItem('${notification.wired.saved}', 'wired');
        }
        else if(this._updateMode === 2)
        {
            this._roomEvents.notifications.addItem('${notification.wired.pasted_into}', 'wired');
        }

        this._updateMode = 0;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::update()
    update(mode: number = 0, id: number = -1): void
    {
        if(this._currentDef == null || this._currentElement == null)
        {
            return;
        }

        const validationError = this._currentElement.validate();

        if(validationError != null)
        {
            this._roomEvents.windowManager?.alert('${wiredfurni.error.title}', validationError, 0, null);

            return;
        }

        this._updateMode = mode;

        if(id === -1)
        {
            id = this._currentDef.id;
        }

        const intParams = this.resolveIntParams();
        const variableIds = this.resolveVariableIds();
        const stringParam = this.resolveStringParam();
        const stuffIds = this.getStuffIds();
        const stuffIds2 = this.getStuffIds2();
        const furniSources = this.resolveFurniSources();
        const userSources = this.resolveUserSources();

        if(this._currentDef instanceof TriggerDefinition)
        {
            this._roomEvents.send(new UpdateTriggerMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, furniSources, userSources));
        }
        else if(this._currentDef instanceof ActionDefinition)
        {
            this._roomEvents.send(new UpdateActionMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, this.getActionDelay(), furniSources, userSources));
        }
        else if(this._currentDef instanceof ConditionDefinition)
        {
            this._roomEvents.send(new UpdateConditionMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, this.resolveQuantifier(), furniSources, userSources));
        }
        else if(this._currentDef instanceof AddonDefinition)
        {
            this._roomEvents.send(new UpdateAddonMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, furniSources, userSources));
        }
        else if(this._currentDef instanceof SelectorDefinition)
        {
            this._roomEvents.send(new UpdateSelectorMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, this.resolveFilterField(), this.resolveInverseField(), furniSources, userSources));
        }
        else if(this._currentDef instanceof VariableDefinition)
        {
            this._roomEvents.send(new UpdateVariableMessageComposer(id, intParams, variableIds, stringParam, stuffIds, stuffIds2, furniSources, userSources));
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getActionDelay()
    getActionDelay(): number
    {
        return this._delaySection?.value ?? 0;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveQuantifier()
    resolveQuantifier(): number
    {
        return this._quantifierRadio !== null ? this._quantifierRadio.selected : 0;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveIntParams()
    private resolveIntParams(): number[]
    {
        return this._currentElement?.readIntParamsFromForm() ?? [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveVariableIds()
    private resolveVariableIds(): string[]
    {
        return this._currentElement?.readVariableIdsFromForm() ?? [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveStringParam()
    private resolveStringParam(): string
    {
        return this._currentElement?.readStringParamFromForm() ?? '';
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveFurniSources()
    private resolveFurniSources(): number[]
    {
        return this._currentDef?.furniSourceTypes ?? [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveUserSources()
    private resolveUserSources(): number[]
    {
        return this._currentDef?.userSourceTypes ?? [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveFilterField()
    private resolveFilterField(): boolean
    {
        return this.isSelectorFilter();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resolveInverseField()
    private resolveInverseField(): boolean
    {
        return this.isSelectorInvert();
    }

    // AS3: UserDefinedRoomEventsCtrl.as::isSelectorFilter()
    private isSelectorFilter(): boolean
    {
        return this._selectorOptionsPreset != null && this._selectorOptionsPreset.optionById(0).selected;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::isSelectorInvert()
    private isSelectorInvert(): boolean
    {
        return this._selectorOptionsPreset != null && this._selectorOptionsPreset.optionById(1).selected;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::isEditing()
    private isEditing(): boolean
    {
        return this._currentElement != null && this._currentDef != null && this._frame != null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::isOwner()
    private isOwner(id: number): boolean
    {
        // 10 = RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE (AS3 passes the literal here).
        const object = this._roomEvents.roomEngine?.getRoomObject(this._roomEvents.roomId, id, 10) ?? null;

        if(object == null)
        {
            return false;
        }

        const model = object.getModel();

        if(model == null)
        {
            return false;
        }

        return model.getNumber('furniture_owner_id') === (this._roomEvents.sessionDataManager?.userId ?? -1);
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onGuildMemberships() — forward the guild-memberships event to
    // the element currently being edited (the group condition/selector refills its dropdown from it).
    onGuildMemberships(event: unknown): void
    {
        if(this._currentElement !== null)
        {
            this._currentElement.onGuildMemberships(event);
        }
    }
}
