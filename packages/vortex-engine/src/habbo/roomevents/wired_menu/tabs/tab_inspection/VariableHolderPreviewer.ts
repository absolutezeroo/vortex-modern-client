import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';

import {Vector3d} from '@room/utils/Vector3d';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {PetImageWidget} from '@habbo/window/widgets/PetImageWidget';
import type {WiredMenuController} from '../../WiredMenuController';

// The AS3 bitmap wrapper is cast to a zoomable bitmap view (_SafeCls_1989) to set zoomX/zoomY; the
// port folds that onto the concrete bitmap controller, so a structural cast mirrors the AS3 cast.
interface IZoomableBitmap
{
    zoomX: number;
    zoomY: number;
}

/**
 * VariableHolderPreviewer — the inspection tab's preview pane. Shows the inspected holder: a rendered
 * furni image (via getRoomObjectImage), an avatar/pet figure widget for a user holder, a "global"
 * placeholder for global variables, or a "pick a furni/user" instruction when nothing is selected.
 *
 * Port notes: getRoomObjectImage returns an ImageBitmap (Flash BitmapData in AS3); it is assigned
 * directly to the wrapper's `bitmap` (ImageBitmap has no `.clone()`, and the engine hands back a fresh
 * render). The zoomX/zoomY refinement is set through a structural cast, mirroring AS3's cast to the
 * zoomable bitmap view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_inspection/VariableHolderPreviewer.as
 */
export class VariableHolderPreviewer implements IDisposable
{
    // AS3: VariableHolderPreviewer.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableHolderPreviewer.as::_container
    private _container: IWindowContainer;

    // AS3: VariableHolderPreviewer.as::_SafeStr_4593 (name derived: the controller)
    private _controller: WiredMenuController;

    // AS3: VariableHolderPreviewer.as::_SafeStr_6493 (name derived: currently-previewed furni id)
    private _previewedFurniId: number = 0;

    // AS3: VariableHolderPreviewer.as::_SafeStr_7536 (name derived: currently-previewed user index)
    private _previewedUserIndex: number = -1;

    // AS3: VariableHolderPreviewer.as::VariableHolderPreviewer()
    constructor(container: IWindowContainer, controller: WiredMenuController)
    {
        this._container = container;
        this._controller = controller;
        this.clearPreviewer();
    }

    // AS3: VariableHolderPreviewer.as::centerContainer()
    static centerContainer(window: IWindow): void
    {
        const parent = window.parent!;
        window.x = parent.width / 2 - window.width / 2;
        window.y = parent.height / 2 - window.height / 2;
    }

    // AS3: VariableHolderPreviewer.as::clearPreviewer()
    clearPreviewer(): void
    {
        this._previewedFurniId = 0;
        this._previewedUserIndex = -1;
        this.previewFurniInstructionText.visible = false;
        this.previewUserInstructionText.visible = false;
        this.previewAvatarWidget.visible = false;
        this.previewPetWidget.visible = false;
        this.previewImageBitmap.visible = false;
        this.previewGlobalPlaceholder.visible = false;
    }

    // AS3: VariableHolderPreviewer.as::setFurniInstructions()
    setFurniInstructions(): void
    {
        this.clearPreviewer();
        this.previewFurniInstructionText.visible = true;
    }

    // AS3: VariableHolderPreviewer.as::setUserInstructions()
    setUserInstructions(): void
    {
        this.clearPreviewer();
        this.previewUserInstructionText.visible = true;
    }

    // AS3: VariableHolderPreviewer.as::setPreviewByUserIndex()
    setPreviewByUserIndex(index: number): void
    {
        if(index === this._previewedUserIndex)
        {
            return;
        }

        this.clearPreviewer();
        const userData = this._controller.roomEvents.roomSession?.userDataManager.getUserDataByIndex(index);

        if(userData == null)
        {
            return;
        }

        switch(userData.type - 1)
        {
            case 0:
            case 2:
            case 3:
                this.previewAvatarWidget.visible = true;
                (this.previewAvatarWidget.widget as unknown as IAvatarImageWidget).figure = userData.figure;
                VariableHolderPreviewer.centerContainer(this.previewAvatarWidget as unknown as IWindow);
                break;
            case 1:
                this.previewPetWidget.visible = true;
                (this.previewPetWidget.widget as unknown as PetImageWidget).figure = userData.figure;
                VariableHolderPreviewer.centerContainer(this.previewPetWidget as unknown as IWindow);
                break;
        }

        this._previewedUserIndex = index;
    }

    // AS3: VariableHolderPreviewer.as::setFurniByObjectId()
    setFurniByObjectId(objectId: number): void
    {
        if(objectId === this._previewedFurniId || -objectId === this._previewedFurniId)
        {
            return;
        }

        this.clearPreviewer();
        let category: number;

        if(objectId >= 0)
        {
            category = 10;
        }
        else
        {
            objectId = -objectId;
            category = 20;
        }

        const engine = this._controller.roomEngine!;
        const image = engine.getRoomObjectImage(engine.activeRoomId, objectId, category, new Vector3d(180), 64, null as never);

        if(image.data != null)
        {
            const bitmap = this.previewImageBitmap;
            bitmap.bitmap = image.data;
            const zoom = bitmap as unknown as IZoomableBitmap;

            if(image.data.width >= this._container.width - 6 || image.data.height > this._container.height - 6)
            {
                zoom.zoomX = 0.5;
                zoom.zoomY = 0.5;
            }
            else
            {
                zoom.zoomX = 1;
                zoom.zoomY = 1;
            }

            bitmap.visible = true;
            VariableHolderPreviewer.centerContainer(bitmap as unknown as IWindow);
        }

        this._previewedFurniId = objectId;
    }

    // AS3: VariableHolderPreviewer.as::setGlobalPlaceholder()
    setGlobalPlaceholder(): void
    {
        this.clearPreviewer();
        this.previewGlobalPlaceholder.visible = true;
    }

    // AS3: VariableHolderPreviewer.as::imageReady()
    imageReady(_id: number, _data: ImageBitmap | null): void
    {
    }

    // AS3: VariableHolderPreviewer.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: VariableHolderPreviewer.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
    }

    // AS3: VariableHolderPreviewer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VariableHolderPreviewer.as::get previewFurniInstructionText()
    private get previewFurniInstructionText(): ITextWindow
    {
        return this._container.findChildByName('preview_instruction_furni') as unknown as ITextWindow;
    }

    // AS3: VariableHolderPreviewer.as::get previewUserInstructionText()
    private get previewUserInstructionText(): ITextWindow
    {
        return this._container.findChildByName('preview_instruction_user') as unknown as ITextWindow;
    }

    // AS3: VariableHolderPreviewer.as::get previewAvatarWidget()
    private get previewAvatarWidget(): IWidgetWindow
    {
        return this._container.findChildByName('preview_avatar') as unknown as IWidgetWindow;
    }

    // AS3: VariableHolderPreviewer.as::get previewPetWidget()
    private get previewPetWidget(): IWidgetWindow
    {
        return this._container.findChildByName('preview_pet') as unknown as IWidgetWindow;
    }

    // AS3: VariableHolderPreviewer.as::get previewImageBitmap()
    private get previewImageBitmap(): IBitmapWrapperWindow
    {
        return this._container.findChildByName('preview_image_bitmap') as unknown as IBitmapWrapperWindow;
    }

    // AS3: VariableHolderPreviewer.as::get previewGlobalPlaceholder()
    private get previewGlobalPlaceholder(): IStaticBitmapWrapperWindow
    {
        return this._container.findChildByName('global_placeholder') as unknown as IStaticBitmapWrapperWindow;
    }
}
