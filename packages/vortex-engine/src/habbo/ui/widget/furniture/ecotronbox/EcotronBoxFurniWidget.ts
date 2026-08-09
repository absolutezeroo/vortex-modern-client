/**
 * EcotronBoxFurniWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/ecotronbox/EcotronBoxFurniWidget.as
 *
 * The Ecotron / Furnimatic box card. It has two states on one window: clicking a box shows its
 * date and an Open button; opening it replaces that with the contents' icon and name and hides the
 * button. `_opened` is what keeps the card alive across the round trip — `hideInterface()` refuses
 * to forget the object id while it is set.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetEcotronBoxDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetEcotronBoxDataUpdateEvent';
import {RoomWidgetPresentDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPresentDataUpdateEvent';
import {RoomWidgetRoomObjectUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetEcotronBoxOpenMessage} from '@habbo/ui/widget/messages/RoomWidgetEcotronBoxOpenMessage';

/**
 * AS3: EcotronBoxFurniWidget.as::_SafeStr_10523 / _SafeStr_10928
 *
 * Both obfuscated and both 100 — the x and y AS3 passes to `createWindow()`'s Rectangle. Names
 * DERIVED from that call site, same pair as the stickie's and the credit furni's.
 */
const WINDOW_X: number = 100;
const WINDOW_Y: number = 100;

// AS3: EcotronBoxFurniWidget.as::showInterface() — the window's own name.
const WINDOW_NAME: string = 'ecotronboxcardui_container';

export class EcotronBoxFurniWidget extends RoomWidgetBase
{
    // AS3: EcotronBoxFurniWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: EcotronBoxFurniWidget.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: EcotronBoxFurniWidget.as::_text
    private _text: string = '';

    // AS3: EcotronBoxFurniWidget.as::_SafeStr_4593
    private _controller: boolean = false;

    /**
     * True from the moment Open is pressed until the card is dismissed. It gates the second phase
     * (`RWEBDUE_CONTENTS` is ignored unless it is set), stops a second Open from being sent, and
     * makes `hideInterface()` keep the object id so the contents can still be matched to the card.
     */
    // AS3: EcotronBoxFurniWidget.as::_SafeStr_5015
    private _opened: boolean = false;

    // AS3: EcotronBoxFurniWidget.as::_furniTypeName
    private _furniTypeName: string = 'ecotron_box';

    /**
     * The Furnimatic box gets its own card layout. The empty-string entry is AS3's own fallback
     * for a furni whose class name did not resolve.
     */
    // AS3: EcotronBoxFurniWidget.as::_interfaceMapByFurniTypeName
    private _interfaceMapByFurniTypeName: Map<string, string> = new Map([
        ['', 'ecotronbox_card'],
        ['ecotron_box', 'ecotronbox_card'],
        ['matic_box', 'ecotronbox_card_furnimatic']
    ]);

    // AS3: EcotronBoxFurniWidget.as::EcotronBoxFurniWidget()
    constructor(
        // AS3: EcotronBoxFurniWidget.as::EcotronBoxFurniWidget() param1
        handler: IRoomWidgetHandler,
        // AS3: EcotronBoxFurniWidget.as::EcotronBoxFurniWidget() param2
        windowManager: IHabboWindowManager,
        // AS3: EcotronBoxFurniWidget.as::EcotronBoxFurniWidget() param3
        assets: IAssetLibrary | null = null
    )
    {
        super(handler, windowManager, assets);
    }

    // AS3: EcotronBoxFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO, this.onObjectUpdate, this);
        dispatcher.on(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS, this.onObjectUpdate, this);
        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved, this);
        dispatcher.on(RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO, this.onPresentUpdate, this);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: EcotronBoxFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO, this.onObjectUpdate, this);
        dispatcher.off(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS, this.onObjectUpdate, this);
        dispatcher.off(RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO, this.onPresentUpdate, this);
        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved, this);
    }

    // AS3: EcotronBoxFurniWidget.as::onObjectUpdate()
    private onObjectUpdate(event: RoomWidgetEcotronBoxDataUpdateEvent): void
    {
        this.hideInterface();

        switch(event.type)
        {
            case RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO:
                this._opened = false;
                this._objectId = event.objectId;
                this._text = event.text;
                this._controller = event.controller;
                this._furniTypeName = event.furniTypeName;

                this.showInterface();
                break;
            case RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS:
                // The contents arrive with objectId 0 — they are only meaningful for a card the
                // user actually opened, which is what `_opened` records.
                if(!this._opened) return;

                this._objectId = event.objectId;

                this.showInterface();
                this.showIcon(event.iconBitmapData);
                this.showDescription(event.text);
                this.setOpenButton(false);
                break;
        }
    }

    // AS3: EcotronBoxFurniWidget.as::onRoomObjectRemoved()
    private onRoomObjectRemoved(event: RoomWidgetRoomObjectUpdateEvent): void
    {
        if(event.id === this._objectId)
        {
            this.hideInterface();
        }
    }

    /**
     * A present dialog opening closes this card — the two share the screen.
     */
    // AS3: EcotronBoxFurniWidget.as::onPresentUpdate()
    private onPresentUpdate(event: RoomWidgetPresentDataUpdateEvent): void
    {
        if(event.type === RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO)
        {
            this.hideInterface();
        }
    }

    /**
     * AS3 centres the icon inside the preview by blitting it into a fresh BitmapData at the
     * computed offset. This port assigns the bitmap and lets the wrapper's own anchor centre it —
     * the null icon becomes a plain clear instead of a 1x1 blit.
     */
    // AS3: EcotronBoxFurniWidget.as::showIcon()
    private showIcon(icon: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const preview = this._window.findChildByName('ecotronbox_card_preview') as IBitmapWrapperWindow | null;

        if(preview === null) return;

        preview.bitmap = icon;
    }

    // AS3: EcotronBoxFurniWidget.as::showDescription()
    private showDescription(text: string | null): void
    {
        if(this._window === null) return;

        const message = this._window.findChildByName('ecotronbox_card_msg') as ITextWindow | null;

        if(message !== null && text !== null)
        {
            message.caption = text;
        }
    }

    /**
     * The layout is chosen by the furni's class name, so an Ecotron box and a Furnimatic box get
     * different cards. AS3 creates the window itself and calls `buildFromXML()`; this port's window
     * manager owns both steps.
     */
    // AS3: EcotronBoxFurniWidget.as::showInterface()
    private showInterface(): void
    {
        if(this._objectId < 0) return;

        const layout = this._interfaceMapByFurniTypeName.get(this._furniTypeName)
            ?? this._interfaceMapByFurniTypeName.get('')!;

        if(!this.assets?.hasAsset(layout)) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._window = this.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.name = WINDOW_NAME;
        this._window.x = WINDOW_X;
        this._window.y = WINDOW_Y;

        const date = this._window.findChildByName('ecotronbox_card_date') as ITextWindow | null;

        if(date !== null && this._text !== null)
        {
            date.caption = this._text;
        }

        const close = this._window.findChildByName('ecotronbox_card_btn_close');

        if(close !== null) close.procedure = this.onMouseEvent;

        this.setOpenButton(true);
    }

    /**
     * Only a controller ever gets a live Open button, and only in the first phase — once the
     * contents are shown it is hidden rather than re-armed.
     */
    // AS3: EcotronBoxFurniWidget.as::setOpenButton()
    private setOpenButton(visible: boolean): void
    {
        if(this._window === null) return;

        const open = this._window.findChildByName('ecotronbox_card_btn_open');

        if(open === null) return;

        if(this._controller && visible)
        {
            open.visible = true;
            open.procedure = this.onMouseEvent;
        }
        else
        {
            open.visible = false;
        }
    }

    /**
     * Keeps `_objectId` while `_opened` is set — the contents update arrives after the card is
     * torn down and rebuilt, and would otherwise have nothing to match against.
     */
    // AS3: EcotronBoxFurniWidget.as::hideInterface()
    private hideInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(!this._opened)
        {
            this._objectId = -1;
        }

        this._text = '';
        this._controller = false;
    }

    /**
     * `_opened` is set before the message goes out, so a double click cannot send twice.
     */
    // AS3: EcotronBoxFurniWidget.as::sendOpen()
    private sendOpen(): void
    {
        if(this._opened || this._objectId === -1 || !this._controller) return;

        this._opened = true;

        if(this.messageListener !== null)
        {
            this.messageListener.processWidgetMessage(
                new RoomWidgetEcotronBoxOpenMessage(RoomWidgetEcotronBoxOpenMessage.OPEN_ECOTRONBOX, this._objectId)
            );
        }
    }

    /**
     * The close case falls through from `default`, so a click on any other child also dismisses
     * the card — that is AS3's switch, not a missing break.
     */
    // AS3: EcotronBoxFurniWidget.as::onMouseEvent()
    private onMouseEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'ecotronbox_card_btn_open':
                this.sendOpen();
                break;
            case 'ecotronbox_card_btn_close':
            default:
                this._opened = false;
                this.hideInterface();
                break;
        }
    };

    // AS3: EcotronBoxFurniWidget.as::dispose()
    public override dispose(): void
    {
        this.hideInterface();

        super.dispose();
    }
}
