import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';

import type {Pet} from './Pet';
import type {PetsModel} from './PetsModel';
import {PetsGridItem} from './PetsGridItem';

const log = Logger.getLogger('habbo.inventory.pets.PetsView');

/**
 * PetsView — the pets-inventory tab (grid of the player's pets + preview/action panel).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/pets/PetsView.as
 *
 * Structurally mirrors FurniView. One deviation, forced by the port's async image pipeline: AS3
 * `getPetImage` returns a BitmapData synchronously, but RoomEngine.getPetImage always resolves
 * through `imageReady` (ImageResult.ts documents why), so the grid thumbnail and the preview paint
 * on the `imageReady` callback rather than inline.
 */
export class PetsView implements IGetImageListener
{
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::STATE_NULL
    private static readonly STATE_NULL: number = 0;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::STATE_INITIALIZING
    private static readonly STATE_INITIALIZING: number = 1;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::STATE_EMPTY
    private static readonly STATE_EMPTY: number = 2;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::STATE_CONTENT
    private static readonly STATE_CONTENT: number = 3;

    private _model: PetsModel;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_windowManager
    private _windowManager: IHabboWindowManager;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_roomEngine
    private _roomEngine: IRoomEngine;
    private _window: IWindowContainer | null = null;
    private _grid: IItemGridWindow | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_disposed
    private _disposed: boolean = false;
    private _initialized: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_gridItems
    private _gridItems: Map<number, PetsGridItem> = new Map<number, PetsGridItem>();
    private _selectedItem: PetsGridItem | null = null;
    private _state: number = PetsView.STATE_NULL;

    // Pending async image ids: the preview's, and (per grid item) tracked on the item itself.
    private _previewImageId: number = -1;

    // Type/rarity filter state (AS3 _SafeStr_5811/5476, _SafeStr_6062/5605).
    private _selectedTypeFilter: number = -1;
    private _typeFilterIds: number[] = [-1];
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_ignoreTypeFilterEvents
    private _ignoreTypeFilterEvents: boolean = false;
    private _selectedRarityFilter: number = -1;
    private _rarityFilterIds: number[] = [-1];
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::_ignoreRarityFilterEvents
    private _ignoreRarityFilterEvents: boolean = false;

    constructor(model: PetsModel, windowManager: IHabboWindowManager, roomEngine: IRoomEngine)
    {
        this._model = model;
        this._windowManager = windowManager;
        this._roomEngine = roomEngine;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PetsView.as::get isVisible()
    get isVisible(): boolean
    {
        return this._window !== null && this._window.parent !== null && this._window.visible;
    }

    // AS3: PetsView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(!this._initialized)
        {
            this.init();
        }

        if(this._window === null || this._window.disposed) return null;

        return this._window;
    }

    // AS3: PetsView.as::update()
    update(): void
    {
        if(!this._initialized) return;

        this.updateGrid();
        this.updatePreview(this._selectedItem);
        this.updateContainerVisibility();
    }

    // AS3: PetsView.as::updateState()
    updateState(): void
    {
        if(!this._initialized) return;

        const pets = this._model.pets;
        let state: number;

        if(!this._model.isListInitialized())
        {
            state = PetsView.STATE_INITIALIZING;
        }
        else if(pets.size === 0)
        {
            state = PetsView.STATE_EMPTY;
        }
        else
        {
            state = PetsView.STATE_CONTENT;
        }

        if(this._state === state) return;

        this._state = state;
        this.updateContainerVisibility();

        if(this._state === PetsView.STATE_CONTENT)
        {
            this.updateGrid();
            this.updatePreview();
        }
    }

    // AS3: PetsView.as::addPet()
    addPet(pet: Pet): void
    {
        if(!this._initialized || this._grid === null) return;

        if(this._gridItems.has(pet.id)) return;

        const item = new PetsGridItem(this, pet, this._windowManager, this._model.isUnseen(pet.id));

        if(item.window !== null)
        {
            this._grid.addGridItem(item.window);
        }

        this._gridItems.set(pet.id, item);

        if(this._selectedItem === null)
        {
            this.selectFirst();
        }
    }

    // AS3: PetsView.as::removePet()
    removePet(id: number): void
    {
        if(!this._initialized) return;

        const item = this._gridItems.get(id);

        if(item === undefined) return;

        this._gridItems.delete(id);

        if(item.window !== null && this._grid !== null)
        {
            this._grid.removeGridItem(item.window);
        }

        if(this._selectedItem === item)
        {
            this._selectedItem = null;
            this.selectFirst();
        }
    }

    // AS3: PetsView.as::setSelectedGridItem()
    setSelectedGridItem(item: PetsGridItem | null): void
    {
        if(!this._initialized) return;

        if(this._selectedItem !== null)
        {
            this._selectedItem.setSelected(false);
        }

        this._selectedItem = item;

        if(this._selectedItem !== null)
        {
            this._selectedItem.setSelected(true);
        }

        this.updatePreview(item);
    }

    // AS3: PetsView.as::selectById()
    selectById(id: number): void
    {
        const item = this._gridItems.get(id) ?? null;
        this.setSelectedGridItem(item);
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::placePetToRoom()
    placePetToRoom(id: number, skipServer: boolean = false): void
    {
        this._model.placePetToRoom(id, skipServer);
    }

    // AS3: PetsView.as::getPetImage() — adapted to the async image pipeline. Instead of returning a
    // BitmapData, it kicks off the load and records the pending id; the image arrives via
    // imageReady(), which routes to the grid item (by imageDownloadId) or the preview.
    getPetImage(
        pet: Pet,
        direction: number,
        fullImage: boolean,
        gridItem: PetsGridItem | null,
        scale: number,
        posture: string | null
    ): void
    {
        const color = parseInt(pet.color, 16);
        const figure = pet.figureData;
        const customParts: {layerId: number; partId: number; paletteId: number}[] = [];
        const flat = figure.customParts;

        for(let i = 0; i + 2 < flat.length; i += 3)
        {
            customParts.push({layerId: flat[i], partId: flat[i + 1], paletteId: flat[i + 2]});
        }

        const result = this._roomEngine.getPetImage(
            pet.typeId,
            pet.paletteId,
            isNaN(color) ? 0 : color,
            new Vector3d(direction * 45),
            scale,
            this,
            fullImage,
            0,
            customParts,
            posture
        );

        if(result.id > 0)
        {
            if(gridItem !== null)
            {
                gridItem.imageDownloadId = result.id;
            }
            else if(fullImage)
            {
                this._previewImageId = result.id;
            }
        }
        else if(result.data !== null)
        {
            // Synchronous hit (id === 0): deliver immediately.
            if(gridItem !== null) gridItem.setPetImage(result.data);
            else this.setPreviewImage(result.data);
        }
    }

    // AS3: PetsView.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(id === this._previewImageId)
        {
            // AS3 re-runs updatePreview() here; the port sets the bitmap directly instead, because
            // getPetImage is always async and re-running updatePreview would start another load and
            // loop forever.
            this.setPreviewImage(data);

            return;
        }

        for(const item of this._gridItems.values())
        {
            if(item.imageDownloadId === id)
            {
                item.setPetImage(data);

                return;
            }
        }
    }

    // AS3: PetsView.as::imageFailed() — no-op.
    imageFailed(_id: number): void
    {
        // Intentional no-op, matches AS3.
    }

    // AS3: PetsView.as::init()
    private init(): void
    {
        this._window = this._model.controller.view.getView('pets') as IWindowContainer | null;

        if(this._window === null)
        {
            log.warn('Pets tab window "pets" not found in the inventory layout');

            return;
        }

        this._window.visible = false;
        this._window.procedure = this.windowEventProc;
        this._grid = this._window.findChildByName('grid') as unknown as IItemGridWindow | null;

        const filter = this._window.findChildByName('filter') as ITextWindow | null;

        if(filter !== null) filter.caption = '';

        const clearFilter = this._window.findChildByName('clear_filter_button');

        if(clearFilter !== null) clearFilter.visible = false;

        this.updateFilterOptions();

        this._window.findChildByName('place_button')?.addEventListener('WME_CLICK', this.startPlacingHandler);
        this._window.findChildByName('preview_image')?.addEventListener('WME_DOWN', this.startPlacingHandler);

        this.updatePreview();
        this._initialized = true;
        this.updateState();
    }

    // AS3: PetsView.as::startPlacingHandler()
    private startPlacingHandler = (_event: unknown): void =>
    {
        if(this._selectedItem === null) return;

        const pet = this._selectedItem.pet;

        this.placePetToRoom(pet.id);
    };

    // AS3: PetsView.as::updateGrid()
    private updateGrid(): void
    {
        if(this._window === null || this._grid === null) return;

        const currentIds = Array.from(this._gridItems.keys());
        const modelIds = Array.from(this._model.pets.keys());

        for(const id of currentIds)
        {
            if(!modelIds.includes(id)) this.removePet(id);
        }

        for(const id of modelIds)
        {
            if(!this._gridItems.has(id))
            {
                const pet = this._model.pets.get(id);

                if(pet !== undefined) this.addPet(pet);
            }

            this._gridItems.get(id)?.setUnseen(this._model.isUnseen(id));
        }

        this.updateFilterOptions();

        const visibleIds = this.getVisiblePetIds(modelIds);

        this._grid.removeGridItems();

        for(const id of visibleIds)
        {
            const window = this._gridItems.get(id)?.window;

            if(window) this._grid.addGridItem(window);
        }

        const selectedId = this._selectedItem?.pet.id ?? -1;

        if(selectedId === -1 || !visibleIds.includes(selectedId))
        {
            if(this._selectedItem !== null)
            {
                this._selectedItem.setSelected(false);
                this._selectedItem = null;
            }

            this.selectFirst();
        }
    }

    // AS3: PetsView.as::selectFirst()
    private selectFirst(): void
    {
        const visible = this.getVisiblePetIds();

        if(visible.length === 0)
        {
            this.updatePreview();

            return;
        }

        this.setSelectedGridItem(this._gridItems.get(visible[0]) ?? null);
    }

    // AS3: PetsView.as::updateContainerVisibility()
    private updateContainerVisibility(): void
    {
        if(this._window === null) return;

        if(this._model.controller.currentCategory !== 'pets') return;

        const view = this._model.controller.view;
        const loadingContainer = view.loadingContainer;
        const emptyContainer = view.emptyContainer;
        const optionsContainer = this._window.findChildByName('options_container');
        const rarityFilter = this._window.findChildByName('filter.rarity');
        const grid = this._window.findChildByName('grid');
        const previewContainer = this._window.findChildByName('preview_container');

        const setVisible = (window: IWindow | null, visible: boolean): void =>
        {
            if(window !== null) window.visible = visible;
        };

        switch(this._state)
        {
            case PetsView.STATE_INITIALIZING:
                setVisible(loadingContainer, true);
                setVisible(emptyContainer, false);
                setVisible(optionsContainer, false);
                setVisible(rarityFilter, false);
                setVisible(grid, false);
                setVisible(previewContainer, false);
                break;
            case PetsView.STATE_EMPTY:
                setVisible(loadingContainer, false);
                setVisible(emptyContainer, true);
                setVisible(optionsContainer, false);
                setVisible(rarityFilter, false);
                setVisible(grid, false);
                setVisible(previewContainer, false);
                break;
            case PetsView.STATE_CONTENT:
                setVisible(loadingContainer, false);
                setVisible(emptyContainer, false);
                setVisible(optionsContainer, true);
                setVisible(rarityFilter, true);
                setVisible(grid, true);
                setVisible(previewContainer, true);
                break;
        }
    }

    // AS3: PetsView.as::updatePreview()
    private updatePreview(item: PetsGridItem | null = null): void
    {
        if(this._window === null) return;

        this._previewImageId = -1;

        let name = '';
        let description = '';
        let hasSelection = false;

        if(item !== null && item.pet !== null)
        {
            const pet = item.pet;
            name = pet.name;
            description = this.getPetTypeLabel(pet.typeId);
            hasSelection = true;

            let direction = 4;
            let posture: string | null = null;

            if(pet.typeId === 16)
            {
                direction = 2;
                posture = pet.level >= 7 ? 'std' : `grw${pet.level}`;
            }

            // Kicks off the async preview image; delivered by imageReady() → setPreviewImage().
            this.getPetImage(pet, direction, true, null, 64, posture);
        }
        else
        {
            this.setPreviewImage(null);
        }

        this.setPreviewText('preview_text', name);
        this.setPreviewText('preview_description', description);

        let petsAllowed = false;
        let isRoomOwner = false;
        const roomSession = this._model.roomSession;

        if(roomSession !== null)
        {
            petsAllowed = roomSession.arePetsAllowed;
            isRoomOwner = roomSession.isRoomOwner;
        }

        let info = '';

        if(!isRoomOwner)
        {
            info = petsAllowed ? '${inventory.pets.allowed}' : '${inventory.pets.forbidden}';
        }

        this.setPreviewText('preview_info', info);

        const placeButton = this._window.findChildByName('place_button');

        if(placeButton !== null)
        {
            if(hasSelection && (isRoomOwner || petsAllowed)) placeButton.enable();
            else placeButton.disable();
        }
    }

    private setPreviewImage(data: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const previewImage = this._window.findChildByName('preview_image') as IBitmapWrapperWindow | null;

        if(previewImage !== null)
        {
            // AS3: PetsView.as::updatePreview() composes the render into a bitmap the size of the
            // preview slot — see drawIntoBitmapSlot().
            const slot = previewImage as unknown as IWindow;

            previewImage.bitmap = drawIntoBitmapSlot(data, slot.width, slot.height);
        }
    }

    private setPreviewText(name: string, caption: string): void
    {
        if(this._window === null) return;

        const window = this._window.findChildByName(name) as ITextWindow | null;

        if(window !== null) window.caption = caption;
    }

    // AS3: PetsView.as::windowEventProc()
    private windowEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._window === null) return;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'clear_filter_button')
            {
                const filter = this._window.findChildByName('filter') as ITextWindow | null;

                if(filter !== null) filter.caption = '';

                window.visible = false;
                this.update();
            }
        }
        else if(event.type === 'WKE_KEY_UP')
        {
            if(window.name === 'filter')
            {
                const keyEvent = event as unknown as WindowKeyboardEvent;
                const clearFilter = this._window.findChildByName('clear_filter_button');
                const caption = (window as unknown as ITextWindow).caption;

                if(clearFilter !== null) clearFilter.visible = caption.length > 0;

                if(keyEvent.keyCode === 27)
                {
                    (window as unknown as ITextWindow).caption = '';

                    if(clearFilter !== null) clearFilter.visible = false;

                    this.update();
                }
                else if(keyEvent.keyCode === 13)
                {
                    this.update();
                }
            }
        }
        else if(event.type === 'WE_SELECTED')
        {
            if(window.name === 'filter.options' && !this._ignoreTypeFilterEvents)
            {
                const selected = this.getSelectedTypeFilter(window as unknown as IDropMenuWindow);

                if(selected !== this._selectedTypeFilter)
                {
                    this._selectedTypeFilter = selected;
                    this.update();
                }
            }
            else if(window.name === 'filter.rarity' && !this._ignoreRarityFilterEvents)
            {
                const selected = this.getSelectedRarityFilter(window as unknown as IDropMenuWindow);

                if(selected !== this._selectedRarityFilter)
                {
                    this._selectedRarityFilter = selected;
                    this.update();
                }
            }
        }
    };

    // AS3: PetsView.as::updateFilterOptions()
    private updateFilterOptions(): void
    {
        if(this._window === null) return;

        const dropdown = this._window.findChildByName('filter.options') as unknown as IDropMenuWindow | null;

        if(dropdown === null) return;

        this._typeFilterIds = this.getAvailableTypeFilterIds();

        if(!this._typeFilterIds.includes(this._selectedTypeFilter)) this._selectedTypeFilter = -1;

        const labels: string[] = [
            this._model.localization.getLocalization('inventory.pets.filter.type.all', 'All types')
        ];

        for(let i = 1; i < this._typeFilterIds.length; i++)
        {
            labels.push(this.getPetTypeLabel(this._typeFilterIds[i]));
        }

        this._ignoreTypeFilterEvents = true;

        try
        {
            dropdown.populateWithStrings(labels);
            dropdown.selection = Math.max(0, this._typeFilterIds.indexOf(this._selectedTypeFilter));
        }
        finally
        {
            this._ignoreTypeFilterEvents = false;
        }

        this.updateRarityFilterOptions();
    }

    // AS3: PetsView.as::updateRarityFilterOptions()
    private updateRarityFilterOptions(): void
    {
        if(this._window === null) return;

        const dropdown = this._window.findChildByName('filter.rarity') as unknown as IDropMenuWindow | null;

        if(dropdown === null) return;

        this._rarityFilterIds = this.getAvailableRarityFilterIds();

        if(!this._rarityFilterIds.includes(this._selectedRarityFilter)) this._selectedRarityFilter = -1;

        const labels = this._rarityFilterIds.map((id) => this.getRarityFilterLabel(id));

        this._ignoreRarityFilterEvents = true;

        try
        {
            const target = this.isRarityFilterEnabled() ? this._selectedRarityFilter : -1;
            dropdown.populateWithStrings(labels);
            dropdown.selection = Math.max(0, this._rarityFilterIds.indexOf(target));
        }
        finally
        {
            this._ignoreRarityFilterEvents = false;
        }

        if(this.isRarityFilterEnabled()) (dropdown as unknown as IWindow).enable();
        else (dropdown as unknown as IWindow).disable();
    }

    // AS3: PetsView.as::getAvailableTypeFilterIds()
    private getAvailableTypeFilterIds(): number[]
    {
        const ids: number[] = [];

        for(const pet of this._model.pets.values())
        {
            if(!ids.includes(pet.typeId)) ids.push(pet.typeId);
        }

        ids.sort((a, b) => a - b);
        ids.unshift(-1);

        return ids;
    }

    // AS3: PetsView.as::getAvailableRarityFilterIds()
    private getAvailableRarityFilterIds(): number[]
    {
        const ids: number[] = [-1];

        for(const pet of this._model.pets.values())
        {
            if(pet.typeId === 16 && pet.rarityLevel >= 0 && !ids.includes(pet.rarityLevel))
            {
                ids.push(pet.rarityLevel);
            }
        }

        ids.sort((a, b) => a - b);

        const minusOne = ids.indexOf(-1);

        if(minusOne > 0)
        {
            ids.splice(minusOne, 1);
            ids.unshift(-1);
        }

        return ids;
    }

    // AS3: PetsView.as::getVisiblePetIds()
    private getVisiblePetIds(ids: number[] | null = null): number[]
    {
        const source = ids ?? Array.from(this._model.pets.keys());
        const visible: number[] = [];

        for(const id of source)
        {
            const pet = this._model.pets.get(id);

            if(pet !== undefined && this.passesFilter(pet)) visible.push(id);
        }

        return visible;
    }

    // AS3: PetsView.as::passesFilter()
    private passesFilter(pet: Pet): boolean
    {
        if(this._selectedTypeFilter !== -1 && pet.typeId !== this._selectedTypeFilter) return false;

        if(this.isRarityFilterEnabled() && this._selectedRarityFilter !== -1 && pet.rarityLevel !== this._selectedRarityFilter)
        {
            return false;
        }

        const term = this.getSearchTerm();

        if(term.length > 0)
        {
            const name = pet.name !== null ? pet.name.toLowerCase() : '';
            const typeLabel = this.getPetTypeLabel(pet.typeId).toLowerCase();

            if(!name.includes(term) && !typeLabel.includes(term)) return false;
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::getSearchTerm()
    private getSearchTerm(): string
    {
        if(this._window === null) return '';

        const filter = this._window.findChildByName('filter') as ITextWindow | null;

        return filter !== null ? filter.caption.toLowerCase() : '';
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::getSelectedTypeFilter()
    private getSelectedTypeFilter(dropdown: IDropMenuWindow): number
    {
        if(this._typeFilterIds.length === 0) return -1;

        let index = dropdown.selection;

        if(index < 0 || index >= this._typeFilterIds.length) index = 0;

        return this._typeFilterIds[index];
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::getSelectedRarityFilter()
    private getSelectedRarityFilter(dropdown: IDropMenuWindow): number
    {
        if(this._rarityFilterIds.length === 0) return -1;

        let index = dropdown.selection;

        if(index < 0 || index >= this._rarityFilterIds.length) index = 0;

        return this._rarityFilterIds[index];
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::isRarityFilterEnabled()
    private isRarityFilterEnabled(): boolean
    {
        return this._selectedTypeFilter === 16;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::getRarityFilterLabel()
    private getRarityFilterLabel(id: number): string
    {
        if(id === -1)
        {
            return this._model.localization.getLocalization('inventory.pets.filter.rarity.all');
        }

        return String(id);
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::getPetTypeLabel()
    private getPetTypeLabel(typeId: number): string
    {
        return this._model.localization.getLocalization(`pet.type.${typeId}`);
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        for(const item of this._gridItems.values())
        {
            item.dispose();
        }

        this._gridItems.clear();
        this._selectedItem = null;
        this._grid = null;
        this._window = null;
    }
}
