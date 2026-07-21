import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';

import type {WiredUIPreset} from './presets/WiredUIPreset';
import type {SpacerPreset} from './presets/SpacerPreset';

/**
 * IWiredUIPreset — the common contract every wired UI preset implements: expose its root window,
 * resize to a width, report/adopt a static width, chain layout wrappers (align/float/wrap), and
 * carry disabled/visible state.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_2790` with no counterpart in the older
 * vortex-flash-client; the name follows its sole implementer `presets/WiredUIPreset`. The fluent
 * methods return the concrete `WiredUIPreset` exactly as the AS3 interface declares.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/_SafeCls_2790.as
 */
export interface IWiredUIPreset extends IDisposable
{
    // AS3: _SafeCls_2790.as::get window()
    readonly window: IWindow;

    // AS3: _SafeCls_2790.as::resizeToWidth()
    resizeToWidth(width: number): void;

    // AS3: _SafeCls_2790.as::hasStaticWidth()
    hasStaticWidth(): boolean;

    // AS3: _SafeCls_2790.as::get staticWidth()
    readonly staticWidth: number;

    // AS3: _SafeCls_2790.as::alignRight()
    alignRight(): WiredUIPreset;

    // AS3: _SafeCls_2790.as::alignCenter()
    alignCenter(): WiredUIPreset;

    // AS3: _SafeCls_2790.as::staticHeight()
    staticHeight(height: number): WiredUIPreset;

    // AS3: _SafeCls_2790.as::floatVertically()
    floatVertically(): WiredUIPreset;

    // AS3: _SafeCls_2790.as::wrapWindow()
    wrapWindow(window: IWindow, staticWidth?: boolean): WiredUIPreset;

    // AS3: _SafeCls_2790.as::noDisable()
    noDisable(): WiredUIPreset;

    // AS3: _SafeCls_2790.as::halfBlend()
    halfBlend(): WiredUIPreset;

    // AS3: _SafeCls_2790.as::set disabled()
    // AS3: _SafeCls_2790.as::get disabled()
    disabled: boolean;

    // AS3: _SafeCls_2790.as::updateDisabledState()
    updateDisabledState(): void;

    // AS3: _SafeCls_2790.as::set visible()
    // AS3: _SafeCls_2790.as::get visible()
    visible: boolean;

    // AS3: _SafeCls_2790.as::set blendSpacer()
    set blendSpacer(spacer: SpacerPreset);
}
