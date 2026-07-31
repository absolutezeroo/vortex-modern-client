import type {IWindowContainer} from '@core/window/IWindowContainer';
import {Logger} from '@core/utils/Logger';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.OpenedToWebPopup');

/**
 * OpenedToWebPopup
 *
 * The little "opened in your browser" bubble shown at the cursor whenever the friend
 * list hands something off to a web page. It closes itself after two seconds, and a
 * second popup replaces the first rather than stacking.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/OpenedToWebPopup.as
 */
export class OpenedToWebPopup
{
    // AS3: .../OpenedToWebPopup.as::show() `new Timer(2000,1)`
    private static readonly DISPLAY_TIME: number = 2000;

    // AS3: .../OpenedToWebPopup.as::OpenedToWebPopup()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../OpenedToWebPopup.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../OpenedToWebPopup.as::_SafeStr_5328
    private _window: IWindowContainer | null = null;

    // AS3: .../OpenedToWebPopup.as::_SafeStr_4902
    private _timer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../OpenedToWebPopup.as::show()
    show(x: number, y: number): void
    {
        if(this._window !== null)
        {
            this.close();
        }

        this._window = this.getOpenedToWebAlert();

        if(this._timer !== null)
        {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => this.close(), OpenedToWebPopup.DISPLAY_TIME);

        if(this._window !== null)
        {
            this._window.x = x;
            this._window.y = y;
        }
    }

    // AS3: .../OpenedToWebPopup.as::close()
    private close(): void
    {
        this._timer = null;

        if(this._window !== null)
        {
            this._window.destroy();
            this._window = null;
        }
    }

    // AS3: .../OpenedToWebPopup.as::getOpenedToWebAlert()
    private getOpenedToWebAlert(): IWindowContainer | null
    {
        const window = this._friendList.getXmlWindow('opened_to_web_popup') as IWindowContainer | null;

        if(window === null)
        {
            logger.error('getOpenedToWebAlert: getXmlWindow("opened_to_web_popup") returned null - layout not registered?');

            return null;
        }

        this._friendList.refreshButton(window, 'opened_to_web', true, null, 0);

        return window;
    }
}
