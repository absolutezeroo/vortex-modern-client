import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../wired_setup/uibuilder/PresetManager';
import type {FooterPreset} from '../wired_setup/uibuilder/presets/main_layout/FooterPreset';
import type {FramePreset} from '../wired_setup/uibuilder/presets/main_layout/FramePreset';

/**
 * Base for the standalone "ubuntu"-styled wired windows: owns the frame, the save/close footer, and
 * the show/hide that attaches the frame to desktop layer 1.
 *
 * Subclasses build their own body and assign {@link framePreset}; this class knows only how to put
 * that frame on screen and take it off again.
 *
 * **Showing is attaching.** `isShowing()` asks whether the frame's window has a parent *and* is
 * visible — there is no separate flag — so a subclass that forgets to set `framePreset` will
 * silently never appear.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/AbstractUbuntuWiredUI.as
 */
export class AbstractUbuntuWiredUI
{
    // AS3: AbstractUbuntuWiredUI.as::_SafeStr_4995 (name derived: the frame)
    private _framePreset: FramePreset | null = null;

    // AS3: AbstractUbuntuWiredUI.as::_SafeStr_6152 (name derived: the footer)
    private _footerPreset: FooterPreset | null;

    // AS3: AbstractUbuntuWiredUI.as::_roomEvents
    private _roomEventsRef: HabboUserDefinedRoomEvents | null;

    // AS3: AbstractUbuntuWiredUI.as::_SafeStr_4640 (name derived: the preset manager)
    private _presetManagerRef: PresetManager | null;

    // AS3: AbstractUbuntuWiredUI.as::_disposed
    private _disposed: boolean = false;

    // AS3: AbstractUbuntuWiredUI.as::_SafeStr_8022 (name derived: the frame has been placed once)
    private _hasBeenPlaced: boolean = false;

    // AS3: AbstractUbuntuWiredUI.as::AbstractUbuntuWiredUI()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager)
    {
        this._roomEventsRef = roomEvents;
        this._presetManagerRef = presetManager;
        this._footerPreset = this.createFooterPreset();
    }

    /**
	 * Overridable so a subclass can supply a footer with different buttons; the default binds save
	 * and close straight to this class's handlers.
	 */
    // AS3: AbstractUbuntuWiredUI.as::createFooterPreset()
    protected createFooterPreset(): FooterPreset | null
    {
        return this.presetManager?.createFooterPreset(
            () => this.onSaveClicked(),
            () => this.onCloseClicked()
        ) ?? null;
    }

    // AS3: AbstractUbuntuWiredUI.as::get footerPreset()
    get footerPreset(): FooterPreset | null
    {
        return this._footerPreset;
    }

    /**
	 * Empty in AS3 too — the base has no save semantics, and a subclass that shows a save button
	 * without overriding this simply does nothing when it is pressed.
	 */
    // AS3: AbstractUbuntuWiredUI.as::onSaveClicked()
    onSaveClicked(): void
    {
    }

    // AS3: AbstractUbuntuWiredUI.as::onCloseClicked()
    onCloseClicked(): void
    {
        this.hide();
    }

    // AS3: AbstractUbuntuWiredUI.as::isShowing()
    isShowing(): boolean
    {
        const window = this._framePreset?.window ?? null;

        return window != null && window.parent != null && window.visible;
    }

    // AS3: AbstractUbuntuWiredUI.as::get xOffsetFromCenter()
    get xOffsetFromCenter(): number
    {
        return 0;
    }

    /**
	 * Centre once, then leave it alone: `_hasBeenPlaced` is what stops a re-open from yanking the
	 * window back to the middle after the player has dragged it — but only for a subclass that
	 * opts in through {@link isRememberLocation}.
	 */
    // AS3: AbstractUbuntuWiredUI.as::showFrame()
    protected showFrame(): void
    {
        const window = this._framePreset?.window ?? null;

        if(window === null) return;

        if(!this.isShowing())
        {
            const desktop = this._roomEventsRef?.windowManager?.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop) desktop.addChild(window);

            if(!this.isRememberLocation || !this._hasBeenPlaced)
            {
                window.center();
                window.x += this.xOffsetFromCenter;
                this._hasBeenPlaced = true;
            }
        }

        window.activate();
    }

    // AS3: AbstractUbuntuWiredUI.as::get window()
    get window(): IWindow | null
    {
        return this._framePreset?.window ?? null;
    }

    // AS3: AbstractUbuntuWiredUI.as::forgetLocation()
    forgetLocation(): void
    {
        this._hasBeenPlaced = false;
    }

    // AS3: AbstractUbuntuWiredUI.as::get isRememberLocation()
    protected get isRememberLocation(): boolean
    {
        return false;
    }

    // AS3: AbstractUbuntuWiredUI.as::get isBoundToParentRect()
    protected get isBoundToParentRect(): boolean
    {
        return false;
    }

    // AS3: AbstractUbuntuWiredUI.as::hide()
    hide(): void
    {
        this.hideFrame();
    }

    // AS3: AbstractUbuntuWiredUI.as::hideFrame()
    protected hideFrame(): void
    {
        if(!this.isShowing()) return;

        const desktop = this._roomEventsRef?.windowManager?.getDesktop(1) as unknown as IWindowContainer | null;
        const window = this._framePreset?.window ?? null;

        if(desktop && window) desktop.removeChild(window);
    }

    /**
	 * The setter is where `isBoundToParentRect` is applied — param flag 32 clamps the window inside
	 * its parent, and AS3 sets it here rather than in the subclass so every frame gets the same
	 * treatment the moment it is assigned.
	 */
    // AS3: AbstractUbuntuWiredUI.as::set framePreset()
    protected set framePreset(value: FramePreset | null)
    {
        this._framePreset = value;

        if(value !== null && this.isBoundToParentRect)
        {
            value.window.setParamFlag(32, true);
        }
    }

    // AS3: AbstractUbuntuWiredUI.as::get framePreset()
    protected get framePreset(): FramePreset | null
    {
        return this._framePreset;
    }

    // AS3: AbstractUbuntuWiredUI.as::get roomEvents()
    protected get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEventsRef!;
    }

    // AS3: AbstractUbuntuWiredUI.as::get localization()
    protected get localization(): IHabboLocalizationManager | null
    {
        return this._roomEventsRef?.localization ?? null;
    }

    // AS3: AbstractUbuntuWiredUI.as::get presetManager()
    protected get presetManager(): PresetManager | null
    {
        return this._presetManagerRef;
    }

    // AS3: AbstractUbuntuWiredUI.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: AbstractUbuntuWiredUI.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        // AS3 disposes the frame and drops the footer without disposing it — the footer is one of
        // the frame's own children, so the frame has already taken it down.
        this._framePreset?.dispose();
        this._framePreset = null;
        this._footerPreset = null;
        this._roomEventsRef = null;
        this._presetManagerRef = null;
        this._disposed = true;
    }
}
