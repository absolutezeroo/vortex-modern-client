import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {WiredStyle} from './styles/WiredStyle';
import {TextParam} from './params/TextParam';
import type {HtmlTextParam} from './params/HtmlTextParam';
import type {WiredUIPreset} from './presets/WiredUIPreset';
import {SpacerPreset} from './presets/SpacerPreset';
import {SplitterPreset} from './presets/SplitterPreset';
import {SpacingPreset} from './presets/SpacingPreset';
import {TextPreset} from './presets/TextPreset';
import {ButtonPreset} from './presets/ButtonPreset';
import {IconButtonPreset} from './presets/IconButtonPreset';
import {HtmlPreset} from './presets/HtmlPreset';
import {StaticBitmapAssetWrapperPreset} from './presets/StaticBitmapAssetWrapperPreset';
import {TextualButtonPreset} from './presets/TextualButtonPreset';
import {PaddedContainerPreset} from './presets/PaddedContainerPreset';
import {ContainerButtonPreset} from './presets/ContainerButtonPreset';
import {CenteredContainerPreset} from './presets/CenteredContainerPreset';
import {SimpleListViewPreset} from './presets/SimpleListViewPreset';
import {ScrollListPreset} from './presets/ScrollListPreset';
import {ButtonRowPreset} from './presets/ButtonRowPreset';
import {HorizontalSectionListPreset} from './presets/HorizontalSectionListPreset';
import {CheckboxOptionPreset} from './presets/CheckboxOptionPreset';
import {CheckboxGroupPreset} from './presets/CheckboxGroupPreset';
import {RadioButtonPreset} from './presets/RadioButtonPreset';
import {RadioGroupPreset} from './presets/RadioGroupPreset';
import {TextInputPreset} from './presets/TextInputPreset';
import {NumberInputPreset} from './presets/NumberInputPreset';
import {TextAreaPreset} from './presets/TextAreaPreset';
import {BitmapViewPreset} from './presets/BitmapViewPreset';
import {AvatarImagePreset} from './presets/AvatarImagePreset';
import {CollapseExpandSectionButtonPreset} from './presets/CollapseExpandSectionButtonPreset';
import {SourceTypeSelectorPreset} from './presets/SourceTypeSelectorPreset';
import type {SourceTypeSelectorParam} from './params/SourceTypeSelectorParam';
import type {ListScrollParams} from './params/ListScrollParams';
import type {CheckboxOptionParam} from './params/CheckboxOptionParam';
import type {RadioButtonParam} from './params/RadioButtonParam';
import type {TextInputParam} from './params/TextInputParam';
import type {NumberInputParam} from './params/NumberInputParam';
import type {TextAreaParam} from './params/TextAreaParam';

/**
 * PresetManager — the factory the wired UI builder uses to instantiate every preset (buttons, text,
 * inputs, sections, layouts…), always threading the current wired style. It also caches parsed XML
 * window templates (`createLayout`) so repeated widgets clone from one parse.
 *
 * TODO(AS3): this is the load-bearing core of the factory — the constructor, the `wiredStyle`
 * accessor and `createLayout`. The ~80 `create*` factory methods (createButton, createText,
 * createSection, createFramePreset, …) each instantiate a concrete preset from
 * `wired_setup/uibuilder/presets/**` and are added here as their preset is ported (Bloc D leaves).
 * Do not treat the absence of a `create*` method as intentional — it means that preset is not ported
 * yet. Full surface:
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/PresetManager.as
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/PresetManager.as
 */
export class PresetManager
{
    // AS3: PresetManager.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: PresetManager.as::_presetTemplates
    private _presetTemplates: OrderedMap<string, IWindow> = new OrderedMap<string, IWindow>();

    // AS3: PresetManager.as::PresetManager()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
    }

    // AS3: PresetManager.as::get wiredStyle()
    get wiredStyle(): WiredStyle
    {
        return this._roomEvents.wiredCtrl.wiredStyle;
    }

    // AS3: PresetManager.as::createLayout()
    createLayout(name: string): IWindow
    {
        if(this._presetTemplates.hasKey(name))
        {
            return this._presetTemplates.getValue(name)!.clone();
        }

        const template = this._roomEvents.getXmlWindow(name)!;

        this._presetTemplates.add(name, template);

        return template.clone();
    }

    // AS3: PresetManager.as::createSpacer()
    createSpacer(size: number): SpacerPreset
    {
        return new SpacerPreset(this._roomEvents, this, this.wiredStyle, size);
    }

    // AS3: PresetManager.as::createSplitter()
    createSplitter(): SplitterPreset
    {
        return new SplitterPreset(this._roomEvents, this, this.wiredStyle);
    }

    // AS3: PresetManager.as::createSpacing()
    createSpacing(vertical: boolean, size: number): SpacingPreset
    {
        return new SpacingPreset(this._roomEvents, this, this.wiredStyle, vertical, size);
    }

    // AS3: PresetManager.as::createText()
    createText(text: string, param: TextParam | null = null): TextPreset
    {
        if(param == null)
        {
            param = TextParam.DEFAULT;
        }

        return new TextPreset(this._roomEvents, this, this.wiredStyle, text, param);
    }

    // AS3: PresetManager.as::createButton()
    createButton(caption: string, onClick: (() => void) | null, mode: number = 0): ButtonPreset
    {
        return new ButtonPreset(this._roomEvents, this, this.wiredStyle, caption, onClick, mode);
    }

    // AS3: PresetManager.as::createIconButtonPreset()
    createIconButtonPreset(name: string, onClick: (() => void) | null): IconButtonPreset
    {
        return new IconButtonPreset(this._roomEvents, this, this.wiredStyle, name, onClick);
    }

    // AS3: PresetManager.as::createHtml()
    createHtml(text: string, param: HtmlTextParam): HtmlPreset
    {
        return new HtmlPreset(this._roomEvents, this, this.wiredStyle, text, param);
    }

    // AS3: PresetManager.as::createBitmapWrapperPreset()
    createBitmapWrapperPreset(assetUri: string): StaticBitmapAssetWrapperPreset
    {
        return new StaticBitmapAssetWrapperPreset(this._roomEvents, this, this.wiredStyle, assetUri);
    }

    // AS3: PresetManager.as::createTextualButtonPreset()
    createTextualButtonPreset(caption: string, onClick: () => void): TextualButtonPreset
    {
        return new TextualButtonPreset(this._roomEvents, this, this.wiredStyle, caption, onClick);
    }

    // AS3: PresetManager.as::createPaddedContainerPreset()
    createPaddedContainerPreset(wrapped: WiredUIPreset, leftPadding: number, top: number, rightPadding: number, bottom: number, window: IWindowContainer | null = null, stretchMode: boolean = false): PaddedContainerPreset
    {
        return new PaddedContainerPreset(this._roomEvents, this, this.wiredStyle, wrapped, leftPadding, top, rightPadding, bottom, window, stretchMode);
    }

    // AS3: PresetManager.as::createContainerButtonPreset()
    createContainerButtonPreset(wrapped: WiredUIPreset, onClick: (() => void) | null, stretchMode: boolean = true): ContainerButtonPreset
    {
        return new ContainerButtonPreset(this._roomEvents, this, this.wiredStyle, wrapped, onClick, stretchMode);
    }

    // AS3: PresetManager.as::createCenteredContainerPreset()
    createCenteredContainerPreset(wrapped: WiredUIPreset, margin: number, window: IWindowContainer | null = null): CenteredContainerPreset
    {
        return new CenteredContainerPreset(this._roomEvents, this, this.wiredStyle, wrapped, margin, window);
    }

    // AS3: PresetManager.as::createSimpleListView()
    createSimpleListView(vertical: boolean, presets: WiredUIPreset[], centered: boolean = false): SimpleListViewPreset
    {
        return new SimpleListViewPreset(this._roomEvents, this, this.wiredStyle, vertical, presets, centered);
    }

    // AS3: PresetManager.as::createScrollList()
    createScrollList(presets: WiredUIPreset[], scrollParams: ListScrollParams, centered: boolean = false): ScrollListPreset
    {
        return new ScrollListPreset(this._roomEvents, this, this.wiredStyle, presets, scrollParams, centered);
    }

    // AS3: PresetManager.as::createButtonRow()
    createButtonRow(buttons: WiredUIPreset[]): ButtonRowPreset
    {
        return new ButtonRowPreset(this._roomEvents, this, this.wiredStyle, buttons);
    }

    // AS3: PresetManager.as::createHorizontalSectionListPreset()
    createHorizontalSectionListPreset(presets: WiredUIPreset[]): HorizontalSectionListPreset
    {
        return new HorizontalSectionListPreset(this._roomEvents, this, this.wiredStyle, presets);
    }

    // AS3: PresetManager.as::createCheckboxOption()
    createCheckboxOption(param: CheckboxOptionParam, last: boolean = false): CheckboxOptionPreset
    {
        return new CheckboxOptionPreset(this._roomEvents, this, this.wiredStyle, param, last);
    }

    // AS3: PresetManager.as::createCheckboxGroup()
    createCheckboxGroup(params: CheckboxOptionParam[], onChange: ((id: number, selected: boolean) => void) | null = null, columns: number = 1): CheckboxGroupPreset
    {
        return new CheckboxGroupPreset(this._roomEvents, this, this.wiredStyle, params, onChange, columns);
    }

    // AS3: PresetManager.as::createRadioButton()
    createRadioButton(param: RadioButtonParam, last: boolean = false): RadioButtonPreset
    {
        return new RadioButtonPreset(this._roomEvents, this, this.wiredStyle, param, last);
    }

    // AS3: PresetManager.as::createRadioGroup()
    createRadioGroup(params: RadioButtonParam[], onChange: ((selected: number) => void) | null = null, columns: number = 1): RadioGroupPreset
    {
        return new RadioGroupPreset(this._roomEvents, this, this.wiredStyle, params, onChange, columns);
    }

    // AS3: PresetManager.as::createTextInput()
    createTextInput(param: TextInputParam): TextInputPreset
    {
        return new TextInputPreset(this._roomEvents, this, this.wiredStyle, param);
    }

    // AS3: PresetManager.as::createNumberInput()
    createNumberInput(param: NumberInputParam): NumberInputPreset
    {
        return new NumberInputPreset(this._roomEvents, this, this.wiredStyle, param);
    }

    // AS3: PresetManager.as::createTextArea()
    createTextArea(param: TextAreaParam): TextAreaPreset
    {
        return new TextAreaPreset(this._roomEvents, this, this.wiredStyle, param);
    }

    // AS3: PresetManager.as::createBitmapViewPreset()
    createBitmapViewPreset(): BitmapViewPreset
    {
        return new BitmapViewPreset(this._roomEvents, this, this.wiredStyle);
    }

    // AS3: PresetManager.as::createAvatarImagePreset()
    createAvatarImagePreset(): AvatarImagePreset
    {
        return new AvatarImagePreset(this._roomEvents, this, this.wiredStyle);
    }

    // AS3: PresetManager.as::createCollapseExpandSectionButton()
    createCollapseExpandSectionButton(callback: ((expanded: boolean) => void) | null = null, startExpanded: boolean = true): CollapseExpandSectionButtonPreset
    {
        return new CollapseExpandSectionButtonPreset(this._roomEvents, this, this.wiredStyle, callback, startExpanded);
    }

    // AS3: PresetManager.as::createSourceTypeSelector()
    createSourceTypeSelector(param: SourceTypeSelectorParam): SourceTypeSelectorPreset
    {
        return new SourceTypeSelectorPreset(this._roomEvents, this, this.wiredStyle, param);
    }
}
