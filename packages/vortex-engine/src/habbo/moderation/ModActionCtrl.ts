/**
 * ModActionCtrl — "sanction this user": a CFH topic, a sanction type, and a message.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/ModActionCtrl.as
 *
 * **The twelve sanctions are hard-coded in the client, not sent by the server**, and built once into
 * a static table on first construction. `actionType` is what decides which of six composers the
 * custom button sends; `sanctionTypeId` and `actionLengthHours` only matter to the ban and
 * trading-lock branches.
 *
 * Two independent paths out of this window:
 *
 * - **Default sanction** — the server was asked what it would give for the selected topic
 *   (`requestSanctionDataForAccount`), answered through `showDefaultSanction()`, and the button
 *   stays disabled until it does. One composer, no client-side choice.
 * - **Custom sanction** — the moderator picks the sanction themselves, and each branch re-checks the
 *   permission flags from the moderator init packet before sending.
 *
 * Selecting a topic also *pre-selects* a sanction, via the `cfh.topic_id.to.sanction_type_id`
 * hotel property (a `topic=action` comma list, parsed once into a static map). Topic `0` is the
 * fallback entry; with neither, the sanction drop-down is cleared to `-1`.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {StringUtil} from '@habbo/utils/StringUtil';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import {
    DefaultSanctionMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/DefaultSanctionMessageComposer';
import {ModAlertMessageComposer} from '@habbo/communication/messages/outgoing/moderation/ModAlertMessageComposer';
import {ModBanMessageComposer} from '@habbo/communication/messages/outgoing/moderation/ModBanMessageComposer';
import {ModKickMessageComposer} from '@habbo/communication/messages/outgoing/moderation/ModKickMessageComposer';
import {
    ModMessageMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ModMessageMessageComposer';
import {ModMuteMessageComposer} from '@habbo/communication/messages/outgoing/moderation/ModMuteMessageComposer';
import {
    ModTradingLockMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ModTradingLockMessageComposer';
import type {IDisposable as IAlertDisposable} from '@core/runtime/IDisposable';
import type {ITrackedWindow} from './ITrackedWindow';
import {ModActionDefinition} from './ModActionDefinition';
import type {ModerationManager} from './ModerationManager';
import type {UserInfoCtrl} from './UserInfoCtrl';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.ModActionCtrl');

export class ModActionCtrl implements IDisposable, ITrackedWindow
{
    /** `actionType` values, one per composer branch — AS3 switches on `actionType - 1`. */
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_ALERT: number = 1;
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_MUTE: number = 2;
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_BAN: number = 3;
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_KICK: number = 4;
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_TRADING_LOCK: number = 5;
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly ACTION_TYPE_MESSAGE: number = 6;

    /** The one sanction whose ban applies to the avatar only — matched by `actionId`, not type. */
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private static readonly AVATAR_ONLY_BAN_ACTION_ID: number = 106;

    /** AS3's fallback topic in `cfh.topic_id.to.sanction_type_id`. */
    // AS3: ModActionCtrl.as::refreshSanctionDataForSelectedTopic()
    private static readonly FALLBACK_TOPIC_ID: number = 0;

    // AS3: ModActionCtrl.as::getIssueId()
    private static readonly NO_ISSUE_ID: number = -1;

    /** Derived name — `_SafeStr_4849`: built once, shared by every window. */
    // AS3: ModActionCtrl.as::_SafeStr_4849
    private static _actionDefinitions: ModActionDefinition[] | null = null;

    /** Derived name — `_SafeStr_7209`: topic id → action id, parsed once from the hotel property. */
    // AS3: ModActionCtrl.as::_SafeStr_7209
    private static _topicToSanctionType: Map<number, number> | null = null;

    // AS3: ModActionCtrl.as::_main
    private _main: ModerationManager | null;

    /** Derived name — `_SafeStr_5301`. */
    // AS3: ModActionCtrl.as::_SafeStr_5301
    private _targetUserId: number;

    // AS3: ModActionCtrl.as::_targetUserName
    private _targetUserName: string;

    /** Derived name — `_SafeStr_7643`. */
    // AS3: ModActionCtrl.as::_SafeStr_7643
    private _issue: IssueInfoData | null;

    // AS3: ModActionCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    // AS3: ModActionCtrl.as::_topicDropdown
    private _topicDropdown: IDropMenuWindow | null = null;

    /** Derived name — `_SafeStr_7296`: drop-down row → topic id. */
    // AS3: ModActionCtrl.as::_SafeStr_7296
    private _topicIdsByRow: number[] = [];

    // AS3: ModActionCtrl.as::_actionTypeDropdown
    private _actionTypeDropdown: IDropMenuWindow | null = null;

    /** Derived name — `_SafeStr_5389`. */
    // AS3: ModActionCtrl.as::_SafeStr_5389
    private _messageInput: ITextFieldWindow | null = null;

    // AS3: ModActionCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6849`: the card this was opened from, for tracking only. */
    // AS3: ModActionCtrl.as::_SafeStr_6849
    private _userInfo: UserInfoCtrl | null;

    // AS3: ModActionCtrl.as::ModActionCtrl()
    constructor(
        main: ModerationManager,
        targetUserId: number,
        targetUserName: string,
        issue: IssueInfoData | null,
        userInfo: UserInfoCtrl | null
    )
    {
        this._main = main;
        this._targetUserId = targetUserId;
        this._targetUserName = targetUserName;
        this._issue = issue;
        this._userInfo = userInfo;

        if(ModActionCtrl._actionDefinitions === null)
        {
            ModActionCtrl._actionDefinitions = [
                new ModActionDefinition(1, 'Alert', ModActionCtrl.ACTION_TYPE_ALERT, 1, 0),
                new ModActionDefinition(2, 'Mute 1h', ModActionCtrl.ACTION_TYPE_MUTE, 2, 0),
                new ModActionDefinition(3, 'Ban 18h', ModActionCtrl.ACTION_TYPE_BAN, 3, 0),
                new ModActionDefinition(4, 'Ban 7 days', ModActionCtrl.ACTION_TYPE_BAN, 4, 0),
                new ModActionDefinition(5, 'Ban 30 days (step 1)', ModActionCtrl.ACTION_TYPE_BAN, 5, 0),
                new ModActionDefinition(7, 'Ban 30 days (step 2)', ModActionCtrl.ACTION_TYPE_BAN, 7, 0),
                new ModActionDefinition(6, 'Ban 100 years', ModActionCtrl.ACTION_TYPE_BAN, 6, 0),
                new ModActionDefinition(106, 'Ban avatar-only 100 years', ModActionCtrl.ACTION_TYPE_BAN, 6, 0),
                new ModActionDefinition(101, 'Kick', ModActionCtrl.ACTION_TYPE_KICK, 0, 0),
                new ModActionDefinition(102, 'Lock trade 1 week', ModActionCtrl.ACTION_TYPE_TRADING_LOCK, 0, 168),
                new ModActionDefinition(
                    104, 'Lock trade permanent', ModActionCtrl.ACTION_TYPE_TRADING_LOCK, 0, 876000
                ),
                new ModActionDefinition(105, 'Message', ModActionCtrl.ACTION_TYPE_MESSAGE, 0, 0),
            ];
        }

        main.issueManager?.addModActionView(targetUserId, this);
    }

    // AS3: ModActionCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** The default-sanction button starts disabled and only `showDefaultSanction()` enables it. */
    // AS3: ModActionCtrl.as::show()
    public show(): void
    {
        this._frame = this._main?.getXmlWindow('modact_summary') as unknown as IFrameWindow | null;

        if(this._frame === null) return;

        const frame = this._frame as unknown as IWindow;

        frame.caption = `Mod action on: ${this._targetUserName}`;

        const customButton = this._frame.findChildByName('custom_sanction_button');

        if(customButton !== null) customButton.procedure = this.onCustomSanctionButton;

        this._messageInput = this._frame.findChildByName('message_input') as ITextFieldWindow | null;

        const defaultButton = this._frame.findChildByName('default_sanction_button');

        if(defaultButton !== null)
        {
            defaultButton.procedure = this.onDefaultSanctionButton;
            defaultButton.disable();
        }

        this.initializeTopicToSanctionTypeMapping();
        this.initializeTopicDropdown();
        this.initializeActionTypeDropdown();

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;

        frame.visible = true;
    }

    // AS3: ModActionCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_MODACTION;
    }

    // AS3: ModActionCtrl.as::getId()
    public getId(): string
    {
        return this._targetUserName;
    }

    // AS3: ModActionCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    // AS3: ModActionCtrl.as::logEvent()
    private logEvent(action: string, label: string = ''): void
    {
        this._userInfo?.logEvent(action, label);
    }

    // AS3: ModActionCtrl.as::trackAction()
    private trackAction(action: string): void
    {
        if(this._userInfo === null || this._userInfo.disposed) return;

        this._userInfo.trackAction(`modAction_${action}`);
    }

    /** Parsed once into a static map; a malformed pair is skipped rather than defaulting. */
    // AS3: ModActionCtrl.as::initializeTopicToSanctionTypeMapping()
    private initializeTopicToSanctionTypeMapping(): void
    {
        if(ModActionCtrl._topicToSanctionType !== null) return;

        ModActionCtrl._topicToSanctionType = new Map();

        const property = this._main?.getProperty('cfh.topic_id.to.sanction_type_id') ?? null;

        if(property === null) return;

        for(const entry of property.split(','))
        {
            const pair = entry.split('=');

            if(pair.length !== 2) continue;

            ModActionCtrl._topicToSanctionType.set(parseInt(pair[0], 10), parseInt(pair[1], 10));
        }
    }

    /**
     * The drop-down holds localization *keys*, not names — `${help.cfh.topic.<id>}` — so the window
     * system resolves them. `_topicIdsByRow` is the flattened category→topic order alongside it.
     */
    // AS3: ModActionCtrl.as::initializeTopicDropdown()
    private initializeTopicDropdown(): void
    {
        this._topicDropdown = this._frame?.findChildByName('cfh_topics') as unknown as IDropMenuWindow | null;

        if(this._topicDropdown === null) return;

        (this._topicDropdown as unknown as IWindow)
            .addEventListener('WE_SELECTED', this.refreshSanctionDataForSelectedTopic);

        this._topicIdsByRow = [];

        const captions: string[] = [];

        for(const category of this._main?.issueManager?.getCfhTopics() ?? [])
        {
            for(const topic of category.topics)
            {
                captions.push(`\${help.cfh.topic.${topic.id}}`);
                this._topicIdsByRow.push(topic.id);
            }
        }

        this._topicDropdown.populate(captions);
    }

    // AS3: ModActionCtrl.as::refreshSanctionDataForSelectedTopic()
    private refreshSanctionDataForSelectedTopic = (): void =>
    {
        const row = this._topicDropdown?.selection ?? -1;
        const topicId = this._topicIdsByRow[row] ?? 0;

        let actionId = ModActionCtrl._topicToSanctionType?.get(topicId) ?? 0;

        if(!actionId)
        {
            actionId = ModActionCtrl._topicToSanctionType?.get(ModActionCtrl.FALLBACK_TOPIC_ID) ?? 0;
        }

        if(actionId)
        {
            const definitions = ModActionCtrl._actionDefinitions ?? [];

            for(let index = 0; index < definitions.length; index++)
            {
                if(definitions[index].actionId === actionId)
                {
                    if(this._actionTypeDropdown !== null) this._actionTypeDropdown.selection = index;

                    break;
                }
            }
        }
        else if(this._actionTypeDropdown !== null)
        {
            this._actionTypeDropdown.selection = -1;
        }

        this._main?.issueManager?.requestSanctionDataForAccount(this._targetUserId, topicId);
    };

    /** Called by the issue manager once the server answers; ignores answers for another user. */
    // AS3: ModActionCtrl.as::showDefaultSanction()
    public showDefaultSanction(userId: number, label: string): void
    {
        if(this._frame === null || userId !== this._targetUserId) return;

        const labelWindow = this._frame.findChildByName('default_sanction_label') as ITextWindow | null;

        if(labelWindow !== null) (labelWindow as unknown as IWindow).caption = label;

        this._frame.findChildByName('default_sanction_button')?.enable();
    }

    // AS3: ModActionCtrl.as::initializeActionTypeDropdown()
    private initializeActionTypeDropdown(): void
    {
        this._actionTypeDropdown = this._frame?.findChildByName('sanction_type') as unknown as IDropMenuWindow | null;

        if(this._actionTypeDropdown === null) return;

        this._actionTypeDropdown.populate((ModActionCtrl._actionDefinitions ?? []).map((d) => d.name));
    }

    // AS3: ModActionCtrl.as::onDefaultSanctionButton()
    private onDefaultSanctionButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if((this._topicDropdown?.selection ?? -1) < 0)
        {
            this.alert('Please select a topic.');

            return;
        }

        log.debug('Giving default sanction...');

        this.trackAction('defaultAction');
        this.logEvent('action.default');

        const topicId = this._topicIdsByRow[this._topicDropdown?.selection ?? -1] ?? 0;

        this._main?.connection?.send(new DefaultSanctionMessageComposer(
            this._targetUserId, topicId, this._messageInput?.text ?? '', this.getIssueId()
        ));

        this.dispose();
    };

    /**
     * Each branch re-checks its own permission flag from the moderator init packet before sending;
     * mute and trading-lock have none. `logEvent('action.custom', 'unknown')` at the end is AS3's —
     * the label is a literal, not the sanction that was sent.
     */
    // AS3: ModActionCtrl.as::onCustomSanctionButton()
    private onCustomSanctionButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if((this._topicDropdown?.selection ?? -1) < 0)
        {
            this.alert('Please select a topic.');

            return;
        }

        if((this._actionTypeDropdown?.selection ?? -1) < 0)
        {
            this.alert('Please select a sanction.');

            return;
        }

        const topicId = this._topicIdsByRow[this._topicDropdown?.selection ?? -1] ?? 0;
        const definition = (ModActionCtrl._actionDefinitions ?? [])[this._actionTypeDropdown?.selection ?? -1];

        if(definition === undefined) return;

        const message = this._messageInput?.text ?? '';
        const issueId = this.getIssueId();
        const init = this._main?.initMsg ?? null;

        switch(definition.actionType)
        {
            case ModActionCtrl.ACTION_TYPE_ALERT:
                if(!(init?.alertPermission ?? false))
                {
                    this.alert('You have insufficient permissions.');

                    return;
                }

                this.trackAction('sendCaution');
                this._main?.connection?.send(
                    new ModAlertMessageComposer(this._targetUserId, message, topicId, issueId)
                );
                break;

            case ModActionCtrl.ACTION_TYPE_MUTE:
                this.trackAction('mute');
                this._main?.connection?.send(
                    new ModMuteMessageComposer(this._targetUserId, message, topicId, issueId)
                );
                break;

            case ModActionCtrl.ACTION_TYPE_BAN:
            {
                if(!(init?.banPermission ?? false))
                {
                    this.alert('You have insufficient permissions.');

                    return;
                }

                this.trackAction('ban');

                const avatarOnly = definition.actionId === ModActionCtrl.AVATAR_ONLY_BAN_ACTION_ID;

                this._main?.connection?.send(new ModBanMessageComposer(
                    this._targetUserId, message, topicId, definition.sanctionTypeId, avatarOnly, issueId
                ));
                break;
            }

            case ModActionCtrl.ACTION_TYPE_KICK:
                if(!(init?.kickPermission ?? false))
                {
                    this.alert('You have insufficient permissions.');

                    return;
                }

                this.trackAction('kick');
                this._main?.connection?.send(
                    new ModKickMessageComposer(this._targetUserId, message, topicId, issueId)
                );
                break;

            case ModActionCtrl.ACTION_TYPE_TRADING_LOCK:
                this.trackAction('trading_lock');
                this._main?.connection?.send(new ModTradingLockMessageComposer(
                    this._targetUserId, message, definition.actionLengthHours * 60, topicId, issueId
                ));
                break;

            case ModActionCtrl.ACTION_TYPE_MESSAGE:
                if(StringUtil.isEmpty(message))
                {
                    this.alert('Please write a message to user.');

                    return;
                }

                this.trackAction('sendCaution');
                this._main?.connection?.send(
                    new ModMessageMessageComposer(this._targetUserId, message, topicId, issueId)
                );
                break;
        }

        this.logEvent('action.custom', 'unknown');

        this.dispose();
    };

    // AS3: ModActionCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.trackAction('close');
        this.dispose();
    };

    // TS-only: the shape every refusal in this class shares.
    private alert(message: string): void
    {
        this._main?.windowManager?.alert('Alert', message, 0, ModActionCtrl.onAlertClose);
    }

    // AS3: ModActionCtrl.as::onAlertClose()
    private static onAlertClose = (dialog: IAlertDisposable): void =>
    {
        dialog.dispose();
    };

    // AS3: ModActionCtrl.as::getIssueId()
    private getIssueId(): number
    {
        return this._issue !== null ? this._issue.issueId : ModActionCtrl.NO_ISSUE_ID;
    }

    // AS3: ModActionCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        this._topicDropdown = null;
        this._messageInput = null;

        this._main?.issueManager?.removeModActionView(this._targetUserId);
        this._main = null;
    }
}
