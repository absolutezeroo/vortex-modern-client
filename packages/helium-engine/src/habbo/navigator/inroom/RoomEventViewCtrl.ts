import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {TextFieldManager} from '../TextFieldManager';
import {EditEventMessageComposer} from '@habbo/communication/messages/outgoing/navigator/EditEventMessageComposer';
import {CancelEventMessageComposer} from '@habbo/communication/messages/outgoing/navigator/CancelEventMessageComposer';
import {RoomAdErrorMessageEvent} from '@habbo/communication/messages/incoming/advertisement/RoomAdErrorMessageEvent';
import type {RoomAdErrorMessageParser} from '@habbo/communication/messages/parser/advertisement/RoomAdErrorMessageParser';

/**
 * Room event (ad) creation/editing view controller.
 *
 * @see sources/win63_version/habbo/navigator/inroom/RoomEventViewCtrl.as
 */
export class RoomEventViewCtrl implements IDisposable
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindowContainer | null = null;
    private _eventNameManager: TextFieldManager | null = null;
    private _eventDescManager: TextFieldManager | null = null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    get disposed(): boolean
    {
        return this._navigator === null;
    }

    show(): void
    {
        if(!this._navigator) return;

        if(this._window !== null && this._window.visible)
        {
            this._window.visible = false;
            return;
        }

        this._prepareWindow();
        this._clearErrors();

        const evData = this._navigator.data.roomEventData;

        if(evData === null)
        {
            this._createEvent();
        }
        else
        {
            this._editEvent(evData.eventName, evData.eventDescription);
        }

        if(this._window !== null)
        {
            this._window.visible = true;
            (this._window as unknown as { activate(): void }).activate?.();
        }
    }

    close(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    dispose(): void
    {
        if(this._navigator === null) return;

        this._navigator = null;

        if(this._window !== null)
        {
            (this._window as unknown as { dispose(): void }).dispose();
            this._window = null;
        }

        this._eventNameManager?.dispose();
        this._eventNameManager = null;

        this._eventDescManager?.dispose();
        this._eventDescManager = null;
    }

    private _editEvent(name: string, desc: string): void
    {
        if(!this._navigator || this._window === null) return;

        this._window.caption = this._navigator.getText('navigator.eventsettings.editcaption');
        this._eventNameManager?.setText(name);
        this._eventDescManager?.setText(desc);
    }

    private _createEvent(): void
    {
        if(!this._navigator || this._window === null) return;

        this._window.caption = this._navigator.getText('navigator.createevent');
        this._eventDescManager?.goBackToInitialState();
        this._eventNameManager?.goBackToInitialState();
    }

    private _getInput(name: string): ITextFieldWindow | null
    {
        if(this._window === null) return null;

        return this._window.findChildByName(name) as ITextFieldWindow | null;
    }

    private _save(): void
    {
        if(!this._navigator) return;

        const evData = this._navigator.data.roomEventData;

        if(evData === null) return;

        if(!this._isMandatoryFieldsFilled()) return;

        const adId = evData.adId;
        const name = this._eventNameManager?.getText() ?? '';
        const desc = this._eventDescManager?.getText() ?? '';

        this._navigator.send(new EditEventMessageComposer(adId, name, desc));
    }

    private _isMandatoryFieldsFilled(): boolean
    {
        this._clearErrors();

        if(!this._navigator) return false;

        if(this._eventNameManager === null) return false;

        if(!this._eventNameManager.checkMandatory(this._navigator.getText('navigator.eventsettings.nameerr')))
        {
            return false;
        }

        return true;
    }

    private _clearErrors(): void
    {
        this._eventNameManager?.clearErrors();
        this._eventDescManager?.clearErrors();
    }

    private _prepareWindow(): void
    {
        if(this._window !== null) return;

        if(!this._navigator) return;

        const win = this._navigator.getXmlWindow('iro_event_settings') as IWindowContainer | null;

        if(win === null) return;

        this._window = win;

        const closeBtn = win.findChildByTag('close');

        if(closeBtn !== null)
        {
            closeBtn.addEventListener('WME_CLICK', this._onClose);
        }

        const endBtn = win.findChildByName('end_button');

        if(endBtn !== null)
        {
            endBtn.addEventListener('WME_CLICK', this._onEndButtonClick);
        }

        const cancelBtn = win.findChildByName('cancel_button');

        if(cancelBtn !== null)
        {
            cancelBtn.addEventListener('WME_CLICK', this._onCancelButtonClick);
        }

        const saveBtn = win.findChildByName('save_button');

        if(saveBtn !== null)
        {
            saveBtn.addEventListener('WME_CLICK', this._onSaveButtonClick);
        }

        const nameInput = this._getInput('event_name');
        const descInput = this._getInput('event_desc');

        if(nameInput !== null)
        {
            this._eventNameManager = new TextFieldManager(this._navigator, nameInput, 25);
            nameInput.addEventListener('WE_UNFOCUSED', this._onUnfocus);
        }

        if(descInput !== null)
        {
            this._eventDescManager = new TextFieldManager(this._navigator, descInput, 100);
            descInput.addEventListener('WE_UNFOCUSED', this._onUnfocus);
        }

        this._navigator.communication.addMessageEvent(
            new RoomAdErrorMessageEvent(this._onRoomAdError)
        );

        (win as unknown as { center(): void }).center?.();
    }

    private _onClose = (_event: WindowEvent): void =>
    {
        this.close();
    };

    private _onEndButtonClick = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        const evData = this._navigator.data.roomEventData;

        if(evData !== null)
        {
            this._navigator.send(new CancelEventMessageComposer(evData.adId));
        }

        this.close();
    };

    private _onCancelButtonClick = (_event: WindowEvent): void =>
    {
        this.close();
    };

    private _onSaveButtonClick = (_event: WindowEvent): void =>
    {
        this._save();
    };

    private _onUnfocus = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        if(this._navigator.data.roomEventData !== null)
        {
            this._save();
        }
    };

    private _onRoomAdError = (event: IMessageEvent): void =>
    {
        this._clearErrors();

        const parser: RoomAdErrorMessageParser | null = (event as RoomAdErrorMessageEvent).getParser() as RoomAdErrorMessageParser | null;

        if(parser === null) return;

        const errorCode = parser.errorCode;

        if(errorCode === 0)
        {
            this._eventNameManager?.displayError(
                this._navigator?.getText('roomad.error.0.description') ?? ''
            );
            this._eventNameManager?.setText(parser.filteredText);
        }
        else if(errorCode === 1)
        {
            this._eventDescManager?.displayError(
                this._navigator?.getText('roomad.error.0.description') ?? ''
            );
            this._eventDescManager?.setText(parser.filteredText);
        }
    };
}
