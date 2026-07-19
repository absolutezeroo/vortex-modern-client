import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';

/**
 * Password input dialog for password-protected rooms.
 *
 * @see sources/win63_version/habbo/navigator/GuestRoomPasswordInput.as
 */
export class GuestRoomPasswordInput
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindow | null = null;
    private _roomData: GuestRoomData | null = null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    /**
	 * Shows the password input dialog.
	 *
	 * @param roomData - Room data
	 * @param posX - Optional X position
	 * @param posY - Optional Y position
	 */
    show(roomData: GuestRoomData, posX: number = -1, posY: number = -1): void
    {
        this._roomData = roomData;

        if(!this._roomData) return;

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

        if(roomName && roomData)
        {
            roomName.text = roomData.roomName;
        }

        const passwordInput = (this._window as any).findChildByName?.('password_input') as ITextFieldWindow | null;

        if(passwordInput)
        {
            passwordInput.text = '';
        }

        this.setInfoText('${navigator.password.info}');
    }

    /**
	 * Re-shows the dialog with retry message.
	 */
    showRetry(): void
    {
        if(this._roomData)
        {
            this.show(this._roomData);
        }

        this.setInfoText('${navigator.password.retryinfo}');
    }

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

    private createWindow(): void
    {
        if(this._window) return;
        if(!this._navigator) return;

        this._window = this._navigator.getXmlWindow('password_input', 2);

        if(!this._window) return;

        const tryButton = (this._window as any).findChildByName?.('try');

        if(tryButton)
        {
            tryButton.addEventListener('WME_CLICK', this.onTry);
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

    private setInfoText(text: string): void
    {
        if(!this._window) return;

        const info = (this._window as any).findChildByName?.('info') as ITextWindow | null;

        if(info)
        {
            info.caption = text;
        }
    }

    private onTry = (_event: WindowEvent): void =>
    {
        if(!this._window || !this._navigator || !this._roomData) return;

        const passwordInput = (this._window as any).findChildByName?.('password_input') as ITextFieldWindow | null;

        if(!passwordInput) return;

        const password = passwordInput.text;

        this._navigator.goToRoom(this._roomData.flatId, true, password);
        this.hide();
    };

    private onClose = (_event: WindowEvent): void =>
    {
        if(!this._window) return;

        this._window.dispose();
        this._window = null;
    };

    private hide(): void
    {
        if(!this._window) return;

        this._window.visible = false;
    }
}
