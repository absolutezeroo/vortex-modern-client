/**
 * BreedPetsResultView — the "here is what the nest produced" dialog, with a card per offspring.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/BreedPetsResultView.as
 *
 * Each card carries a rendered seed image, the breeder's name, its rarity level and — only for the
 * results that belong to *you* — a place/pick pair that moves the seed between the inventory and
 * the room. A spectator (neither result is theirs) gets the "sorry" variant with a close button.
 * The place/pick pair is re-evaluated whenever the seed enters or leaves the room, which is what
 * roomObjectAdded()/roomObjectRemoved()/updatePlacingButtons() are for.
 *
 * AS3 adaptation: BitmapData.copyPixels() → OffscreenCanvas drawImage.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {FurnitureItem} from '@habbo/inventory/items/FurnitureItem';
import {FurnitureCategory} from '@habbo/inventory/enum/FurnitureCategory';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {Vector3d} from '@room/utils/Vector3d';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {BreedPetsResultData} from './BreedPetsResultData';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

// Seed preview render parameters (BreedPetsResultView.as::resolvePreviewImage()).
const PREVIEW_DIRECTION: number = 90;
const PREVIEW_SCALE: number = 64;

// AS3: BreedPetsResultView.as::modifyRoomObject(..., "OBJECT_PICKUP")
const OBJECT_PICKUP: string = 'OBJECT_PICKUP';

export class BreedPetsResultView implements IDisposable, IGetImageListener
{
    private _window: IFrameWindow | null = null;
    private _disposed: boolean = false;
    private _widget: AvatarInfoWidget;
    private _windowManager: IHabboWindowManager;
    private _assets: IAssetLibrary | null;

    // AS3: BreedPetsResultView.as::_SafeStr_6216 — pending image request id → target window name.
    private _pendingImages: Map<number, string> = new Map();

    private _resultData: BreedPetsResultData | null = null;
    private _resultData2: BreedPetsResultData | null = null;

    // AS3: BreedPetsResultView.as::_SafeStr_6239 — set by the place buttons, cleared by show().
    private _placed: boolean = false;

    // AS3: BreedPetsResultView.as::BreedPetsResultView()
    constructor(widget: AvatarInfoWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: BreedPetsResultView.as::open()
    public open(resultData: BreedPetsResultData, resultData2: BreedPetsResultData): void
    {
        this._resultData = resultData;
        this._resultData2 = resultData2;

        this.setWindowContent();
        this.show();
    }

    private get inventory(): IHabboInventory | null
    {
        return this._widget.handler?.container?.inventory ?? null;
    }

    // AS3: BreedPetsResultView.as::resolvePreviewImage()
    private resolvePreviewImage(classId: number, targetName: string): ImageBitmap | null
    {
        const roomEngine = this._widget.handler?.container?.roomEngine ?? null;

        if(!roomEngine) return null;

        const result = roomEngine.getFurnitureImage(
            classId, new Vector3d(PREVIEW_DIRECTION, 0, 0), PREVIEW_SCALE, this, 0, null, -1, -1, null
        );

        if(!result) return null;

        if(result.id > 0) this._pendingImages.set(result.id, targetName);

        return result.data;
    }

    // AS3: BreedPetsResultView.as::imageReady()
    public imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._disposed) return;

        const targetName = this._pendingImages.get(id);

        if(targetName) this.updatePreviewImage(data, targetName);
    }

    // AS3: BreedPetsResultView.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op.
    }

    // AS3: BreedPetsResultView.as::setWindowContent()
    private setWindowContent(): void
    {
        const container = this._widget.handler?.container ?? null;
        const result1 = this._resultData;
        const result2 = this._resultData2;

        if(!container || !result1 || !result2) return;

        const localizations = this._widget.localizations;
        const sessionDataManager = container.sessionDataManager;
        const furniData1 = sessionDataManager?.getFloorItemData(result1.classId) ?? null;
        const furniData2 = sessionDataManager?.getFloorItemData(result2.classId) ?? null;

        localizations?.registerParameter('breedpetsresult.widget.seed1.name', 'name', furniData1?.localizedName ?? '');
        localizations?.registerParameter('breedpetsresult.widget.seed2.name', 'name', furniData2?.localizedName ?? '');
        localizations?.registerParameter('breedpetsresult.widget.seed1.description', 'name', result1.userName);
        localizations?.registerParameter('breedpetsresult.widget.seed2.description', 'name', result2.userName);
        localizations?.registerParameter('breedpetsresult.widget.seed1.raritylevel', 'level', result1.rarityLevel.toString());
        localizations?.registerParameter('breedpetsresult.widget.seed2.raritylevel', 'level', result2.rarityLevel.toString());

        const userId = sessionDataManager?.userId ?? -1;
        const ownsFirst = result1.userId === userId;
        const ownsSecond = result2.userId === userId;
        const ownsEither = ownsFirst || ownsSecond;

        if(!ownsEither)
        {
            let breederName = '';

            if(result1.userName) breederName = result1.userName;
            else if(result2.userName) breederName = result2.userName;

            localizations?.registerParameter('breedpetsresult.widget.text.sorry', 'name', breederName);
        }

        if(!this._window)
        {
            this._window = this._windowManager.buildWidgetLayout('breed_pets_result_xml') as IFrameWindow | null;

            if(!this._window) return;

            this.addClickListener('header_button_close');
        }

        this._window.center();
        this._window.visible = true;

        this.enableElement('seed1_buttonlist', false);
        this.enableElement('seed2_buttonlist', false);
        this.enableElement('place_button1', false);
        this.enableElement('pick_button1', false);
        this.enableElement('place_button2', false);
        this.enableElement('pick_button2', false);
        this.enableElement('close_button', false);

        if(ownsFirst)
        {
            this.enableElement('place_button1', true);
            this.enableElement('seed1_buttonlist', true);
        }

        if(ownsSecond)
        {
            this.enableElement('place_button2', true);
            this.enableElement('seed2_buttonlist', true);
        }

        if(ownsEither) this.enableElement('preview_buttonlist', true);

        // A breeding that produced only one seed leaves the second card empty.
        this.enableElement('seed2_itemlist', true);

        if(result2.stuffId === -1) this.enableElement('seed2_itemlist', false);

        this.enableElement('description', true);
        // AS3 shows `info` and then hides it again two lines later; kept as written.
        this.enableElement('info', true);
        this.enableElement('description_sorry', false);
        this.enableElement('info', false);
        this.enableElement('button_list', false);
        this.enableElement('close_button', false);

        if(!ownsEither)
        {
            this.enableElement('preview_buttonlist', false);
            this.enableElement('description', false);
            this.enableElement('info', false);
            this.enableElement('save_button', false);
            this.enableElement('place_button1', false);
            this.enableElement('pick_button1', false);
            this.enableElement('place_button2', false);
            this.enableElement('pick_button2', false);
            this.enableElement('button_list', true);
            this.enableElement('description_sorry', true);
            this.enableElement('info_sorry', true);
            this.enableElement('close_button', true);
        }

        this.enableElement('info_mutate1', false);
        this.enableElement('info_mutate2', false);

        if(result1.hasMutation) this.enableElement('info_mutate1', true);
        if(result2.hasMutation) this.enableElement('info_mutate2', true);

        this.addClickListener('save_button');
        this.addClickListener('header_button_close');
        this.addClickListener('close_button');
        this.addClickListener('place_button1');
        this.addClickListener('place_button2');
        this.addClickListener('pick_button1');
        this.addClickListener('pick_button2');
        this.addClickListener('preview_image_region');
        this.addClickListener('preview_image_region2');

        // AS3 renders the *first* seed's class into both slots — the second card shows the same
        // image. Left as written rather than "fixed" to furniData2.
        if(furniData1)
        {
            this.updatePreviewImage(this.resolvePreviewImage(furniData1.id, 'preview_image'), 'preview_image');
            this.updatePreviewImage(this.resolvePreviewImage(furniData1.id, 'preview_image2'), 'preview_image2');
        }

        this.arrangeListItems();
        this._window.invalidate();
    }

    // AS3: BreedPetsResultView.as::enableElement()
    private enableElement(name: string, visible: boolean): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: BreedPetsResultView.as::arrangeListItems()
    private arrangeListItems(): void
    {
        this.arrangeListItem('seed1_itemlist');
        this.arrangeListItem('seed2_itemlist');
        this.arrangeListItem('seed1_buttonlist');
        this.arrangeListItem('seed2_buttonlist');
        this.arrangeListItem('preview_buttonlist');
        this.arrangeListItem('button_list');
        this.arrangeListItem('preview_list');
        this.arrangeListItem('element_list');

        this._window?.resizeToFitContent();
    }

    // AS3: BreedPetsResultView.as::arrangeListItem()
    private arrangeListItem(name: string): void
    {
        const list = this._window?.findChildByName(name) as IItemListWindow | null;

        list?.arrangeListItems();
    }

    // AS3: BreedPetsResultView.as::updatePreviewImage()
    private updatePreviewImage(image: ImageBitmap | null, targetName: string): void
    {
        if(!this._window || !image) return;

        const target = this._window.findChildByName(targetName) as IBitmapWrapperWindow | null;

        if(!target) return;

        const canvas = new OffscreenCanvas(target.width, target.height);
        const context = canvas.getContext('2d');

        if(!context) return;

        const background = (this._assets?.getAssetByName('breed_pets_preview_bg')?.content ?? null) as ImageBitmap | null;

        if(background) context.drawImage(background, 0, 0);

        context.drawImage(
            image,
            Math.round((target.width - image.width) / 2),
            Math.round((target.height - image.height) / 2)
        );

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    // AS3: BreedPetsResultView.as::close()
    public close(): void
    {
        this._widget.removeBreedPetsResultView(this);
    }

    // AS3: BreedPetsResultView.as::show()
    public show(): void
    {
        this._placed = false;

        if(this._window) this._window.visible = true;
    }

    // AS3: BreedPetsResultView.as::hide()
    private hide(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: BreedPetsResultView.as::addClickListener()
    private addClickListener(name: string): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        child?.addEventListener(WindowMouseEvent.CLICK, this.onMouseClick);
    }

    // AS3: BreedPetsResultView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch((event.window as IWindow | null)?.name)
        {
            case 'header_button_close':
            case 'close_button':
                this.close();
                break;
            case 'place_button1':
                this._placed = this.placeItemToRoom(this._resultData?.stuffId ?? -1);
                if(this._placed) this.close();
                break;
            case 'place_button2':
                this._placed = this.placeItemToRoom(this._resultData2?.stuffId ?? -1);
                if(this._placed) this.close();
                break;
            case 'pick_button1':
                this.pickItemFromRoom(this._resultData?.stuffId ?? -1);
                break;
            case 'pick_button2':
                this.pickItemFromRoom(this._resultData2?.stuffId ?? -1);
                break;
            case 'preview_image_region':
                this.selectItemFromInventoryOrRoom(this._resultData?.stuffId ?? -1);
                break;
            case 'preview_image_region2':
                this.selectItemFromInventoryOrRoom(this._resultData2?.stuffId ?? -1);
                break;
            case 'ok_button':
            case 'save_button':
                this.hide();
                break;
        }
    };

    // AS3: BreedPetsResultView.as::selectItemFromInventoryOrRoom()
    private selectItemFromInventoryOrRoom(stuffId: number): boolean
    {
        const container = this._widget.handler?.container ?? null;

        if(this.findInventoryFloorItemById(stuffId))
        {
            this.inventory?.toggleInventoryPage('furni');

            return true;
        }

        const roomObject = this.findRoomObject(stuffId);

        if(roomObject && container?.roomEngine)
        {
            container.roomEngine.selectRoomObject(
                container.roomSession.roomId, roomObject.getId(), RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
            );

            return true;
        }

        return false;
    }

    // AS3: BreedPetsResultView.as::pickItemFromRoom()
    private pickItemFromRoom(stuffId: number): boolean
    {
        const roomObject = this.findRoomObject(stuffId);
        const roomEngine = this._widget.handler?.container?.roomEngine ?? null;

        if(roomObject && roomEngine)
        {
            roomEngine.modifyRoomObject(roomObject.getId(), RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE, OBJECT_PICKUP);

            return true;
        }

        return false;
    }

    // AS3: BreedPetsResultView.as::placeItemToRoom()
    private placeItemToRoom(stuffId: number): boolean
    {
        return this.requestSelectedFurniPlacement(this.findInventoryFloorItemById(stuffId));
    }

    // AS3: BreedPetsResultView.as::findRoomObject()
    private findRoomObject(stuffId: number): IRoomObject | null
    {
        const container = this._widget.handler?.container ?? null;

        if(!container?.roomEngine) return null;

        return container.roomEngine.getRoomObject(
            container.roomSession.roomId, stuffId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        );
    }

    // AS3: BreedPetsResultView.as::findInventoryFloorItemById()
    // The negated id is AS3's own: a freshly bred seed sits in the inventory under -stuffId.
    private findInventoryFloorItemById(stuffId: number): FurnitureItem | null
    {
        return this.inventory?.getFloorItemById(-stuffId) ?? null;
    }

    // AS3: BreedPetsResultView.as::requestSelectedFurniPlacement()
    private requestSelectedFurniPlacement(item: FurnitureItem | null): boolean
    {
        const inventory = this.inventory;

        if(!item || !inventory) return false;

        // Wallpaper/floor/landscape are not placed through the mover.
        if(item.category === FurnitureCategory.FLOOR
            || item.category === FurnitureCategory.WALL_PAPER
            || item.category === FurnitureCategory.LANDSCAPE)
        {
            return false;
        }

        return inventory.requestSelectedFurniToMover(item);
    }

    // AS3: BreedPetsResultView.as::roomObjectRemoved()
    public roomObjectRemoved(objectId: number): void
    {
        if(!this._resultData || !this._resultData2) return;

        if(this._resultData.stuffId === objectId || this._resultData2.stuffId === objectId)
        {
            this.updatePlacingButtons();
            this.show();
        }
    }

    // AS3: BreedPetsResultView.as::roomObjectAdded()
    public roomObjectAdded(objectId: number): void
    {
        if(!this._resultData || !this._resultData2) return;

        if(this._resultData.stuffId === objectId || this._resultData2.stuffId === objectId)
        {
            this.updatePlacingButtons();
            this.show();
        }
    }

    // AS3: BreedPetsResultView.as::updatePlacingButtons()
    public updatePlacingButtons(): void
    {
        this.updateButtons(this._resultData, 'place_button1', 'pick_button1');
        this.updateButtons(this._resultData2, 'place_button2', 'pick_button2');
        this.arrangeListItems();
    }

    // AS3: BreedPetsResultView.as::updateButtons()
    // Place shows while the seed is in your inventory (or nowhere yet); pick shows once it is
    // standing in the room. Neither shows for a result that is not yours.
    private updateButtons(result: BreedPetsResultData | null, placeButtonName: string, pickButtonName: string): void
    {
        if(!this._window || !result) return;

        const userId = this._widget.handler?.container?.sessionDataManager?.userId ?? -1;
        const isOwn = result.userId === userId;
        const inRoom = this.findRoomObject(result.stuffId) !== null;
        const inInventory = !inRoom && this.findInventoryFloorItemById(result.stuffId) !== null;

        const placeButton = this._window.findChildByName(placeButtonName);
        const pickButton = this._window.findChildByName(pickButtonName);

        if(placeButton)
        {
            placeButton.visible = false;

            if(isOwn && (inInventory || (!inInventory && !inRoom))) placeButton.visible = true;
        }

        if(pickButton)
        {
            pickButton.visible = false;

            if(isOwn && inRoom) pickButton.visible = true;
        }
    }

    // AS3: BreedPetsResultView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: BreedPetsResultView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._pendingImages.clear();
    }
}
