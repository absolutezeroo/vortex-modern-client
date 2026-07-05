import type {IIlluminaChatBubbleWidget} from './IIlluminaChatBubbleWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import type {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Illumina chat bubble widget.
 *
 * Renders a chat bubble with avatar, username, message list, timestamp,
 * and online status indicator. Supports flipped layout and message
 * confirmation tracking.
 *
 * In the AS3 version, uses complex IWindowContainer hierarchy with
 * IItemListWindow for messages. In the TypeScript port, chat bubble
 * data is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/IlluminaChatBubbleWidget.as
 */
export class IlluminaChatBubbleWidget implements IIlluminaChatBubbleWidget
{
    public static readonly TYPE: string = 'illumina_chat_bubble';

    private static readonly FLIPPED_KEY: string = 'illumina_chat_bubble:flipped';
    private static readonly USER_NAME_KEY: string = 'illumina_chat_bubble:user_name';
    private static readonly FIGURE_KEY: string = 'illumina_chat_bubble:figure';
    private static readonly MESSAGE_KEY: string = 'illumina_chat_bubble:message';

    private static readonly PARAM_FLAG_147456: number = 147456;
    private static readonly PARAM_FLAG_1: number = 1;

    private _messages: string[] = [];
    private _confirmationIds: number[] = [];
    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;

    private _root: IWindowContainer | null = null;
    private _messageContainer: IWindow | null = null;
    private _messageTemplate: IWindow | null = null;
    private _spacedMessageContainer: IWindow | null = null;
    private _userNameLabel: IWindow | null = null;
    private _userAvatarWidget: IWindow | null = null;
    private _bubbleWrapper: IWindowContainer | null = null;
    private _postTimeWidget: IWindow | null = null;
    private _offlinePlaceholder: IWindow | null = null;
    private _arrowPoint: IWindow | null = null;
    private _messageRegion: IWindow | null = null;

    private _rootProcedureBound: ((event: WindowEvent, window: IWindow) => void);

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._rootProcedureBound = this.rootProcedure.bind(this);

        const root = this._windowManager.buildWidgetLayout('illumina_chat_bubble') as IWindowContainer | null;

        if(root)
        {
            this._root = root;

            this._messageContainer = root.findChildByName('message_container');
            this._spacedMessageContainer = root.findChildByName('spaced_message_container');
            this._userNameLabel = root.findChildByName('user_name');
            this._userAvatarWidget = root.findChildByName('user_avatar');
            this._bubbleWrapper = root.findChildByName('bubble_wrapper') as IWindowContainer | null;
            this._postTimeWidget = root.findChildByName('post_time');
            this._offlinePlaceholder = root.findChildByName('offline_placeholder');
            this._arrowPoint = root.findChildByName('arrow_point');
            this._messageRegion = root.findChildByName('message_region');

            // Clone the first message item as template, then remove it
            if(this._messageContainer)
            {
                const messageContainerAsContainer = this._messageContainer as IWindowContainer;

                if(messageContainerAsContainer.numChildren > 0)
                {
                    const firstItem = messageContainerAsContainer.getChildAt(0);

                    if(firstItem)
                    {
                        this._messageTemplate = firstItem.clone();
                        messageContainerAsContainer.removeChildAt(0);
                    }
                }
            }

            // Disable param flag 1 on message region
            if(this._messageRegion)
            {
                this._messageRegion.setParamFlag(IlluminaChatBubbleWidget.PARAM_FLAG_1, false);
            }

            root.procedure = this._rootProcedureBound;

            // Set rootWindow with param flag 147456
            this._widgetWindow.rootWindow = root as unknown as IWindow;
            (this._widgetWindow as IWindow).setParamFlag(IlluminaChatBubbleWidget.PARAM_FLAG_147456, true);
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _flipped: boolean = false;

    public get flipped(): boolean
    {
        return this._flipped;
    }

    public set flipped(value: boolean)
    {
        this._flipped = value;
    }

    private _userName: string = '';

    public get userName(): string
    {
        return this._userName;
    }

    public set userName(value: string)
    {
        this._userName = value;
    }

    private _userId: number = 0;

    public get userId(): number
    {
        return this._userId;
    }

    public set userId(value: number)
    {
        this._userId = value;
    }

    private _figure: string = '';

    public get figure(): string
    {
        return this._figure;
    }

    public set figure(value: string)
    {
        this._figure = value;
    }

    private _timeStamp: number = 0;

    public get timeStamp(): number
    {
        return this._timeStamp;
    }

    public set timeStamp(value: number)
    {
        this._timeStamp = value;
    }

    private _friendOnline: boolean = true;

    public get friendOnline(): boolean
    {
        return this._friendOnline;
    }

    public set friendOnlineStatus(value: boolean)
    {
        this._friendOnline = value;
    }

    public get numMessages(): number
    {
        return this._messages.length;
    }

    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(IlluminaChatBubbleWidget.FLIPPED_KEY, this._flipped),
            new PropertyStruct(IlluminaChatBubbleWidget.USER_NAME_KEY, this._userName),
            new PropertyStruct(IlluminaChatBubbleWidget.FIGURE_KEY, this._figure),
            new PropertyStruct(IlluminaChatBubbleWidget.MESSAGE_KEY, this._messages.join('\t')),
        ];
    }

    public set properties(values: PropertyStruct[])
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case IlluminaChatBubbleWidget.FLIPPED_KEY:
                    this.flipped = Boolean(prop.value);
                    break;
                case IlluminaChatBubbleWidget.USER_NAME_KEY:
                    this.userName = String(prop.value);
                    break;
                case IlluminaChatBubbleWidget.FIGURE_KEY:
                    this.figure = String(prop.value);
                    break;
                case IlluminaChatBubbleWidget.MESSAGE_KEY:
                {
                    const msgs = IlluminaChatBubbleWidget.getMessagesFromProperty(String(prop.value));
                    this._messages = [];
                    this._confirmationIds = [];

                    for(const msg of msgs)
                    {
                        this.appendMessage(msg);
                    }
                    break;
                }
            }
        }
    }

    /**
	 * Parse messages from a tab-separated property string.
	 */
    public static getMessagesFromProperty(value: string): string[]
    {
        const parts = value.split('\t');

        if(parts.length === 1 && parts[0] === '')
        {
            return [];
        }

        return parts;
    }

    public getMessage(index: number): string
    {
        return this._messages[index] ?? '';
    }

    public setMessage(index: number, text: string): void
    {
        while(index >= this._messages.length)
        {
            this._messages.push('');
            this._confirmationIds.push(0);
        }

        this._messages[index] = text;
    }

    public appendMessage(text: string, prepend: boolean = false, confirmationId: number = 0): void
    {
        let index: number;

        if(prepend)
        {
            index = 0;
            this._messages.splice(0, 0, '');
            this._confirmationIds.splice(0, 0, 0);
        }
        else
        {
            index = this._messages.length;
        }

        this.setMessage(index, text);
        this.setAwaitingConfirmationId(index, confirmationId);
    }

    public setAwaitingConfirmationId(messageIndex: number, confirmationId: number): void
    {
        if(messageIndex < this._confirmationIds.length)
        {
            this._confirmationIds[messageIndex] = confirmationId;
        }
    }

    public clearAwaitingConfirmationId(messageIndex: number): void
    {
        if(messageIndex < this._confirmationIds.length)
        {
            this._confirmationIds[messageIndex] = 0;
        }
    }

    public getAwaitingConfirmationId(messageIndex: number): number
    {
        return this._confirmationIds[messageIndex] ?? 0;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._root)
        {
            this._root.procedure = null;
            this._root.dispose();
            this._root = null;
        }

        if(this._messageTemplate)
        {
            this._messageTemplate.dispose();
            this._messageTemplate = null;
        }

        this._messageContainer = null;
        this._spacedMessageContainer = null;
        this._userNameLabel = null;
        this._userAvatarWidget = null;
        this._bubbleWrapper = null;
        this._postTimeWidget = null;
        this._offlinePlaceholder = null;
        this._arrowPoint = null;
        this._messageRegion = null;

        if(this._widgetWindow)
        {
            this._widgetWindow.rootWindow = null;
        }

        this._widgetWindow = null;
        this._windowManager = null;
        this._messages = [];
        this._confirmationIds = [];
    }

    /**
	 * Root procedure for handling window events on the chat bubble tree.
	 *
	 * @param event - The window event
	 * @param window - The source window
	 */
    private rootProcedure(event: WindowEvent, window: IWindow): void
    {
        if(this._disposed) return;

        // Event handling for chat bubble interactions
        // Most visual logic is handled by the client UI layer
    }
}
