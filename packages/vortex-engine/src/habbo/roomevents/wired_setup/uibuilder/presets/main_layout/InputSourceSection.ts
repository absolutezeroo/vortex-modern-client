import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {IWiredElement} from '../../../IWiredElement';
import {WiredInputSourcePicker} from '../../../inputsources/WiredInputSourcePicker';
import type {ISourceTypeListener} from '../../../inputsources/ISourceTypeListener';
import type {PresetManager} from '../../PresetManager';
import {SectionParam} from '../../params/SectionParam';
import {SourceTypeSelectorParam} from '../../params/SourceTypeSelectorParam';
import {TextParam} from '../../params/TextParam';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {IconButtonPreset} from '../IconButtonPreset';
import type {MiniAssetIconButtonPreset} from '../MiniAssetIconButtonPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import type {TextPreset} from '../TextPreset';
import type {WiredUIPreset} from '../WiredUIPreset';
import {AbstractSectionPreset} from '../sections/AbstractSectionPreset';

/**
 * InputSourceSection — one advanced input-source row: left/right arrows cycling a WiredInputSourcePicker
 * slot with the current source's label in between, an optional source-type selector (for merged slots
 * without a custom type picker) and optional dual furni-picking buttons. Implements ISourceTypeListener
 * so the source-type selector drives the picker's merged type.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/InputSourceSection.as
 */
export class InputSourceSection extends AbstractSectionPreset implements ISourceTypeListener
{
    // AS3: InputSourceSection.as::_SafeStr_7529 (name derived: the padded container)
    private _container: WiredUIPreset;

    // AS3: InputSourceSection.as::_SafeStr_4836 (name derived: the arrows/label list view)
    private _listView: SimpleListViewPreset;

    // AS3: InputSourceSection.as::_SafeStr_4714 (name derived: the source label text)
    private _text: TextPreset;

    // AS3: InputSourceSection.as::_picker
    private _picker: WiredInputSourcePicker;

    // AS3: InputSourceSection.as::_SafeStr_7104 (name derived: the left arrow)
    private _leftButton: IconButtonPreset;

    // AS3: InputSourceSection.as::_SafeStr_7219 (name derived: the right arrow)
    private _rightButton: IconButtonPreset;

    // AS3: InputSourceSection.as::_furniPicking1Button
    private _furniPicking1Button: MiniAssetIconButtonPreset | null = null;

    // AS3: InputSourceSection.as::_furniPicking2Button
    private _furniPicking2Button: MiniAssetIconButtonPreset | null = null;

    // AS3: InputSourceSection.as::InputSourceSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, title: string, sourceType: number, id: number, sourceOptionIds: number[] | null = null, hasCustomTypePicker: boolean = false, dualFurniPickingMode: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._picker = new WiredInputSourcePicker(roomEvents, sourceType, id);
        this._leftButton = presetManager.createIconButtonPreset('left', () =>
        {
            this._picker.onChangeInputSource(false);
            this.updateUI();
        });
        this._text = presetManager.createText('', new TextParam(1, false, 0, false, 'center'));
        this._rightButton = presetManager.createIconButtonPreset('right', () =>
        {
            this._picker.onChangeInputSource(true);
            this.updateUI();
        });
        this._listView = presetManager.createSimpleListView(false, [this._leftButton, this._text, this._rightButton], true);
        this._listView.minHeight = wiredStyle.inputSourceListMinHeight;
        this._listView.spacing = wiredStyle.LRContainerSpacing;
        this._container = presetManager.createPaddedContainerPreset(this._listView, wiredStyle.LRContainerMargin, wiredStyle.LRContainerTopBottomPadding, wiredStyle.LRContainerMargin, wiredStyle.LRContainerTopBottomPadding);

        let param: SectionParam | null = null;

        if(sourceType === WiredInputSourcePicker.MERGED_SOURCE && !hasCustomTypePicker)
        {
            param = new SectionParam(new SourceTypeSelectorParam(sourceOptionIds ?? [], this));
        }

        if(dualFurniPickingMode)
        {
            if(param === null)
            {
                param = new SectionParam();
            }

            this._furniPicking1Button = presetManager.createMiniAssetIconButtonPreset('furni_picks_1', '${wiredfurni.params.furni_picking.tooltip}', () => this.onFurniPicks1Clicked());
            this._furniPicking2Button = presetManager.createMiniAssetIconButtonPreset('furni_picks_2', '${wiredfurni.params.furni_picking.tooltip}', () => this.onFurniPicks2Clicked());
            param.addHeaderOption(this._furniPicking1Button);
            param.addHeaderOption(this._furniPicking2Button);
        }

        this.initializeSection(title, this._container, param);
    }

    // AS3: InputSourceSection.as::onFurniPicks1Clicked()
    private onFurniPicks1Clicked(): void
    {
        this._roomEvents.wiredCtrl.activeFurniPicks = 1;
    }

    // AS3: InputSourceSection.as::onFurniPicks2Clicked()
    private onFurniPicks2Clicked(): void
    {
        this._roomEvents.wiredCtrl.activeFurniPicks = 2;
    }

    // AS3: InputSourceSection.as::activeFurniPicksChanged()
    activeFurniPicksChanged(): void
    {
        if(this._furniPicking1Button !== null && this._furniPicking1Button.visible)
        {
            this._furniPicking1Button.selected = this._roomEvents.wiredCtrl.activeFurniPicks === 1;
        }
        else if(this._furniPicking2Button !== null && this._furniPicking2Button.visible)
        {
            this._furniPicking2Button.selected = this._roomEvents.wiredCtrl.activeFurniPicks === 2;
        }
    }

    // AS3: InputSourceSection.as::refresh()
    refresh(def: Triggerable, element: IWiredElement): void
    {
        this._picker.refreshContainer(def, element);
        this.updateUI();
    }

    // AS3: InputSourceSection.as::updateUI()
    updateUI(): void
    {
        this.disabled = this._picker.disabled;
        this._leftButton.disabled = this._picker.isButtonsDisabled;
        this._rightButton.disabled = this._picker.isButtonsDisabled;
        this._text.text = this._picker.selectedText;

        if(this._furniPicking1Button !== null && this._furniPicking2Button !== null)
        {
            switch(this._picker.stuffPickingSpecialMode)
            {
                case WiredInputSourcePicker.STUFF_PICKING_MODE_1:
                    this._furniPicking1Button.visible = true;
                    this._furniPicking2Button.visible = false;
                    this._furniPicking1Button.selected = this._roomEvents.wiredCtrl.activeFurniPicks === 1;
                    break;
                case WiredInputSourcePicker.STUFF_PICKING_MODE_2:
                    this._furniPicking1Button.visible = false;
                    this._furniPicking2Button.visible = true;
                    this._furniPicking2Button.selected = this._roomEvents.wiredCtrl.activeFurniPicks === 2;
                    break;
                default:
                    this._furniPicking1Button.visible = false;
                    this._furniPicking2Button.visible = false;
            }
        }

        this._section.refreshAlignments();
    }

    // AS3: InputSourceSection.as::get baseSourceType()
    get baseSourceType(): number
    {
        return this._picker.sourceType;
    }

    // AS3: InputSourceSection.as::get id()
    get id(): number
    {
        return this._picker.id;
    }

    // AS3: InputSourceSection.as::set sourceType()
    set sourceType(type: number)
    {
        this._picker.sourceType = type;
        const selector = this._section.getSourceTypeSelector();

        if(selector !== null)
        {
            selector.select(type);
        }

        this.updateUI();
    }

    // AS3: InputSourceSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container = null as unknown as WiredUIPreset;
        this._listView = null as unknown as SimpleListViewPreset;
        this._text = null as unknown as TextPreset;
        this._picker.dispose();
        this._picker = null as unknown as WiredInputSourcePicker;
        this._leftButton = null as unknown as IconButtonPreset;
        this._rightButton = null as unknown as IconButtonPreset;
    }
}
