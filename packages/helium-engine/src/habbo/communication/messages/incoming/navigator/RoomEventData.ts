import type {IMessageDataWrapper} from '@core/communication';

/**
 * Room event data (promoted room events)
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1680
 */
export class RoomEventData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._adId = wrapper.readInt();
        this._ownerAvatarId = wrapper.readInt();
        this._ownerAvatarName = wrapper.readString();
        this._flatId = wrapper.readInt();
        this._eventType = wrapper.readInt();
        this._eventName = wrapper.readString();
        this._eventDescription = wrapper.readString();

        const minutesSinceCreation = wrapper.readInt();
        const minutesUntilExpiration = wrapper.readInt();

        const now = new Date();
        const creationMs = now.getTime() - minutesSinceCreation * 60 * 1000;
        const creationDate = new Date(creationMs);
        this._creationTime =
            creationDate.getDate() +
			'-' +
			creationDate.getMonth() +
			'-' +
			creationDate.getFullYear() +
			' ' +
			creationDate.getHours() +
			':' +
			creationDate.getMinutes();

        const expirationMs = now.getTime() + minutesUntilExpiration * 60 * 1000;
        this._expirationDate = new Date(expirationMs);

        this._categoryId = wrapper.readInt();
    }

    private _adId: number = 0;

    get adId(): number
    {
        return this._adId;
    }

    private _ownerAvatarId: number = 0;

    get ownerAvatarId(): number
    {
        return this._ownerAvatarId;
    }

    private _ownerAvatarName: string = '';

    get ownerAvatarName(): string
    {
        return this._ownerAvatarName;
    }

    private _flatId: number = 0;

    get flatId(): number
    {
        return this._flatId;
    }

    private _eventType: number = 0;

    get eventType(): number
    {
        return this._eventType;
    }

    private _eventName: string = '';

    get eventName(): string
    {
        return this._eventName;
    }

    private _eventDescription: string = '';

    get eventDescription(): string
    {
        return this._eventDescription;
    }

    private _creationTime: string = '';

    get creationTime(): string
    {
        return this._creationTime;
    }

    private _expirationDate: Date;

    get expirationDate(): Date
    {
        return this._expirationDate;
    }

    private _categoryId: number = 0;

    get categoryId(): number
    {
        return this._categoryId;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }
        this._disposed = true;
    }
}
