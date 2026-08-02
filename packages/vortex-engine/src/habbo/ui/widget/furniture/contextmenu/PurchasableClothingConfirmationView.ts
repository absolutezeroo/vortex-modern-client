import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import type {FurnitureContextMenuWidget} from './FurnitureContextMenuWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.contextmenu.PurchasableClothingConfirmationView');

/**
 * PurchasableClothingConfirmationView
 *
 * "Wear this outfit?" — the dialog behind clothing furniture. It composes the player's
 * *current* figure with the sets the furni carries, previews the result, and on confirm
 * hands the whole thing to the handler's two-step redeem.
 *
 * Only sets valid for the player's gender are taken (`isValidFigureSetForGender`), which is
 * why the same furni can offer different pieces to different players.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/PurchasableClothingConfirmationView.as
 */
export class PurchasableClothingConfirmationView
{
    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::PRODUCT_PAGE_UKNOWN
    private static readonly PRODUCT_PAGE_UNKNOWN: number = -1;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::PRODUCT_PAGE_CLOTHING
    private static readonly PRODUCT_PAGE_CLOTHING: number = 0;

    /**
     * Clothing furniture is category 23; AS3 writes the switch as `category - 23`, so the
     * offset is derived from that arithmetic rather than named anywhere.
     */
    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::open()
    private static readonly CATEGORY_OFFSET: number = 23;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::PurchasableClothingConfirmationView()
    constructor(widget: FurnitureContextMenuWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_SafeStr_4549
    private _widget: FurnitureContextMenuWidget | null;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_windowManager
    private _windowManager: IHabboWindowManager;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_SafeStr_7216
    private _objectId: number = -1;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_SafeStr_5194
    private _furniData: {category: number; className: string; localizedName: string; customParams: string} | null = null;

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::_newFigureString
    private _newFigureString: string = '';

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Already-bound furniture skips the dialog entirely: the outfit is applied straight away,
     * because the player has redeemed this one before.
     */
    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::open()
    public open(objectId: number): void
    {
        const handler = this._widget?.handler ?? null;
        const container = handler?.container ?? null;
        const roomId = container?.roomSession?.roomId ?? 0;
        const roomObject = container?.roomEngine?.getRoomObject(
            roomId, objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        ) ?? null;

        if(roomObject === null) return;

        this._furniData = (handler?.getFurniData(roomObject) ?? null) as typeof this._furniData;
        this._objectId = roomObject.getId();

        if(this._furniData === null) return;

        let content = PurchasableClothingConfirmationView.PRODUCT_PAGE_UNKNOWN;
        const figureSetIds: number[] = [];

        const renderManager = container?.avatarRenderManager ?? null;
        const gender = container?.sessionDataManager?.gender ?? '';

        if(this._furniData.category - PurchasableClothingConfirmationView.CATEGORY_OFFSET === 0)
        {
            content = PurchasableClothingConfirmationView.PRODUCT_PAGE_CLOTHING;

            for(const raw of (this._furniData.customParams ?? '').split(','))
            {
                const setId = parseInt(raw, 10);

                if(!isNaN(setId) && (renderManager?.isValidFigureSetForGender(setId, gender) ?? false))
                {
                    figureSetIds.push(setId);
                }
            }
        }
        else
        {
            log.warn(`[PurchasableClothingConfirmationView.open()] Unsupported furniture category: ${this._furniData.category}`);
        }

        this._newFigureString = renderManager?.getFigureStringWithFigureIds(
            container?.sessionDataManager?.figure ?? '', gender, figureSetIds
        ) ?? '';

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/PurchasableClothingConfirmationView.as::open()
        // asks `container.inventory.hasBoundFigureSetFurniture(className)` first and, when the
        // furni is already bound, sends `UpdateFigureData` immediately instead of opening this
        // dialog. `IHabboInventory` has no such member in this port, so the dialog always
        // opens — one extra confirmation for an outfit the player already owns, never a wrong
        // outfit.
        this.setWindowContent(content);

        if(this._window !== null)
        {
            this._window.visible = true;
        }
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::setWindowContent()
    private setWindowContent(content: number): void
    {
        const localizations = this._widget?.localizations ?? null;
        const productName = this._furniData?.localizedName ?? '';

        localizations?.registerParameter('useproduct.widget.title.bind_clothing', 'name', productName);

        if(this._window === null)
        {
            // Shares the seed dialog's frame — AS3 names that same asset here.
            this._window = this.buildLayout('use_product_widget_frame_plant_seed_xml');

            if(this._window === null) return;

            this.addClickListener('header_button_close');
            this._window.center();
        }

        this._window.caption = '${useproduct.widget.title.bind_clothing}';

        localizations?.registerParameter('useproduct.widget.text.bind_clothing', 'productName', productName);

        (this._window as unknown as IFrameWindow).content?.removeChildAt(0);

        const contentWindow = this.createWindow(content);

        if(contentWindow === null) return;

        (this._window as unknown as IFrameWindow).content?.addChild(contentWindow);

        if(content !== PurchasableClothingConfirmationView.PRODUCT_PAGE_CLOTHING)
        {
            throw new Error(`Invalid type for use product confirmation content apply: ${content}`);
        }

        this.addClickListener('save_button');
        this.addClickListener('cancel_text');

        this.refreshAvatar();

        this._window.invalidate();
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::createWindow()
    private createWindow(content: number): IWindowContainer | null
    {
        if(content !== PurchasableClothingConfirmationView.PRODUCT_PAGE_CLOTHING)
        {
            throw new Error(`Invalid type for view content creation: ${content}`);
        }

        return this.buildLayout('use_product_controller_purchasable_clothing_xml');
    }

    /** TS-only: the asset lookup + buildFromXML pair both layouts go through. */
    private buildLayout(assetName: string): IWindowContainer | null
    {
        const asset = this._assets?.getAssetByName(assetName) as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn(`Missing layout "${assetName}" - the clothing confirmation cannot open`);

            return null;
        }

        return this._windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;
    }

    /**
     * TODO(AS3): AS3 reaches into the layout's `avatar_preview` window, casts its `widget` to
     * the window-system's avatar widget and assigns `figure = _newFigureString`. This port has
     * no avatar widget behind a window (`habbo/window/widgets` is unported), so the preview
     * pane stays empty and the composed figure is only used by the redeem below.
     */
    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::refreshAvatar()
    private refreshAvatar(): void
    {
        if(this._window?.findChildByName('avatar_preview') == null)
        {
            log.debug('No avatar_preview in the layout - nothing to refresh');
        }
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::close()
    public close(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::addClickListener()
    private addClickListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseClick);
    }

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::onMouseClick()
    private onMouseClick = (event: WindowMouseEvent): void =>
    {
        const name = (event.target as {name?: string} | null)?.name ?? '';

        switch(name)
        {
            case 'header_button_close':
            case 'cancel_text':
            case 'ok_button':
                this.close();
                break;
            case 'save_button':
                this._widget?.handler?.redeemPurchasableClothing(
                    this._objectId,
                    this._furniData?.className ?? '',
                    this._newFigureString,
                    this._widget?.handler?.container?.sessionDataManager?.gender ?? ''
                );

                this.close();
                break;
        }
    };

    // AS3: .../contextmenu/PurchasableClothingConfirmationView.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
    }
}
