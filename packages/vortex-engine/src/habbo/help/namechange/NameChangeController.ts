import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {
    UserObjectMessageEvent
} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import type {
    UserObjectMessageParser
} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import {
    UserNameChangedMessageEvent
} from '@habbo/communication/messages/incoming/help/UserNameChangedMessageEvent';
import type {
    UserNameChangedMessageParser
} from '@habbo/communication/messages/parser/help/UserNameChangedMessageParser';
import {
    CheckUserNameResultMessageEvent
} from '@habbo/communication/messages/incoming/help/CheckUserNameResultMessageEvent';
import type {
    CheckUserNameResultMessageParser
} from '@habbo/communication/messages/parser/help/CheckUserNameResultMessageParser';
import {
    ChangeUserNameResultMessageEvent
} from '@habbo/communication/messages/incoming/help/ChangeUserNameResultMessageEvent';
import type {
    ChangeUserNameResultMessageParser
} from '@habbo/communication/messages/parser/help/ChangeUserNameResultMessageParser';
import {
    CheckUserNameMessageComposer
} from '@habbo/communication/messages/outgoing/help/CheckUserNameMessageComposer';
import {
    ChangeUserNameMessageComposer
} from '@habbo/communication/messages/outgoing/help/ChangeUserNameMessageComposer';
import {HabboHelpTutorialEvent} from '../enum/HabboHelpTutorialEvent';
import type {INameChangeUI} from '../INameChangeUI';
import type {HabboHelp} from '../HabboHelp';
import {NameChangeView} from './NameChangeView';

/**
 * NameChangeController — the in-client "change my name" flow.
 *
 * It owns the four subscriptions the flow needs and the view that reads them. Two of those are not
 * about the dialog at all: `UserObject` and `UserNameChanged` are how the controller learns what
 * your name currently *is*, which is what the first page offers to keep.
 *
 * Reached from the own-avatar menu (`RWUAM_START_NAME_CHANGE` → `HabboHelp.startNameChange()`).
 * Before this was ported the whole chain existed and ended in a log line.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/namechange/NameChangeController.as
 */
export class NameChangeController implements INameChangeUI, IDisposable
{
    /** The view id, and the tutorial step this dialog stands for. */
    // AS3: .../NameChangeController.as::NAME_CHANGE
    public static readonly NAME_CHANGE: string = 'TUI_NAME_VIEW';

    // AS3: .../NameChangeController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    /** Derived name — `_SafeStr_4886`: the dialog, built on first show and thrown away on close. */
    // AS3: .../NameChangeController.as::_SafeStr_4886
    private _view: NameChangeView | null = null;

    // AS3: .../NameChangeController.as::_ownUserName
    private _ownUserName: string = '';

    /** Derived name — `_SafeStr_8762`: own web id, used to tell your own rename from anyone else's. */
    // AS3: .../NameChangeController.as::_SafeStr_8762
    private _ownUserId: number = 0;

    // AS3: .../NameChangeController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../NameChangeController.as::NameChangeController()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;

        const communication = habboHelp.communicationManager;

        communication?.addHabboConnectionMessageEvent(new UserObjectMessageEvent(this.onUserObject));
        communication?.addHabboConnectionMessageEvent(new UserNameChangedMessageEvent(this.onUserNameChange));
        communication?.addHabboConnectionMessageEvent(new CheckUserNameResultMessageEvent(this.onCheckUserNameResult));
        communication?.addHabboConnectionMessageEvent(
            new ChangeUserNameResultMessageEvent(this.onChangeUserNameResult)
        );
    }

    // AS3: .../NameChangeController.as::get help()
    get help(): HabboHelp | null
    {
        return this._habboHelp;
    }

    // AS3: .../NameChangeController.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._habboHelp?.localization ?? null;
    }

    // AS3: .../NameChangeController.as::get myName()
    get myName(): string
    {
        return this._ownUserName;
    }

    // AS3: .../NameChangeController.as::get ownUserName()
    get ownUserName(): string
    {
        return this._ownUserName;
    }

    // AS3: .../NameChangeController.as::get ownUserId()
    get ownUserId(): number
    {
        return this._ownUserId;
    }

    /**
     * AS3 reads the layout off the component's own asset library and appends `"_xml"`; this port
     * has no per-component library, so `HabboHelp.getXmlWindow()` is the equivalent pair and
     * already does that suffixing.
     */
    // AS3: .../NameChangeController.as::buildXmlWindow()
    buildXmlWindow(name: string, layer: number = 1): IWindow | null
    {
        return this._habboHelp?.getXmlWindow(name, layer) ?? null;
    }

    // AS3: .../NameChangeController.as::showView()
    showView(): void
    {
        if(this._view === null || this._view.disposed) this._view = new NameChangeView(this);

        this._view.showMainView();
        this.prepareForTutorial();
    }

    // AS3: .../NameChangeController.as::hideView()
    hideView(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    /**
     * AS3: .../NameChangeController.as::disposeView()
     *
     * Identical to `hideView()` in the primary tree — AS3's tail call is `disposeWindow()`, whose
     * body is empty. Both are kept because both are called, and collapsing them would hide that the
     * source distinguishes them.
     */
    // AS3: .../NameChangeController.as::disposeView()
    disposeView(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    /** Leaving a room takes the dialog down with it. */
    // AS3: .../NameChangeController.as::setRoomSessionStatus()
    setRoomSessionStatus(inRoom: boolean): void
    {
        if(!inRoom) this.disposeView();
    }

    // AS3: .../NameChangeController.as::prepareForTutorial()
    prepareForTutorial(): void
    {
        this._habboHelp?.events.emit(
            HabboHelpTutorialEvent.AVATAR_TUTORIAL_START,
            new HabboHelpTutorialEvent(HabboHelpTutorialEvent.AVATAR_TUTORIAL_START)
        );
    }

    /**
     * AS3: .../NameChangeController.as::windowProcedure()
     *
     * The frame's own procedure is the view's; this one is AS3's separate close handler, kept
     * because AS3 declares it public and the two disagree — the view's `header_button_close` calls
     * `hideView()`, this one `disposeView()`.
     */
    // AS3: .../NameChangeController.as::windowProcedure()
    windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(window.name === 'header_button_close') this.disposeView();
    };

    // AS3: .../NameChangeController.as::checkName()
    checkName(name: string): void
    {
        this._habboHelp?.sendMessage(new CheckUserNameMessageComposer(name));
    }

    // AS3: .../NameChangeController.as::changeName()
    changeName(name: string): void
    {
        this._habboHelp?.sendMessage(new ChangeUserNameMessageComposer(name));
    }

    /** The "you are now called X" notice, once the server has accepted the rename. */
    // AS3: .../NameChangeController.as::onUserNameChanged()
    onUserNameChanged(name: string): void
    {
        const localization = this._habboHelp?.localization ?? null;
        const windowManager = this._habboHelp?.windowManager ?? null;

        if(localization === null || windowManager === null) return;

        localization.registerParameter('help.tutorial.name.changed', 'name', name);
        windowManager.alert('${generic.notice}', '${help.tutorial.name.changed}', 0, (dialog) =>
        {
            dialog.dispose();
        });
    }

    // AS3: .../NameChangeController.as::onChangeUserNameResult()
    private onChangeUserNameResult = (event: IMessageEvent): void =>
    {
        const parser = event.parser as ChangeUserNameResultMessageParser | null;

        if(parser === null) return;

        if(parser.resultCode === ChangeUserNameResultMessageEvent.NAME_OK)
        {
            this.onUserNameChanged(parser.name);
            this.hideView();

            return;
        }

        this._view?.setNameNotAvailableView(parser.resultCode, parser.name, parser.nameSuggestions);
    };

    /**
     * AS3: .../NameChangeController.as::onCheckUserNameResult()
     *
     * Returns early with no view: a check reply can only arrive because the dialog asked for one,
     * and AS3 guards it rather than reopening.
     *
     * The success constant it compares against is `ChangeUserNameResult`'s, not its own — AS3 reads
     * `_SafeCls_2167._SafeStr_6694` here too, and both messages share the code space.
     */
    // AS3: .../NameChangeController.as::onCheckUserNameResult()
    private onCheckUserNameResult = (event: IMessageEvent): void =>
    {
        if(this._view === null) return;

        const parser = event.parser as CheckUserNameResultMessageParser | null;

        if(parser === null) return;

        if(parser.resultCode === ChangeUserNameResultMessageEvent.NAME_OK)
        {
            this._view.checkedName = parser.name;

            return;
        }

        this._view.setNameNotAvailableView(parser.resultCode, parser.name, parser.nameSuggestions);
    };

    // AS3: .../NameChangeController.as::onUserObject()
    private onUserObject = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserObjectMessageParser | null;

        if(parser === null) return;

        this._ownUserId = parser.id;
        this._ownUserName = parser.name;
    };

    /** Someone was renamed — only your own rename changes what this controller offers to keep. */
    // AS3: .../NameChangeController.as::onUserNameChange()
    private onUserNameChange = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserNameChangedMessageParser | null;

        if(parser === null) return;

        if(this._ownUserId === parser.webId) this._ownUserName = parser.newName;
    };

    // AS3: .../NameChangeController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../NameChangeController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.disposeView();
        this._habboHelp = null;
        this._disposed = true;
    }
}
