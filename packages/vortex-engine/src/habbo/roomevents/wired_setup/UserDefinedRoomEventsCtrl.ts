import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {ActionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ActionDefinition';
import {ConditionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ConditionDefinition';
import {SelectorDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/SelectorDefinition';
import {TriggerDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/TriggerDefinition';
import {AddonDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/AddonDefinition';
import {VariableDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/VariableDefinition';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {IUserDefinedRoomEventsCtrl} from './IUserDefinedRoomEventsCtrl';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import type {IWiredTypeHolder} from './IWiredTypeHolder';
import type {IWiredElement} from './IWiredElement';
import {DefaultElement} from './DefaultElement';
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
 * - createAdvancedSections / createAdvancedInputSources (InputSourceSection not ported) — skipped.
 * - WiredConfigurationCache (useCache) — caching disabled (useCache = false).
 * - The clipboard, network save, quantifier/merged-source common-UI refinements, stuff dictionaries.
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

    // AS3: UserDefinedRoomEventsCtrl.as::_initialWidth
    private _initialWidth: number = -1;

    // AS3: UserDefinedRoomEventsCtrl.as::_savedX
    private _savedX: number = -2147483648;

    // AS3: UserDefinedRoomEventsCtrl.as::_savedY
    private _savedY: number = -2147483648;

    // AS3: UserDefinedRoomEventsCtrl.as::activeFurniPicks (backing field)
    private _activeFurniPicks: number = 1;

    // AS3: UserDefinedRoomEventsCtrl.as::UserDefinedRoomEventsCtrl()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
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
        // TODO(AS3): createAdvancedSections — needs InputSourceSection (not ported); skipped.
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

        if(this._delaySection != null && this._currentDef instanceof ActionDefinition)
        {
            this._delaySection.value = this._currentDef.delayInPulses;
        }

        // TODO(AS3): quantifier / merged input sources / wired-menu button-visible common UI — Bloc C.
        if(this._footerPreset != null)
        {
            this._footerPreset.saveButtonDisabled = !this._roomEvents.wiredMenu.hasWritePermission;
        }

        this._frame?.refreshForNewTriggerable();
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
            this._currentElement.onEditEnd();
            this._currentDef = null;
            this._currentElement = null;
        }

        if(this._frame != null)
        {
            this.savePosition();
            this.hideFrame();
            this._headerPreset = null;
            this._selectorOptionsPreset = null;
            this._furniPicksSection = null;
            this._delaySection = null;
            this._footerPreset = null;
            this._initialWidth = -1;
            this._frame.dispose();
            this._frame = null;
        }
    }

    // AS3: UserDefinedRoomEventsCtrl.as::applySnapshot()
    private _applySnapshot = (): void =>
    {
        // TODO(AS3): Bloc C — send the state-snapshot apply composer.
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

    // AS3: UserDefinedRoomEventsCtrl.as::save()
    private _saveHandler = (): void =>
    {
        // TODO(AS3): Bloc C — serialise the form and send the update composer.
        log.debug('wired save requested (network save not ported — Bloc C)');
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
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearCache()
    clearCache(): void
    {
        this.close();
    }

    // ---- The methods below remain Bloc C stubs (furni picking, clipboard, network save, guilds). ----

    // AS3: UserDefinedRoomEventsCtrl.as::stuffAdded()
    stuffAdded(_id: number): void
    {
        // TODO(AS3): Bloc C — RoomObjectHighLighter.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffSelected()
    stuffSelected(_id: number): void
    {
        // TODO(AS3): Bloc C — furni pick selection.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffRemoved()
    stuffRemoved(_id: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds()
    getStuffIds(): number[]
    {
        // TODO(AS3): Bloc C.
        return [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds2()
    getStuffIds2(): number[]
    {
        // TODO(AS3): Bloc C.
        return [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearStuffPicks()
    clearStuffPicks(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resetToDefault()
    resetToDefault(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createClipboardCopy()
    createClipboardCopy(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::pasteFromClipboard()
    pasteFromClipboard(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hasCurrentElementInClipboard()
    hasCurrentElementInClipboard(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::setMergedSourceType()
    setMergedSourceType(_a: number, _b: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::updateSourceContainer()
    updateSourceContainer(_a: number, _b: number): void
    {
        // TODO(AS3): Bloc C.
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
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onSaveSuccess()
    onSaveSuccess(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::update()
    update(_a: number = 0, _b: number = -1): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onGuildMemberships()
    onGuildMemberships(_event: unknown): void
    {
        // TODO(AS3): Bloc C.
    }
}
