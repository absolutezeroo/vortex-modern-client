import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {IWindow} from '@core/window/IWindow';
import type {IRoomAreaSelectionManager} from '@habbo/room/IRoomAreaSelectionManager';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextParam} from '../uibuilder/params/TextParam';
import type {ButtonPreset} from '../uibuilder/presets/ButtonPreset';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * InArea — abstract base for the "in area" selectors (UsersInArea, FurniInArea): a Select/Clear button
 * pair driving the room-engine's IRoomAreaSelectionManager to pick a rectangular tile area. The chosen
 * (x, y, width, height) serialize into intParams.
 *
 * It is abstract (no `code` override) and never registered. Area selection is inert until the
 * room-engine's RoomAreaSelectionManager is fully ported (see its TODO(AS3)); when activate() reports
 * unavailable, both buttons stay disabled.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/InArea.as
 */
export class InArea extends DefaultSelectorType
{
    // AS3: InArea.as::_SafeStr_5591 (name derived: the room-engine area-selection manager)
    private _areaSelectionManager!: IRoomAreaSelectionManager;

    // AS3: InArea.as::_SafeStr_6295 (name derived: the area x)
    private _x: number = 0;

    // AS3: InArea.as::_SafeStr_6455 (name derived: the area y)
    private _y: number = 0;

    // AS3: InArea.as::_width
    private _width: number = 0;

    // AS3: InArea.as::_SafeStr_4970 (name derived: the area height)
    private _height: number = 0;

    // AS3: InArea.as::_SafeStr_5364 (name derived: whether area selection is active)
    private _selectionActive: boolean = false;

    // AS3: InArea.as::_SafeStr_7993 (name derived: the select button)
    private _selectButton!: ButtonPreset;

    // AS3: InArea.as::_SafeStr_8582 (name derived: the clear button)
    private _clearButton!: ButtonPreset;

    // AS3: InArea.as::_SafeStr_7105 (name derived: the select button's interactive window)
    private _selectButtonWindow: IWindow | null = null;

    // AS3: InArea.as::_SafeStr_8734 (name derived: the clear button's interactive window)
    private _clearButtonWindow: IWindow | null = null;

    // AS3: InArea.as::enableButton()
    private static enableButton(window: IWindow | null, enable: boolean): void
    {
        if(window === null)
        {
            return;
        }

        if(enable)
        {
            window.enable();
        }
        else
        {
            window.disable();
        }
    }

    // AS3: InArea.as::onInit()
    override onInit(roomEvents: HabboUserDefinedRoomEvents): void
    {
        super.onInit(roomEvents);
        this._areaSelectionManager = roomEvents.roomEngine!.areaSelectionManager;
    }

    // AS3: InArea.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        if(!this._selectionActive)
        {
            this._selectionActive = this._areaSelectionManager.activate((x, y, width, height) => this.onAreaSelected(x, y, width, height), 'highlight_brighten');
        }

        this._x = def.getInt(0);
        this._y = def.getInt(1);
        this._width = def.getInt(2);
        this._height = def.getInt(3);

        if(this._selectionActive)
        {
            this._areaSelectionManager.setHighlight(this._x, this._y, this._width, this._height);
            InArea.enableButton(this._selectButtonWindow, true);
            InArea.enableButton(this._clearButtonWindow, true);
        }
        else
        {
            InArea.enableButton(this._selectButtonWindow, false);
            InArea.enableButton(this._clearButtonWindow, false);
        }
    }

    // AS3: InArea.as::onEditEnd()
    override onEditEnd(): void
    {
        super.onEditEnd();

        if(this._selectionActive)
        {
            this._areaSelectionManager.deactivate();
            this._selectionActive = false;
        }
    }

    // AS3: InArea.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._x, this._y, this._width, this._height];
    }

    // AS3: InArea.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: InArea.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const textParam = new TextParam(1);
        textParam.textColor = wiredStyle.softTextColor;
        const info = presetManager.createText(this.l('area_selection.info'), textParam);
        this._selectButton = presetManager.createButton(this.l('area_selection.select'), () => this.onSelect());
        this._clearButton = presetManager.createButton(this.l('area_selection.clear'), () => this.onClear());
        const buttonRow = presetManager.createButtonRow([this._selectButton, this._clearButton]);
        const section = presetManager.createSection(this.l('area_selection'), presetManager.createSimpleListView(true, [info, buttonRow]));
        builder.addElements(section);
        this._selectButtonWindow = this._selectButton.window;
        this._clearButtonWindow = this._clearButton.window;
    }

    // AS3: InArea.as::onSelect()
    private onSelect(): void
    {
        InArea.enableButton(this._selectButtonWindow, false);
        this._areaSelectionManager.startSelecting();
    }

    // AS3: InArea.as::onClear()
    private onClear(): void
    {
        this._areaSelectionManager.clearHighlight();
    }

    // AS3: InArea.as::onAreaSelected()
    private onAreaSelected(x: number, y: number, width: number, height: number): void
    {
        InArea.enableButton(this._selectButtonWindow, true);
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
}
