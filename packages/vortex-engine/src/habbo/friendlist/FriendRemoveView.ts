import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {RemoveFriendMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/RemoveFriendMessageComposer';
import {AlertView} from './AlertView';
import {Util} from './Util';
import type {Friend} from './domain/Friend';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.FriendRemoveView');

/**
 * FriendRemoveView
 *
 * "Remove these friends?" — the selection is captured when the dialog is constructed,
 * not when OK is pressed, so a list refresh behind the dialog cannot change what it
 * removes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/FriendRemoveView.as
 */
export class FriendRemoveView extends AlertView
{
    // AS3: .../FriendRemoveView.as::FriendRemoveView()
    constructor(friendList: HabboFriendList)
    {
        super(friendList, 'friend_remove_confirm');

        this._selected = friendList.categories?.getSelectedFriends() ?? [];
    }

    // AS3: .../FriendRemoveView.as::_selected
    private _selected: Friend[] | null;

    // AS3: .../FriendRemoveView.as::setupContent()
    protected override setupContent(content: IWindowContainer): void
    {
        const cancel = content.findChildByName('cancel');
        const ok = content.findChildByName('ok');

        if(cancel !== null)
        {
            cancel.procedure = this.onClose;
        }

        if(ok !== null)
        {
            ok.procedure = this.onRemove;
        }

        const names: string[] = [];

        for(const friend of this._selected ?? [])
        {
            names.push(friend.name);
        }

        this.friendList.registerParameter('friendlist.removefriendconfirm.userlist', 'user_names', Util.arrayToString(names));
    }

    // AS3: .../FriendRemoveView.as::onRemove()
    private onRemove = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Remove Ok clicked');

        const friendIds: number[] = [];

        for(const friend of this._selected ?? [])
        {
            friendIds.push(friend.id);
        }

        this.friendList.send(new RemoveFriendMessageComposer(...friendIds));
        this.dispose();
    };

    // AS3: .../FriendRemoveView.as::dispose()
    override dispose(): void
    {
        this._selected = null;

        super.dispose();
    }
}
