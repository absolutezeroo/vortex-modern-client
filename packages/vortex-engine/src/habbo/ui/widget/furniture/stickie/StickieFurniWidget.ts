/**
 * StickieFurniWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/stickie/StickieFurniWidget.as
 *
 * The sticky-note editor. Opens on a `RWSDUE_STICKIE_DATA` update, writes back through
 * `RWSUM_STICKIE_SEND_UPDATE` / `RWSUM_STICKIE_SEND_DELETE`.
 *
 * Members are `protected` because AS3's `SpamWallPostItFurniWidget` extends this class — that
 * subclass is a separate `RWE_*` type and is not ported yet, but the visibility is kept as AS3 has
 * it rather than tightened, so it can subclass this without changes later.
 */
import type {EventEmitter} from 'eventemitter3';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetStickieDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetStickieDataUpdateEvent';
import {RoomWidgetStickieSendUpdateMessage} from '@habbo/ui/widget/messages/RoomWidgetStickieSendUpdateMessage';

// AS3: StickieFurniWidget.as::FIELD_MAX_LINES
const FIELD_MAX_LINES: number = 14;

// AS3: StickieFurniWidget.as::FIELD_MAX_CHARS
const FIELD_MAX_CHARS: number = 500;

/**
 * AS3: StickieFurniWidget.as::_SafeStr_10523 / _SafeStr_10928
 *
 * Both obfuscated and both 100 — the x and y AS3 passes to `createWindow()`'s Rectangle. The names
 * are DERIVED from that call site.
 */
const WINDOW_X: number = 100;
const WINDOW_Y: number = 100;

// AS3: StickieFurniWidget.as::COLOR_BUTTON_NAMES
const COLOR_BUTTON_NAMES: readonly string[] = ['blue', 'purple', 'green', 'yellow', 'white', 'red', 'orange', 'cyan'];

export class StickieFurniWidget extends RoomWidgetBase
{
    // AS3: StickieFurniWidget.as::_window
    private _stickieWindow: IWindowContainer | null = null;

    // AS3: StickieFurniWidget.as::_SafeStr_4841
    protected _objectId: number = -1;

    // AS3: StickieFurniWidget.as::_SafeStr_6938
    protected _objectType: string = '';

    // AS3: StickieFurniWidget.as::_text
    protected _text: string | null = null;

    // AS3: StickieFurniWidget.as::_SafeStr_5209
    protected _colorHex: string = '';

    // AS3: StickieFurniWidget.as::_SafeStr_4593
    protected _controller: boolean = false;

    /**
     * AS3: StickieFurniWidget.as::_SafeStr_8699
     *
     * A background-bitmap override. Nothing in AS3 ever assigns it — `showInterface()` reads it and
     * `dispose()` frees it, but no writer exists in this class or any caller. Kept because it
     * changes which bitmap is drawn when set, and dropping it would silently remove that branch.
     */
    private _backgroundOverride: ImageBitmap | null = null;

    // AS3: StickieFurniWidget.as::_windowName
    protected _windowName: string = 'stickieui_container';

    // AS3: StickieFurniWidget.as::StickieFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null
    )
    {
        super(handler, windowManager, assets);
    }

    // AS3: StickieFurniWidget.as::get window()
    protected get window(): IWindowContainer | null
    {
        return this._stickieWindow;
    }

    // AS3: StickieFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetStickieDataUpdateEvent.UPDATE_STICKIE_DATA, this.onObjectUpdate, this);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: StickieFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetStickieDataUpdateEvent.UPDATE_STICKIE_DATA, this.onObjectUpdate, this);
    }

    /**
     * AS3: StickieFurniWidget.as::onObjectUpdate()
     *
     * `hideInterface(false)` first — without sending — so switching from one note straight to
     * another does not save the outgoing note's text onto the incoming one.
     */
    protected onObjectUpdate(event: RoomWidgetStickieDataUpdateEvent): void
    {
        this.hideInterface(false);

        this._objectId = event.objectId;
        this._objectType = event.objectType;
        this._text = event.text;
        this._colorHex = event.colorHex;
        this._controller = event.controller;

        this.showInterface();
    }

    /**
     * AS3: StickieFurniWidget.as::showInterface()
     *
     * AS3 creates the window itself (`windowManager.createWindow(_windowName, …, Rectangle(100,
     * 100, 2, 2))`) and then calls `buildFromXML()` on it; this port's window manager owns both
     * steps, so it becomes `buildWidgetLayout('stickie')` plus the same starting position.
     *
     * The background is picked by *object type*: a themed note (`stickie_xmas`, `stickie_vd`, …)
     * uses its own bitmap untinted, and anything else falls back to `stickie_blanco` tinted with
     * the note's colour. The `post_it` -> `stickie` rename is AS3's, because the furni type and the
     * asset name differ by that prefix.
     */
    protected showInterface(): void
    {
        if(this._objectId === -1) return;

        if(!this.assets?.hasAsset('stickie')) return;

        if(this._stickieWindow === null)
        {
            this._stickieWindow = this.windowManager.buildWidgetLayout('stickie') as IWindowContainer | null;

            if(this._stickieWindow === null) return;

            this._stickieWindow.name = this._windowName;
            this._stickieWindow.x = WINDOW_X;
            this._stickieWindow.y = WINDOW_Y;
        }

        const textField = this._stickieWindow.findChildByName('text') as ITextFieldWindow | null;

        if(textField !== null)
        {
            textField.text = this._text ?? '';
            textField.procedure = this.onTextWindowEvent;
        }

        let background = this._stickieWindow.findChildByTag('bg') as IBitmapWrapperWindow | null;

        if(background !== null)
        {
            const themedName = this._objectType.replace('post_it', 'stickie');
            let asset: BitmapDataAsset | null;

            if(this.assets.hasAsset(themedName))
            {
                asset = this.assets.getAssetByName(themedName) as BitmapDataAsset | null;
            }
            else
            {
                asset = this.assets.getAssetByName('stickie_blanco') as BitmapDataAsset | null;
                background.color = parseInt(`FF${this._colorHex}`, 16);
            }

            const content = (this._backgroundOverride ?? asset?.content ?? null) as ImageBitmap | null;

            if(content) background.bitmap = content;
        }

        background = this._stickieWindow.findChildByTag('close_button') as IBitmapWrapperWindow | null;

        if(background !== null)
        {
            const content = (this.assets.getAssetByName('stickie_close') as BitmapDataAsset | null)?.content as ImageBitmap | null;

            if(content) background.bitmap = content;

            background.procedure = this.onMouseEvent;
        }

        background = this._stickieWindow.findChildByTag('delete_button') as IBitmapWrapperWindow | null;

        // AS3 only wires the delete button for a controller — a plain visitor gets no handler and
        // no bitmap, rather than a live button the server would refuse.
        if(background !== null && this._controller)
        {
            const content = (this.assets.getAssetByName('stickie_remove') as BitmapDataAsset | null)?.content as ImageBitmap | null;

            if(content) background.bitmap = content;

            background.procedure = this.onMouseEvent;
        }

        this.setColorButtons(this._controller && this._objectType === 'post_it');
    }

    /**
     * AS3: StickieFurniWidget.as::hideInterface()
     *
     * The default `true` sends any pending edit before tearing the window down — closing the note
     * is what saves it.
     */
    protected hideInterface(sendUpdate: boolean = true): void
    {
        if(sendUpdate)
        {
            this.sendUpdate();
        }

        if(this._stickieWindow !== null)
        {
            this._stickieWindow.dispose();
            this._stickieWindow = null;
        }

        this._objectId = -1;
        this._text = null;
        this._controller = false;
    }

    /**
     * AS3: StickieFurniWidget.as::setColorButtons()
     *
     * Only shown for a controller on a plain `post_it`: the themed notes have a fixed bitmap, so
     * recolouring them would do nothing visible.
     */
    private setColorButtons(visible: boolean): void
    {
        if(this._stickieWindow === null) return;

        for(const name of COLOR_BUTTON_NAMES)
        {
            const button = this._stickieWindow.findChildByName(name);

            if(button === null) continue;

            if(visible)
            {
                button.visible = true;
                button.procedure = this.onMouseEvent;
            }
            else
            {
                button.visible = false;
            }
        }
    }

    /**
     * AS3: StickieFurniWidget.as::storeTextFromField()
     *
     * Returns false when nothing changed, which is what stops `sendUpdate()` from writing on every
     * close.
     */
    protected storeTextFromField(): boolean
    {
        if(this._stickieWindow === null) return false;

        const textField = this._stickieWindow.findChildByName('text') as ITextFieldWindow | null;

        if(textField === null) return false;

        if(this._text === textField.text) return false;

        this._text = textField.text;

        return true;
    }

    // AS3: StickieFurniWidget.as::sendUpdate()
    protected sendUpdate(): void
    {
        if(this._objectId === -1) return;

        if(!this.storeTextFromField()) return;

        if(this.messageListener !== null)
        {
            this.messageListener.processWidgetMessage(new RoomWidgetStickieSendUpdateMessage(
                RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_UPDATE, this._objectId, this._text ?? '', this._colorHex
            ));
        }
    }

    /**
     * AS3: StickieFurniWidget.as::sendSetColor()
     *
     * The colour arrives as the button window's own `color`, i.e. an ARGB value, and AS3 keeps only
     * the low six hex digits. Re-selecting the current colour returns early, so no redundant write
     * reaches the wire.
     */
    protected sendSetColor(color: number): void
    {
        if(this._objectId === -1) return;

        this.storeTextFromField();

        let hex = color.toString(16).toUpperCase();

        if(hex.length > 6)
        {
            hex = hex.slice(hex.length - 6, hex.length);
        }

        if(hex === this._colorHex) return;

        this._colorHex = hex;

        if(this.messageListener !== null)
        {
            this.messageListener.processWidgetMessage(new RoomWidgetStickieSendUpdateMessage(
                RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_UPDATE, this._objectId, this._text ?? '', this._colorHex
            ));
        }

        this.showInterface();
    }

    // AS3: StickieFurniWidget.as::sendDelete()
    protected sendDelete(): void
    {
        if(this._objectId === -1) return;

        if(this.messageListener !== null && this._controller)
        {
            this.messageListener.processWidgetMessage(new RoomWidgetStickieSendUpdateMessage(
                RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_DELETE, this._objectId
            ));
        }
    }

    /**
     * AS3: StickieFurniWidget.as::onTextWindowEvent()
     *
     * The line cap is enforced by undoing the keystroke that crossed it: AS3 drops the last
     * character and then pins `maxChars` to the current length, freezing the field until the user
     * deletes something. `maxChars` is re-raised to 500 on every event, which is what releases it.
     */
    private onTextWindowEvent = (_event: WindowEvent, _window: IWindow): void =>
    {
        if(this._stickieWindow === null) return;

        const textField = this._stickieWindow.findChildByName('text') as ITextFieldWindow | null;

        if(textField === null) return;

        textField.maxChars = FIELD_MAX_CHARS;

        if(textField.numLines < FIELD_MAX_LINES) return;

        textField.text = textField.text.slice(0, textField.text.length - 1);
        textField.maxChars = textField.length;
    };

    /**
     * AS3: StickieFurniWidget.as::onMouseEvent()
     *
     * Dispatches on the target's *name*, while the close and delete buttons are found above by
     * *tag* (`close_button` / `delete_button`). The two differ in the layout and AS3 relies on
     * both — matching either one alone would leave a button inert.
     */
    protected onMouseEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'blue':
            case 'purple':
            case 'green':
            case 'yellow':
            case 'white':
            case 'red':
            case 'orange':
            case 'cyan':
                this.sendSetColor(window.color);
                break;
            case 'close':
                this.hideInterface();
                break;
            case 'delete':
                this.sendDelete();
                this.hideInterface(false);
                break;
        }
    };

    // AS3: StickieFurniWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        this.hideInterface();

        this._backgroundOverride = null;

        super.dispose();
    }
}
