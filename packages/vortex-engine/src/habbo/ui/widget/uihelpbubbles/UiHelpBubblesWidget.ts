import type {Component} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboFriendBarView} from '@habbo/friendbar/view/IHabboFriendBarView';
import type {IRoomDesktop} from '../../IRoomDesktop';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import type {RoomChatInputWidget} from '../chatinput/RoomChatInputWidget';
import type {RoomToolsWidget} from '../roomtools/RoomToolsWidget';
import type {IBubbleRect} from './UiHelpBubble';
import {OrderedMap} from '@core/utils/OrderedMap';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetScriptProceedMessage} from '../messages/RoomWidgetScriptProceedMessage';
import {HelpBubbleItem} from './HelpBubbleItem';
import {UiHelpBubble} from './UiHelpBubble';
import {UiHelpBubbleIconEnum} from './UiHelpBubbleIconEnum';

/**
 * The guided-tour bubbles: a server-side script sends `helpBubble/add/<element>/<textKey>/...`
 * links, and this widget walks them one at a time, each balloon pointing at a real piece of the
 * interface until the user dismisses it.
 *
 * The element is found by asking four different owners in a fixed order — toolbar, friend bar,
 * room tools, then the chat input as a special case — and the *first* one that knows the name
 * wins. That order is why the same token can mean different things in different bars without
 * ambiguity.
 *
 * It is driven entirely by link events, not by room events: the widget registers itself as an
 * `ILinkEventTracker` for the `helpBubble/` prefix in its own constructor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubblesWidget.as
 */
export class UiHelpBubblesWidget extends RoomWidgetBase implements ILinkEventTracker
{
    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::LINK_PREFIX
    // Name DERIVED: the string `get linkPattern()` returns.
    private static readonly LINK_PREFIX: string = 'helpBubble/';

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::LINK_ADD
    // Name DERIVED: the two verbs `linkReceived()` compares the second path segment against.
    private static readonly LINK_ADD: string = 'add';

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::LINK_REMOVE
    private static readonly LINK_REMOVE: string = 'remove';

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::MIN_LINK_SEGMENTS
    // Name DERIVED: the `< 3` that rejects a link with no payload — "helpBubble", the verb, and at
    // least one argument.
    private static readonly MIN_LINK_SEGMENTS: number = 3;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::BUBBLE_GAP
    // Name DERIVED: the 15px AS3 leaves between the balloon and the element it points at, dropped
    // to 0 when that would push the balloon off the top of the screen.
    private static readonly BUBBLE_GAP: number = 15;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::TOP_MARGIN
    // Name DERIVED: the 50px AS3 tests the balloon's top against before collapsing the gap.
    private static readonly TOP_MARGIN: number = 50;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::CHAT_INPUT_Y_OFFSET
    // Name DERIVED: the 40 subtracted from the balloon height for the chat input, whose balloon
    // sits over the field rather than above it.
    private static readonly CHAT_INPUT_Y_OFFSET: number = 40;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::CHAT_INPUT_X_OFFSET
    private static readonly CHAT_INPUT_X_OFFSET: number = 10;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::ARROW_EDGE_INSET
    // Name DERIVED: the 25 subtracted from half the balloon width when the pointer would run past
    // the balloon's own edge.
    private static readonly ARROW_EDGE_INSET: number = 25;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::ARROW_NEAR_EDGE
    // Name DERIVED: the 30 below which the pointer offset is divided by three instead.
    private static readonly ARROW_NEAR_EDGE: number = 30;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::FLIP_EXTRA_GAP
    // Name DERIVED: the extra 10 added when the balloon flips to below its element.
    private static readonly FLIP_EXTRA_GAP: number = 10;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::LEFT_EDGE_X
    // Name DERIVED: the 10 the balloon is pinned to when it would run off the left.
    private static readonly LEFT_EDGE_X: number = 10;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::DIRECTION_DOWN
    // Name DERIVED: the two pointer directions AS3 assigns inline — "down" means the pointer is on
    // the bottom of the balloon, i.e. the balloon sits *above* its element.
    private static readonly DIRECTION_DOWN: string = 'down';

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::DIRECTION_UP
    private static readonly DIRECTION_UP: string = 'up';

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_roomUI
    // Name DERIVED (`_SafeStr_4617`): assigned in the constructor and read nowhere in the class,
    // in AS3 too.
    private _roomUI: Component | null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_bubbles
    // Live bubbles, keyed by element name. Ordered because `onDesktopResized()` walks them.
    private _bubbles: OrderedMap<string, UiHelpBubble> | null = new OrderedMap<string, UiHelpBubble>();

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_toolBar
    private _toolBar: IHabboToolbar | null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_friendBar
    private _friendBar: IHabboFriendBarView | null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_roomTools
    private _roomTools: RoomToolsWidget | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_chatInput
    // Name DERIVED (`_SafeStr_7424`): returned by `get chatInput()`.
    private _chatInput: RoomChatInputWidget | null = null;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_items
    // Name DERIVED (`_SafeStr_5257`): the queue of bubbles still to show. It is never trimmed —
    // `_index` walks it forward, so a second script appends to what the first left behind.
    private _items: HelpBubbleItem[] | null = [];

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_index
    // Name DERIVED (`_SafeStr_6991`): how far through `_items` the tour has got.
    private _index: number = 0;

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::_localization
    // Held separately from the base class's `localizations`, as in AS3 — both are the same object.
    private _localization: IHabboLocalizationManager | null;

    /**
     * The two sibling widgets are pulled off the desktop rather than injected: they must already
     * exist, which is why AS3 creates `RWE_UI_HELP_BUBBLE` after room tools and chat input in
     * `RoomUI`. Creating it earlier would leave both null and silently disable two of the four
     * element lookups.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubblesWidget.as::UiHelpBubblesWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        friendBarView: IHabboFriendBarView | null,
        toolbar: IHabboToolbar | null,
        desktop: IRoomDesktop | null,
        roomUI: Component | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._roomUI = roomUI;
        this._friendBar = friendBarView;
        this._toolBar = toolbar;
        this._localization = localizations;

        if(desktop !== null)
        {
            this._roomTools = (desktop.getWidget('RWE_ROOM_TOOLS') as RoomToolsWidget | null) ?? null;
            this._chatInput = (desktop.getWidget('RWE_CHAT_INPUT_WIDGET') as RoomChatInputWidget | null) ?? null;
        }

        // AS3 casts the window manager to the base Component to reach its context. Every Component
        // shares one context, so which one is used does not matter.
        (windowManager as unknown as Component).context?.addLinkEventTracker(this);
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::get toolBar()
    get toolBar(): IHabboToolbar | null
    {
        return this._toolBar;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::get friendBar()
    get friendBar(): IHabboFriendBarView | null
    {
        return this._friendBar;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::get roomTools()
    get roomTools(): RoomToolsWidget | null
    {
        return this._roomTools;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::get chatInput()
    get chatInput(): RoomChatInputWidget | null
    {
        return this._chatInput;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::get linkPattern()
    get linkPattern(): string
    {
        return UiHelpBubblesWidget.LINK_PREFIX;
    }

    /**
     * `helpBubble/add/<element>/<textKey>[/<element>/<textKey>…]` queues one bubble per pair, and
     * `helpBubble/remove/<element>` drops one.
     *
     * The pair walk is a counter rather than a stride of two, so an `add` with an odd number of
     * arguments simply leaves the last half-built item unqueued rather than failing.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubblesWidget.as::linkReceived()
    linkReceived(link: string): void
    {
        if(this._bubbles === null) this._bubbles = new OrderedMap<string, UiHelpBubble>();
        if(this._items === null) this._items = [];

        const parts = link.split('/');

        if(parts.length < UiHelpBubblesWidget.MIN_LINK_SEGMENTS) return;

        if(parts[1] === UiHelpBubblesWidget.LINK_ADD)
        {
            let counter = 0;
            let item: HelpBubbleItem | null = null;

            for(let index = 2; index < parts.length; index++)
            {
                counter++;

                if(counter === 1)
                {
                    item = new HelpBubbleItem();

                    const token = parts[index];

                    // An unknown token is used verbatim, so a script may name an icon id directly.
                    item.name = UiHelpBubbleIconEnum.resolve(token) ?? token;
                    item.modal = true;
                }

                if(counter === 2 && item !== null)
                {
                    item.text = this._localization?.getLocalization(parts[index], parts[index]) ?? parts[index];
                    counter = 0;

                    this._items.push(item);
                    item = null;
                }
            }

            this.addNextBubble();
        }
        else if(parts[1] === UiHelpBubblesWidget.LINK_REMOVE)
        {
            this.removeHelpBubble(parts[2]);
        }
    }

    /**
     * Shows the next queued bubble, **skipping any whose element cannot be found** — that is the
     * recursive `addNextBubble()` in the else branch, and it is why a tour naming an icon that is
     * hidden on this hotel still reaches its later steps.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubblesWidget.as::addNextBubble()
    addNextBubble(): void
    {
        if(this._items === null || this._items.length === 0 || this._items.length < this._index + 1) return;

        const item = this._items[this._index];
        const hasNext = this._items.length > this._index + 1;
        const name = item.name;
        const bubble = new UiHelpBubble(this, item, hasNext);

        // AS3 replaces a bubble already showing for the same element — and `removeHelpBubble()`
        // ends by calling this method again, so the replacement path re-enters here before the
        // new bubble has been positioned.
        if(this._bubbles?.hasKey(name) === true) this.removeHelpBubble(name);

        const rect = this.checkElementPosition(bubble);

        this._index = this._index + 1;

        if(rect === null)
        {
            bubble.dispose();
            this.addNextBubble();

            return;
        }

        bubble.setPosition({x: rect.x, y: rect.y});
        bubble.getWindow()?.desktop?.addEventListener('WE_RESIZED', this.onDesktopResized);
        // A second pass in "modal mode", which returns the element's untouched bounds — the hole
        // must sit over the element, not over the balloon's computed position.
        bubble.setModal(this.checkElementPosition(bubble, true));
        this.addHelpBubble(name, bubble);
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::removeHelpBubble()
    // Advancing the tour and dismissing a bubble are the same operation.
    removeHelpBubble(name: string): void
    {
        if(this._bubbles === null) return;

        const bubble = this._bubbles.getValue(name);

        if(bubble === null) return;

        this._bubbles.remove(name);
        bubble.dispose();
        this.addNextBubble();
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::sendScriptProceedMessage()
    // Raised only by the *last* bubble's dismissal — see `UiHelpBubble.onLastBubble()`.
    sendScriptProceedMessage(): void
    {
        const message = new RoomWidgetScriptProceedMessage(RoomWidgetScriptProceedMessage.ANSWER);

        this.messageListener?.processWidgetMessage(message);
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::dispose()
    // Guarded on `disposed` rather than on the base's own guard, as in AS3.
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._bubbles !== null)
        {
            for(const bubble of this._bubbles.getValues())
            {
                bubble.dispose();
            }

            this._bubbles.dispose();
            this._bubbles = null;
            this._items = null;
        }

        this._roomUI = null;
        this._localization = null;

        super.dispose();
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::addHelpBubble()
    private addHelpBubble(name: string, bubble: UiHelpBubble | null): void
    {
        if(this._bubbles === null || bubble === null) return;

        this._bubbles.add(name, bubble);
    }

    /**
     * Finds the element the bubble names and works out where the balloon goes.
     *
     * With `modalMode` true it stops early and hands back the element's own global bounds — that
     * second call is what the modal hole is cut from. Otherwise it returns the balloon's position
     * and, as a side effect, has already told the bubble which window dismisses it
     * (`setCallback`) and which way its pointer faces (`setArrowPos`).
     *
     * The lookup order is toolbar → friend bar → room tools → chat input, first match wins.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/UiHelpBubblesWidget.as::checkElementPosition()
    private checkElementPosition(bubble: UiHelpBubble | null, modalMode: boolean = false): IBubbleRect | null
    {
        const window = bubble?.getWindow() ?? null;

        if(bubble === null || window === null) return null;

        const name = bubble.getName();

        if(name === '') return null;

        const bubbleHeight = Math.trunc(window.height);
        const bubbleWidth = Math.trunc(window.width);
        let direction = UiHelpBubblesWidget.DIRECTION_DOWN;
        // AS3 starts the pointer offset at -1, and the chat-input branch is the only one that ever
        // uses that value — every other path overwrites it with 0 first.
        let arrowOffset = -1;
        let rect: IBubbleRect | null = null;

        if(this.toolBar !== null)
        {
            const icon = this.toolBar.getIcon(name);

            if(icon !== null)
            {
                rect = {x: 0, y: 0, width: 0, height: 0};
                icon.getGlobalRectangle(rect);
                bubble.setCallback(icon);
            }
        }

        if(this.friendBar !== null && rect === null)
        {
            const icon = this.friendBar.getIconLocation(name);

            if(icon !== null)
            {
                rect = {x: 0, y: 0, width: 0, height: 0};
                icon.getGlobalRectangle(rect);
                bubble.setCallback(icon as IWindow);
            }
        }

        if(rect === null && this.roomTools !== null)
        {
            const icon = this.roomTools.getIconLocation(name);

            if(icon !== null)
            {
                rect = {x: 0, y: 0, width: 0, height: 0};
                icon.getGlobalRectangle(rect);
                bubble.setCallback(icon);
            }
        }

        if(rect === null && this.chatInput !== null && name === UiHelpBubbleIconEnum.CHAT_INPUT)
        {
            const elements = this.chatInput.getChatInputElements() ?? [];
            let container: IWindowContainer | null = null;
            let field: ITextFieldWindow | null = null;

            if(elements.length > 1)
            {
                container = elements[0] as IWindowContainer;
                field = elements[1] as unknown as ITextFieldWindow;
            }

            // AS3 dereferences the container unguarded here, so a chat input that reported fewer
            // than two elements throws rather than falling through.
            const chatRect = container?.rectangle ?? null;

            if(chatRect !== null)
            {
                if(modalMode) return chatRect;

                chatRect.y -= bubbleHeight - UiHelpBubblesWidget.CHAT_INPUT_Y_OFFSET;
                chatRect.x += chatRect.width / 2 - UiHelpBubblesWidget.CHAT_INPUT_X_OFFSET;

                bubble.setChatFieldCallback(field);
                bubble.setArrowPos(direction, arrowOffset);

                return chatRect;
            }
        }

        if(rect === null) return null;

        if(modalMode) return rect;

        const original = {...rect};
        let gap = UiHelpBubblesWidget.BUBBLE_GAP;
        const desktopWidth = Math.trunc(window.desktop?.width ?? 0);

        // No room for the gap above the element — give it up rather than push the balloon off.
        if(rect.y - (bubbleHeight + gap) < UiHelpBubblesWidget.TOP_MARGIN) gap = 0;

        direction = UiHelpBubblesWidget.DIRECTION_DOWN;
        arrowOffset = 0;

        rect.x += rect.width / 2;
        rect.y -= bubbleHeight + gap;

        // Both `right` terms share the element's x, so this is always half the element's width —
        // AS3 computes it the long way and the cap below can therefore only bite for a very wide
        // element. Kept as written.
        let pointer = (rect.x + rect.width) - (original.x + original.width);

        if(pointer >= bubbleWidth / 2) pointer = bubbleWidth / 2 - UiHelpBubblesWidget.ARROW_EDGE_INSET;

        // Still off the top: flip the balloon under its element and turn the pointer around.
        if(rect.y < bubbleHeight)
        {
            rect.y += rect.height + bubbleHeight + UiHelpBubblesWidget.FLIP_EXTRA_GAP;
            direction = UiHelpBubblesWidget.DIRECTION_UP;

            if(pointer <= UiHelpBubblesWidget.ARROW_NEAR_EDGE) pointer /= 3;

            arrowOffset = pointer;
            bubble.setArrowPos(direction, arrowOffset);
        }

        if(rect.x < bubbleWidth / 2)
        {
            rect.x = UiHelpBubblesWidget.LEFT_EDGE_X;
            arrowOffset -= bubbleWidth / 2 - UiHelpBubblesWidget.ARROW_NEAR_EDGE;
            bubble.setArrowPos(direction, arrowOffset);

            return rect;
        }

        if(rect.x + bubbleWidth / 2 > desktopWidth)
        {
            rect.x = desktopWidth - bubbleWidth / 2;
            arrowOffset = bubbleWidth / 4;
            bubble.setArrowPos(direction, arrowOffset);

            return rect;
        }

        bubble.setArrowPos(direction, arrowOffset);

        return rect;
    }

    // AS3: .../widget/uihelpbubbles/UiHelpBubblesWidget.as::onDesktopResized()
    // Re-runs the whole lookup per bubble, so a balloon follows an icon that moved rather than
    // just being clamped back on screen.
    private onDesktopResized = (): void =>
    {
        if(this._bubbles === null) return;

        for(const bubble of this._bubbles.getValues())
        {
            const rect = this.checkElementPosition(bubble);

            if(rect === null) continue;

            bubble.setPosition({x: rect.x, y: rect.y});
            bubble.setModal(this.checkElementPosition(bubble, true));
        }
    };
}
