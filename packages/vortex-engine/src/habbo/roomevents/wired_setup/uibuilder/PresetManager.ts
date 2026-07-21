import type {IWindow} from '@core/window/IWindow';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {WiredStyle} from './styles/WiredStyle';

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
}
