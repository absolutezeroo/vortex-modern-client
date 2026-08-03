import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';
import {
    RoomWidgetClothingChangeMessage
} from '@habbo/ui/widget/messages/RoomWidgetClothingChangeMessage';
import {
    RoomWidgetClothingChangeUpdateEvent
} from '@habbo/ui/widget/events/RoomWidgetClothingChangeUpdateEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

const log = Logger.getLogger('habbo.ui.handler.FurnitureClothingChangeWidgetHandler');

/**
 * FurnitureClothingChangeWidgetHandler
 *
 * Clothing-change furniture: opens the boy/girl chooser for anyone with rights over the
 * room, then hands the chosen gender's outfit to the avatar editor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureClothingChangeWidgetHandler.as
 */
export class FurnitureClothingChangeWidgetHandler implements IRoomWidgetHandler
{
    /** Used when the furni carries no outfit of its own. */
    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::DEFAULT_BOY_CLOTHES
    private static readonly DEFAULT_BOY_CLOTHES: string = 'hd-99999-99999.lg-270-62';

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::DEFAULT_GIRL_CLOTHES
    private static readonly DEFAULT_GIRL_CLOTHES: string = 'hd-99999-99999.ch-630-62.lg-695-62';

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_CLOTHING_CHANGE';
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: read back, as the port's other handlers expose it.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_CLOTHING_CHANGE_WIDGET,
            RoomWidgetClothingChangeMessage.REQUEST_EDITOR
        ];
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        const widgetMessage = message as RoomWidgetMessage | null;

        if(widgetMessage === null || this._container === null) return null;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_CLOTHING_CHANGE_WIDGET:
                this.openGenderSelection(widgetMessage as RoomWidgetFurniToWidgetMessage);
                break;
            case RoomWidgetClothingChangeMessage.REQUEST_EDITOR:
                this.openEditor(widgetMessage as RoomWidgetClothingChangeMessage);
                break;
        }

        return null;
    }

    /** Rights-gated: a visitor clicking the furni gets nothing. */
    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::processWidgetMessage() "RWFWM_MESSAGE_REQUEST_CLOTHING_CHANGE"
    private openGenderSelection(request: RoomWidgetFurniToWidgetMessage): void
    {
        const roomObject = this._container?.roomEngine?.getRoomObject(
            request.roomId, request.id, request.category
        ) ?? null;

        if(roomObject === null || roomObject.getModel() === null) return;

        const isOwner = this._container?.roomSession?.isRoomOwner ?? false;
        const isAnyRoomController = this._container?.sessionDataManager?.isAnyRoomController ?? false;
        const hasControllerLevel = (this._container?.roomSession?.roomControllerLevel ?? 0) >= 1;

        if(!(isOwner || isAnyRoomController || hasControllerLevel)) return;

        const update = new RoomWidgetClothingChangeUpdateEvent(
            RoomWidgetClothingChangeUpdateEvent.SHOW_GENDER_SELECTION, request.id, request.category, request.roomId
        );

        this._container?.desktopEvents.emit(update.type, update);
    }

    /**
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureClothingChangeWidgetHandler.as::processWidgetMessage()
     * "RWCCM_REQUEST_EDITOR" reads the furni's `furniture_clothing_boy`/`_girl` outfit (falling
     * back to the defaults above), then calls
     * `container.avatarEditor.openEditor(1, this, ["torso", "legs"], false, title)` and
     * `loadAvatarInEditor(...)`. `IRoomWidgetHandlerContainer` exposes no `avatarEditor` in this
     * port — `habbo/avatar`'s editor component is unported — so picking a gender resolves the
     * outfit and stops there. The chooser itself works; only the editor it would open does not.
     */
    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::processWidgetMessage() "RWCCM_REQUEST_EDITOR"
    private openEditor(request: RoomWidgetClothingChangeMessage): void
    {
        const roomObject = this._container?.roomEngine?.getRoomObject(
            request.roomId, request.objectId, request.objectCategory
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        this._objectId = request.objectId;

        const isGirl = request.gender === 'F';

        const outfit = isGirl
            ? model.getString(RoomObjectVariableEnum.FURNITURE_CLOTHING_GIRL) || FurnitureClothingChangeWidgetHandler.DEFAULT_GIRL_CLOTHES
            : model.getString(RoomObjectVariableEnum.FURNITURE_CLOTHING_BOY) || FurnitureClothingChangeWidgetHandler.DEFAULT_BOY_CLOTHES;

        log.warn(`Clothing editor requested for object ${this._objectId} (${isGirl ? 'F' : 'M'}, "${outfit}") - the avatar editor is not reachable from the widget container`);
    }

    /**
     * TODO(AS3): AS3 implements `IAvatarEditorListener.saveFigure()`, which sends the chosen
     * outfit back to the furni. Unreachable while the editor above is.
     */
    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::saveFigure()
    public saveFigure(_figure: string, _gender: string): void
    {
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op.
    }

    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    /** AS3 also closes the avatar editor here; see the TODO on `openEditor()`. */
    // AS3: .../handler/FurnitureClothingChangeWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
