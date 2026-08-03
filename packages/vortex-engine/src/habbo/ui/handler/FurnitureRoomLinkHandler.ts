import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IConfirmDialog} from '@habbo/window/utils/ConfirmDialog';
import type {IContext} from '@core/runtime/IContext';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {
    GetGuestRoomResultMessageEvent
} from '@habbo/communication/messages/incoming/navigator/GetGuestRoomResultMessageEvent';
import type {
    GetGuestRoomResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import {
    GetGuestRoomMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

/**
 * FurnitureRoomLinkHandler
 *
 * Teleport-by-furniture: a room-link furni carries a room id, and clicking it asks the
 * server for that room's name and owner before offering to go there.
 *
 * The confirmation is why this is a two-step flow — the player is told *which* room and
 * *whose* before being moved, so the furni cannot silently teleport anyone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureRoomLinkHandler.as
 */
export class FurnitureRoomLinkHandler implements IRoomWidgetHandler
{
    /** The key the link hides under inside the furni's `furniture_data` map. */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::INTERNAL_LINK_KEY
    private static readonly INTERNAL_LINK_KEY: string = 'internalLink';

    // AS3: .../handler/FurnitureRoomLinkHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/FurnitureRoomLinkHandler.as::_confirmDialog
    private _confirmDialog: IConfirmDialog | null = null;

    // AS3: .../handler/FurnitureRoomLinkHandler.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../handler/FurnitureRoomLinkHandler.as::_communicationManagerMessageEvents
    private _messageEvents: IMessageEvent[] = [];

    /** The room the pending lookup is for; a reply for any other id is ignored. */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::_SafeStr_7260
    private _pendingRoomId: number = 0;

    // AS3: .../handler/FurnitureRoomLinkHandler.as::_SafeStr_5371
    private _pendingLink: string | null = null;

    // AS3: .../handler/FurnitureRoomLinkHandler.as::get type()
    public get type(): string
    {
        return 'RWE_ROOM_LINK';
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: read back where the port's other handlers expose it.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /** Registering the reply listener is the setter's job, as in AS3. */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::set communicationManager()
    public set communicationManager(value: IHabboCommunicationManager | null)
    {
        this._communicationManager = value;

        if(this._communicationManager === null) return;

        const event = new GetGuestRoomResultMessageEvent(this.onRoomInfo);

        this._communicationManager.addHabboConnectionMessageEvent(event);
        this._messageEvents.push(event);
    }

    /**
     * The reply. `%%room_name%%` and `%%room_owner%%` are substituted by hand because the
     * localisation carries them as literals rather than as registered parameters.
     */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::onRoomInfo()
    private onRoomInfo = (event: IMessageEvent): void =>
    {
        const roomData = (event.parser as GetGuestRoomResultMessageParser).data;

        if(roomData === null || roomData.flatId !== this._pendingRoomId) return;

        this._pendingRoomId = 0;

        let message = this._container?.localization?.getLocalization('room.link.confirmation.message') ?? '';

        message = message.replace('%%room_name%%', roomData.roomName);
        message = message.replace('%%room_owner%%', roomData.ownerName);

        this._confirmDialog = this._container?.windowManager?.confirm(
            '${room.link.confirmation.title}',
            message,
            0x10 | 0x20,
            (dialog, dialogEvent) =>
            {
                if(dialogEvent.type === 'WE_OK' && this._pendingLink !== null && this._pendingLink.length > 0)
                {
                    this.navigateTo(this._pendingLink);
                }

                dialog.dispose();
            }
        ) ?? null;
    };

    // AS3: .../handler/FurnitureRoomLinkHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_ROOM_LINK];
    }

    /**
     * The link lives in one of two places — the `furniture_data` map, or a plain model string
     * — and AS3 falls back from the first to the second, so an older furni still works.
     *
     * Without a navigator or localisation there is nothing to confirm *with*, so that branch
     * jumps straight to the link event instead of asking.
     */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const engineEvent = event as {type?: string; roomId: number; objectId: number; category: number} | null;

        if(engineEvent?.type !== RoomEngineToWidgetEvent.REQUEST_ROOM_LINK) return;

        const roomObject = this._container?.roomEngine?.getRoomObject(
            engineEvent.roomId, engineEvent.objectId, engineEvent.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        let link = model.getStringToStringMap(RoomObjectVariableEnum.FURNITURE_DATA)
            ?.get(FurnitureRoomLinkHandler.INTERNAL_LINK_KEY) ?? null;

        if(link === null || link.length === 0)
        {
            link = model.getString(RoomObjectVariableEnum.FURNITURE_INTERNAL_LINK);
        }

        if(link === null) return;

        if(this._container?.navigator === null || this._container?.localization === null)
        {
            this.navigateTo(link);

            return;
        }

        if(this._confirmDialog !== null)
        {
            this._confirmDialog.dispose();
            this._confirmDialog = null;
        }

        this._pendingLink = link;
        this._pendingRoomId = parseInt(link, 10);

        this._communicationManager?.connection?.send(new GetGuestRoomMessageComposer(this._pendingRoomId, false, false));
    }

    /**
     * AS3 casts the room engine to its `Component` base to reach `context.createLinkEvent()`
     * — `IRoomEngine` declares no such member in either tree. The same cast is done here
     * rather than widening the interface; `InfoStandWidgetHandler` documents the same gap for
     * its wired-inspect actions, and this is the shape that unblocks it.
     */
    // AS3: .../handler/FurnitureRoomLinkHandler.as::processEvent() / onRoomInfo()
    private navigateTo(link: string): void
    {
        const context = (this._container?.roomEngine as unknown as {context?: IContext} | null)?.context ?? null;

        context?.createLinkEvent(`navigator/goto/${link}`);
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::dispose()
    public dispose(): void
    {
        for(const event of this._messageEvents)
        {
            this._communicationManager?.removeHabboConnectionMessageEvent(event);
        }

        this._messageEvents = [];
        this._confirmDialog?.dispose();
        this._confirmDialog = null;
        this._communicationManager = null;
        this._container = null;
    }

    // AS3: .../handler/FurnitureRoomLinkHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._container === null;
    }
}
