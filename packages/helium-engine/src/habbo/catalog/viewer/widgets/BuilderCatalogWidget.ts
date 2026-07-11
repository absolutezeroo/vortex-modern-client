import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {YouAreOwnerMessageEvent} from '@habbo/communication/messages/incoming/room/permissions/YouAreOwnerMessageEvent';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetRoomChangedEvent} from './events/CatalogWidgetRoomChangedEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

/**
 * Builders Club "place item" widget: shown only on builder-catalog pages, exposes
 * place-one/place-many buttons for the selected offer, disabled with an explanatory error
 * when the player currently can't place builder furniture (over the limit, not in a room,
 * not a controller, etc).
 *
 * TODO(AS3): the button-enabled state always reflects "placeable" (see
 * HabboCatalog.getBuilderFurniPlaceableStatusForOffer()'s own TODO) since room-session state
 * isn't wired into the catalog yet, and the actual place action
 * (HabboCatalog.requestSelectedItemToMover()) is itself a CatalogObjectMover-blocked stub -
 * so this widget renders and reacts correctly, but the buttons don't yet place furniture.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/BuilderCatalogWidget.as
 */
export class BuilderCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    private _offer: IPurchasableOffer | null = null;

    private _youAreOwnerEvent: YouAreOwnerMessageEvent;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
        this._youAreOwnerEvent = new YouAreOwnerMessageEvent(this.onYouAreOwner);
        this._catalog.connection?.addMessageEvent(this._youAreOwnerEvent);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._catalog?.connection?.removeMessageEvent(this._youAreOwnerEvent);
        this._catalog = null;
        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(CatalogWidgetRoomChangedEvent.CWE_ROOM_CHANGED, this.onRoomChanged);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        if(!this.page.isBuilderPage)
        {
            this.window.visible = false;

            return true;
        }

        this.attachWidgetView(CatalogWidgetName.BUILDER);
        this.updateButtons(false);
        this.window.procedure = this.windowProcedure;
        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(CatalogWidgetRoomChangedEvent.CWE_ROOM_CHANGED, this.onRoomChanged);

        return true;
    }

    private onRoomChanged = (_event: CatalogWidgetRoomChangedEvent): void =>
    {
        this.updateButtons(false);
    };

    private onYouAreOwner = (_event: IMessageEvent): void =>
    {
        if(!this.page.isBuilderPage) return;

        this.updateButtons(true);
    };

    private windowProcedure = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(event.target?.name)
        {
            case 'place_one':
                this._catalog?.requestSelectedItemToMover(null, this._offer!);
                break;
            case 'place_many':
                this._catalog?.requestSelectedItemToMover(null, this._offer!, true);
                break;
        }
    };

    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        this._offer = event.offer;
        this.updateButtons(false);
    };

    private updateButtons(ignoreGroupRoomStatus: boolean): void
    {
        if(!this.window || !this.window.visible) return;

        let status = this._catalog!.getBuilderFurniPlaceableStatusForOffer(this._offer);

        if(status === 4 && ignoreGroupRoomStatus) status = 0;

        const placeOne = this.window.findChildByName('place_one');
        const placeMany = this.window.findChildByName('place_many');
        const errorContainer = this.window.findChildByName('error_container');

        if(status === 0)
        {
            placeOne?.enable();
            placeMany?.enable();

            if(errorContainer) errorContainer.visible = false;

            return;
        }

        placeOne?.disable();
        placeMany?.disable();

        if(errorContainer) errorContainer.visible = true;

        const errorIcon = this.window.findChildByName('error_icon') as unknown as IStaticBitmapWrapperWindow | null;
        const errorMessage = this.window.findChildByName('error_message');

        switch(status - 1)
        {
            case 0:
                if(errorContainer) errorContainer.visible = false;
                break;
            case 1:
                if(errorIcon) errorIcon.assetUri = 'icons_builder_error_furnilimit';
                if(errorMessage) errorMessage.caption = '${builder.placement_widget.error.limit_reached}';
                break;
            case 2:
                if(errorIcon) errorIcon.assetUri = 'icons_builder_error_notroom';
                if(errorMessage) errorMessage.caption = '${builder.placement_widget.error.not_in_room}';
                break;
            case 3:
                if(errorIcon) errorIcon.assetUri = 'icons_builder_error_room';
                if(errorMessage) errorMessage.caption = '${builder.placement_widget.error.not_group_admin}';
                break;
            case 4:
                if(errorIcon) errorIcon.assetUri = 'icons_builder_error_grouproom';
                if(errorMessage) errorMessage.caption = '${builder.placement_widget.error.group_room}';
                break;
            case 5:
                if(errorIcon) errorIcon.assetUri = 'icons_builder_error_userinroom';
                if(errorMessage) errorMessage.caption = '${builder.placement_widget.error.visitors}';
                break;
        }
    }
}
