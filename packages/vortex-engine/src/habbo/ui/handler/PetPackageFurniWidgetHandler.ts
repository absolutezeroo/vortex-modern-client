/**
 * PetPackageFurniWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PetPackageFurniWidgetHandler.as
 *
 * Purely session-driven: it claims no `RWFWM_MESSAGE_REQUEST_*` and never sees a
 * `RETWE_REQUEST_*`. The room session opens the dialog by raising
 * `RSOPPE_OPEN_PET_PACKAGE_REQUESTED`, and answers the chosen name with
 * `RSOPPE_OPEN_PET_PACKAGE_RESULT`. The one message it does claim is the widget's own send.
 *
 * Also an image listener: the pet preview is rendered by the room engine, which may answer
 * immediately or later through `imageReady()`.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {RoomSessionPetPackageEvent} from '@habbo/session/events/RoomSessionPetPackageEvent';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomWidgetPetPackageUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetPackageUpdateEvent';
import {RoomWidgetOpenPetPackageMessage} from '@habbo/ui/widget/messages/RoomWidgetOpenPetPackageMessage';

/**
 * The pet figure carried by RSOPPE_OPEN_PET_PACKAGE_REQUESTED.
 *
 * AS3: `_SafePkg_2554._SafeCls_3943` — obfuscated in every tree, so the shape is taken from its
 * three readable accessors rather than named. `RoomSessionPetPackageEvent.figureData` is typed
 * `unknown` on this port, which is what this narrows.
 */
interface IPetFigureData
{
    // AS3: _SafePkg_2554/_SafeCls_3943.as::get typeId()
    readonly typeId: number;
    // AS3: _SafePkg_2554/_SafeCls_3943.as::get paletteId()
    readonly paletteId: number;
    // AS3: _SafePkg_2554/_SafeCls_3943.as::get color()
    readonly color: string;
}

export class PetPackageFurniWidgetHandler implements IRoomWidgetHandler, IGetImageListener
{
    // AS3: PetPackageFurniWidgetHandler.as::getProcessedEvents()
    private static readonly OPEN_PET_PACKAGE_REQUESTED: string = 'RSOPPE_OPEN_PET_PACKAGE_REQUESTED';

    private static readonly OPEN_PET_PACKAGE_RESULT: string = 'RSOPPE_OPEN_PET_PACKAGE_RESULT';

    /**
    * AS3: PetPackageFurniWidgetHandler.as::getPetImage()
    *
    * The preview is rendered head-on at 64px. AS3 passes these literally; they are named here so the
    * call reads.
    */
    private static readonly PET_IMAGE_DIRECTION: number = 90;

    private static readonly PET_IMAGE_SCALE: number = 64;

    private static readonly PET_IMAGE_HEAD_ONLY: boolean = true;

    // AS3: PetPackageFurniWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: PetPackageFurniWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    /**
     * Held across the asynchronous image request — `imageReady()` has no object id of its own.
     */
    // AS3: PetPackageFurniWidgetHandler.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: PetPackageFurniWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_PET_PACKAGE_WIDGET';
    }

    // AS3: PetPackageFurniWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: PetPackageFurniWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [RoomWidgetOpenPetPackageMessage.WIDGET_MESSAGE_OPEN_PET_PACKAGE];
    }

    // AS3: PetPackageFurniWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        if(this.disposed || message === null || message === undefined) return null;

        const openMessage = message as RoomWidgetOpenPetPackageMessage;

        if(openMessage.type === RoomWidgetOpenPetPackageMessage.WIDGET_MESSAGE_OPEN_PET_PACKAGE)
        {
            this._container?.roomSession?.sendOpenPetPackageMessage(openMessage.objectId, openMessage.name);
        }

        return null;
    }

    // AS3: PetPackageFurniWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [PetPackageFurniWidgetHandler.OPEN_PET_PACKAGE_REQUESTED, PetPackageFurniWidgetHandler.OPEN_PET_PACKAGE_RESULT];
    }

    // AS3: PetPackageFurniWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const sessionEvent = event as RoomSessionPetPackageEvent | null;

        if(sessionEvent === null) return;

        switch(sessionEvent.type)
        {
            case PetPackageFurniWidgetHandler.OPEN_PET_PACKAGE_REQUESTED: {
                this._objectId = sessionEvent.objectId;

                const figureData = sessionEvent.figureData as IPetFigureData | null;

                this._container?.desktopEvents.emit(
                    RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_REQUESTED,
                    new RoomWidgetPetPackageUpdateEvent(
                        RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_REQUESTED,
                        this._objectId, this.getPetImage(figureData), -1, null, figureData?.typeId ?? -1
                    )
                );
                break;
            }
            case PetPackageFurniWidgetHandler.OPEN_PET_PACKAGE_RESULT:
                this._objectId = sessionEvent.objectId;

                this._container?.desktopEvents.emit(
                    RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_RESULT,
                    new RoomWidgetPetPackageUpdateEvent(
                        RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_RESULT,
                        this._objectId, null, sessionEvent.nameValidationStatus, sessionEvent.nameValidationInfo, -1
                    )
                );
                break;
        }
    }

    /**
     * The colour arrives as a hex *string* and is parsed base 16 — a pet whose colour did not
     * resolve yields NaN here, exactly as in AS3, and the renderer is left to deal with it.
     */
    // AS3: PetPackageFurniWidgetHandler.as::getPetImage()
    private getPetImage(figureData: IPetFigureData | null): ImageBitmap | null
    {
        if(figureData === null || figureData === undefined) return null;

        const color = parseInt(figureData.color, 16);

        const image = this._container?.roomEngine?.getPetImage(
            figureData.typeId, figureData.paletteId, color,
            new Vector3d(PetPackageFurniWidgetHandler.PET_IMAGE_DIRECTION), PetPackageFurniWidgetHandler.PET_IMAGE_SCALE, this, PetPackageFurniWidgetHandler.PET_IMAGE_HEAD_ONLY, 0
        ) ?? null;

        return image?.data ?? null;
    }

    /**
     * Re-dispatches against the object id the handler is holding, which is why the widget checks it
     * before replacing its preview.
     */
    // AS3: PetPackageFurniWidgetHandler.as::imageReady()
    public imageReady(_id: number, data: ImageBitmap | null): void
    {
        this._container?.desktopEvents.emit(
            RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_UPDATE_PET_IMAGE,
            new RoomWidgetPetPackageUpdateEvent(
                RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_UPDATE_PET_IMAGE,
                this._objectId, data, -1, null, -1
            )
        );
    }

    // AS3: PetPackageFurniWidgetHandler.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op — the dialog stays up without a preview.
    }

    // AS3: PetPackageFurniWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: PetPackageFurniWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PetPackageFurniWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
        this._objectId = -1;
    }
}
