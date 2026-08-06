import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    CustomUserNotificationMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/CustomUserNotificationMessageEvent';
import type {CustomUserNotificationWidget} from '@habbo/ui/widget/furniture/requirementsmissing/CustomUserNotificationWidget';

/**
 * Turns the server's refusal code into one of `CustomUserNotificationWidget`'s five dialogs.
 *
 * The handler processes no widget messages and no room events at all — its whole job is the one
 * incoming message it subscribes when the container is set.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/CustomUserNotificationWidgetHandler.as
 */
export class CustomUserNotificationWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::_SafeStr_4549
    private _widget: CustomUserNotificationWidget | null = null;

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::_SafeStr_6231
    private _notificationEvent: IMessageEvent | null = null;

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_CUSTOM_USER_NOTIFICATION';
    }

    /**
     * AS3: .../handler/CustomUserNotificationWidgetHandler.as::set widget()
     *
     * Set by the widget's own constructor, which casts its handler to this class.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/CustomUserNotificationWidgetHandler.as::set widget()
    public set widget(value: CustomUserNotificationWidget | null)
    {
        this._widget = value;
    }

    /**
     * AS3: .../handler/CustomUserNotificationWidgetHandler.as::set container()
     *
     * Subscribes on first assignment only — a second container never re-subscribes, as in AS3.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/CustomUserNotificationWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;

        if(!this._notificationEvent)
        {
            this._notificationEvent = new CustomUserNotificationMessageEvent(
                this.onFurnitureUsageRequirementMissingMessage.bind(this)
            );

            this._container?.connection?.addMessageEvent(this._notificationEvent);
        }
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    /**
     * AS3: .../handler/CustomUserNotificationWidgetHandler.as::getProcessedEvents()
     *
     * Returns null, not an empty array — AS3 distinguishes the two here.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/CustomUserNotificationWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::update()
    public update(): void
    {
    }

    /**
     * AS3: .../handler/CustomUserNotificationWidgetHandler.as::onFurnitureUsageRequirementMissingMessage()
     *
     * AS3 switches on `code - 1`; the five codes are spelled out here. Codes 4 and 5 are also read
     * by `AvatarInfoWidgetHandler`, which refunds the failed respect — both handlers subscribe the
     * same message.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/CustomUserNotificationWidgetHandler.as::onFurnitureUsageRequirementMissingMessage()
    public onFurnitureUsageRequirementMissingMessage(event: IMessageEvent): void
    {
        const parser = (event as CustomUserNotificationMessageEvent).customUserNotificationParser;

        if(!parser || !this._widget) return;

        switch(parser.code)
        {
            case 1:
                this._widget.open('costumehopper');
                break;
            case 2:
                this._widget.open('viphopper');
                break;
            case 3:
                this._widget.open('vipgate');
                break;
            case 4:
                this._widget.open('respectfailedstage');
                break;
            case 5:
                this._widget.open('respectfailedaudience');
        }
    }

    // AS3: .../handler/CustomUserNotificationWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(!this._disposed)
        {
            if(this._container?.connection && this._notificationEvent)
            {
                this._container.connection.removeMessageEvent(this._notificationEvent);
            }

            this._notificationEvent = null;
            this._widget = null;
            this._container = null;
            this._disposed = true;
        }
    }
}
