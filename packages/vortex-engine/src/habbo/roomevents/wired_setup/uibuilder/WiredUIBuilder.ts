import type {PresetManager} from './PresetManager';
import {ListScrollParams} from './params/ListScrollParams';
import type {WiredUIPreset} from './presets/WiredUIPreset';
import type {FramePreset} from './presets/main_layout/FramePreset';

/**
 * WiredUIBuilder — assembles a wired dialog: elements are added, then build() wraps them in a
 * FramePreset (optionally scrollable) via the PresetManager and sizes it to its initial width times
 * the requested scale.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/WiredUIBuilder.as
 */
export class WiredUIBuilder
{
    // AS3: WiredUIBuilder.as::_presetManager
    private _presetManager: PresetManager;

    // AS3: WiredUIBuilder.as::_callback (close callback)
    private _callback: (() => void) | null;

    // AS3: WiredUIBuilder.as::_holderKey
    private _holderKey: string;

    // AS3: WiredUIBuilder.as::_code
    private _code: number;

    // AS3: WiredUIBuilder.as::_frame
    private _frame!: FramePreset;

    // AS3: WiredUIBuilder.as::_elements
    protected _elements: WiredUIPreset[] | null;

    // AS3: WiredUIBuilder.as::_resizable
    private _resizable: boolean;

    // AS3: WiredUIBuilder.as::_initialWidth
    private _initialWidth: number = 0;

    // AS3: WiredUIBuilder.as::WiredUIBuilder()
    constructor(presetManager: PresetManager, callback: (() => void) | null, holderKey: string, code: number, resizable: boolean = false)
    {
        this._presetManager = presetManager;
        this._callback = callback;
        this._resizable = resizable;
        this._holderKey = holderKey;
        this._code = code;
        this._elements = [];
    }

    // AS3: WiredUIBuilder.as::addElements()
    addElements(...rest: WiredUIPreset[]): void
    {
        for(const element of rest)
        {
            this._elements!.push(element);
        }
    }

    // AS3: WiredUIBuilder.as::get frame()
    get frame(): FramePreset
    {
        return this._frame;
    }

    // AS3: WiredUIBuilder.as::build()
    build(scale: number = 1, scroll: boolean = false): void
    {
        let scrollParams: ListScrollParams | null = null;

        if(scroll)
        {
            // AS3: Capabilities.screenResolutionY (the display height).
            const screenHeight = typeof screen !== 'undefined' ? screen.height : 1080;

            scrollParams = new ListScrollParams(false, 0, screenHeight / 1.8, true, true);
        }

        this._frame = this._presetManager.createFramePreset(this._elements!, this._callback, this._holderKey, this._code, this._resizable, true, scrollParams);
        this._elements = null;
        this._initialWidth = this._frame.window.width;
        this._frame.resizeToWidth(Math.trunc(this._initialWidth * scale));
    }

    // AS3: WiredUIBuilder.as::get initialWidth()
    get initialWidth(): number
    {
        return this._initialWidth;
    }
}
