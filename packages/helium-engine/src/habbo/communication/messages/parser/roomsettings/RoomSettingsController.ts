import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomSettingsController
{
    private _userId: number;
    private _userName: string;
    private _selected: boolean = false;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
    }

    get userId(): number { return this._userId; }
    get userName(): string { return this._userName; }
    get selected(): boolean { return this._selected; }
    set selected(value: boolean) { this._selected = value; }
}
