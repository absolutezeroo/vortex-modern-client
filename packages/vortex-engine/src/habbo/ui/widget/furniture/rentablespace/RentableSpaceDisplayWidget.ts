import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {RentableSpaceWidgetHandler} from '@habbo/ui/handler/RentableSpaceWidgetHandler';

/**
 * The rent dialog on a rentable space: rent it, see who has it and for how long, or give it up.
 *
 * The layout holds all three states as sibling views (`rent_view`, `rented_view`, `error_view`)
 * and the widget shows exactly one at a time — it never rebuilds the window, it only flips
 * visibility.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as
 */
export class RentableSpaceDisplayWidget extends RoomWidgetBase
{
    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::errorCodesToMessages
     *
     * A `Dictionary` in AS3, filled by static initialisers directly after the declaration. The
     * codes are the server's; 200 is looked up twice — once as the server's own answer, and once
     * by the widget itself when the price exceeds the player's credits.
     */
    private static readonly ERROR_CODES_TO_MESSAGES: Map<number, string> = new Map([
        [100, '${rentablespace.widget.error_reason_already_rented}'],
        [101, '${rentablespace.widget.error_reason_not_rented}'],
        [102, '${rentablespace.widget.error_reason_not_rented_by_you}'],
        [103, '${rentablespace.widget.error_reason_can_rent_only_one_space}'],
        [200, '${rentablespace.widget.error_reason_not_enough_credits}'],
        [201, '${rentablespace.widget.error_reason_not_enough_duckets}'],
        [202, '${rentablespace.widget.error_reason_no_permission}'],
        [203, '${rentablespace.widget.error_reason_no_habboclub}'],
        [300, '${rentablespace.widget.error_reason_disabled}'],
        [400, '${rentablespace.widget.error_reason_generic}'],
    ]);

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::_roomObject
    private _roomObject: IRoomObject | null = null;

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::RentableSpaceDisplayWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this.windowProcedure = this.windowProcedure.bind(this);

        this.ownHandler.widget = this;
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::get ownHandler()
     *
     * The base class's handler, narrowed — every call below needs the rent-specific members.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::get ownHandler()
    private get ownHandler(): RentableSpaceWidgetHandler
    {
        return this._handler as unknown as RentableSpaceWidgetHandler;
    }

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::get mainWindow()
    public override get mainWindow(): IWindow | null
    {
        return this._window as unknown as IWindow | null;
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::show()
     *
     * Does not build anything — the window appears only once the status answer arrives in
     * `populateRentInfo()`.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::show()
    public show(roomObject: IRoomObject): void
    {
        this._roomObject = roomObject;
        this.updateWidgetState();
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::hide()
     *
     * Ignores a request aimed at a different object, which is how a close event for some other
     * furniture leaves this dialog alone.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::hide()
    public hide(roomObject: IRoomObject | null): void
    {
        if(this._roomObject !== roomObject)
        {
            return;
        }

        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._roomObject = null;
    }

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::updateWidgetState()
    public updateWidgetState(): void
    {
        if(this._roomObject == null)
        {
            return;
        }

        this.ownHandler.getRentableSpaceStatus(this._roomObject.getId());
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::populateRentInfo()
     *
     * The rent branch decides between three captions: the server's refusal, the widget's own
     * "not enough credits", or no error at all — and only that last case enables the button.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::populateRentInfo()
    public populateRentInfo(
        rented: boolean,
        canRent: boolean,
        canRentErrorCode: number,
        _renterId: number,
        renterName: string,
        timeRemaining: number,
        price: number
    ): void
    {
        if(this._roomObject == null)
        {
            return;
        }

        const window = this.createWindow();

        if(!window) return;

        if(rented)
        {
            this.setVisible(window, 'rent_view', false);
            this.setVisible(window, 'error_view', false);
            this.setVisible(window, 'rented_view', true);

            this.setCaption(window, 'renter_name', renterName);
            this.setCaption(
                window, 'time_remaining_label',
                FriendlyTime.getFriendlyTime(this.ownHandler.container?.localization ?? null, timeRemaining)
            );

            const cancelButton = window.findChildByName('cancel_rent_button');

            if(cancelButton)
            {
                const container = this.ownHandler.container;

                cancelButton.visible = (this._roomObject != null && container?.isOwnerOfFurniture(this._roomObject) === true)
                    || container?.sessionDataManager?.hasSecurity(5) === true;
            }

            (window.findChildByName('rented_view') as unknown as IItemListWindow | null)?.arrangeListItems();
        }
        else
        {
            this.setVisible(window, 'rented_view', false);
            this.setVisible(window, 'error_view', false);
            this.setVisible(window, 'rent_view', true);

            this.setCaption(window, 'price_label', price.toString() + ' x');

            const affordable = price <= this.ownHandler.getUsersCreditAmount();

            if(!canRent)
            {
                this.setCaption(
                    window, 'cant_rent_error',
                    RentableSpaceDisplayWidget.ERROR_CODES_TO_MESSAGES.get(canRentErrorCode) ?? ''
                );
            }
            else if(!affordable)
            {
                this.setCaption(
                    window, 'cant_rent_error',
                    RentableSpaceDisplayWidget.ERROR_CODES_TO_MESSAGES.get(200) ?? ''
                );
            }
            else
            {
                this.setVisible(window, 'cant_rent_error', false);
                window.findChildByName('rent_button')?.enable();
            }

            (window.findChildByName('rent_view') as unknown as IItemListWindow | null)?.arrangeListItems();
        }

        if(!window.visible)
        {
            window.visible = true;
        }
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::showErrorView()
     *
     * Assumes the window exists — AS3 does not null-check it, and in practice a rent failure can
     * only follow a rent button that only the built window has.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::showErrorView()
    public showErrorView(reason: number): void
    {
        if(!this._window) return;

        this.setVisible(this._window, 'rent_view', false);
        this.setVisible(this._window, 'rented_view', false);
        this.setVisible(this._window, 'error_view', true);

        this.setCaption(
            this._window, 'error_message',
            RentableSpaceDisplayWidget.ERROR_CODES_TO_MESSAGES.get(reason) ?? ''
        );
    }

    /**
     * AS3: .../rentablespace/RentableSpaceDisplayWidget.as::createWindow()
     *
     * AS3 returns void; the return value is a TS addition so the caller can act on the window
     * without re-reading a field TS has narrowed.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/rentablespace/RentableSpaceDisplayWidget.as::createWindow()
    private createWindow(): IWindowContainer | null
    {
        if(this._window != null)
        {
            return this._window;
        }

        this._window = this.windowManager.buildWidgetLayout('rentablespace_xml') as IWindowContainer | null;

        if(!this._window) return null;

        this._window.procedure = this.windowProcedure;
        this._window.center();

        this._window.findChildByName('rent_button')?.disable();
        this.setVisible(this._window, 'rented_view', false);
        this.setVisible(this._window, 'error_view', false);

        return this._window;
    }

    /** TS-only: the `findChildByName(...).visible = x` AS3 repeats at a dozen call sites. */
    private setVisible(window: IWindowContainer, name: string, visible: boolean): void
    {
        const child = window.findChildByName(name);

        if(child)
        {
            child.visible = visible;
        }
    }

    /** TS-only: the `findChildByName(...).caption = x` AS3 repeats at a dozen call sites. */
    private setCaption(window: IWindowContainer, name: string, caption: string): void
    {
        const child = window.findChildByName(name);

        if(child)
        {
            child.caption = caption;
        }
    }

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::windowProcedure()
    private windowProcedure(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'header_button_close':
            case 'error_button_close':
                this.hide(this._roomObject);
                break;
            case 'rent_button':
                if(this._roomObject)
                {
                    this.ownHandler.rentSpace(this._roomObject.getId());
                }
                break;
            case 'cancel_rent_button':
                if(this._roomObject)
                {
                    this.ownHandler.cancelRent(this._roomObject.getId());
                }
        }
    }

    // AS3: .../rentablespace/RentableSpaceDisplayWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this.hide(this._roomObject);

        super.dispose();
    }
}
