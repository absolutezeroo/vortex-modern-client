/**
 * SendMsgsCtrl — "send this user a message": a template picker over a free-text field.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/SendMsgsCtrl.as
 *
 * The templates come from the moderator init packet (`initMsg.messageTemplates`), which is also the
 * list the drop-down is populated from by index — picking entry *n* copies `messageTemplates[n]`
 * into the field verbatim.
 *
 * **The field starts holding placeholder text that is not a real message.** `_placeHolderMessage`
 * tracks that: focusing the field clears it, picking a template replaces it, and until one of those
 * happens the send button refuses and shows an alert. That is why the guard tests the flag *and*
 * the empty string — a moderator who focused the field and typed nothing gets the same refusal.
 *
 * The window is tracked under `WindowTracker.TYPE_SENDMSGS`, keyed by the target's **name**, so a
 * second "message" click on the same user re-uses the open window rather than stacking one.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {
    ModMessageMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ModMessageMessageComposer';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.SendMsgsCtrl');

export class SendMsgsCtrl implements IDisposable, ITrackedWindow
{
    /**
     * AS3 declares this and then passes the bare literal `-999` at the send site rather than the
     * constant. Same value; the named form is used here.
     */
    // AS3: SendMsgsCtrl.as::TOPIC_ID_NOT_SELECTED
    private static readonly TOPIC_ID_NOT_SELECTED: number = -999;

    /** AS3's `-1` for "this message is not attached to an issue" — the composer then omits it. */
    // AS3: SendMsgsCtrl.as::onSendMessageButton()
    private static readonly NO_ISSUE_ID: number = -1;

    // AS3: SendMsgsCtrl.as::_main
    private _main: ModerationManager | null;

    /** Derived name — `_SafeStr_5301`: the user the message goes to. */
    // AS3: SendMsgsCtrl.as::_SafeStr_5301
    private _targetUserId: number;

    // AS3: SendMsgsCtrl.as::_targetUserName
    private _targetUserName: string;

    /** Derived name — `_SafeStr_7643`: the issue this was opened from, if any. */
    // AS3: SendMsgsCtrl.as::_SafeStr_7643
    private _issue: IssueInfoData | null;

    // AS3: SendMsgsCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    // AS3: SendMsgsCtrl.as::_msgSelect
    private _msgSelect: IDropMenuWindow | null = null;

    /** Derived name — `_SafeStr_5389`: the message field. */
    // AS3: SendMsgsCtrl.as::_SafeStr_5389
    private _messageInput: ITextFieldWindow | null = null;

    // AS3: SendMsgsCtrl.as::_disposed
    private _disposed: boolean = false;

    /** True while the field still holds the layout's placeholder rather than a typed message. */
    // AS3: SendMsgsCtrl.as::_placeHolderMessage
    private _placeHolderMessage: boolean = true;

    // AS3: SendMsgsCtrl.as::SendMsgsCtrl()
    constructor(
        main: ModerationManager, targetUserId: number, targetUserName: string, issue: IssueInfoData | null
    )
    {
        this._main = main;
        this._targetUserId = targetUserId;
        this._targetUserName = targetUserName;
        this._issue = issue;
    }

    // AS3: SendMsgsCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SendMsgsCtrl.as::show()
    public show(): void
    {
        this._frame = this._main?.getXmlWindow('send_msgs') as unknown as IFrameWindow | null;

        if(this._frame === null) return;

        const frame = this._frame as unknown as IWindow;

        frame.caption = `Msg To: ${this._targetUserName}`;

        const sendButton = this._frame.findChildByName('send_message_but');

        if(sendButton !== null) sendButton.procedure = this.onSendMessageButton;

        this._messageInput = this._frame.findChildByName('message_input') as ITextFieldWindow | null;

        if(this._messageInput !== null)
        {
            (this._messageInput as unknown as IWindow).procedure = this.onInputClick;
        }

        this._msgSelect = this._frame.findChildByName('msgTemplatesSelect') as unknown as IDropMenuWindow | null;

        if(this._msgSelect !== null)
        {
            this.prepareMessageSelection(this._msgSelect);

            (this._msgSelect as unknown as IWindow).procedure = this.onSelectTemplate;
        }

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;

        frame.visible = true;
    }

    // AS3: SendMsgsCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_SENDMSGS;
    }

    // AS3: SendMsgsCtrl.as::getId()
    public getId(): string
    {
        return this._targetUserName;
    }

    // AS3: SendMsgsCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    // AS3: SendMsgsCtrl.as::prepareMessageSelection()
    private prepareMessageSelection(select: IDropMenuWindow): void
    {
        const templates = this._main?.initMsg?.messageTemplates ?? [];

        log.debug(`MSG TEMPLATES: ${templates.length}`);

        select.populate(templates);
    }

    /** The drop-down reports its choice as an index into the same `messageTemplates` array. */
    // AS3: SendMsgsCtrl.as::onSelectTemplate()
    private onSelectTemplate = (event: WindowEvent): void =>
    {
        if(event.type !== 'WE_SELECTED') return;

        const templates = this._main?.initMsg?.messageTemplates ?? [];
        const template = templates[this._msgSelect?.selection ?? -1] ?? null;

        if(template === null) return;

        this._placeHolderMessage = false;

        if(this._messageInput !== null) this._messageInput.text = template;
    };

    // AS3: SendMsgsCtrl.as::onSendMessageButton()
    private onSendMessageButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const message = this._messageInput?.text ?? '';

        if(this._placeHolderMessage || message === '')
        {
            this._main?.windowManager?.alert(
                'Alert', 'You must input a message to the user', 0, SendMsgsCtrl.onAlertClose
            );

            return;
        }

        log.debug('Sending message...');

        this._main?.connection?.send(new ModMessageMessageComposer(
            this._targetUserId,
            message,
            SendMsgsCtrl.TOPIC_ID_NOT_SELECTED,
            this._issue !== null ? this._issue.issueId : SendMsgsCtrl.NO_ISSUE_ID
        ));

        this.dispose();
    };

    // AS3: SendMsgsCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    /** Focusing the field is what clears the placeholder — nothing else does. */
    // AS3: SendMsgsCtrl.as::onInputClick()
    private onInputClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WE_FOCUSED') return;
        if(!this._placeHolderMessage) return;

        if(this._messageInput !== null) this._messageInput.text = '';

        this._placeHolderMessage = false;
    };

    // AS3: SendMsgsCtrl.as::onAlertClose()
    private static onAlertClose = (dialog: IDisposable): void =>
    {
        dialog.dispose();
    };

    // AS3: SendMsgsCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        this._msgSelect = null;
        this._messageInput = null;
        this._main = null;
    }
}
