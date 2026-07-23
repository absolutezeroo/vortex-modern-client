/**
 * AvatarInfoWidgetHandler — handler for the RWE_AVATAR_INFO widget (own-avatar slice).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as
 *
 * Opens the own-avatar bubble on the toolbar MEMENU click, and (consolidating
 * what AS3 splits across MeMenuWidgetHandler/InfoStandWidgetHandler) routes the
 * bubble's dance/expression/posture actions to roomSession.send*.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetDanceMessage} from '@habbo/ui/widget/messages/RoomWidgetDanceMessage';
import {RoomWidgetAvatarExpressionMessage} from '@habbo/ui/widget/messages/RoomWidgetAvatarExpressionMessage';
import {RoomWidgetChangePostureMessage} from '@habbo/ui/widget/messages/RoomWidgetChangePostureMessage';
import {RoomWidgetUserActionMessage} from '@habbo/ui/widget/messages/RoomWidgetUserActionMessage';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '@habbo/toolbar/HabboToolbarIconEnum';
import type {AvatarInfoWidget} from '@habbo/ui/widget/avatarinfo/AvatarInfoWidget';

export class AvatarInfoWidgetHandler implements IRoomWidgetHandler
{
    private _disposed: boolean = false;
    private _container: IRoomWidgetHandlerContainer | null = null;
    private _widget: AvatarInfoWidget | null = null;

    // AS3: AvatarInfoWidgetHandler.as::set widget()
    public set widget(value: AvatarInfoWidget | null)
    {
        this._widget = value;
    }

    // AS3: AvatarInfoWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_AVATAR_INFO';
    }

    // AS3: AvatarInfoWidgetHandler.as::set container() / get container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container?.toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClicked);

        this._container = value;

        this._container?.toolbar?.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClicked);
    }

    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: AvatarInfoWidgetHandler.as::onToolbarClicked()
    private onToolbarClicked = (event: HabboToolbarEvent): void =>
    {
        if(event.iconId === HabboToolbarIconEnum.MEMENU)
        {
            this._widget?.selectOwnAvatar();
        }
    };

    // AS3: AvatarInfoWidgetHandler.as::getWidgetMessages()
    // Own-avatar action types this handler owns (AS3 splits these across the
    // MeMenu/AvatarInfo handlers — consolidated here in the port).
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetDanceMessage.DANCE,
            RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION,
            RoomWidgetChangePostureMessage.CHANGE_POSTURE,
            RoomWidgetUserActionMessage.START_NAME_CHANGE,
        ];
    }

    // AS3: AvatarInfoWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: AvatarInfoWidgetHandler.as::processWidgetMessage() (+ MeMenuWidgetHandler action cases)
    public processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(!message || !this._container) return null;

        const roomSession = this._container.roomSession;

        switch(message.type)
        {
            case RoomWidgetDanceMessage.DANCE:
            {
                const style = (message as RoomWidgetDanceMessage).style;

                roomSession.sendDanceMessage(style);
                // AS3 adaptation: derive isDancing optimistically from the sent style
                // (the RSDE_DANCE round-trip event isn't wired in this slice).
                if(this._widget) this._widget.isDancing = style !== RoomWidgetDanceMessage.STOP;
                break;
            }
            case RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION:
                roomSession.sendAvatarExpressionMessage((message as RoomWidgetAvatarExpressionMessage).animation.ordinal);
                break;
            case RoomWidgetChangePostureMessage.CHANGE_POSTURE:
                roomSession.sendChangePostureMessage((message as RoomWidgetChangePostureMessage).posture);
                break;
            case RoomWidgetUserActionMessage.START_NAME_CHANGE:
                // TODO(AS3): container.habboHelp.startNameChange() — habboHelp not ported.
                break;
        }

        return null;
    }

    // AS3: AvatarInfoWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
    }

    // AS3: AvatarInfoWidgetHandler.as::update()
    public update(): void
    {
    }

    // AS3: AvatarInfoWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.container = null;
        this._widget = null;
        this._disposed = true;
    }

    // AS3: AvatarInfoWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }
}
