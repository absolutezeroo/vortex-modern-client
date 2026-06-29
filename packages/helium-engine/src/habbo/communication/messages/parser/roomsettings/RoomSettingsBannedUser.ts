import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomSettingsBannedUser
{
    private _userId: number;
    private _userName: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
    }

    get userId(): number { return this._userId; }
    get userName(): string { return this._userName; }
}
