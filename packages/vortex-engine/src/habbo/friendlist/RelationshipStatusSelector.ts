import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {RelationshipStatusEnum} from './RelationshipStatusEnum';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.RelationshipStatusSelector');

/**
 * RelationshipStatusSelector
 *
 * The four-icon popup that sets a friend's relationship status. One instance is built
 * per friends tab and reused: it is hidden rather than destroyed, and each opening
 * only moves it and re-points `friendId`.
 *
 * It closes on losing focus (`WE_UNFOCUSED`) as well as on a pick, which is what makes
 * clicking anywhere else dismiss it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/RelationshipStatusSelector.as
 */
export class RelationshipStatusSelector implements IDisposable
{
    // AS3: .../RelationshipStatusSelector.as::RelationshipStatusSelector()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;

        this.createWindow();
    }

    // AS3: .../RelationshipStatusSelector.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../RelationshipStatusSelector.as::_window
    private _window: IWindow | null = null;

    // AS3: .../RelationshipStatusSelector.as::_SafeStr_7252
    private _friendId: number = 0;

    // AS3: .../RelationshipStatusSelector.as::set friendId()
    set friendId(value: number)
    {
        this._friendId = value;
    }

    // AS3: .../RelationshipStatusSelector.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../RelationshipStatusSelector.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Opens over `anchor`, in desktop coordinates — the popup is not a child of the
     * friend list, so the anchor's global position is what it is placed at.
     */
    // AS3: .../RelationshipStatusSelector.as::appearAt()
    appearAt(anchor: IWindow, _parent: IWindow | null): void
    {
        if(this._window === null)
        {
            return;
        }

        const position = {x: 0, y: 0};

        anchor.getGlobalPosition(position);

        this._window.x = position.x;
        this._window.y = position.y;
        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../RelationshipStatusSelector.as::disappear()
    disappear(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    // AS3: .../RelationshipStatusSelector.as::createWindow()
    private createWindow(): void
    {
        const window = this._friendList.getXmlWindow('relationship_chooser');

        if(window === null)
        {
            logger.error('createWindow: getXmlWindow("relationship_chooser") returned null - layout not registered?');

            return;
        }

        this._window = window;
        this._window.procedure = this.onWindowEvent;
        this._window.visible = false;
    }

    // AS3: .../RelationshipStatusSelector.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            switch(window.name)
            {
                case 'item_none':
                    this._friendList.setRelationshipStatus(this._friendId, RelationshipStatusEnum.NONE);
                    break;
                case 'item_heart':
                    this._friendList.setRelationshipStatus(this._friendId, RelationshipStatusEnum.HEART);
                    break;
                case 'item_smile':
                    this._friendList.setRelationshipStatus(this._friendId, RelationshipStatusEnum.SMILE);
                    break;
                case 'item_bobba':
                    this._friendList.setRelationshipStatus(this._friendId, RelationshipStatusEnum.BOBBA);
                    break;
            }

            if(this._window !== null)
            {
                this._window.visible = false;
            }
        }

        if(event.type === 'WE_UNFOCUSED' && this._window !== null)
        {
            this._window.visible = false;
        }
    };

    // AS3: .../RelationshipStatusSelector.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.destroyWindow();
        this._disposed = true;
    }

    // AS3: .../RelationshipStatusSelector.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
