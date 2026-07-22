import type {IWindow} from '@core/window/IWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {Util} from '@habbo/roomevents/Util';

import type {IWiredUIPreset} from '../IWiredUIPreset';
import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {SpacerPreset} from './SpacerPreset';
// The wrapper classes are NOT imported here: they `extends WiredUIPreset`, so a static import would
// form an evaluation-order cycle (runtime TDZ). They are built through the wrapperCtors registry
// instead (populated by registerWrappers, called from the PresetManager constructor).
import {wrapperCtors} from './wrapperCtors';

/**
 * WiredUIPreset — the base of every wired UI preset. It carries the shared plumbing: the root window
 * accessor (overridden by concrete presets), width caching + resize, the fluent layout wrappers
 * (align right/center, static height, float, wrap), disabled/visible state with recursive dimming
 * (via Util.disableSection), a blend-spacer background, localization helpers, and disposal.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/WiredUIPreset.as
 */
export class WiredUIPreset implements IWiredUIPreset
{
    // AS3: WiredUIPreset.as::_SafeStr_9544 (disposing flag)
    private _disposing: boolean = false;

    // AS3: WiredUIPreset.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredUIPreset.as::_roomEvents
    protected _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredUIPreset.as::_SafeStr_4640 (preset manager)
    protected _presetManager: PresetManager;

    // AS3: WiredUIPreset.as::_SafeStr_4572 (wired style)
    protected _wiredStyle: WiredStyle;

    // AS3: WiredUIPreset.as::_SafeStr_6724 (blend spacer)
    private _blendSpacer: SpacerPreset | null = null;

    // AS3: WiredUIPreset.as::_blendingBackgroundColor
    private _blendingBackgroundColor: number = 0;

    // AS3: WiredUIPreset.as::_cacheWidth
    private _cacheWidth: number = -1;

    // AS3: WiredUIPreset.as::_SafeStr_6948 (disabled)
    private _disabled: boolean = false;

    // AS3: WiredUIPreset.as::_SafeStr_7246 (invisibility listener)
    private _invisibilityListener: WiredUIPreset | null = null;

    // AS3: WiredUIPreset.as::WiredUIPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        this._roomEvents = roomEvents;
        this._presetManager = presetManager;
        this._wiredStyle = wiredStyle;
    }

    // AS3: WiredUIPreset.as::toArray()
    protected static toArray(value: unknown): unknown[]
    {
        const out: unknown[] = [];

        for(const item of value as Iterable<unknown>)
        {
            out.push(item);
        }

        return out;
    }

    // AS3: WiredUIPreset.as::get window()
    get window(): IWindow
    {
        return null as unknown as IWindow;
    }

    // AS3: WiredUIPreset.as::resizeToWidth()
    resizeToWidth(width: number): void
    {
        this._cacheWidth = width;
    }

    // AS3: WiredUIPreset.as::resize()
    resize(): void
    {
        if(this._cacheWidth !== -1)
        {
            this.resizeToWidth(this._cacheWidth);
        }
    }

    // AS3: WiredUIPreset.as::hasStaticWidth()
    hasStaticWidth(): boolean
    {
        return false;
    }

    // AS3: WiredUIPreset.as::get staticWidth()
    get staticWidth(): number
    {
        return -1;
    }

    // AS3: WiredUIPreset.as::alignRight()
    alignRight(): WiredUIPreset
    {
        return new wrapperCtors.AlignRight!(this._roomEvents, this._presetManager, this._wiredStyle, this);
    }

    // AS3: WiredUIPreset.as::alignCenter()
    alignCenter(): WiredUIPreset
    {
        return new wrapperCtors.AlignCenter!(this._roomEvents, this._presetManager, this._wiredStyle, this);
    }

    // AS3: WiredUIPreset.as::staticHeight()
    staticHeight(height: number): WiredUIPreset
    {
        return new wrapperCtors.StaticHeight!(this._roomEvents, this._presetManager, this._wiredStyle, this, height);
    }

    // AS3: WiredUIPreset.as::floatVertically()
    floatVertically(): WiredUIPreset
    {
        return new wrapperCtors.FloatVertically!(this._roomEvents, this._presetManager, this._wiredStyle, this);
    }

    // AS3: WiredUIPreset.as::wrapWindow()
    wrapWindow(window: IWindow, staticWidth: boolean = false): WiredUIPreset
    {
        return new wrapperCtors.WindowWrapper!(this._roomEvents, this._presetManager, this._wiredStyle, window, staticWidth);
    }

    // AS3: WiredUIPreset.as::noDisable()
    noDisable(): WiredUIPreset
    {
        this.window.tags.push('DO_NOT_DISABLE');

        return this;
    }

    // AS3: WiredUIPreset.as::halfBlend()
    halfBlend(): WiredUIPreset
    {
        this.window.blend = 0.5;
        this.window.tags.push('HALF_BLEND');

        return this;
    }

    // AS3: WiredUIPreset.as::set disabled()
    set disabled(value: boolean)
    {
        if(this._disabled === value)
        {
            return;
        }

        this._disabled = value;
        this.updateDisabledState();
    }

    // AS3: WiredUIPreset.as::updateDisabledState()
    updateDisabledState(): void
    {
        Util.disableSection(this.window, this._disabled);

        if(!this._disabled)
        {
            for(const child of this.childPresets)
            {
                child.updateDisabledState();
            }
        }
    }

    // AS3: WiredUIPreset.as::get childPresets()
    protected get childPresets(): WiredUIPreset[]
    {
        return [];
    }

    // AS3: WiredUIPreset.as::get disabled()
    get disabled(): boolean
    {
        return this._disabled;
    }

    // AS3: WiredUIPreset.as::set visible()
    set visible(value: boolean)
    {
        if(this.window.visible !== value)
        {
            this.window.visible = value;

            if(this._invisibilityListener != null)
            {
                this._invisibilityListener.onInvisibilityChanged(this, value);
            }
        }
    }

    // AS3: WiredUIPreset.as::get visible()
    get visible(): boolean
    {
        return this.window.visible;
    }

    // AS3: WiredUIPreset.as::set invisibilityListener() (AS3 `internal`; no package scope in TS)
    set invisibilityListener(listener: WiredUIPreset)
    {
        this._invisibilityListener = listener;
    }

    // AS3: WiredUIPreset.as::onInvisibilityChanged()
    protected onInvisibilityChanged(_preset: WiredUIPreset, _visible: boolean): void
    {
    }

    // AS3: WiredUIPreset.as::loc()
    protected loc(key: string): string
    {
        return this._roomEvents.localization.getLocalization(key, key);
    }

    // AS3: WiredUIPreset.as::l()
    protected l(key: string): string
    {
        return this._roomEvents.localization.getLocalization('wiredfurni.params.' + key, key);
    }

    // AS3: WiredUIPreset.as::get localizations()
    protected get localizations(): IHabboLocalizationManager
    {
        return this._roomEvents.localization;
    }

    // AS3: WiredUIPreset.as::get disposing()
    protected get disposing(): boolean
    {
        return this._disposing;
    }

    // AS3: WiredUIPreset.as::dispose()
    dispose(): void
    {
        this._disposing = true;

        if(this._disposed)
        {
            return;
        }

        this._blendSpacer = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._wiredStyle = null as unknown as WiredStyle;
        this._presetManager = null as unknown as PresetManager;
        this._invisibilityListener = null;

        for(const child of this.childPresets)
        {
            child.dispose();
        }

        this._disposed = true;
    }

    // AS3: WiredUIPreset.as::set blendSpacer()
    set blendSpacer(spacer: SpacerPreset)
    {
        this._blendSpacer = spacer;
        this.updateBackgroundColorBlending();
    }

    // AS3: WiredUIPreset.as::set blendingBackgroundColor()
    protected set blendingBackgroundColor(color: number)
    {
        this._blendingBackgroundColor = color;
        this.updateBackgroundColorBlending();
    }

    // AS3: WiredUIPreset.as::updateBackgroundColorBlending()
    private updateBackgroundColorBlending(): void
    {
        if(this._blendSpacer != null)
        {
            const enabled = this._blendingBackgroundColor !== 0;

            this._blendSpacer.backgroundEnabled = enabled;

            if(enabled)
            {
                this._blendSpacer.backgroundColor = this._blendingBackgroundColor;
            }
        }
    }

    // AS3: WiredUIPreset.as::resolveAssetFullName()
    protected resolveAssetFullName(name: string): string
    {
        const full = 'wired_styles_' + this._wiredStyle.name + '_' + name;

        // TODO(AS3): AS3 resolves against `windowManager.assets`; the port's IHabboWindowManager does
        // not expose an asset library, so the component's own asset library is consulted instead.
        const assets = (this._roomEvents as unknown as { assets?: { getAssetByName(n: string): unknown } }).assets;

        if(assets != null && assets.getAssetByName(full) != null)
        {
            return full;
        }

        return 'wired_' + name;
    }

    // AS3: WiredUIPreset.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
