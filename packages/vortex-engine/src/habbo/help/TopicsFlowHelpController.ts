import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextLinkWindow} from '@core/window/components/ITextLinkWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {ICfhTopic} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import {CallForHelpFromForumMessageMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromForumMessageMessageComposer';
import {CallForHelpFromForumThreadMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromForumThreadMessageComposer';
import {CallForHelpFromIMMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromIMMessageComposer';
import {CallForHelpFromPhotoMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromPhotoMessageComposer';
import {CallForHelpMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpMessageComposer';
import {ReportBullyMessageComposer} from '@habbo/communication/messages/outgoing/help/ReportBullyMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IIlluminaInputWidget} from '@habbo/window/widgets/IIlluminaInputWidget';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.TopicsFlowHelpController');

/**
 * The new call-for-help flow
 *
 * One modal (`topics_flow_help`) holding nine containers, shown one at a time, that walk the
 * reporter through: who → which chat lines → which reason → which topic → the message → a summary.
 * Which step it opens on depends on the entry point — a room report skips straight to a single
 * reason, a username report jumps to the message, an IM report opens on the chat list — and the
 * back button's visibility is recomputed from that entry point so a flow never offers to step back
 * behind where it started.
 *
 * `submitCallForHelp()` is the one exit: it picks a composer from the report type and sends
 * whatever the walk collected. The "unlawful activity" category is the exception throughout — it
 * shows an extra consent checkbox plus name and e-mail fields, and those two strings ride along on
 * every composer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/TopicsFlowHelpController.as
 */
export class TopicsFlowHelpController
{
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::START_CONTAINER
    private static readonly START_CONTAINER: string = 'start_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::HELP_CONTAINER
    private static readonly HELP_CONTAINER: string = 'help_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::USERS_CONTAINER
    private static readonly USERS_CONTAINER: string = 'users_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::USER_CONTAINER
    private static readonly USER_CONTAINER: string = 'user';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::REASON_CONTAINER
    private static readonly REASON_CONTAINER: string = 'reason_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::TOPIC_CONTAINER
    private static readonly TOPIC_CONTAINER: string = 'topic_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::MESSAGE_CONTAINER
    private static readonly MESSAGE_CONTAINER: string = 'message_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::CHAT_CONTAINER
    private static readonly CHAT_CONTAINER: string = 'chat_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::BACK_BUTTON
    private static readonly BACK_BUTTON: string = 'back_button';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::SUMMARY_CONTAINER
    private static readonly SUMMARY_CONTAINER: string = 'summary_container';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::UNLAWFUL_MESSAGE_CONTENT
    private static readonly UNLAWFUL_MESSAGE_CONTENT: string = 'unlawful_message_content';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::HELP_MESSAGE
    private static readonly HELP_MESSAGE: string = 'help_message';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::MESSAGE_CONTAINER_DESCRIPTION
    private static readonly MESSAGE_CONTAINER_DESCRIPTION: string = 'message_container_description';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::UNLAWFUL_MESSAGE_CONFIRM
    // Name derived (`_SafeStr_10601`): the consent checkbox of the unlawful-activity form.
    private static readonly UNLAWFUL_MESSAGE_CONFIRM: string = 'unlawful_message_confirm';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::MESSAGE_NAME_INPUT
    private static readonly MESSAGE_NAME_INPUT: string = 'help_message_name';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::MESSAGE_EMAIL_INPUT
    private static readonly MESSAGE_EMAIL_INPUT: string = 'help_message_email';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::CONTINUE_BUTTON
    private static readonly CONTINUE_BUTTON: string = 'continue_button';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::FIELD_MAX_CHARS
    private static readonly FIELD_MAX_CHARS: number = 253;
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::TOPIC_NAME_BULLYING
    private static readonly TOPIC_NAME_BULLYING: string = 'bullying';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::TOPIC_NAME_BAD_USER_NAME
    private static readonly TOPIC_NAME_BAD_USER_NAME: string = 'habbo_name';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::DEFAULT_REPORT_MESSAGE_DESCRIPTION
    private static readonly DEFAULT_REPORT_MESSAGE_DESCRIPTION: string = 'help.emergency.main.step.one.description';
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::UNLAWFUL_REPORT_MESSAGE_TITLE
    private static readonly UNLAWFUL_REPORT_MESSAGE_TITLE: string = 'help.cfh.unlawful_activity.reason_description';

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::REQUIRES_CONTINUE_BUTTON
    private static readonly REQUIRES_CONTINUE_BUTTON: string[] = ['users_container', 'message_container', 'chat_container'];

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::REQUIRES_USER_DATA
    private static readonly REQUIRES_USER_DATA: string[] = ['reason_container', 'message_container', 'chat_container', 'summary_container'];

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_dialog
    // Name derived (`_SafeStr_5179`).
    private _dialog: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_containers
    private _containers: string[];

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_userList
    private _userList: IItemListWindow | null = null;
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_reasonList
    private _reasonList: IItemListWindow | null = null;
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_chatList
    private _chatList: IItemListWindow | null = null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_userTemplate
    // The three lists each ship one row in the layout, lifted out as a template and cloned per
    // entry; AS3 empties the lists straight afterwards.
    private _userTemplate: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_reasonTemplate
    private _reasonTemplate: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_chatTemplate
    private _chatTemplate: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_currentContainer
    private _currentContainer: string = TopicsFlowHelpController.START_CONTAINER;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_selectedTopic
    private _selectedTopic: ICfhTopic | null = null;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_selectedCategoryName
    private _selectedCategoryName: string = '';

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_helpMessage
    private _helpMessage: string = '';

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_reportedUserName
    private _reportedUserName: string = '';

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_reportType
    // Name derived (`_SafeStr_5400`): -1 when the flow was opened from the help icon rather than
    // from a specific report entry point.
    private _reportType: number = -1;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_isUserNameReport
    // Name derived (`_SafeStr_9413`): set only by `openReportingUserName()`, and read by the back
    // button so a username report cannot step back out of its message step.
    private _isUserNameReport: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_unlawfulCategories
    private _unlawfulCategories: string[] = ['unlawful_activity'];

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::TopicsFlowHelpController()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
        this._containers = [
            TopicsFlowHelpController.START_CONTAINER,
            TopicsFlowHelpController.HELP_CONTAINER,
            TopicsFlowHelpController.USERS_CONTAINER,
            TopicsFlowHelpController.USER_CONTAINER,
            TopicsFlowHelpController.REASON_CONTAINER,
            TopicsFlowHelpController.MESSAGE_CONTAINER,
            TopicsFlowHelpController.CHAT_CONTAINER,
            TopicsFlowHelpController.BACK_BUTTON,
            TopicsFlowHelpController.SUMMARY_CONTAINER,
        ];
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // --- Entry points ---

    /**
	 * Report a user's name — straight to the message step, with the topic already decided
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::openReportingUserName()
    openReportingUserName(): void
    {
        this._isUserNameReport = true;

        this.showReportingDialog(-1, false);

        this._selectedTopic = this.getTopic(TopicsFlowHelpController.TOPIC_NAME_BAD_USER_NAME);

        const title = this._window?.findChildByName('message_phase_title');
        const localization = this._habboHelp?.localization ?? null;

        if(title && this._selectedTopic)
        {
            title.caption = `${localization?.getLocalizationWithParams('generic.reason', '') ?? ''} `
				+ `${localization?.getLocalizationWithParams(`help.cfh.topic.${this._selectedTopic.id}`, '') ?? ''}`;
        }

        this.showContainer(TopicsFlowHelpController.MESSAGE_CONTAINER);
    }

    /**
	 * Report room chat — opens on the chat list, with the user swap offered
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::openReportingChatLineSelection()
    openReportingChatLineSelection(): void
    {
        this.showReportingDialog(-1, true);

        if(!this.userChatLinesAvailable()) return;

        this.showContainer(TopicsFlowHelpController.CHAT_CONTAINER);
        this.populateChatMessage();
    }

    /**
	 * Report a piece of content — opens on the reason list
	 *
	 * @returns false when there is no user to report, in which case the window closes again
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::openReportingContentReasonCategory()
    openReportingContentReasonCategory(reportType: number): boolean
    {
        this.showReportingDialog(reportType, false);

        const shown = this.showReasons(reportType);

        if(!shown) this.closeWindow();

        return shown;
    }

    /**
	 * Report instant messages — opens on the IM list
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::openReportingIMSelection()
    openReportingIMSelection(): void
    {
        this.showReportingDialog(3, false);
        this.showContainer(TopicsFlowHelpController.CHAT_CONTAINER);
        this.populateInstantMessages();

        if((this._chatList?.numListItems ?? 0) === 0)
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.no_user_data}', 0, null);
            this.closeWindow();
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::showReportingDialog()
    private showReportingDialog(reportType: number, allowUserChange: boolean): void
    {
        this._reportType = reportType;

        if(this._dialog === null) this.openWindow();

        const changeUser = this._window?.findChildByName('change_user');

        if(changeUser) changeUser.visible = allowUserChange;
    }

    // --- Window lifecycle ---

    /**
	 * Build the modal and cache the three list templates
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::openWindow()
    private openWindow(): void
    {
        if(this._dialog !== null || this.disposed) return;

        const dialog = this._habboHelp?.getModalXmlWindow('topics_flow_help') ?? null;

        if(!dialog)
        {
            log.error('openWindow: getModalXmlWindow("topics_flow_help") returned null - layout not registered?');

            return;
        }

        this._dialog = dialog;

        const root = this._dialog.rootWindow as IWindowContainer | null;

        if(!root) return;

        root.procedure = this.windowEventProcedure;

        this._window = root;
        this._userList = root.findChildByName('user_list') as IItemListWindow | null;
        this._reasonList = root.findChildByName('reason_list') as IItemListWindow | null;
        this._chatList = root.findChildByName('chat_list') as IItemListWindow | null;

        this._userTemplate = (this._userList?.getListItemAt(0) ?? null) as IWindowContainer | null;
        this._reasonTemplate = (this._reasonList?.getListItemAt(0) ?? null) as IWindowContainer | null;
        this._chatTemplate = (this._chatList?.getListItemAt(0) ?? null) as IWindowContainer | null;

        this._userList?.removeListItems();
        this._reasonList?.removeListItems();
        this._chatList?.removeListItems();

        const input = this.getInput(TopicsFlowHelpController.HELP_MESSAGE);

        if(input) input.maxChars = TopicsFlowHelpController.FIELD_MAX_CHARS;

        if(!this._habboHelp?.getBoolean('my.reports.status.enabled'))
        {
            const bitmap = root.findChildByName('reports_status_bitmap');
            const link = root.findChildByName('reports_status');

            if(bitmap) bitmap.visible = false;
            if(link) link.visible = false;
        }

        this.deselectChatEntries();
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::closeWindow()
    closeWindow(): void
    {
        if(this._dialog !== null)
        {
            this._dialog.dispose();
            this._dialog = null;
        }

        this._currentContainer = TopicsFlowHelpController.START_CONTAINER;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::toggleWindow()
    toggleWindow(): void
    {
        if(this._dialog === null)
        {
            this._reportType = -1;
            this.openWindow();
            this.showContainer(TopicsFlowHelpController.START_CONTAINER);
        }
        else
        {
            this.closeWindow();
        }
    }

    /**
	 * Show one step and hide the rest
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::showContainer()
    private showContainer(name: string): void
    {
        if(!this._window) return;

        for(const container of this._containers)
        {
            const child = this._window.findChildByName(container);

            if(child) child.visible = false;
        }

        const continueButton = this._window.findChildByName(TopicsFlowHelpController.CONTINUE_BUTTON);
        const userPanel = this._window.findChildByName(TopicsFlowHelpController.USER_CONTAINER);

        if(continueButton) continueButton.visible = TopicsFlowHelpController.REQUIRES_CONTINUE_BUTTON.indexOf(name) > -1;
        if(userPanel) userPanel.visible = TopicsFlowHelpController.REQUIRES_USER_DATA.indexOf(name) > -1;

        this._currentContainer = name;

        this.updateBackButtonVisibility();

        const target = this._window.findChildByName(name);

        if(target) target.visible = true;

        if(name === TopicsFlowHelpController.MESSAGE_CONTAINER)
        {
            // The unlawful-activity form adds a consent block, so the message box shrinks to make
            // room for it and the description above changes.
            const unlawful = this._unlawfulCategories.indexOf(this._selectedCategoryName) > -1;

            const content = this._window.findChildByName(TopicsFlowHelpController.UNLAWFUL_MESSAGE_CONTENT);
            const message = this._window.findChildByName(TopicsFlowHelpController.HELP_MESSAGE);
            const description = this._window.findChildByName(TopicsFlowHelpController.MESSAGE_CONTAINER_DESCRIPTION);

            if(content) content.visible = unlawful;
            if(message) message.height = unlawful ? 120 : 220;

            if(description)
            {
                description.caption = this._habboHelp?.localization?.getLocalizationWithParams(
                    unlawful
                        ? TopicsFlowHelpController.UNLAWFUL_REPORT_MESSAGE_TITLE
                        : TopicsFlowHelpController.DEFAULT_REPORT_MESSAGE_DESCRIPTION,
                    ''
                ) ?? '';
            }
        }

        if(TopicsFlowHelpController.REQUIRES_USER_DATA.indexOf(name) > -1) this.updateUserData();
    }

    /**
	 * Hide the back button on whichever step this flow started at
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::updateBackButtonVisibility()
    private updateBackButtonVisibility(): void
    {
        let visible = true;

        if(this._currentContainer === TopicsFlowHelpController.START_CONTAINER) visible = false;
        else if(this._reportType === 3) visible = this._currentContainer !== TopicsFlowHelpController.CHAT_CONTAINER;
        else if(this._reportType > -1) visible = this._currentContainer !== TopicsFlowHelpController.REASON_CONTAINER;
        else if(this._isUserNameReport) visible = this._currentContainer !== TopicsFlowHelpController.MESSAGE_CONTAINER;

        const back = this._window?.findChildByName(TopicsFlowHelpController.BACK_BUTTON);

        if(back) back.visible = visible;
    }

    // --- Validation ---

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::verifyUserSelected()
    private verifyUserSelected(): boolean
    {
        if(this._habboHelp?.reportedUserId === -1)
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${guide.bully.request.usermissing}', 0, null);

            return false;
        }

        return true;
    }

    /**
	 * Check the message step, including the unlawful-activity consent block
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::verifyMessage()
    private verifyMessage(): boolean
    {
        if(this._unlawfulCategories.indexOf(this._selectedCategoryName) > -1)
        {
            const confirm = this._window?.findChildByName(TopicsFlowHelpController.UNLAWFUL_MESSAGE_CONFIRM) as unknown as ISelectableWindow | null;
            const name = this.getInput(TopicsFlowHelpController.MESSAGE_NAME_INPUT)?.message ?? '';
            const email = this.getInput(TopicsFlowHelpController.MESSAGE_EMAIL_INPUT)?.message ?? '';

            if(!confirm?.isSelected || name === '' || email === '')
            {
                // AS3 reuses the step's own description as the error text here.
                this._habboHelp?.windowManager?.alertWithModal(
                    '${generic.alert.title}', `\${${TopicsFlowHelpController.DEFAULT_REPORT_MESSAGE_DESCRIPTION}}`, 0, null
                );

                return false;
            }
        }

        this._helpMessage = this.getInput(TopicsFlowHelpController.HELP_MESSAGE)?.message ?? '';

        if(this._helpMessage === '')
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.nomsg}', 0, null);

            return false;
        }

        if(this._helpMessage.length < (this._habboHelp?.getInteger('help.cfh.length.minimum', 15) ?? 15))
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.msgtooshort}', 0, null);

            return false;
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::verifySelectedChatLines()
    private verifySelectedChatLines(): boolean
    {
        const selected = this._habboHelp?.callForHelpManager?.chatReportController?.collectSelectedEntries(
            this._reportType, this._habboHelp?.reportedUserId ?? -1
        ) ?? [];

        if(selected.length === 0)
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.chatmissing}', 0, null);

            return false;
        }

        return true;
    }

    // --- Window procedure ---

    /**
	 * Every button in the modal, including the step-to-step navigation
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::windowEventProcedure()
    private windowEventProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
                this.closeWindow();
                break;

            case TopicsFlowHelpController.BACK_BUTTON:
                this.onBackButton();
                break;

            case TopicsFlowHelpController.CONTINUE_BUTTON:
                this.onContinueButton();
                break;

            case 'button_habbo_help':
                this.showContainer(TopicsFlowHelpController.HELP_CONTAINER);
                break;

            case 'button_user_report':
            case 'change_user':
                if(this.populateUsers())
                {
                    this.showContainer(TopicsFlowHelpController.USERS_CONTAINER);

                    break;
                }

                this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.nochathistory}', 0, null);
                break;

            case 'button_account':
                HabboWebTools.openWebPage(this._habboHelp?.getProperty('zendesk.url') ?? '', 'habboMain');
                this._habboHelp?.trackGoogle('helpWindow', 'click_selfHelp');
                this.closeWindow();
                break;

            case 'tour_button':
                this._habboHelp?.guideHelpManager?.createHelpRequest(this._habboHelp?.newIdentity ? 0 : 2);
                this._habboHelp?.trackGoogle('helpWindow', 'click_userTour');
                this.closeWindow();
                break;

            case 'bully_button':
                this.closeWindow();
                this._habboHelp?.toggleNewHelpWindow();
                this._habboHelp?.trackGoogle('helpWindow', 'click_reportBully');
                break;

            case 'instructions_button':
                this._habboHelp?.guideHelpManager?.createHelpRequest(1);
                this._habboHelp?.trackGoogle('helpWindow', 'click_instructions');
                this.closeWindow();
                break;

            case 'safetybooklet_link':
                this._habboHelp?.showSafetyBooklet();
                this._habboHelp?.trackGoogle('helpWindow', 'click_showSafetyBooklet');
                this.closeWindow();
                break;

            case 'habboway_link':
                if(this._habboHelp?.getBoolean('habboway.enabled')) this._habboHelp.showHabboWay();
                else HabboWebTools.openWebPage(this._habboHelp?.getProperty('habboway.url') ?? '', 'habboMain');

                this._habboHelp?.trackGoogle('helpWindow', 'click_habboWay');
                this.closeWindow();
                break;

            case 'faq_link':
                this._habboHelp?.openCfhFaq();
                break;

            case 'sanction_info_link':
                this._habboHelp?.requestSanctionInfo(false);
                this.closeWindow();
                break;

            case 'reports_status':
                this._habboHelp?.requestReportsStatus();
                this.closeWindow();
                break;

            case 'submit_button':
                if(this._selectedTopic)
                {
                    this.submitCallForHelp(true);
                    this.closeWindow();

                    break;
                }

                this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.notopic}', 0, null);
                break;
        }
    };

    /**
	 * Step back one place, which is not always the previous step
	 */
    // AS3: inlined in `windowEventProcedure()`'s `back_button` case; split out here because that
    // switch is otherwise two nested switches deep.
    private onBackButton(): void
    {
        switch(this._currentContainer)
        {
            case TopicsFlowHelpController.REASON_CONTAINER:
                this.showContainer(TopicsFlowHelpController.CHAT_CONTAINER);
                break;

            case TopicsFlowHelpController.TOPIC_CONTAINER:
            case TopicsFlowHelpController.MESSAGE_CONTAINER:
                this.showContainer(TopicsFlowHelpController.REASON_CONTAINER);
                this.populateReasons();
                break;

            case TopicsFlowHelpController.CHAT_CONTAINER:
                if(this.populateUsers())
                {
                    this.showContainer(TopicsFlowHelpController.USERS_CONTAINER);

                    break;
                }

                this.showContainer(TopicsFlowHelpController.START_CONTAINER);
                break;

            case TopicsFlowHelpController.SUMMARY_CONTAINER:
                this.showContainer(TopicsFlowHelpController.MESSAGE_CONTAINER);
                break;

            default:
                this.showContainer(TopicsFlowHelpController.START_CONTAINER);
                break;
        }
    }

    /**
	 * Advance, if the current step validates
	 */
    // AS3: inlined in `windowEventProcedure()`'s `continue_button` case.
    private onContinueButton(): void
    {
        switch(this._currentContainer)
        {
            case TopicsFlowHelpController.USERS_CONTAINER:
                if(this.verifyUserSelected())
                {
                    this.showContainer(TopicsFlowHelpController.CHAT_CONTAINER);
                    this.populateChatMessage();
                }
                break;

            case TopicsFlowHelpController.MESSAGE_CONTAINER:
                if(this.verifyMessage()) this.showContainer(TopicsFlowHelpController.SUMMARY_CONTAINER);
                break;

            case TopicsFlowHelpController.CHAT_CONTAINER:
                if(this.verifySelectedChatLines())
                {
                    this.showContainer(TopicsFlowHelpController.REASON_CONTAINER);
                    this.populateReasons();
                }
                break;

            default:
                this.showContainer(TopicsFlowHelpController.START_CONTAINER);
                break;
        }
    }

    // --- Submission ---

    /**
	 * Send the report the walk collected
	 *
	 * @param allowGuideRoute When set, a bullying topic with guardians enabled files a guide
	 *   report instead of an ordinary call for help. The pending-calls-deleted path passes false,
	 *   because that report has already been through the decision once.
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::submitCallForHelp()
    submitCallForHelp(allowGuideRoute: boolean): void
    {
        if(this._helpMessage === '' || !this._selectedTopic || !this._habboHelp) return;

        let reporterName = '';
        let reporterEmail = '';

        // Only the unlawful-activity flow collects these; every other report sends them empty.
        if(this._unlawfulCategories.indexOf(this._selectedCategoryName) > -1)
        {
            reporterName = this.getInput(TopicsFlowHelpController.MESSAGE_NAME_INPUT)?.message ?? '';
            reporterEmail = this.getInput(TopicsFlowHelpController.MESSAGE_EMAIL_INPUT)?.message ?? '';
        }

        this._habboHelp.ignoreAndUnfriendReportedUser();

        const chatReport = this._habboHelp.callForHelpManager?.chatReportController ?? null;
        const manager = this._habboHelp.callForHelpManager;

        switch(this._reportType)
        {
            case 3:
                this._habboHelp.sendMessage(new CallForHelpFromIMMessageComposer(
                    this._helpMessage,
                    this._selectedTopic.id,
                    this._habboHelp.reportedUserId,
                    chatReport?.collectSelectedEntries(3, this._habboHelp.reportedUserId) ?? [],
                    reporterName,
                    reporterEmail
                ));
                break;

            case 4:
                // A room report names no user and attaches no chat.
                this._habboHelp.sendMessage(new CallForHelpMessageComposer(
                    this._helpMessage, this._selectedTopic.id, -1, this._habboHelp.reportedRoomId, [], reporterName, reporterEmail
                ));
                break;

            case 7:
                this._habboHelp.sendMessage(new CallForHelpFromForumThreadMessageComposer(
                    manager?.reportedGroupId ?? -1,
                    manager?.reportedThreadId ?? -1,
                    this._selectedTopic.id,
                    this._helpMessage,
                    reporterName,
                    reporterEmail
                ));
                break;

            case 8:
                this._habboHelp.sendMessage(new CallForHelpFromForumMessageMessageComposer(
                    manager?.reportedGroupId ?? -1,
                    manager?.reportedThreadId ?? -1,
                    manager?.reportedMessageId ?? -1,
                    this._selectedTopic.id,
                    this._helpMessage,
                    reporterName,
                    reporterEmail
                ));
                break;

            case 9:
                this._habboHelp.sendMessage(new CallForHelpFromPhotoMessageComposer(
                    this._habboHelp.reportedExtraDataId,
                    this._habboHelp.reportedRoomId,
                    this._habboHelp.reportedUserId,
                    this._selectedTopic.id,
                    this._habboHelp.reportedRoomObjectId,
                    reporterName,
                    reporterEmail
                ));
                break;

            default:
                if(
                    allowGuideRoute
					&& this._selectedTopic.name === TopicsFlowHelpController.TOPIC_NAME_BULLYING
					&& this._habboHelp.getBoolean('guides.enabled')
					&& this._habboHelp.guardiansEnabled
                )
                {
                    this._habboHelp.sendMessage(new ReportBullyMessageComposer(
                        this._habboHelp.reportedUserId, this._habboHelp.reportedRoomId
                    ));

                    break;
                }

                this._habboHelp.sendMessage(new CallForHelpMessageComposer(
                    this._helpMessage,
                    this._selectedTopic.id,
                    this._habboHelp.reportedUserId,
                    this._habboHelp.reportedRoomId,
                    chatReport?.collectSelectedEntries(1, -1) ?? [],
                    reporterName,
                    reporterEmail
                ));
                break;
        }
    }

    // --- User step ---

    /**
	 * List everyone the reporter has chat history with
	 *
	 * Users with nothing on record are left out, which is what makes an empty list mean "nothing
	 * to report" rather than "nobody in the room".
	 *
	 * @returns whether anyone made the list
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateUsers()
    private populateUsers(): boolean
    {
        if(!this._userList || !this._userTemplate || !this._habboHelp) return false;

        this._userList.removeListItems();

        let insertAt = 0;
        let reportedStillListed = false;

        for(const entry of this._habboHelp.userRegistry.getRegistry().values())
        {
            if(this._habboHelp.chatRegistry.getItemsByUser(entry.userId).length === 0) continue;

            const row = this._userTemplate.clone() as IWindowContainer;
            const isReported = entry.userId === this._habboHelp.reportedUserId;

            row.name = entry.userId.toString();
            row.procedure = this.onUserSelectEvent;

            const background = row.findChildByName('user_bg');

            if(background) background.blend = isReported ? 1 : 0;

            const userName = row.findChildByName('user_name');

            if(userName) userName.caption = entry.userName;

            const roomName = row.findChildByName('room_name');

            if(roomName)
            {
                roomName.id = entry.roomId;
                roomName.caption = entry.roomName !== ''
                    ? this._habboHelp.localization?.getLocalizationWithParams(
                        'help.emergency.main.step.two.room.name', '', 'room_name', entry.roomName
                    ) ?? ''
                    : '';
            }

            if(isReported) this._habboHelp.reportedRoomId = entry.roomId;

            const avatar = row.findChildByName('user_avatar') as IWidgetWindow | null;
            const avatarWidget = avatar?.widget as IAvatarImageWidget | null;

            if(avatarWidget) avatarWidget.figure = entry.figure;

            this._userList.addListItemAt(row, insertAt);

            if(isReported)
            {
                insertAt = 1;
                reportedStillListed = true;
            }
        }

        // The previously-reported user may have dropped off the list; forget them rather than
        // submitting against someone the reporter can no longer see.
        if(!reportedStillListed)
        {
            this._habboHelp.reportedUserId = -1;
            this._habboHelp.reportedRoomId = -1;
        }

        return this._userList.numListItems > 0;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::refreshUserList()
    private refreshUserList(): void
    {
        if(!this._userList) return;

        for(let i = 0; i < this._userList.numListItems; i++)
        {
            const row = this._userList.getListItemAt(i) as IWindowContainer | null;
            const background = row?.findChildByName('user_bg');

            if(row && background) background.blend = parseInt(row.name, 10) === this._habboHelp?.reportedUserId ? 1 : 0;
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::onUserSelectEvent()
    private onUserSelectEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.selectUserToReport(window as IWindowContainer);
    };

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::selectUserToReport()
    private selectUserToReport(row: IWindowContainer | null): void
    {
        if(!row || !this._habboHelp) return;

        this._habboHelp.reportedUserId = parseInt(row.name, 10);
        this._habboHelp.reportedRoomId = row.findChildByName('room_name')?.id ?? -1;

        this.refreshUserList();
    }

    // --- Reason and topic steps ---

    /**
	 * A room report has exactly one reason, so the list is built by hand
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateRoomReportButton()
    private populateRoomReportButton(): void
    {
        if(!this._reasonList || !this._reasonTemplate) return;

        this.resetReasonList();

        const row = this._reasonTemplate.clone() as IWindowContainer;

        // Topic 34 is the room-report topic; its caption takes the reported user's name.
        this._habboHelp?.localization?.registerParameter('help.cfh.topic.34', 'name', this._reportedUserName);

        const label = row.findChildByName('name') as ITextWindow | null;

        if(label)
        {
            label.caption = '${help.cfh.topic.34}';
            this.growRowToFitLabel(row, label);
        }

        row.name = 'inappropiate_room_group_event';
        row.addEventListener('WME_CLICK', this.onReportTopic);

        this._reasonList.addListItem(row);

        this._selectedCategoryName = 'room_report';
    }

    /**
	 * List the CFH categories the server sent at login
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateReasons()
    private populateReasons(): void
    {
        if(!this._reasonList || !this._reasonTemplate) return;

        this._reasonList.destroyListItems();

        for(const category of this._habboHelp?.callForHelpCategories ?? [])
        {
            const row = this._reasonTemplate.clone() as IWindowContainer;
            const label = row.findChildByName('name');

            if(label) label.caption = `\${help.cfh.reason.${category.name}}`;

            row.name = category.name;
            row.addEventListener('WME_CLICK', this.populateTopicsEvent);

            this._reasonList.addListItem(row);
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateTopicsEvent()
    private populateTopicsEvent = (event: WindowEvent): void =>
    {
        const target = event.target as IWindow | null;

        if(!target) return;

        this.populateTopics(target.name);
        this._selectedCategoryName = target.name;
    };

    /**
	 * Replace the reason list with the chosen category's topics
	 *
	 * @returns false when the category has no topics, leaving the reason list in place
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateTopics()
    private populateTopics(categoryName: string): boolean
    {
        if(!this._reasonList || !this._reasonTemplate) return false;

        let topics: ICfhTopic[] | null = null;

        for(const category of this._habboHelp?.callForHelpCategories ?? [])
        {
            if(category.name === categoryName)
            {
                topics = category.topics;

                break;
            }
        }

        if(!topics || topics.length === 0) return false;

        this.resetReasonList();

        for(const topic of topics)
        {
            const row = this._reasonTemplate.clone() as IWindowContainer;

            this._habboHelp?.localization?.registerParameter(`help.cfh.topic.${topic.id}`, 'name', this._reportedUserName);

            const label = row.findChildByName('name') as ITextWindow | null;

            if(label)
            {
                label.caption = `\${help.cfh.topic.${topic.id}}`;
                this.growRowToFitLabel(row, label);
            }

            row.name = topic.name;
            row.addEventListener('WME_CLICK', this.onReportTopic);

            this._reasonList.addListItem(row);
        }

        // The topic list reuses the reason container, so the step name is set directly rather
        // than through showContainer().
        this._currentContainer = TopicsFlowHelpController.TOPIC_CONTAINER;

        this.updateBackButtonVisibility();

        return true;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::onReportTopic()
    private onReportTopic = (event: WindowEvent): void =>
    {
        if(this._dialog === null) this.openWindow();

        const target = event.target as IWindow | null;

        this._selectedTopic = this.getTopic(target?.name ?? '');

        this.showContainer(TopicsFlowHelpController.MESSAGE_CONTAINER);
    };

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::isNotNeededToSelectUser()
    private isNotNeededToSelectUser(): boolean
    {
        return this._reportType === 4 || this._reportType === 7 || this._reportType === 8;
    }

    /**
	 * Check there is anyone worth reporting before opening the chat step
	 *
	 * `populateUsers()` clears the reported user when they are no longer on the list, so this
	 * reads the id back afterwards rather than before.
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::userChatLinesAvailable()
    private userChatLinesAvailable(): boolean
    {
        this.populateUsers();

        if((this._habboHelp?.reportedUserId ?? -1) <= 0)
        {
            this._habboHelp?.windowManager?.alertWithModal('${generic.alert.title}', '${help.cfh.error.no_user_data}', 0, null);
            this.closeWindow();

            return false;
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::showReasons()
    private showReasons(reportType: number): boolean
    {
        if(!this.isNotNeededToSelectUser() && !this.verifyUserSelected()) return false;

        this.showContainer(TopicsFlowHelpController.REASON_CONTAINER);

        if(reportType === 4) this.populateRoomReportButton();
        else this.populateReasons();

        return true;
    }

    // --- Chat step ---

    /**
	 * List the reported user's room chat, each line with its own checkbox
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateChatMessage()
    private populateChatMessage(): void
    {
        if(!this._chatList || !this._chatTemplate || !this._habboHelp) return;

        this._chatList.removeListItems();
        this._habboHelp.chatRegistry.holdPurges = true;

        const items = this._habboHelp.reportedUserId > 0
            ? this._habboHelp.chatRegistry.getItemsByUser(this._habboHelp.reportedUserId)
            : this._habboHelp.chatRegistry.getItems();

        log.debug(`Found chat items: ${items.length} from user: ${this._habboHelp.reportedUserId}`);

        for(const item of items)
        {
            if(item.userId === this._habboHelp.ownUserId) continue;

            const row = this._chatTemplate.clone() as IWindowContainer;
            const text = row.findChildByName('chat_text') as ITextLinkWindow | null;

            if(text)
            {
                text.caption = item.text;
                this.growRowToFitLabel(row, text as unknown as ITextWindow, 0);
            }

            row.id = item.index;
            row.procedure = this.onChatEntryEvent;

            const check = row.findChildByName('chat_check') as unknown as ISelectableWindow | null;

            if(check) check.isSelected = item.selected;

            this._chatList.addListItem(row);
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::deselectChatEntries()
    private deselectChatEntries(): void
    {
        if(!this._habboHelp) return;

        for(const items of this._habboHelp.instantMessageRegistry.getItems().values())
        {
            for(const item of items) item.selected = false;
        }

        for(const item of this._habboHelp.chatRegistry.getItems()) item.selected = false;
    }

    /**
	 * Toggle a chat line, whether the click landed on the text or the checkbox
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::onChatEntryEvent()
    private onChatEntryEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const {index, check} = this.resolveChatRow(window);
        const item = this._habboHelp?.chatRegistry.getItem(index) ?? null;

        if(!item) return;

        // Picking a line from another room retargets the report at that room.
        if(!item.selected && item.roomId !== this._habboHelp?.reportedRoomId && this._habboHelp)
        {
            this._habboHelp.reportedRoomId = item.roomId;
        }

        item.selected = !item.selected;

        if(check) check.isSelected = item.selected;
    };

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::populateInstantMessages()
    private populateInstantMessages(): void
    {
        if(!this._chatList || !this._chatTemplate || !this._habboHelp) return;

        this._chatList.removeListItems();
        this._habboHelp.instantMessageRegistry.holdPurges = true;

        const items = this._habboHelp.instantMessageRegistry.getItemsByUser(this._habboHelp.reportedUserId) ?? [];

        for(const item of items)
        {
            const row = this._chatTemplate.clone() as IWindowContainer;
            const text = row.findChildByName('chat_text');

            if(text) text.caption = item.text;

            row.id = item.index;
            row.procedure = this.onInstantMessageEntryEvent;

            const check = row.findChildByName('chat_check') as unknown as ISelectableWindow | null;

            if(check) check.isSelected = item.selected;

            this._chatList.addListItem(row);
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::onInstantMessageEntryEvent()
    private onInstantMessageEntryEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const {index, check} = this.resolveChatRow(window);
        const item = this._habboHelp?.instantMessageRegistry.getItem(this._habboHelp?.reportedUserId ?? -1, index) ?? null;

        if(!item) return;

        item.selected = !item.selected;

        if(check) check.isSelected = item.selected;
    };

    /**
	 * Find the row id and checkbox behind a click on a chat row
	 *
	 * The row's procedure fires for the row itself, its text link and its checkbox, and only the
	 * row carries the registry index — so the two children have to walk back up to it.
	 */
    // AS3: the same three-branch resolution opens both `onChatEntryEvent()` and
    // `onInstantMessageEntryEvent()`; extracted so it exists once.
    private resolveChatRow(window: IWindow): {index: number; check: ISelectableWindow | null}
    {
        const parent = window.parent as IWindowContainer | null;
        const asSelectable = window as unknown as ISelectableWindow;

        // A text link or a checkbox: the id lives on the parent row.
        if(parent && (this.isTextLink(window) || asSelectable.isSelected !== undefined))
        {
            return {
                index: parent.id,
                check: (parent.findChildByName('chat_check') as unknown as ISelectableWindow | null) ?? null,
            };
        }

        return {index: window.id, check: null};
    }

    // TS-only: AS3 uses `is ITextLinkWindow`, which has no TypeScript equivalent for an interface.
    // The link window is the only child of a chat row carrying a `link` member.
    private isTextLink(window: IWindow): boolean
    {
        return 'link' in (window as unknown as Record<string, unknown>);
    }

    // --- Shared helpers ---

    /**
	 * Clear the reason list and force it to re-measure
	 *
	 * AS3 sets the list's height to 0 and straight back, which is how this window system is made
	 * to recompute a list's layout after its contents were destroyed.
	 */
    // AS3: the same three lines open `populateRoomReportButton()` and `populateTopics()`.
    private resetReasonList(): void
    {
        if(!this._reasonList) return;

        this._reasonList.destroyListItems();

        const height = this._reasonList.height;

        this._reasonList.height = 0;
        this._reasonList.height = height;
    }

    /**
	 * Grow a row so a wrapped caption fits inside it
	 */
    // AS3: the same pair of height comparisons appears in `populateRoomReportButton()`,
    // `populateTopics()` and `populateChatMessage()`; the trailing margin differs, hence the
    // parameter.
    private growRowToFitLabel(row: IWindowContainer, label: ITextWindow, rowMargin: number = 5): void
    {
        if(label.height < label.textHeight) label.height = label.textHeight + 5;

        const needed = label.height + label.y * 2 + rowMargin;

        if(row.height < needed) row.height = needed;
    }

    /**
	 * One of the modal's text inputs, which live inside widget windows
	 */
    // TS-only: AS3 inlines this double cast at each of its six use sites.
    private getInput(name: string): IIlluminaInputWidget | null
    {
        const holder = this._window?.findChildByName(name) as IWidgetWindow | null;

        return (holder?.widget as IIlluminaInputWidget | null) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::getTopic()
    private getTopic(name: string): ICfhTopic | null
    {
        for(const category of this._habboHelp?.callForHelpCategories ?? [])
        {
            for(const topic of category.topics)
            {
                if(topic.name === name) return topic;
            }
        }

        return null;
    }

    /**
	 * Fill the "who/what is being reported" strip shown above the later steps
	 */
    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::updateUserData()
    private updateUserData(): void
    {
        if(!this._window || !this._habboHelp) return;

        const avatar = this._window.findChildByName('reported_user_avatar');
        const title = this._window.findChildByName('user_info_title');
        const name = this._window.findChildByName('reported_user_name');

        switch(this._reportType)
        {
            // A room report names the room instead of a user.
            case 4:
                if(avatar) avatar.visible = false;
                if(title) title.visible = false;
                if(name) name.caption = this._habboHelp.callForHelpManager?.reportedRoomName ?? '';
                break;

            // Forum reports name neither.
            case 7:
            case 8:
                if(avatar) avatar.visible = false;
                if(title) title.visible = false;
                if(name) name.visible = false;
                break;

            default:
                if(this._habboHelp.reportedUserId > 0)
                {
                    const entry = this._habboHelp.userRegistry.getEntry(this._habboHelp.reportedUserId);

                    if(entry)
                    {
                        this._reportedUserName = entry.userName;

                        const widget = (avatar as IWidgetWindow | null)?.widget as IAvatarImageWidget | null;

                        if(widget) widget.figure = entry.figure;
                    }
                    else
                    {
                        // Reported from outside a room — no figure to draw.
                        if(avatar) avatar.visible = false;

                        this._reportedUserName = this._habboHelp.reportedUserName;
                    }

                    if(name) name.caption = this._reportedUserName;
                }
                break;
        }
    }

    // AS3: .../src/com/sulake/habbo/help/TopicsFlowHelpController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        this._habboHelp = null;
        this._disposed = true;
    }
}
