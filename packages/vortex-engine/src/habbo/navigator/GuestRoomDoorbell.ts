import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '../communication/messages/incoming/navigator';
import {QuitMessageComposer} from '../communication/messages/outgoing/room/session/QuitMessageComposer';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';

/**
 * Doorbell dialog for doorbell-protected rooms.
 *
 * Manages ring/wait/no answer states for entering doorbell rooms.
 *
 * @see sources/win63_version/habbo/navigator/GuestRoomDoorbell.as
 */
export class GuestRoomDoorbell
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::_navigator
    private _navigator: IHabboTransitionalNavigator | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::_window
    private _window: IWindow | null = null;
    private _roomData: GuestRoomData | null = null;
    private _isWaiting: boolean = false;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    /**
	 * Shows the doorbell dialog.
	 *
	 * @param roomData - Room data
	 * @param posX - Optional X position
	 * @param posY - Optional Y position
	 * @param isWaiting - Whether to show in waiting mode
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::show()
    show(roomData: GuestRoomData, posX: number = -1, posY: number = -1, isWaiting: boolean = false): void
    {
        if(!roomData) return;

        this._roomData = roomData;
        this._isWaiting = isWaiting;
        this.createWindow();

        if(!this._window) return;

        if(posX >= 0 && posY >= 0)
        {
            this._window.setGlobalPosition({
                x: posX - this._window.width / 2,
                y: posY - this._window.height / 2
            });
        }

        this._window.visible = true;
        this._window.activate();

        const roomName = (this._window as any).findChildByName?.('room_name') as ITextWindow | null;

        if(roomName)
        {
            roomName.text = roomData.roomName;
        }

        if(this._isWaiting)
        {
            this.setText('info', '${navigator.doorbell.waiting}');
            this.setText('cancel', '${navigator.doorbell.button.cancel.entering}');
            this.showButton('ring', false);
        }
        else
        {
            this.setText('info', '${navigator.doorbell.info}');
            this.setText('cancel', '${generic.cancel}');
            this.showButton('ring', true);
        }
    }

    /**
	 * Switches to the waiting state.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::showWaiting()
    showWaiting(): void
    {
        if(this._roomData)
        {
            this.show(this._roomData, -1, -1, true);
        }
    }

    /**
	 * Shows the no answer message.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::showNoAnswer()
    showNoAnswer(): void
    {
        if(!this._window) return;

        this._window.visible = true;
        this._window.activate();
        this.setText('info', '${navigator.doorbell.no.answer}');
        this.showButton('ring', false);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::hide()
    hide(): void
    {
        if(!this._window) return;

        this._window.visible = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::dispose()
    dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
        }

        this._window = null;
        this._navigator = null;
        this._roomData = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::showButton()
    private showButton(name: string, visible: boolean): void
    {
        if(!this._window) return;

        const button = (this._window as any).findChildByName?.(name);

        if(button)
        {
            button.visible = visible;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::createWindow()
    private createWindow(): void
    {
        if(this._window) return;
        if(!this._navigator) return;

        this._window = this._navigator.getXmlWindow('doorbell_xml', 2);

        if(!this._window) return;

        const ringButton = (this._window as any).findChildByName?.('ring');

        if(ringButton)
        {
            ringButton.addEventListener('WME_CLICK', this.onRingDoorbell);
        }

        const cancelRegion = (this._window as any).findChildByName?.('cancel_region');

        if(cancelRegion)
        {
            cancelRegion.addEventListener('WME_CLICK', this.onClose);
        }

        const closeButton = (this._window as any).findChildByTag?.('close');

        if(closeButton)
        {
            closeButton.addEventListener('WME_CLICK', this.onClose);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuestRoomDoorbell.as::setText()
    private setText(name: string, text: string): void
    {
        if(!this._window) return;

        const child = (this._window as any).findChildByName?.(name);

        if(child)
        {
            child.caption = text;
        }
    }

    private onRingDoorbell = (_event: WindowEvent): void =>
    {
        if(!this._navigator || !this._roomData) return;

        this._navigator.goToRoom(this._roomData.flatId, true);
        this.hide();
    };

    private onClose = (_event: WindowEvent): void =>
    {
        if(!this._window) return;

        if(this._isWaiting && this._navigator)
        {
            this._navigator.send(new QuitMessageComposer());
        }

        this._window.dispose();
        this._window = null;
    };
}
