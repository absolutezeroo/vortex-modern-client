/**
 * MysteryTrophyOpenDialogView — the engraving prompt for a mystery trophy.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/mysterytrophy/MysteryTrophyOpenDialogView.as
 *
 * Owner-only (the handler gates it). Unlike the mystery box, nothing here waits on the server:
 * the OK button sends the inscription and the dialog closes.
 *
 * The window is built once and then hidden/shown rather than disposed, so a reopened dialog keeps
 * whatever the user had typed — AS3 behaviour, kept.
 */
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {OpenMysteryTrophyMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/OpenMysteryTrophyMessageComposer';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.mysterytrophy.MysteryTrophyOpenDialogView');

export class MysteryTrophyOpenDialogView
{
    // AS3: MysteryTrophyOpenDialogView.as::_SafeStr_10490 / _SafeStr_10615 / _SafeStr_10470
    private static readonly BUTTON_CLOSE: string = 'header_button_close';

    private static readonly BUTTON_CANCEL: string = 'cancel';

    private static readonly BUTTON_OK: string = 'ok';

    // AS3: .../src/com/sulake/habbo/ui/widget/furniture/mysterytrophy/MysteryTrophyOpenDialogView.as::_disposed
    private _disposed: boolean = false;

    // AS3: MysteryTrophyOpenDialogView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: MysteryTrophyOpenDialogView.as::_SafeStr_4549 (the widget)
    private _widget: FurnitureContextMenuWidget | null;

    // AS3: MysteryTrophyOpenDialogView.as::_SafeStr_7499 (the trophy's object id)
    private _objectId: number = -1;

    // AS3: MysteryTrophyOpenDialogView.as::MysteryTrophyOpenDialogView()
    constructor(widget: FurnitureContextMenuWidget)
    {
        this._widget = widget;
    }

    // AS3: MysteryTrophyOpenDialogView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: MysteryTrophyOpenDialogView.as::open()
    public open(objectId: number): void
    {
        this._objectId = objectId;

        this.setWindowContent();

        if(this._window !== null) this._window.visible = true;
    }

    // AS3: MysteryTrophyOpenDialogView.as::setWindowContent()
    private setWindowContent(): void
    {
        if(this._window !== null) return;

        const windowManager = this._widget?.windowManager;

        if(!windowManager) return;

        this._window = windowManager.buildWidgetLayout('mysterytrophy_xml') as IWindowContainer | null;

        if(this._window === null)
        {
            log.warn('mysterytrophy_xml layout missing — trophy dialog not shown');

            return;
        }

        this.addClickListener(MysteryTrophyOpenDialogView.BUTTON_OK);
        this.addClickListener(MysteryTrophyOpenDialogView.BUTTON_CANCEL);
        this.addClickListener(MysteryTrophyOpenDialogView.BUTTON_CLOSE);

        this._window.center();
    }

    // AS3: MysteryTrophyOpenDialogView.as::close()
    public close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    // AS3: MysteryTrophyOpenDialogView.as::addClickListener()
    private addClickListener(name: string): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.procedure = this.onMouseClick;
    }

    // AS3: MysteryTrophyOpenDialogView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case MysteryTrophyOpenDialogView.BUTTON_CLOSE:
            case MysteryTrophyOpenDialogView.BUTTON_CANCEL:
                this.close();
                break;
            case MysteryTrophyOpenDialogView.BUTTON_OK:
                this.connection?.send(new OpenMysteryTrophyMessageComposer(
                    this._objectId, this.getTrophyInscription() ?? ''
                ));
                this.close();
                break;
        }
    };

    // AS3: MysteryTrophyOpenDialogView.as::getTrophyInscription()
    private getTrophyInscription(): string | null
    {
        const input = this._window?.findChildByName('input') as ITextFieldWindow | null;

        return input ? input.text : null;
    }

    // AS3: MysteryTrophyOpenDialogView.as::get connection()
    private get connection(): IConnection | null
    {
        return this._widget?.handler?.container?.connection ?? null;
    }

    // AS3: MysteryTrophyOpenDialogView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._widget = null;
    }
}
