import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {Logger} from '@core/utils/Logger';
import {SendRoomInviteMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/SendRoomInviteMessageComposer';
import {AlertView} from './AlertView';
import type {Friend} from './domain/Friend';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.RoomInviteView');

/**
 * RoomInviteView
 *
 * "Come to my room" — one message, sent to every selected friend at once.
 *
 * The message box is capped at 120 characters by truncating on each key rather than
 * by a maxlength on the field, so a paste is clipped too.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/RoomInviteView.as
 */
export class RoomInviteView extends AlertView
{
    // AS3: .../RoomInviteView.as::onMessageInput() local `_loc2_`
    private static readonly MAX_MESSAGE_LENGTH: number = 120;

    // AS3: .../RoomInviteView.as::RoomInviteView()
    constructor(friendList: HabboFriendList)
    {
        super(friendList, 'room_invite_confirm');

        this._selected = friendList.categories?.getSelectedFriends() ?? [];
    }

    // AS3: .../RoomInviteView.as::_selected
    private _selected: Friend[] | null;

    // AS3: .../RoomInviteView.as::_inputMessage
    private _inputMessage: ITextFieldWindow | null = null;

    // AS3: .../RoomInviteView.as::setupContent()
    protected override setupContent(content: IWindowContainer): void
    {
        this.friendList.registerParameter('friendlist.invite.summary', 'count', `${this._selected?.length ?? 0}`);

        this._inputMessage = content.findChildByName('message_input') as ITextFieldWindow | null;

        if(this._inputMessage !== null)
        {
            (this._inputMessage as unknown as IWindow).addEventListener('WKE_KEY_DOWN', this.onMessageInput);
        }

        const cancel = content.findChildByName('cancel');
        const ok = content.findChildByName('ok');

        if(cancel !== null)
        {
            cancel.procedure = this.onClose;
        }

        if(ok !== null)
        {
            ok.procedure = this.onInvite;
        }
    }

    // AS3: .../RoomInviteView.as::onInvite()
    private onInvite = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Invite Ok clicked');

        this.sendMsg();
        this.dispose();
    };

    // AS3: .../RoomInviteView.as::onMessageInput()
    private onMessageInput = (event: WindowEvent): void =>
    {
        const keyboardEvent = event as WindowKeyboardEvent;

        if(this._inputMessage === null)
        {
            return;
        }

        if(keyboardEvent.charCode === 13)
        {
            this.sendMsg();
        }
        else
        {
            const text = this._inputMessage.text;

            if(text.length > RoomInviteView.MAX_MESSAGE_LENGTH)
            {
                this._inputMessage.text = text.substring(0, RoomInviteView.MAX_MESSAGE_LENGTH);
            }
        }
    };

    /**
     * Sending resets the invite cooldown the friends tab checks before it will open
     * this dialog again.
     */
    // AS3: .../RoomInviteView.as::sendMsg()
    private sendMsg(): void
    {
        const message = this._inputMessage?.text ?? '';

        logger.debug(`Send msg: ${message}`);

        if(message === '')
        {
            this.friendList.simpleAlert('${friendlist.invite.emptyalert.title}', '${friendlist.invite.emptyalert.text}');

            return;
        }

        const recipientIds: number[] = [];

        for(const friend of this._selected ?? [])
        {
            recipientIds.push(friend.id);
        }

        this.friendList.resetLastRoomInvitationTime();
        this.friendList.send(new SendRoomInviteMessageComposer(recipientIds, message));
        this.dispose();
    }

    // AS3: .../RoomInviteView.as::dispose()
    override dispose(): void
    {
        this._selected = null;
        this._inputMessage = null;

        super.dispose();
    }
}
