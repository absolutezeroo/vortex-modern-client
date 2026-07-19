import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomModerationSettings
{
    static readonly MUTE_NOBODY: number = 0;
    static readonly MUTE_CONTROLLERS: number = 1;
    static readonly MUTE_EVERYONE: number = 2;
    static readonly MUTE_GROUPS: number = 4;
    static readonly MUTE_OWNER: number = 5;

    private _whoCanMute: number = 0;
    private _whoCanKick: number = 0;
    private _whoCanBan: number = 0;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._whoCanMute = wrapper.readInt();
        this._whoCanKick = wrapper.readInt();
        this._whoCanBan = wrapper.readInt();
    }

    get whoCanMute(): number { return this._whoCanMute; }
    get whoCanKick(): number { return this._whoCanKick; }
    get whoCanBan(): number { return this._whoCanBan; }
}
