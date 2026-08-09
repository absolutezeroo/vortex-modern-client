import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {textureToBitmap} from '@habbo/avatar/AvatarImageSnapshot';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';

import type {Bot} from './Bot';
import type {BotsModel} from './BotsModel';
import {BotGridItem} from './BotGridItem';

const log = Logger.getLogger('habbo.inventory.bots.BotsView');

/**
 * BotsView — the bots-inventory tab (grid of the player's bots + preview/place panel).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/bots/BotsView.as
 *
 * One deviation, forced by the port's image pipeline: AS3's `getItemImage()` returns a BitmapData
 * synchronously, but `AvatarImage.getCroppedImage()` yields a PixiJS texture that only becomes the
 * `ImageBitmap` a bitmap-wrapper window accepts through the browser's async `createImageBitmap()`.
 * Callers therefore apply the render in a promise continuation — the same shape
 * `ProductGridItem.renderAvatarImage()` already uses.
 */
export class BotsView implements IAvatarImageListener
{
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::STATE_NULL
    private static readonly STATE_NULL: number = 0;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::STATE_INITIALIZING
    private static readonly STATE_INITIALIZING: number = 1;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::STATE_EMPTY
    private static readonly STATE_EMPTY: number = 2;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::STATE_CONTENT
    private static readonly STATE_CONTENT: number = 3;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_4570
    private _model: BotsModel;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_windowManager
    private _windowManager: IHabboWindowManager;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_avatarRenderer
    private _avatarRenderer: IAvatarRenderManager | null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_4550
    private _window: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_5211
    private _grid: IItemGridWindow | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_gridItems
    private _gridItems: Map<number, BotGridItem> = new Map<number, BotGridItem>();
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_4790
    private _selectedItem: BotGridItem | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_6499
    private _state: number = BotsView.STATE_NULL;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_SafeStr_4755
    private _initialized: boolean = false;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::_disposed
    private _disposed: boolean = false;
    // TS-only: the preview's half of BotGridItem._hasImage — see avatarImageReady().
    private _previewHasImage: boolean = false;

    constructor(model: BotsModel, windowManager: IHabboWindowManager, avatarRenderer: IAvatarRenderManager | null)
    {
        this._model = model;
        this._windowManager = windowManager;
        this._avatarRenderer = avatarRenderer;
    }

    // TS-only: AS3 keeps only the manager its constructor was handed, because `HabboInventory`
    // declares `IIDAvatarRenderManager` as a *required* dependency there — it cannot be null by the
    // time the model is built. This port declares it optional (a hard dependency locks the whole
    // component if nothing provides the IID), so the constructor argument may still be null and the
    // manager attach afterwards. Reading it back through the controller on every render is what
    // keeps a late attach from leaving every bot thumbnail blank for the session.
    private get avatarRenderer(): IAvatarRenderManager | null
    {
        return this._avatarRenderer ?? this._model.controller.avatarRenderer;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::get isVisible()
    get isVisible(): boolean
    {
        return this._window !== null && this._window.parent !== null && this._window.visible;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(!this._initialized)
        {
            this.init();
        }

        if(this._window === null || this._window.disposed) return null;

        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::update()
    update(): void
    {
        if(!this._initialized) return;

        this.updateGrid();
        this.updatePreview(this._selectedItem);
        this.updateContainerVisibility();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::updateState()
    updateState(): void
    {
        if(!this._initialized) return;

        const items = this._model.items;
        let state: number;

        if(!this._model.isListInitialized())
        {
            state = BotsView.STATE_INITIALIZING;
        }
        else if(items.size === 0)
        {
            state = BotsView.STATE_EMPTY;
        }
        else
        {
            state = BotsView.STATE_CONTENT;
        }

        if(this._state === state) return;

        this._state = state;
        this.updateContainerVisibility();

        if(this._state === BotsView.STATE_CONTENT)
        {
            this.updateGrid();
            this.updatePreview();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::addItem()
    addItem(data: Bot | null): void
    {
        if(!this._initialized) return;

        if(data === null) return;

        if(this._gridItems.has(data.id)) return;

        const item = new BotGridItem(this, data, this._windowManager, this._model.isUnseen(data.id));

        if(item.window !== null && this._grid !== null)
        {
            this._grid.addGridItem(item.window);
        }

        this._gridItems.set(data.id, item);

        if(this._selectedItem === null)
        {
            this.selectFirst();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::removeItem()
    removeItem(id: number): void
    {
        if(!this._initialized) return;

        const item = this._gridItems.get(id);

        if(item === undefined) return;

        this._gridItems.delete(id);

        if(item.window !== null && this._grid !== null)
        {
            this._grid.removeGridItem(item.window);
        }

        // AS3 drops the item without disposing it — Flash's GC takes the orphaned window. Here the
        // window is a live display object that has to be released explicitly, or every placed bot
        // leaves its thumbnail behind in memory.
        item.dispose();

        if(this._selectedItem === item)
        {
            this._selectedItem = null;
            this.selectFirst();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::setSelectedGridItem()
    setSelectedGridItem(item: BotGridItem | null): void
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

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::selectById()
    selectById(id: number): void
    {
        this.setSelectedGridItem(this._gridItems.get(id) ?? null);
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::placeItemToRoom()
    placeItemToRoom(id: number, skipServer: boolean = false): void
    {
        this._model.placeItemToRoom(id, skipServer);
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::getGridItemImage()
    getGridItemImage(data: Bot): Promise<ImageBitmap | null>
    {
        return this.getItemImage(data, 3, false, 'h');
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::getItemImage()
    getItemImage(data: Bot, direction: number, fullImage: boolean, scale: string): Promise<ImageBitmap | null>
    {
        const renderer = this.avatarRenderer;
        const avatarImage = renderer?.createAvatarImage(data.figure, scale, data.gender, this, null) ?? null;
        const setType = fullImage ? 'full' : 'head';

        if(avatarImage === null)
        {
            // `createAvatarImage()` returns null only before the download manager exists; the
            // listener is queued and replayed from processInitBuffer(), so this is a wait, not a
            // failure — but it is worth seeing, because nothing is drawn until that replay.
            log.debug(
                `getItemImage: no avatar image (renderer=${renderer !== null}) `
                + `figure="${data.figure}" gender="${data.gender}"`
            );

            return Promise.resolve(null);
        }

        avatarImage.setDirection('full', direction);

        const texture = avatarImage.getCroppedImage(setType);

        log.debug(
            `getItemImage: figure="${data.figure}" gender="${data.gender}" setType=${setType} `
            + `image=${avatarImage.constructor.name} `
            + `texture=${texture ? `${texture.width}x${texture.height}` : 'null'}`
        );

        const bitmap = textureToBitmap(texture);

        avatarImage.dispose();

        return bitmap;
    }

    /**
     * AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::avatarImageReady()
     *
     * AS3 matches the ready figure against each item's own (`_loc2_.data.figure == param1`). **That
     * test cannot be transcribed literally here** and was the reason every bot thumbnail stayed
     * blank: `createAvatarImage()` is given a gender, so `validateAvatarFigure()` completes the
     * container with every mandatory part it lacks, and the manager reports back
     * `figureContainer.getFigureString()` — the *completed* figure, not the one the bot carries. The
     * strings differ for exactly the figures that had to be downloaded, i.e. every one that gets
     * here. (`ProductGridItem` never hit this: it passes an empty gender, which skips validation.)
     *
     * So the figure match is kept as one of two triggers, and any item still showing nothing takes
     * the repaint too. It converges: a render that finds its assets ready registers no listener.
     */
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::avatarImageReady()
    avatarImageReady(figureString: string): void
    {
        if(this._disposed) return;

        log.debug(
            `avatarImageReady: reported="${figureString}" `
            + `items=[${Array.from(this._gridItems.values()).map((i) => `"${i.data.figure}"(painted=${i.hasImage})`).join(', ')}]`
        );

        for(const item of this._gridItems.values())
        {
            if(item.data.figure === figureString || !item.hasImage)
            {
                void this.getGridItemImage(item.data).then((image) => item.setImage(image));
            }
        }

        // TS-only: AS3 stops at the grid, because its preview render is synchronous and complete on
        // the first call. Here the first render can land before the figure's assets are in, so the
        // preview needs the same second pass — repainting the bitmap only, never re-running
        // updatePreview(), which would start another render from inside this callback.
        const selected = this._selectedItem;

        if(selected !== null && (selected.data.figure === figureString || !this._previewHasImage))
        {
            void this.getItemImage(selected.data, 4, true, 'h').then((image) => this.setPreviewImage(image));
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::init()
    private init(): void
    {
        this._window = this._model.controller.view.getView('bots') as IWindowContainer | null;

        if(this._window === null)
        {
            log.warn('Bots tab window "bots" not found in the inventory layout');

            return;
        }

        this._window.visible = false;
        this._grid = this._window.findChildByName('grid') as unknown as IItemGridWindow | null;

        this._window.findChildByName('place_button')?.addEventListener('WME_CLICK', this.startPlacingHandler);
        this._window.findChildByName('preview_image')?.addEventListener('WME_DOWN', this.startPlacingHandler);

        this.updatePreview();

        // AS3 raises its initialised flag LAST, after updateState() and selectFirst() — both of
        // which begin with `if(!initialized) return`, so in AS3 they do nothing here and the tab
        // stays in STATE_NULL until the next model change happens to call updateState() again.
        // Raising the flag first is what PetsView already does, and it is what makes a tab opened
        // *after* the inventory arrived render its grid instead of an unpainted panel.
        this._initialized = true;
        this.updateState();
        this.selectFirst();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::startPlacingHandler()
    private startPlacingHandler = (_event: unknown): void =>
    {
        if(this._selectedItem === null) return;

        const data = this._selectedItem.data;

        this.placeItemToRoom(data.id);
    };

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::selectFirst()
    private selectFirst(): void
    {
        const first = this._gridItems.values().next();

        if(first.done === true)
        {
            this.updatePreview();

            return;
        }

        this.setSelectedGridItem(first.value);
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::updateGrid()
    private updateGrid(): void
    {
        if(this._window === null || this._grid === null) return;

        const currentIds = Array.from(this._gridItems.keys());
        const modelIds = Array.from(this._model.items.keys());

        this._grid.lock();

        for(const id of currentIds)
        {
            if(!modelIds.includes(id)) this.removeItem(id);
        }

        for(const id of modelIds)
        {
            if(!this._gridItems.has(id))
            {
                this.addItem(this._model.items.get(id) ?? null);
            }

            this._gridItems.get(id)?.setUnseen(this._model.isUnseen(id));
        }

        this._grid.unlock();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::updateContainerVisibility()
    private updateContainerVisibility(): void
    {
        if(this._window === null) return;

        if(this._model.controller.currentCategory !== 'bots') return;

        const view = this._model.controller.view;
        const loadingContainer = view.loadingContainer;
        const emptyContainer = view.emptyContainer;
        const grid = this._window.findChildByName('grid');
        const previewContainer = this._window.findChildByName('preview_container');

        const setVisible = (window: IWindow | null, visible: boolean): void =>
        {
            if(window !== null) window.visible = visible;
        };

        switch(this._state)
        {
            case BotsView.STATE_INITIALIZING:
                setVisible(loadingContainer, true);
                setVisible(emptyContainer, false);
                setVisible(grid, false);
                setVisible(previewContainer, false);
                break;
            case BotsView.STATE_EMPTY:
                setVisible(loadingContainer, false);
                setVisible(emptyContainer, true);
                setVisible(grid, false);
                setVisible(previewContainer, false);
                break;
            case BotsView.STATE_CONTENT:
                setVisible(loadingContainer, false);
                setVisible(emptyContainer, false);
                setVisible(grid, true);
                setVisible(previewContainer, true);
                break;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::updatePreview()
    private updatePreview(item: BotGridItem | null = null): void
    {
        if(this._window === null) return;

        let name = '';
        let motto = '';
        let hasSelection = false;

        if(item !== null && item.data !== null)
        {
            const data = item.data;

            name = data.name;
            motto = data.motto;
            hasSelection = true;

            // Kicks off the preview render; delivered by the promise, and again by
            // avatarImageReady() once the figure's assets are in.
            void this.getItemImage(data, 4, true, 'h').then((image) => this.setPreviewImage(image));
        }
        else
        {
            this.setPreviewImage(null);
        }

        this.setPreviewText('bot_name', name);
        this.setPreviewText('bot_description', motto);

        let botsAllowed = false;
        let isRoomOwner = false;
        const roomSession = this._model.roomSession;

        if(roomSession !== null)
        {
            botsAllowed = roomSession.areBotsAllowed;
            isRoomOwner = roomSession.isRoomOwner;
        }

        let info = '';

        if(!isRoomOwner)
        {
            info = botsAllowed ? '${inventory.bots.allowed}' : '${inventory.bots.forbidden}';
        }

        this.setPreviewText('preview_info', info);

        const placeButton = this._window.findChildByName('place_button');

        if(placeButton !== null)
        {
            if(hasSelection && (isRoomOwner || botsAllowed)) placeButton.enable();
            else placeButton.disable();
        }
    }

    // TS-only: AS3 blits the BitmapData into the preview wrapper inline inside updatePreview();
    // split out here because the render arrives asynchronously and lands from two call sites.
    private setPreviewImage(data: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const previewImage = this._window.findChildByName('preview_image') as IBitmapWrapperWindow | null;

        if(previewImage !== null)
        {
            // AS3: updatePreview() builds `new BitmapData(preview.width, preview.height)` and
            // copyPixels() the render into its centre — see drawIntoBitmapSlot().
            const slot = previewImage as unknown as IWindow;

            previewImage.bitmap = drawIntoBitmapSlot(data, slot.width, slot.height);
        }

        this._previewHasImage = data !== null;
    }

    // TS-only: the `findChildByName(...) as ITextWindow` + caption assignment AS3 repeats inline
    // for each of the three preview captions.
    private setPreviewText(name: string, caption: string): void
    {
        if(this._window === null) return;

        const window = this._window.findChildByName(name) as ITextWindow | null;

        if(window !== null) window.caption = caption;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsView.as::dispose()
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
        this._avatarRenderer = null;
    }
}
