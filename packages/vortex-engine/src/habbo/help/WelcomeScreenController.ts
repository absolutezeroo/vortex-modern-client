import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.WelcomeScreenController');

/**
 * The onboarding bubble that points at a toolbar icon
 *
 * A small speech bubble that slides in from off-screen, parks itself beside the toolbar icon it
 * is explaining, and opens that icon's window when clicked. It arrives from the left or the right
 * depending on which side of the toolbar the icon sits, and re-parks itself when the toolbar
 * resizes.
 *
 * The slide is driven by `update()`: each tick moves the window halfway to its target and stops
 * once it is within five pixels, so it eases in rather than jumping. The controller unregisters
 * itself from the update loop the moment it arrives — it is not a per-frame cost while idle.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/WelcomeScreenController.as
 */
export class WelcomeScreenController implements IUpdateReceiver
{
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_targetPosition
    // Name derived (`_SafeStr_4871`): where the bubble is sliding to. AS3 seeds it with (72, 10),
    // the left-hand resting x and a placeholder y that `updatePosition()` overwrites at once.
    private _targetX: number = 72;
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_targetPosition
    // The `y` half of the same AS3 `Point`, split in two because this port has no Point type.
    private _targetY: number = 10;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_iconId
    // Name derived (`_SafeStr_8781`): the toolbar icon the bubble points at.
    private _iconId: string = '';

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_position
    // Name derived (`_SafeStr_8317`): 0 means the bubble comes from the left, anything else from
    // the right of the icon.
    private _position: number = 0;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_windowToOpen
    // Name derived (`_SafeStr_8437`): the toolbar window clicking the bubble toggles.
    private _windowToOpen: string | null = null;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::WelcomeScreenController()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Show the bubble beside a toolbar icon
	 *
	 * @param iconId The toolbar icon to point at
	 * @param textKey The localization key for the bubble's text
	 * @param position 0 to arrive from the left, anything else from the right
	 * @param windowToOpen The toolbar window a click on the bubble toggles
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::showWelcomeScreen()
    showWelcomeScreen(iconId: string, textKey: string, position: number, windowToOpen: string | null): void
    {
        if(this._disposed) return;

        this._iconId = iconId;
        this._position = position;
        this._windowToOpen = windowToOpen;

        if(this._window === null) this.initializeWindow();

        if(!this._window) return;

        const text = this._window.findChildByName('text') as ITextWindow | null;

        if(text)
        {
            text.caption = `\${${textKey}}`;
            text.height = text.textHeight + 5;
        }

        this.updatePosition();
        this.registerUpdates();

        this._window.visible = true;
        this._window.activate();
    }

    /**
	 * Build the bubble and strip the frame chrome off it
	 *
	 * The layout is an ordinary framed window; AS3 hides the header and pulls the content up by
	 * the header's height so what is left reads as a bare bubble.
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::initializeWindow()
    private initializeWindow(): void
    {
        // Layer 2 — the dialog layer, above the toolbar it points at.
        const window = this._habboHelp?.getXmlWindow('welcome_screen', 2) as IWindowContainer | null;

        if(!window)
        {
            log.error('initializeWindow: getXmlWindow("welcome_screen") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const frame = window.findChildByName('frame') as unknown as IFrameWindow | null;

        if(frame)
        {
            frame.header.visible = false;
            frame.content.y -= 20;

            // 2048 is the frame's own mouse-handling flag; cleared so clicks reach the bubble's
            // click region rather than being eaten by the content container.
            frame.content.setParamFlag(2048, false);
            frame.height -= 20;
        }

        const text = window.findChildByName('text') as ITextWindow | null;

        if(text) text.height = text.textHeight + 5;

        window.findChildByName('close')?.addEventListener('WME_CLICK', this.onCloseButton);
        window.findChildByName('click')?.addEventListener('WME_CLICK', this.onRegionClick);
    }

    /**
	 * Point the bubble at its icon, and decide which arrow it wears
	 *
	 * The window is placed off-screen on the far side first, so the slide has somewhere to come
	 * from; `update()` then walks it to the target.
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::updatePosition()
    private updatePosition(): void
    {
        if(!this._window) return;

        // With no icon to point at, AS3 falls back to a rectangle the size of the bubble at the
        // origin, which parks it in the top-left.
        const icon = this._habboHelp?.toolbar?.getIconLocation(this._iconId)
			?? {x: 0, y: 0, width: this._window.width, height: this._window.height};

        const arrowLeft = this._window.findChildByName('arrow');
        const arrowRight = this._window.findChildByName('arrow_right');

        if(this._position === 0)
        {
            this._targetX = 72;
            this._window.x = -this._window.width;

            // Both arrows are centred off the *left* arrow's height, in AS3, even in the
            // right-hand branch below — the two are the same size, so it reads as a shortcut.
            if(arrowLeft)
            {
                arrowLeft.y = (this._window.height - arrowLeft.height) / 2;
                arrowLeft.visible = true;
            }

            if(arrowRight) arrowRight.visible = false;
        }
        else
        {
            this._targetX = icon.x - this._window.width;
            this._window.x = icon.x + icon.width + this._window.width;

            if(arrowRight)
            {
                arrowRight.y = (this._window.height - (arrowLeft?.height ?? arrowRight.height)) / 2;
                arrowRight.visible = true;
            }

            if(arrowLeft) arrowLeft.visible = false;
        }

        this._targetY = icon.y + icon.height / 2 - this._window.height / 2;
        this._window.y = this._targetY;
    }

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::onCloseButton()
    private onCloseButton = (_event: WindowMouseEvent): void =>
    {
        this.closeWindow();
    };

    /**
	 * Clicking the bubble opens whatever it was advertising
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::onRegionClick()
    private onRegionClick = (_event: WindowMouseEvent): void =>
    {
        if(this._windowToOpen !== null) this._habboHelp?.toolbar?.toggleWindowVisibility(this._windowToOpen);

        this.closeWindow();
    };

    /**
	 * Hide and dispose — the bubble is shown once and not reused
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::closeWindow()
    private closeWindow(): void
    {
        if(!this._window) return;

        this._window.visible = false;

        this.dispose();
    }

    /**
	 * Ease the bubble toward its parked position
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::update()
    update(_deltaTime: number): void
    {
        if(this._window === null)
        {
            this._habboHelp?.removeUpdateReceiver(this);

            return;
        }

        const dx = this._targetX - this._window.x;
        const dy = this._targetY - this._window.y;

        // AS3 uses `Point.distance`; the comparison is against 5 pixels either way.
        if(Math.sqrt(dx * dx + dy * dy) > 5)
        {
            // `Point.interpolate(a, b, 0.5)` is the midpoint, so each tick halves the remaining
            // gap rather than moving a fixed step.
            this._window.x += dx / 2;
            this._window.y += dy / 2;

            return;
        }

        this._window.x = this._targetX;
        this._window.y = this._targetY;

        this._habboHelp?.removeUpdateReceiver(this);
    }

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::registerUpdates()
    // Removed first: showing a second bubble while one is still sliding would otherwise register
    // this receiver twice.
    private registerUpdates(): void
    {
        this._habboHelp?.removeUpdateReceiver(this);
        this._habboHelp?.registerUpdateReceiver(this, 10);
    }

    /**
	 * Follow the toolbar when it moves, and get out of the way when it is used
	 */
    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::onHabboToolbarEvent()
    onHabboToolbarEvent(event: HabboToolbarEvent): void
    {
        if(this._disposed) return;

        switch(event.type)
        {
            case 'HTE_RESIZED':
            {
                const icon = this._habboHelp?.toolbar?.getIconLocation(this._iconId) ?? null;

                if(icon && this._window)
                {
                    this._targetY = icon.y + icon.height / 2 - this._window.height / 2;
                    this._window.y = this._targetY;
                }
                break;
            }

            case 'HTE_TOOLBAR_CLICK':
            case 'HTE_GROUP_ROOM_INFO_CLICK':
                this.closeWindow();
                break;
        }
    }

    // AS3: .../src/com/sulake/habbo/help/WelcomeScreenController.as::dispose()
    dispose(): void
    {
        if(this._habboHelp)
        {
            this._habboHelp.removeUpdateReceiver(this);
            this._habboHelp = null;
        }

        if(this._window)
        {
            this._window.findChildByName('close')?.removeEventListener('WME_CLICK', this.onCloseButton);
            this._window.findChildByName('click')?.removeEventListener('WME_CLICK', this.onRegionClick);

            this._window.dispose();
            this._window = null;
        }

        this._disposed = true;
    }
}
