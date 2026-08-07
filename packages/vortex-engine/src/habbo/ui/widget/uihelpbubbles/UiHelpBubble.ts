import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {HelpBubbleItem} from './HelpBubbleItem';
import type {UiHelpBubblesWidget} from './UiHelpBubblesWidget';

/** TS-only: the shape AS3's `flash.geom.Rectangle` reduces to across this port's window API. */
export interface IBubbleRect
{
    // TS-only: `flash.geom.Rectangle.x`.
    x: number;
    // TS-only: `flash.geom.Rectangle.y`.
    y: number;
    // TS-only: `flash.geom.Rectangle.width`.
    width: number;
    // TS-only: `flash.geom.Rectangle.height`.
    height: number;
}

/**
 * One help bubble: a pointer balloon over some UI element, optionally with the rest of the screen
 * dimmed and a hole punched over the element it is pointing at.
 *
 * The bubble is dismissed three ways, and all three are the *same* two callbacks — the OK button,
 * the modal backdrop, and clicking the highlighted element itself. Which callback is used depends
 * only on whether another bubble follows: `onNext` chains, `onLastBubble` also tells the server
 * the script may proceed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubble.as
 */
export class UiHelpBubble
{
    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::MODAL_LAYER
    // Name DERIVED: the 3 AS3 passes to buildFromXML for both windows — above the room, above the
    // toolbar, below the alerts.
    private static readonly MODAL_LAYER: number = 3;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::TEXT_HEIGHT_PADDING
    // Name DERIVED: the +90 added to the measured text height for the window, and the +30 for the
    // OK button — the balloon's chrome above and below the text.
    private static readonly TEXT_HEIGHT_PADDING: number = 90;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::BUTTON_TEXT_OFFSET
    private static readonly BUTTON_TEXT_OFFSET: number = 30;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::ARROW_OFFSET_CORRECTION
    // Name DERIVED: the -8 applied to every pointer offset before it reaches the bubble.
    private static readonly ARROW_OFFSET_CORRECTION: number = 8;

    /**
     * Name DERIVED: the literal AS3 fills the backdrop BitmapData with. It decodes to
     * **A=255 R=224 G=0 B=0** — opaque red, not the grey a dim suggests. That is what the source
     * says and it is left alone: the layout tints and blends this bitmap itself
     * (`ui_help_modal.xml` gives it `color="0x024231e"` and `blend="0.6"`), and the layout ships
     * verbatim, so whatever AS3 rendered this port renders too.
     */
    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::MODAL_FILL_COLOR
    private static readonly MODAL_FILL_COLOR: number = 4292870144;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_widget
    // Name DERIVED (`_SafeStr_4549`): the same obfuscated id the other widgets use for their owner.
    private _widget: UiHelpBubblesWidget | null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_name
    // Name DERIVED (`_SafeStr_4872`): returned by `getName()`, and the key the widget files the
    // bubble under.
    private _name: string;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_text
    // Name DERIVED (`_SafeStr_9917`): the already-localised bubble text.
    private _text: string;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_hasNext
    // Name DERIVED (`_SafeStr_8061`): true when another bubble follows this one, which is what
    // decides between the two dismiss callbacks and whether the OK button keeps its layout caption.
    private _hasNext: boolean;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_bubble
    private _bubble: IBubbleWindow | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_okButton
    // Name DERIVED (`_SafeStr_6684`): found by "help_bubble_btn_ok".
    private _okButton: IWindow | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_modalWindow
    // Name DERIVED (`_SafeStr_4876`): the full-screen backdrop built from "ui_help_modal".
    private _modalWindow: IWindowContainer | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_modal
    // Name DERIVED (`_SafeStr_10013`): copied from the item; whether the backdrop is built at all.
    private _modal: boolean;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_modalBitmap
    // Name DERIVED (`_SafeStr_7174`): the backdrop's "bitmap" child, which carries the dim and
    // the hole.
    private _modalBitmap: IBitmapWrapperWindow | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_callbackTarget
    // Name DERIVED (`_SafeStr_8239`): the highlighted UI element, made clickable so that clicking
    // the thing the bubble points at also dismisses it.
    private _callbackTarget: IWindow | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_chatFieldTarget
    // Name DERIVED (`_SafeStr_8871`): the same, for the chat input, which is reached by a
    // different lookup. **Never unsubscribed** — see `dispose()`.
    private _chatFieldTarget: ITextFieldWindow | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_callback
    // Name DERIVED (`_SafeStr_5185`): whichever of onNext/onLastBubble this bubble uses. Its
    // non-null-ness is also the "already bound" guard in both setters.
    private _callback: ((event?: unknown) => void) | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::_position
    // Name DERIVED (`_SafeStr_8580`): stored by setPosition() and read by nothing afterwards.
    private _position: {x: number; y: number} | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::UiHelpBubble()
    constructor(widget: UiHelpBubblesWidget, item: HelpBubbleItem, hasNext: boolean)
    {
        this._widget = widget;
        this._name = item.name;
        this._text = item.text;
        this._hasNext = hasNext;
        this._modal = item.modal;

        this.createWindow();
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::getWindow()
    getWindow(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::getName()
    getName(): string
    {
        return this._name;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::show()
    // Called by nobody: `createWindow()` already sets `visible`, and the widget never re-shows a
    // bubble. Kept because AS3 declares it public.
    show(): void
    {
        if(this._window !== null)
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    /**
     * Punches a hole in the backdrop over the highlighted element.
     *
     * AS3 fills a full-screen BitmapData with `MODAL_FILL_COLOR`, then `copyPixels()` a
     * fully-transparent rectangle over the element's bounds — with `mergeAlpha` left false, so the
     * hole *replaces* rather than blends. `clearRect` is the canvas form of exactly that.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubble.as::setModal()
    setModal(rect: IBubbleRect | null): void
    {
        if(this._modalBitmap === null || this._modalWindow === null || rect === null) return;

        const width = Math.trunc(this._modalWindow.width);
        const height = Math.trunc(this._modalWindow.height);

        if(width <= 0 || height <= 0) return;

        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context === null) return;

        const color = UiHelpBubble.MODAL_FILL_COLOR;
        const alpha = ((color >>> 24) & 0xFF) / 255;

        context.fillStyle = `rgba(${(color >>> 16) & 0xFF}, ${(color >>> 8) & 0xFF}, ${color & 0xFF}, ${alpha})`;
        context.fillRect(0, 0, width, height);
        context.clearRect(rect.x, rect.y, rect.width, rect.height);

        this._modalBitmap.bitmap = canvas.transferToImageBitmap();
        this._modalBitmap.invalidate();
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::setPosition()
    // The x is the element's *centre*, so the balloon is pulled left by half its own width.
    setPosition(position: {x: number; y: number}): void
    {
        if(this._window === null) return;

        this._position = position;
        this._window.y = position.y;
        this._window.x = position.x - this._window.width / 2;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::setArrowPos()
    setArrowPos(direction: string, offset: number): void
    {
        if(this._bubble === null) return;

        this._bubble.direction = direction;
        this._bubble.pointerOffset = offset - UiHelpBubble.ARROW_OFFSET_CORRECTION;
    }

    /**
     * Makes the highlighted element itself dismiss the bubble. The first caller wins: both this
     * and `setChatFieldCallback()` bail once `_callback` is set, which is what stops a bubble
     * matched by two different lookups from being bound twice.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubble.as::setCallback()
    setCallback(target: IWindow | null): void
    {
        if(this._callback !== null || target === null) return;

        this._callbackTarget = target;
        this._callback = this._hasNext ? this.onNext : this.onLastBubble;

        this._callbackTarget.addEventListener('WME_CLICK', this._callback);
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::setChatFieldCallback()
    setChatFieldCallback(target: ITextFieldWindow | null): void
    {
        if(this._callback !== null || target === null) return;

        this._chatFieldTarget = target;
        this._callback = this._hasNext ? this.onNext : this.onLastBubble;

        this._chatFieldTarget.addEventListener('WME_CLICK', this._callback);
    }

    /**
     * AS3: .../widget/uihelpbubbles/UiHelpBubble.as::dispose()
     *
     * Unsubscribes `_callbackTarget` only. A bubble bound through `setChatFieldCallback()` leaves
     * its listener on the chat field, which then still calls back into a disposed bubble — AS3's
     * leak, kept, because the callbacks null-check `_widget` first and so do nothing. Removing it
     * here would be a behaviour change, not a port.
     */
    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::dispose()
    dispose(): void
    {
        this._widget = null;

        if(this._callbackTarget !== null && this._callback !== null)
        {
            this._callbackTarget.removeEventListener('WME_CLICK', this._callback);
        }

        if(this._modalWindow !== null)
        {
            this._modalWindow.dispose();
            this._modalWindow = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        void this._position;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::addMouseClickListener()
    // The param flag makes the target clickable in the first place — without it the element is
    // inert and the listener never fires.
    private addMouseClickListener(target: IWindow | null, callback: (event?: unknown) => void): void
    {
        if(target === null) return;

        target.setParamFlag(1, true);
        target.addEventListener('WME_CLICK', callback);
    }

    /**
     * Builds the backdrop (only when the item asked for one) and the balloon, both on layer 3.
     *
     * The balloon's height comes from the text: AS3 measures `textHeight` *after* assigning the
     * text, then sizes the window and drops the OK button below it. A layout without
     * `help_bubble_text` therefore keeps the layout's own height — and AS3 still dereferences the
     * OK button below that branch, unguarded.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubble.as::createWindow()
    private createWindow(): void
    {
        const widget = this._widget;

        if(widget === null || widget.assets === null) return;

        if(this._modal)
        {
            this._modalWindow = widget.windowManager.buildWidgetLayout(
                'ui_help_modal', UiHelpBubble.MODAL_LAYER
            ) as IWindowContainer | null;
        }

        if(this._modalWindow !== null && this._modalWindow !== undefined)
        {
            this._modalWindow.width = this._modalWindow.desktop?.width ?? this._modalWindow.width;
            this._modalWindow.height = this._modalWindow.desktop?.height ?? this._modalWindow.height;
            this._modalBitmap = this._modalWindow.findChildByName('bitmap') as IBitmapWrapperWindow | null;

            this.addMouseClickListener(this._modalBitmap, this.onActivateBubble);
        }

        this._window = widget.windowManager.buildWidgetLayout(
            'ui_help_bubble', UiHelpBubble.MODAL_LAYER
        ) as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            this._window = null;

            return;
        }

        this._okButton = this._window.findChildByName('help_bubble_btn_ok');
        this._bubble = this._window.findChildByName('bubble') as IBubbleWindow | null;

        const textWindow = this._window.findChildByName('help_bubble_text') as ITextWindow | null;

        if(textWindow !== null && textWindow !== undefined)
        {
            textWindow.text = this._text;

            const textHeight = Math.trunc(textWindow.textHeight);

            this._window.height = textHeight + UiHelpBubble.TEXT_HEIGHT_PADDING;

            if(this._okButton !== null) this._okButton.y = textHeight + UiHelpBubble.BUTTON_TEXT_OFFSET;
        }

        if(!this._hasNext)
        {
            // The last bubble's button says "close"; every earlier one keeps the layout's caption.
            if(this._okButton !== null)
            {
                this._okButton.caption =
                    widget.localizations?.getLocalization('alert.close.button', 'alert.close.button') ?? '';
            }

            this.addMouseClickListener(this._okButton, this.onLastBubble);
        }
        else
        {
            this.addMouseClickListener(this._okButton, this.onNext);
        }

        this._window.visible = true;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::onActivateBubble()
    // Clicking the backdrop does not dismiss anything — it pushes focus back onto the balloon.
    private onActivateBubble = (): void =>
    {
        this._modalWindow?.deactivate();
        this._window?.activate();
    };

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::onNext()
    // `removeHelpBubble()` disposes this bubble and then queues the following one.
    private onNext = (): void =>
    {
        const widget = this._widget;

        if(widget === null) return;

        if(this._modalWindow !== null) this._modalWindow.visible = false;

        widget.removeHelpBubble(this._name);
    };

    // AS3: .../widget/uihelpbubbles/UiHelpBubble.as::onLastBubble()
    // The only place the script-proceed message is raised — dismissing the last bubble is what
    // lets a server-side script continue.
    private onLastBubble = (): void =>
    {
        const widget = this._widget;

        if(widget === null) return;

        widget.sendScriptProceedMessage();

        if(this._modalWindow !== null) this._modalWindow.visible = false;

        widget.removeHelpBubble(this._name);
    };
}
