import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {DoorbellWidget} from './DoorbellWidget';

const log = Logger.getLogger('habbo.ui.widget.doorbell.DoorbellView');

/**
 * The list of people waiting at the door, one row each with an accept and a deny button.
 *
 * The window is built on first use and **destroyed** whenever the list empties, so an empty
 * doorbell leaves nothing on screen — `update()` is the only entry point and it decides which.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/doorbell/DoorbellView.as
 */
export class DoorbellView
{
    // AS3: .../DoorbellView.as::_widget
    private _widget: DoorbellWidget | null;

    // AS3: .../DoorbellView.as::_frame
    private _frame: IWindowContainer | null = null;

    // AS3: .../DoorbellView.as::_userList
    // Name DERIVED (`_SafeStr_4652`): the `user_list` item list inside the frame.
    private _userList: IItemListWindow | null = null;

    // AS3: .../DoorbellView.as::DoorbellView()
    constructor(widget: DoorbellWidget)
    {
        this._widget = widget;
    }

    // AS3: .../DoorbellView.as::get mainWindow()
    get mainWindow(): IWindow | null
    {
        return this._frame;
    }

    /**
     * AS3: .../DoorbellView.as::update()
     *
     * Rebuilds the whole list rather than diffing it — the list is at most 50 rows and a doorbell
     * changes rarely, so AS3 destroys and re-adds every time.
     */
    update(): void
    {
        if(this._widget === null) return;

        if(this._widget.users.length === 0)
        {
            this.hide();

            return;
        }

        if(this._frame === null) this.createMainWindow();

        if(this._frame === null) return;

        this._frame.visible = true;

        if(this._userList === null) return;

        this._userList.destroyListItems();

        for(let i = 0; i < this._widget.users.length; i++)
        {
            const item = this.createListItem(this._widget.users[i], i);

            if(item !== null) this._userList.addListItem(item);
        }
    }

    // AS3: .../DoorbellView.as::dispose()
    dispose(): void
    {
        this._userList = null;
        this._widget = null;

        if(this._frame !== null)
        {
            this._frame.dispose();
            this._frame = null;
        }
    }

    /**
     * AS3: .../DoorbellView.as::createListItem()
     *
     * The row's *window name* is the user name — that is how the button handler knows who was
     * accepted or denied, by reading its parent's name. Every other row is tinted.
     */
    private createListItem(userName: string, index: number): IWindow | null
    {
        const row = this._widget?.windowManager.buildWidgetLayout('doorbell_list_entry') as IWindowContainer | null;

        if(row === null || row === undefined)
        {
            // AS3 throws here; a missing layout is a build problem, not a runtime one, and
            // throwing would take the whole room UI down with it.
            log.warn('doorbell_list_entry did not build — that user cannot be shown');

            return null;
        }

        const nameText = row.findChildByName('user_name') as ITextWindow | null;

        if(nameText !== null) nameText.caption = userName;

        row.name = userName;

        if(index % 2 === 0) row.color = 4294967295;

        for(const buttonName of ['accept', 'deny'])
        {
            const button = row.findChildByName(buttonName);

            if(button !== null) button.addEventListener('WME_CLICK', this.onButtonClicked);
        }

        return row;
    }

    // AS3: .../DoorbellView.as::hide()
    // Disposed, not hidden: the next `update()` with users builds it again.
    private hide(): void
    {
        if(this._frame !== null)
        {
            this._frame.dispose();
            this._frame = null;
            this._userList = null;
        }
    }

    // AS3: .../DoorbellView.as::createMainWindow()
    private createMainWindow(): void
    {
        if(this._frame !== null) return;

        this._frame = this._widget?.windowManager.buildWidgetLayout('doorbell') as IWindowContainer | null;

        if(this._frame === null || this._frame === undefined)
        {
            log.warn('doorbell did not build — nobody at the door can be answered');
            this._frame = null;

            return;
        }

        this._userList = this._frame.findChildByName('user_list') as unknown as IItemListWindow | null;
        this._frame.visible = false;

        const close = this._frame.findChildByTag('close');

        if(close !== null) close.addEventListener('WME_CLICK', this.onClose);
    }

    // AS3: .../DoorbellView.as::onClose()
    // Closing the window is not "dismiss" — it denies everyone waiting.
    private onClose = (): void =>
    {
        this._widget?.denyAll();
    };

    // AS3: .../DoorbellView.as::onButtonClicked()
    private onButtonClicked = (_event: WindowEvent, window: IWindow): void =>
    {
        const userName = window.parent?.name ?? '';

        if(window.name === 'accept') this._widget?.accept(userName);
        else if(window.name === 'deny') this._widget?.deny(userName);
    };
}
