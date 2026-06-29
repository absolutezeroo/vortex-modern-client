import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomChatSettings
{
    static readonly MODE_FREE_FLOW: number = 0;
    static readonly MODE_LINE_BY_LINE: number = 1;

    static readonly BUBBLE_WIDTH_NORMAL: number = 0;
    static readonly BUBBLE_WIDTH_THIN: number = 1;
    static readonly BUBBLE_WIDTH_WIDE: number = 2;

    static readonly SCROLL_SPEED_FAST: number = 0;
    static readonly SCROLL_SPEED_NORMAL: number = 1;
    static readonly SCROLL_SPEED_SLOW: number = 2;

    static readonly FLOOD_SENSITIVITY_LOOSE: number = 0;
    static readonly FLOOD_SENSITIVITY_NORMAL: number = 1;
    static readonly FLOOD_SENSITIVITY_STRICT: number = 2;

    private _mode: number = 0;
    private _bubbleWidth: number = 1;
    private _scrollSpeed: number = 1;
    private _fullHearRange: number = 14;
    private _floodSensitivity: number = 1;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._mode = wrapper.readInt();
        this._bubbleWidth = wrapper.readInt();
        this._scrollSpeed = wrapper.readInt();
        this._fullHearRange = wrapper.readInt();
        this._floodSensitivity = wrapper.readInt();
    }

    get mode(): number { return this._mode; }
    get bubbleWidth(): number { return this._bubbleWidth; }
    get scrollSpeed(): number { return this._scrollSpeed; }
    get fullHearRange(): number { return this._fullHearRange; }
    get floodSensitivity(): number { return this._floodSensitivity; }
}
