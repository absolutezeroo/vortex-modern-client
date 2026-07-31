import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {Util} from './Util';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.AlertView');

/**
 * AlertView
 *
 * Base for the friend list's modal dialogs — remove-friend, room-invite. Loads its
 * layout by name, wires the close button, and centres itself on the friend list.
 *
 * One dialog per layout name is allowed at a time: `show()` disposes whatever is
 * already up under the same name before building a new one, through a table shared by
 * every subclass.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/AlertView.as
 */
export class AlertView implements IDisposable
{
    // AS3: .../AlertView.as::_SafeStr_6379
    private static readonly OPEN_ALERTS: Map<string, IFrameWindow> = new Map<string, IFrameWindow>();

    // AS3: .../AlertView.as::AlertView()
    constructor(friendList: HabboFriendList, xmlFileName: string, caption: string | null = null)
    {
        this._friendList = friendList;
        this._xmlFileName = xmlFileName;
        this._caption = caption;
    }

    // AS3: .../AlertView.as::_friendList
    private _friendList: HabboFriendList | null;

    // AS3: .../AlertView.as::get friendList()
    get friendList(): HabboFriendList
    {
        return this._friendList!;
    }

    // AS3: .../AlertView.as::_xmlFileName
    private _xmlFileName: string;

    // AS3: .../AlertView.as::_SafeStr_5263
    private _caption: string | null;

    // AS3: .../AlertView.as::_SafeStr_5328
    private _window: IFrameWindow | null = null;

    // AS3: .../AlertView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../AlertView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../AlertView.as::show()
    show(): void
    {
        const previous = AlertView.OPEN_ALERTS.get(this._xmlFileName) ?? null;

        if(previous !== null)
        {
            previous.dispose();
        }

        const window = this.getAlert();

        if(window === null)
        {
            return;
        }

        this._window = window;

        if(this._caption !== null)
        {
            window.caption = this._caption;
        }

        this.setupContent(window.content);

        const location = Util.getLocationRelativeTo(this._friendList?.view?.mainWindow ?? null, window.width, window.height);

        window.x = location.x;
        window.y = location.y;

        AlertView.OPEN_ALERTS.set(this._xmlFileName, window);
    }

    /** Filled in by subclasses; the base dialog has nothing but its close button. */
    // AS3: .../AlertView.as::setupContent()
    protected setupContent(_content: IWindowContainer): void
    {
        // Intentionally empty - see AS3.
    }

    // AS3: .../AlertView.as::onClose()
    protected onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this.dispose();
    };

    // AS3: .../AlertView.as::getAlert()
    private getAlert(): IFrameWindow | null
    {
        const window = this._friendList?.getXmlWindow(this._xmlFileName) as IFrameWindow | null;

        if(window == null)
        {
            logger.error(`getAlert: getXmlWindow("${this._xmlFileName}") returned null - layout not registered?`);

            return null;
        }

        const closeButton = window.findChildByTag('close');

        if(closeButton !== null)
        {
            closeButton.procedure = this.onClose;
        }

        return window;
    }

    // AS3: .../AlertView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;

        if(this._window !== null)
        {
            this._window.destroy();
            this._window = null;
        }

        this._friendList = null;
    }
}
