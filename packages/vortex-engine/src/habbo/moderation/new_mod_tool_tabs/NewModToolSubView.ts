/**
 * NewModToolSubView — the base every panel of the new mod tool extends.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/new_mod_tool_tabs/_SafeCls_2521.as
 *
 * Derived name: the AS3 class is `_SafeCls_2521` and appears under no readable identifier in any
 * tree. It is named after the vocabulary the owning class already uses for these panels —
 * `setActiveSubView()`, `subViewWrapper`, `banSubView` — rather than after the `new_mod_tool_tabs`
 * package, which calls them tabs but builds no tab context.
 *
 * The constructor hides the window it is handed. `NewModerationTool.setWindowManager()` hides the
 * five panels itself first, so this is belt-and-braces there, but it is what guarantees `visible`
 * starts out agreeing with the window regardless of who constructs a panel.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {NewModerationTool} from '../NewModerationTool';

export class NewModToolSubView implements IDisposable
{
    /** Derived name — `_SafeStr_7570`, from `get tool()`. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::_SafeStr_7570
    private _tool: NewModerationTool | null;

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_5208`, from `get visible()`. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::_SafeStr_5208
    private _visible: boolean = false;

    /** Derived name — `_SafeStr_5769`, from `get disposed()`. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::_SafeCls_2521()
    constructor(tool: NewModerationTool, window: IWindowContainer)
    {
        this._tool = tool;
        this._window = window;

        (window as unknown as IWindow).visible = false;
    }

    /** Guarded so a repeated assignment does not touch the window. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::set visible()
    public set visible(value: boolean)
    {
        if(this._visible !== value)
        {
            this._visible = value;

            if(this._window !== null) (this._window as unknown as IWindow).visible = value;
        }
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::get visible()
    public get visible(): boolean
    {
        return this._visible;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::get tool()
    public get tool(): NewModerationTool
    {
        return this._tool as NewModerationTool;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::get window()
    public get window(): IWindowContainer
    {
        return this._window as IWindowContainer;
    }

    /** Overridden by the panels that refill fields each time they are shown. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::onOpen()
    public onOpen(): void
    {
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2521.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._window = null;
        this._tool = null;
        this._disposed = true;
    }
}
