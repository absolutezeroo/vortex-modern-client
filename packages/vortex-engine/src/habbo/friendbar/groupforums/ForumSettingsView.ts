import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ForumPermissions} from '@habbo/communication/messages/parser/groupforums/ForumPermissions';
import type {GroupForumController} from './GroupForumController';
import {GroupForumView} from './GroupForumView';

/**
 * Who may read, post, start threads and moderate — four selectors of the same four ranks.
 *
 * The three that matter are **cascaded**: reading is the floor for posting, posting is the floor
 * for starting threads. `setSelectorState()` enforces that by disabling and dimming every rank
 * below the floor and, if the current pick has fallen below it, dragging the pick up to the floor
 * and returning the value it settled on. That returned value is then the next selector's floor,
 * which is why `initControls()` and `onSelectionChanged()` both run the three in order.
 *
 * Moderation is not in the chain: its floor is the constant 2.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ForumSettingsView.as
 */
export class ForumSettingsView
{
    /**
     * The blend a disabled rank is dimmed to. **Name derived** — AS3 declares the constant and then
     * inlines it at all four of its uses in `setSelectorState()`.
     */
    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_11647
    private static readonly DISABLED_BLEND: number = 0.5;

    /**
     * How many ranks a selector offers. AS3 inlines this as a literal `4` in `setSelectorState()`'s
     * second loop; it is not declared as a constant at all. Named here because the loop bound and
     * the moderation floor of 2 are otherwise two unexplained numbers.
     */
    // TS-only: no AS3 counterpart; the bound is a literal there.
    private static readonly RANK_COUNT: number = 4;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_4593
    private _controller: GroupForumController | null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_4684
    private _view: GroupForumView | null;

    // AS3: .../groupforums/ForumSettingsView.as::_window
    private _window: IFrameWindow | null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_7450
    // **Names derived** from the layout children, here and for the next three.
    private _readSelector: ISelectorWindow | null = null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_6512
    private _postMessageSelector: ISelectorWindow | null = null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_6825
    private _postThreadSelector: ISelectorWindow | null = null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_7322
    private _moderateSelector: ISelectorWindow | null = null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_4633
    private _forum: ForumPermissions | null;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_6877
    // **Names derived** from the permission each holds — the four values sent on OK, in order.
    private _readPermissions: number = 0;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_6677
    private _postMessagePermissions: number = 0;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_7723
    private _postThreadPermissions: number = 0;

    // AS3: .../groupforums/ForumSettingsView.as::_SafeStr_8299
    private _moderatePermissions: number = 0;

    // AS3: .../groupforums/ForumSettingsView.as::ForumSettingsView()
    constructor(view: GroupForumView, x: number, y: number, forum: ForumPermissions)
    {
        this._view = view;
        this._controller = this._view.controller;
        this._forum = forum;
        this._window = this._controller?.windowManager?.buildWidgetLayout('groupforum_forum_settings_xml') as IFrameWindow | null ?? null;

        if(this._window === null) return;

        this._window.x = x;

        const desktopWidth = this._controller?.windowManager?.getDesktop(1)?.width ?? 0;

        if(this._window.x + this._window.width > desktopWidth)
        {
            this._window.x = desktopWidth - this._window.width;
        }

        this._window.y = y;

        this.initControls();
    }

    /**
     * Applies a floor to one selector and reports where the selection ended up.
     *
     * The label beside each rank is dimmed with it — the labels are siblings of the selector, not
     * children, so they are reached through the selector's parent by name (`label0`…`label3`).
     */
    // AS3: .../groupforums/ForumSettingsView.as::setSelectorState()
    private static setSelectorState(selector: ISelectorWindow | null, floor: number, selected: number): number
    {
        if(selector === null) return selected;

        if(selected < floor)
        {
            selected = floor;
        }

        const parent = selector.parent as IWindowContainer | null;

        for(let i = 0; i < floor; i++)
        {
            const selectable = selector.getSelectableByName(String(i));

            if(selectable !== null)
            {
                selectable.disable();
                selectable.blend = ForumSettingsView.DISABLED_BLEND;

                const label = parent?.findChildByName('label' + i) ?? null;

                if(label !== null)
                {
                    label.blend = ForumSettingsView.DISABLED_BLEND;
                }
            }
        }

        for(let i = floor; i < ForumSettingsView.RANK_COUNT; i++)
        {
            const selectable = selector.getSelectableByName(String(i));

            if(selectable !== null)
            {
                selectable.enable();
                selectable.blend = 1;

                const label = parent?.findChildByName('label' + i) ?? null;

                if(label !== null)
                {
                    label.blend = 1;
                }

                if(i === selected)
                {
                    selector.setSelected(selectable);
                }
            }
        }

        return selected;
    }

    // AS3: .../groupforums/ForumSettingsView.as::getSelectorState()
    // The rank is the selectable's own name — the layout names them "0" through "3".
    private static getSelectorState(selector: ISelectorWindow | null): number
    {
        const selected = selector?.getSelected() ?? null;

        if(selected === null)
        {
            return 0;
        }

        return parseInt(selected.name, 10) || 0;
    }

    // AS3: .../groupforums/ForumSettingsView.as::focus()
    // Re-initialises only when the forum actually changed; otherwise the window is just raised, so
    // an unsaved edit survives being re-opened from the same forum.
    focus(forum: ForumPermissions): void
    {
        if(this._forum !== forum)
        {
            this._forum = forum;
            this.initControls();
        }

        this._window?.activate();
    }

    // AS3: .../groupforums/ForumSettingsView.as::initControls()
    private initControls(): void
    {
        if(this._window === null || this._forum === null) return;

        const clickArea = GroupForumView.initTopAreaForForum(this._window, this._forum);

        if(clickArea !== null)
        {
            clickArea.removeEventListener('WME_CLICK', this.onTopAreaClick);
            clickArea.addEventListener('WME_CLICK', this.onTopAreaClick);
        }

        const cancelButton = this._window.findChildByName('cancel_btn');

        cancelButton?.removeEventListener('WME_CLICK', this.onCancelButtonClick);
        cancelButton?.addEventListener('WME_CLICK', this.onCancelButtonClick);

        const closeButton = this._window.findChildByName('header_button_close');

        closeButton?.removeEventListener('WME_CLICK', this.onCancelButtonClick);
        closeButton?.addEventListener('WME_CLICK', this.onCancelButtonClick);

        const okButton = this._window.findChildByName('ok_btn');

        okButton?.removeEventListener('WME_CLICK', this.onPostButtonClick);
        okButton?.addEventListener('WME_CLICK', this.onPostButtonClick);

        this._readSelector = this._window.findChildByName('read_selector') as ISelectorWindow | null;
        this._readSelector?.addEventListener('WME_OVER', this.onReadSelectorHover);
        this.addSelectorListeners(this._readSelector);

        this._postMessageSelector = this._window.findChildByName('post_message_selector') as ISelectorWindow | null;
        this._postMessageSelector?.addEventListener('WME_OVER', this.onPostMessageSelectorHover);
        this.addSelectorListeners(this._postMessageSelector);

        this._postThreadSelector = this._window.findChildByName('post_thread_selector') as ISelectorWindow | null;
        this._postThreadSelector?.addEventListener('WME_OVER', this.onPostThreadSelectorHover);
        this.addSelectorListeners(this._postThreadSelector);

        this._moderateSelector = this._window.findChildByName('moderate_selector') as ISelectorWindow | null;
        this._moderateSelector?.addEventListener('WME_OVER', this.onModerateSelectorHover);
        this.addSelectorListeners(this._moderateSelector);

        this._readPermissions = ForumSettingsView.setSelectorState(this._readSelector, 0, this._forum.readPermissions);
        this._postMessagePermissions = ForumSettingsView.setSelectorState(this._postMessageSelector, this._readPermissions, this._forum.postMessagePermissions);
        this._postThreadPermissions = ForumSettingsView.setSelectorState(this._postThreadSelector, this._postMessagePermissions, this._forum.postThreadPermissions);
        this._moderatePermissions = ForumSettingsView.setSelectorState(this._moderateSelector, 2, this._forum.moderatePermissions);
    }

    // AS3: .../groupforums/ForumSettingsView.as::dispose()
    dispose(): void
    {
        if(this._controller !== null) this._controller.forumSettingsView = null;

        this._window?.dispose();
        this._window = null;
    }

    // AS3: .../groupforums/ForumSettingsView.as::onTopAreaClick()
    private onTopAreaClick = (_event: WindowMouseEvent): void =>
    {
        if(this._forum !== null)
        {
            this._controller?.context.createLinkEvent('group/' + this._forum.groupId);
        }
    };

    // AS3: .../groupforums/ForumSettingsView.as::onPostButtonClick()
    // Closes on send without waiting for a reply — a rejected change is silent, and the settings
    // will simply be the old ones the next time the forum is opened.
    private onPostButtonClick = (_event: WindowMouseEvent): void =>
    {
        if(this._forum !== null)
        {
            this._controller?.updateForumSettings(
                this._forum.groupId,
                this._readPermissions,
                this._postMessagePermissions,
                this._postThreadPermissions,
                this._moderatePermissions
            );
        }

        this.dispose();
    };

    // AS3: .../groupforums/ForumSettingsView.as::onCancelButtonClick()
    private onCancelButtonClick = (_event: WindowMouseEvent): void =>
    {
        this.dispose();
    };

    // AS3: .../groupforums/ForumSettingsView.as::addSelectorListeners()
    private addSelectorListeners(selector: ISelectorWindow | null): void
    {
        if(selector === null) return;

        for(let i = 0; i < selector.numSelectables; i++)
        {
            const selectable = selector.getSelectableAt(i);

            selectable?.removeEventListener('WE_SELECTED', this.onSelectionChanged);
            selectable?.addEventListener('WE_SELECTED', this.onSelectionChanged);
        }
    }

    /**
     * Re-cascades the floors after any change. The read and moderate ranks are only *read* back;
     * the two in the middle are re-applied, because raising the read rank can have pushed either of
     * them up.
     */
    // AS3: .../groupforums/ForumSettingsView.as::onSelectionChanged()
    private onSelectionChanged = (_event: WindowEvent): void =>
    {
        this._readPermissions = ForumSettingsView.getSelectorState(this._readSelector);
        this._postMessagePermissions = ForumSettingsView.setSelectorState(
            this._postMessageSelector,
            this._readPermissions,
            ForumSettingsView.getSelectorState(this._postMessageSelector)
        );
        this._postThreadPermissions = ForumSettingsView.setSelectorState(
            this._postThreadSelector,
            this._postMessagePermissions,
            ForumSettingsView.getSelectorState(this._postThreadSelector)
        );
        this._moderatePermissions = ForumSettingsView.getSelectorState(this._moderateSelector);
    };

    // AS3: .../groupforums/ForumSettingsView.as::onReadSelectorHover()
    private onReadSelectorHover = (_event: WindowMouseEvent): void =>
    {
        this._controller?.tracking?.trackEventLogOncePerSession('InterfaceExplorer', 'hover', 'forum.can.read.seen');
    };

    // AS3: .../groupforums/ForumSettingsView.as::onPostMessageSelectorHover()
    private onPostMessageSelectorHover = (_event: WindowMouseEvent): void =>
    {
        this._controller?.tracking?.trackEventLogOncePerSession('InterfaceExplorer', 'hover', 'forum.can.post.seen');
    };

    // AS3: .../groupforums/ForumSettingsView.as::onPostThreadSelectorHover()
    private onPostThreadSelectorHover = (_event: WindowMouseEvent): void =>
    {
        this._controller?.tracking?.trackEventLogOncePerSession('InterfaceExplorer', 'hover', 'forum.can.start.thread.seen');
    };

    // AS3: .../groupforums/ForumSettingsView.as::onModerateSelectorHover()
    private onModerateSelectorHover = (_event: WindowMouseEvent): void =>
    {
        this._controller?.tracking?.trackEventLogOncePerSession('InterfaceExplorer', 'hover', 'forum.can.moderate.seen');
    };
}
