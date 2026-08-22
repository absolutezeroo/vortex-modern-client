import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {MeMenuWidget} from '@habbo/ui/widget/memenu/MeMenuWidget';
import {Logger} from '@core/utils/Logger';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '@habbo/toolbar/HabboToolbarIconEnum';
import {HabboHelpTutorialEvent} from '@habbo/help/enum/HabboHelpTutorialEvent';
import {AvatarEditorIdEnum} from '@habbo/avatar/enum/AvatarEditorIdEnum';
import {MiniMailMessageEvent} from '@habbo/messenger/events/MiniMailMessageEvent';
import type {PurseEvent} from '@habbo/catalog/purse/PurseEvent';
import {RoomWidgetAvatarExpressionMessage} from '../widget/messages/RoomWidgetAvatarExpressionMessage';
import {RoomWidgetChangePostureMessage} from '../widget/messages/RoomWidgetChangePostureMessage';
import {RoomWidgetDanceMessage} from '../widget/messages/RoomWidgetDanceMessage';
import {RoomWidgetMeMenuMessage} from '../widget/messages/RoomWidgetMeMenuMessage';
import {RoomWidgetOpenCatalogMessage} from '../widget/messages/RoomWidgetOpenCatalogMessage';
import {RoomWidgetOpenInventoryMessage} from '../widget/messages/RoomWidgetOpenInventoryMessage';
import {RoomWidgetSelectEffectMessage} from '../widget/messages/RoomWidgetSelectEffectMessage';
import {RoomWidgetStoreSettingsMessage} from '../widget/messages/RoomWidgetStoreSettingsMessage';
import {RoomWidgetHabboClubUpdateEvent} from '../widget/events/RoomWidgetHabboClubUpdateEvent';
import {RoomWidgetMiniMailUpdateEvent} from '../widget/events/RoomWidgetMiniMailUpdateEvent';
import {RoomWidgetPurseUpdateEvent} from '../widget/events/RoomWidgetPurseUpdateEvent';
import {RoomWidgetSettingsUpdateEvent} from '../widget/events/RoomWidgetSettingsUpdateEvent';
import {RoomWidgetTutorialEvent} from '../widget/events/RoomWidgetTutorialEvent';
import {RoomWidgetUpdateEffectsUpdateEvent} from '../widget/events/RoomWidgetUpdateEffectsUpdateEvent';

const log = Logger.getLogger('habbo.ui.handler.MeMenuWidgetHandler');

/**
 * The me-menu's back end: 24 widget message types covering dancing, expressions, effects, the
 * purse, the club, sound settings, the avatar editor and navigation home.
 *
 * It is the only widget handler that subscribes to **five** managers at once — inventory, toolbar,
 * help, catalogue and messenger — and it does so from its own `container` setter, unsubscribing
 * the previous container first. Everything it learns is re-broadcast as a widget update event; the
 * menu views never read a manager directly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/MeMenuWidgetHandler.as
 */
export class MeMenuWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/MeMenuWidgetHandler.as::EFFECTS_CHANGED
    // Name DERIVED: the inventory event AS3 subscribes to inline.
    private static readonly EFFECTS_CHANGED: string = 'HIEE_EFFECTS_CHANGED';

    // AS3: .../handler/MeMenuWidgetHandler.as::HABBO_CLUB_CHANGED
    private static readonly HABBO_CLUB_CHANGED: string = 'HIHCE_HABBO_CLUB_CHANGED';

    // AS3: .../handler/MeMenuWidgetHandler.as::TOOLBAR_CLICK
    private static readonly TOOLBAR_CLICK: string = 'HTE_TOOLBAR_CLICK';

    // AS3: .../handler/MeMenuWidgetHandler.as::CREDIT_BALANCE_EVENT
    // Name DERIVED: the catalogue purse event AS3 subscribes to inline.
    private static readonly CREDIT_BALANCE_EVENT: string = 'catalog_purse_credit_balance';

    // AS3: .../handler/MeMenuWidgetHandler.as::GET_EFFECTS
    // Name DERIVED: the six message types AS3 pushes as bare strings and never declares.
    private static readonly GET_EFFECTS: string = 'RWCM_MESSAGE_GET_EFFECTS';

    // AS3: .../handler/MeMenuWidgetHandler.as::STOP_EFFECT
    private static readonly STOP_EFFECT: string = 'RWGOI_MESSAGE_STOP_EFFECT';

    // AS3: .../handler/MeMenuWidgetHandler.as::NAVIGATE_TO_ROOM
    // Declared in `getWidgetMessages()` and handled by no case — it falls to the default.
    private static readonly NAVIGATE_TO_ROOM: string = 'RWGOI_MESSAGE_NAVIGATE_TO_ROOM';

    // AS3: .../handler/MeMenuWidgetHandler.as::NAVIGATE_HOME
    private static readonly NAVIGATE_HOME: string = 'RWGOI_MESSAGE_NAVIGATE_HOME';

    // AS3: .../handler/MeMenuWidgetHandler.as::OPEN_AVATAR_EDITOR
    private static readonly OPEN_AVATAR_EDITOR: string = 'RWCM_OPEN_AVATAR_EDITOR';

    // AS3: .../handler/MeMenuWidgetHandler.as::GET_WARDROBE
    // Declared and unhandled, like NAVIGATE_TO_ROOM.
    private static readonly GET_WARDROBE: string = 'RWCM_GET_WARDROBE';

    // AS3: .../handler/MeMenuWidgetHandler.as::SELECT_OUTFIT
    // The one lower-case type in the list — declared and unhandled.
    private static readonly SELECT_OUTFIT: string = 'select_outfit';

    // AS3: .../handler/MeMenuWidgetHandler.as::SHOW_OWN_ROOMS
    private static readonly SHOW_OWN_ROOMS: string = 'RWSORM_SHOW_OWN_ROOMS';

    // AS3: .../handler/MeMenuWidgetHandler.as::ME_MENU
    // Not the same as `RoomWidgetMeMenuMessage.ME_MENU_OPENED` — this one *re-raises* the toolbar
    // click that opens the menu, where the other reports that it already opened.
    private static readonly ME_MENU: string = 'RWRWM_ME_MENU';

    // AS3: .../handler/MeMenuWidgetHandler.as::GET_SETTINGS
    private static readonly GET_SETTINGS: string = 'RWGSM_GET_SETTINGS';

    // AS3: .../handler/MeMenuWidgetHandler.as::AVATAR_EDITOR_VIEW_DISPOSED
    private static readonly AVATAR_EDITOR_VIEW_DISPOSED: string = 'RWAEM_AVATAR_EDITOR_VIEW_DISPOSED';

    // AS3: .../handler/MeMenuWidgetHandler.as::EFFECTS
    // Declared and unhandled.
    private static readonly EFFECTS: string = 'RWRWM_EFFECTS';

    // AS3: .../handler/MeMenuWidgetHandler.as::CATALOG_PAGE_AVATAR_EFFECTS
    // Name DERIVED: the catalogue page name AS3 opens inline for the effects inventory type.
    private static readonly CATALOG_PAGE_AVATAR_EFFECTS: string = 'avatar_effects';

    // AS3: .../handler/MeMenuWidgetHandler.as::INVENTORY_PAGE_BADGES
    // Name DERIVED: the two inventory page names AS3 passes inline.
    private static readonly INVENTORY_PAGE_BADGES: string = 'badges';

    // AS3: .../handler/MeMenuWidgetHandler.as::INVENTORY_PAGE_FURNI
    private static readonly INVENTORY_PAGE_FURNI: string = 'furni';

    // AS3: .../handler/MeMenuWidgetHandler.as::_disposed
    // Name DERIVED (`_SafeStr_5769`): the field behind `get disposed()`.
    private _disposed: boolean = false;

    // AS3: .../handler/MeMenuWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/MeMenuWidgetHandler.as::_inventory
    // Cached rather than read off the container each time, because `set container(null)` has to
    // unsubscribe from the *previous* one after the container reference is already gone.
    private _inventory: IHabboInventory | null = null;

    // AS3: .../handler/MeMenuWidgetHandler.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: .../handler/MeMenuWidgetHandler.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    /**
     * AS3: .../handler/MeMenuWidgetHandler.as::_widget
     *
     * Name DERIVED (`_SafeStr_4549`): write-only, as in every widget-owning handler — the widget
     * assigns itself here and nothing reads it back.
     */
    // AS3: .../handler/MeMenuWidgetHandler.as::_widget
    private _widget: MeMenuWidget | null = null;

    // AS3: .../handler/MeMenuWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_ME_MENU';
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::set widget()
    set widget(value: MeMenuWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /**
     * Unsubscribes from the outgoing container's five buses and subscribes to the incoming one's.
     *
     * Every teardown branch is guarded on `!disposed && events` because this also runs from
     * `dispose()`, by which time a manager may already have been torn down. AS3 guards the
     * inventory, toolbar, help and messenger that way but **not** the catalogue's `_catalog`
     * field — it reads `_container.catalog` for the unsubscribe instead, so a container swapped
     * while the catalogue changed would leak. Kept as written.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/MeMenuWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        if(this._container !== null)
        {
            /**
             * AS3 guards each teardown with `!manager.disposed && manager.events`. None of this
             * port's manager interfaces declares `disposed` — it lives on `Component`, which they
             * do not extend — and widening five interfaces for a guard that only protects a
             * *nulled* Flash dispatcher would be a wider change than this slice. The optional
             * chain on `events` covers the same case: removing a listener from a live emitter is
             * harmless, and there is no emitter to remove it from otherwise.
             */
            if(this._inventory !== null)
            {
                this._inventory.events?.off(MeMenuWidgetHandler.EFFECTS_CHANGED, this.onAvatarEffectsChanged);
                this._inventory.events?.off(MeMenuWidgetHandler.HABBO_CLUB_CHANGED, this.onHabboClubSubscriptionChanged);
            }

            if(this._toolbar !== null)
            {
                this._toolbar.toolbarEvents?.off(MeMenuWidgetHandler.TOOLBAR_CLICK, this.onHabboToolbarEvent);
            }

            const help = this._container.habboHelp;

            if(help !== null)
            {
                help.events?.off(HabboHelpTutorialEvent.LIGHT_CLOTHES_ICON, this.onHelpTutorialEvent);
                help.events?.off(HabboHelpTutorialEvent.AVATAR_TUTORIAL_START, this.onHelpTutorialEvent);
            }

            const catalog = this._container.catalog;

            if(catalog !== null)
            {
                catalog.events?.off(MeMenuWidgetHandler.CREDIT_BALANCE_EVENT, this.onCreditBalance);
            }

            const messenger = this._container.messenger;

            if(messenger !== null)
            {
                messenger.events?.off(MiniMailMessageEvent.NEW_MESSAGE_NOTIFICATION, this.onMiniMailNewMessage);
                messenger.events?.off(MiniMailMessageEvent.UNREAD_MESSAGE_COUNT, this.onMiniMailUnreadCount);
            }
        }

        this._container = value;

        if(this._container === null) return;

        this._inventory = this._container.inventory;

        if(this._inventory !== null)
        {
            this._inventory.events?.on(MeMenuWidgetHandler.EFFECTS_CHANGED, this.onAvatarEffectsChanged);
            this._inventory.events?.on(MeMenuWidgetHandler.HABBO_CLUB_CHANGED, this.onHabboClubSubscriptionChanged);
        }

        this._toolbar = this._container.toolbar;
        this._toolbar?.toolbarEvents?.on(MeMenuWidgetHandler.TOOLBAR_CLICK, this.onHabboToolbarEvent);

        const help = this._container.habboHelp;

        if(help !== null)
        {
            help.events?.on(HabboHelpTutorialEvent.LIGHT_CLOTHES_ICON, this.onHelpTutorialEvent);
            help.events?.on(HabboHelpTutorialEvent.AVATAR_TUTORIAL_START, this.onHelpTutorialEvent);
        }

        this._catalog = this._container.catalog;
        this._catalog?.events?.on(MeMenuWidgetHandler.CREDIT_BALANCE_EVENT, this.onCreditBalance);

        const messenger = this._container.messenger;

        if(messenger !== null)
        {
            messenger.events?.on(MiniMailMessageEvent.NEW_MESSAGE_NOTIFICATION, this.onMiniMailNewMessage);
            messenger.events?.on(MiniMailMessageEvent.UNREAD_MESSAGE_COUNT, this.onMiniMailUnreadCount);
        }
    }

    /**
     * The 24 types the me-menu can send. Four of them — `NAVIGATE_TO_ROOM`, `GET_WARDROBE`,
     * `select_outfit` and `RWRWM_EFFECTS` — are declared here and matched by no case in
     * `processWidgetMessage()`, so they reach the "unhandled" default. Kept, because the
     * registration is what routes them to this handler at all.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/MeMenuWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[] | null
    {
        return [
            RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION,
            RoomWidgetDanceMessage.DANCE,
            RoomWidgetChangePostureMessage.CHANGE_POSTURE,
            MeMenuWidgetHandler.GET_EFFECTS,
            RoomWidgetSelectEffectMessage.SELECT_EFFECT,
            RoomWidgetSelectEffectMessage.UNSELECT_EFFECT,
            RoomWidgetSelectEffectMessage.UNSELECT_ALL_EFFECTS,
            RoomWidgetOpenInventoryMessage.OPEN_INVENTORY,
            RoomWidgetOpenCatalogMessage.OPEN_CATALOG,
            MeMenuWidgetHandler.STOP_EFFECT,
            MeMenuWidgetHandler.NAVIGATE_TO_ROOM,
            MeMenuWidgetHandler.NAVIGATE_HOME,
            MeMenuWidgetHandler.OPEN_AVATAR_EDITOR,
            MeMenuWidgetHandler.GET_WARDROBE,
            MeMenuWidgetHandler.SELECT_OUTFIT,
            MeMenuWidgetHandler.SHOW_OWN_ROOMS,
            MeMenuWidgetHandler.ME_MENU,
            RoomWidgetMeMenuMessage.ME_MENU_OPENED,
            MeMenuWidgetHandler.GET_SETTINGS,
            RoomWidgetStoreSettingsMessage.STORE_ALL_SETTINGS,
            RoomWidgetStoreSettingsMessage.STORE_SOUND_SETTING,
            RoomWidgetStoreSettingsMessage.PREVIEW_SOUND_SETTING,
            MeMenuWidgetHandler.AVATAR_EDITOR_VIEW_DISPOSED,
            MeMenuWidgetHandler.EFFECTS
        ];
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(message === null || message === undefined) return null;

        switch(message.type)
        {
            case MeMenuWidgetHandler.ME_MENU:
                this.reraiseMeMenuToolbarClick();

                break;

            case RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION:
                // AS3 casts unguarded here, unlike every neighbouring case.
                this._container?.roomSession?.sendAvatarExpressionMessage(
                    (message as RoomWidgetAvatarExpressionMessage).animation.ordinal
                );

                break;

            case RoomWidgetDanceMessage.DANCE:
                if(message instanceof RoomWidgetDanceMessage)
                {
                    this._container?.roomSession?.sendDanceMessage(message.style);
                }

                break;

            case RoomWidgetChangePostureMessage.CHANGE_POSTURE:
                if(message instanceof RoomWidgetChangePostureMessage)
                {
                    this._container?.roomSession?.sendChangePostureMessage(message.posture);
                }

                break;

            case MeMenuWidgetHandler.GET_EFFECTS:
                this.broadcastEffects();

                break;

            case RoomWidgetSelectEffectMessage.SELECT_EFFECT:
                if(this._inventory !== null && message instanceof RoomWidgetSelectEffectMessage)
                {
                    this._inventory.setEffectSelected(message.effectType);
                }

                break;

            case RoomWidgetSelectEffectMessage.UNSELECT_EFFECT:
                if(this._inventory !== null && message instanceof RoomWidgetSelectEffectMessage)
                {
                    this._inventory.setEffectDeselected(message.effectType);
                }

                break;

            case RoomWidgetOpenCatalogMessage.OPEN_CATALOG:
                // Only the club page is acted on; the three currency keys resolve to nothing.
                if(this._catalog !== null
                    && message instanceof RoomWidgetOpenCatalogMessage
                    && message.pageKey === RoomWidgetOpenCatalogMessage.CATALOG_CLUB)
                {
                    this._catalog.openClubCenter();
                }

                break;

            case RoomWidgetOpenInventoryMessage.OPEN_INVENTORY:
                this.openInventory(message as RoomWidgetOpenInventoryMessage);

                break;

            // Both types fall through to the same clear-everything call, as in AS3.
            case RoomWidgetSelectEffectMessage.UNSELECT_ALL_EFFECTS:
            case MeMenuWidgetHandler.STOP_EFFECT:
                this._inventory?.deselectAllEffects(true);

                break;

            case MeMenuWidgetHandler.NAVIGATE_HOME:
                this._container?.navigator?.goToHomeRoom();

                break;

            case MeMenuWidgetHandler.SHOW_OWN_ROOMS:
                this._container?.navigator?.showOwnRooms();

                break;

            case RoomWidgetMeMenuMessage.ME_MENU_OPENED:
                return this.onMeMenuOpened(message);

            case MeMenuWidgetHandler.OPEN_AVATAR_EDITOR:
                this.openAvatarEditor();

                break;

            case MeMenuWidgetHandler.GET_SETTINGS:
                this.broadcastSoundSettings();

                break;

            case RoomWidgetStoreSettingsMessage.STORE_SOUND_SETTING:
                if(message instanceof RoomWidgetStoreSettingsMessage && this._container?.soundManager != null)
                {
                    this._container.soundManager.traxVolume = message.traxVolume;
                    this._container.soundManager.furniVolume = message.furniVolume;
                    this._container.soundManager.genericVolume = message.genericVolume;
                }

                this.broadcastSoundSettings();

                break;

            case RoomWidgetStoreSettingsMessage.PREVIEW_SOUND_SETTING:
                if(message instanceof RoomWidgetStoreSettingsMessage)
                {
                    // Note the argument order: previewVolume takes (generic, furni, trax).
                    this._container?.soundManager?.previewVolume(
                        message.genericVolume, message.furniVolume, message.traxVolume
                    );
                }

                this.broadcastSoundSettings();

                break;

            case MeMenuWidgetHandler.AVATAR_EDITOR_VIEW_DISPOSED:
                this._container?.habboHelp?.events?.emit(
                    HabboHelpTutorialEvent.DONE_AVATAR_EDITOR_CLOSING,
                    new HabboHelpTutorialEvent(HabboHelpTutorialEvent.DONE_AVATAR_EDITOR_CLOSING)
                );

                break;

            default:
                log.debug(`Unhandled message in MeMenuWidgetHandler: ${message.type}`);
        }

        return null;
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::getProcessedEvents()
    // Empty: everything this handler reacts to arrives on a manager's own bus, not the room's.
    getProcessedEvents(): string[] | null
    {
        return [];
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::processEvent()
    // Empty in AS3 too — see getProcessedEvents().
    processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/MeMenuWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    /**
     * AS3: .../handler/MeMenuWidgetHandler.as::dispose()
     *
     * Closes the avatar editor first, then routes through `this.container = null` so the five
     * unsubscribes in the setter run — which is why the setter's teardown branch has to tolerate
     * already-disposed managers.
     */
    // AS3: .../handler/MeMenuWidgetHandler.as::dispose()
    dispose(): void
    {
        this._container?.avatarEditor?.close(AvatarEditorIdEnum.MAIN_EDITOR);

        this._disposed = true;
        this.container = null;
        this._inventory = null;
        this._toolbar = null;
        this._catalog = null;
    }

    /**
     * AS3: .../handler/MeMenuWidgetHandler.as::onHabboToolbarEvent()
     *
     * Does nothing. AS3 reads the icon id into a local and opens an `if("HTIE_ICON_MEMENU" !== id)`
     * whose body is **empty** — the decompiler's rendering of a switch that lost its cases. The
     * subscription is kept because it is what AS3 registers; there is no recoverable behaviour to
     * put inside it, and inventing one would be a guess.
     */
    // AS3: .../handler/MeMenuWidgetHandler.as::onHabboToolbarEvent()
    private onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
    {
        if(this.disposed || this._container === null) return;

        if(event.type !== MeMenuWidgetHandler.TOOLBAR_CLICK) return;

        void event.iconId;
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onAvatarEffectsChanged()
    private onAvatarEffectsChanged = (): void =>
    {
        if(this._container === null) return;

        this.broadcastEffects();
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onHabboClubSubscriptionChanged()
    private onHabboClubSubscriptionChanged = (): void =>
    {
        this.broadcastClubStatus();
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onCreditBalance()
    private onCreditBalance = (event: PurseEvent): void =>
    {
        if(event === null || this._container === null) return;

        this._container.desktopEvents.emit(
            RoomWidgetPurseUpdateEvent.CREDIT_BALANCE,
            new RoomWidgetPurseUpdateEvent(RoomWidgetPurseUpdateEvent.CREDIT_BALANCE, event.balance)
        );
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onHelpTutorialEvent()
    // Translates the help module's two nudges into the widget-side pair.
    private onHelpTutorialEvent = (event: HabboHelpTutorialEvent): void =>
    {
        if(this._container === null) return;

        let type: string | null = null;

        switch(event.type)
        {
            case HabboHelpTutorialEvent.AVATAR_TUTORIAL_START:
                type = RoomWidgetTutorialEvent.AVATAR_EDITOR_STARTED;
                break;

            case HabboHelpTutorialEvent.LIGHT_CLOTHES_ICON:
                type = RoomWidgetTutorialEvent.AVATAR_EDITOR_HIGHLIGHT;
                break;
        }

        if(type === null) return;

        this._container.desktopEvents.emit(type, new RoomWidgetTutorialEvent(type));
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onMiniMailNewMessage()
    private onMiniMailNewMessage = (): void =>
    {
        this.emitMiniMail(RoomWidgetMiniMailUpdateEvent.NEW_MESSAGE_NOTIFICATION);
    };

    // AS3: .../handler/MeMenuWidgetHandler.as::onMiniMailUnreadCount()
    private onMiniMailUnreadCount = (): void =>
    {
        this.emitMiniMail(RoomWidgetMiniMailUpdateEvent.UNREAD_MESSAGE_COUNT);
    };

    // TS-only: the two mini-mail relays are identical but for the type; AS3 writes them out twice.
    private emitMiniMail(type: string): void
    {
        this._container?.desktopEvents.emit(type, new RoomWidgetMiniMailUpdateEvent(type));
    }

    // TS-only: AS3 builds this event inline in both `RWCM_MESSAGE_GET_EFFECTS` and
    // `onAvatarEffectsChanged()`, identically.
    private broadcastEffects(): void
    {
        if(this._inventory === null || this._container === null) return;

        const effects = this._inventory.getAvatarEffects();

        this._container.desktopEvents.emit(
            RoomWidgetUpdateEffectsUpdateEvent.UPDATE_EFFECTS,
            new RoomWidgetUpdateEffectsUpdateEvent(effects)
        );
    }

    /**
     * TS-only: AS3 builds this event inline in both `RWMMM_MESSAGE_ME_MENU_OPENED` and
     * `onHabboClubSubscriptionChanged()`, identically.
     *
     * `allowClubDances` comes from `sessionDataManager.hasClub`, not from the day/period counts
     * beside it — see `RoomWidgetHabboClubUpdateEvent`.
     */
    // TS-only: AS3 repeats this five-argument event verbatim in two places.
    private broadcastClubStatus(): void
    {
        if(this._inventory === null || this._container === null) return;

        const hasClub = this._container.sessionDataManager?.hasClub ?? false;

        this._container.desktopEvents.emit(
            RoomWidgetHabboClubUpdateEvent.HABBO_CLUB,
            new RoomWidgetHabboClubUpdateEvent(
                this._inventory.clubDays,
                this._inventory.clubPeriods,
                this._inventory.clubPastPeriods,
                hasClub,
                this._inventory.clubLevel
            )
        );
    }

    // TS-only: AS3 repeats this four-argument event in three of the settings cases, identically.
    private broadcastSoundSettings(): void
    {
        const sound = this._container?.soundManager ?? null;

        if(sound === null || this._container === null) return;

        this._container.desktopEvents.emit(
            RoomWidgetSettingsUpdateEvent.SETTINGS,
            new RoomWidgetSettingsUpdateEvent(
                RoomWidgetSettingsUpdateEvent.SETTINGS, sound.traxVolume, sound.furniVolume, sound.genericVolume
            )
        );
    }

    /**
     * TS-only: the `RWRWM_ME_MENU` case, extracted. AS3 checks the toolbar and its event bus
     * twice — once before building the event and once again before dispatching it, the second
     * time also re-checking `disposed`. Both checks are kept.
     */
    // TS-only: the RWRWM_ME_MENU case, extracted — see the block comment above.
    private reraiseMeMenuToolbarClick(): void
    {
        if(this._container?.toolbar?.toolbarEvents == null) return;

        const event = new HabboToolbarEvent(MeMenuWidgetHandler.TOOLBAR_CLICK);

        event.iconId = HabboToolbarIconEnum.MEMENU;

        if(this.disposed || this._container?.toolbar?.toolbarEvents == null) return;

        this._container.toolbar.toolbarEvents.emit(event.type, event);
    }

    /**
     * TS-only: the `RWGOI_MESSAGE_OPEN_INVENTORY` case, extracted.
     *
     * Two of the four types do not open the inventory: effects opens a *catalogue* page, and
     * clothes is an empty case placed **after** the default — so an unknown type logs and a
     * clothes request does not, but both do nothing.
     */
    // TS-only: the RWGOI_MESSAGE_OPEN_INVENTORY case, extracted.
    private openInventory(message: RoomWidgetOpenInventoryMessage): void
    {
        if(this._inventory === null) return;

        log.debug(`MeMenuWidgetHandler open inventory: ${message.inventoryType}`);

        switch(message.inventoryType)
        {
            case RoomWidgetOpenInventoryMessage.INVENTORY_EFFECTS:
                this._catalog?.openCatalogPage(MeMenuWidgetHandler.CATALOG_PAGE_AVATAR_EFFECTS);
                break;

            case RoomWidgetOpenInventoryMessage.INVENTORY_BADGES:
                this._inventory.toggleInventoryPage(MeMenuWidgetHandler.INVENTORY_PAGE_BADGES);
                break;

            case RoomWidgetOpenInventoryMessage.INVENTORY_FURNITURE:
                this._inventory.toggleInventoryPage(MeMenuWidgetHandler.INVENTORY_PAGE_FURNI);
                break;

            case RoomWidgetOpenInventoryMessage.INVENTORY_CLOTHES:
                break;

            default:
                log.debug(`MeMenuWidgetHandler: unknown inventory type: ${message.inventoryType}`);
                break;
        }
    }

    /**
     * TS-only: the `RWMMM_MESSAGE_ME_MENU_OPENED` case, extracted.
     *
     * Three pushes and one side effect, and it can abandon halfway: if the local user has no user
     * data in the room, AS3 **returns** before selecting the avatar — but after having already
     * dispatched the club and purse events. Kept.
     */
    // TS-only: the RWMMM_MESSAGE_ME_MENU_OPENED case, extracted.
    private onMeMenuOpened(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(!(message instanceof RoomWidgetMeMenuMessage) || this._container === null) return null;

        this.broadcastClubStatus();

        const purse = this._catalog?.getPurse() ?? null;

        if(purse !== null)
        {
            this._container.desktopEvents.emit(
                RoomWidgetPurseUpdateEvent.CREDIT_BALANCE,
                new RoomWidgetPurseUpdateEvent(RoomWidgetPurseUpdateEvent.CREDIT_BALANCE, purse.credits)
            );
        }

        const session = this._container.roomSession;

        if(session?.userDataManager == null || this._container.roomEngine === null) return null;

        const userId = this._container.sessionDataManager?.userId ?? -1;
        const userData = session.userDataManager.getUserData(userId);

        if(userData === null) return null;

        // The room id really is a hard 0, not the session's: AS3 assigns `_loc8_ = 0` on the line
        // before the call. Rooms are keyed by that id in `_roomInstanceData`, so a room whose id
        // is not 0 finds nothing and no avatar lights up — transcribed as found rather than
        // "corrected", because a fix would change which avatar gets selected.
        this._container.roomEngine.selectAvatar(0, userData.roomObjectId);

        return null;
    }

    /**
     * TS-only: the `RWCM_OPEN_AVATAR_EDITOR` case, extracted.
     *
     * The order is AS3's: open, load the user's own figure, *then* tell the help module the editor
     * opened — a tutorial listening for that event can assume the figure is already in.
     */
    private openAvatarEditor(): void
    {
        if(this._container === null) return;

        const editor = this._container.avatarEditor;

        if(editor === null)
        {
            log.warn('Avatar editor requested, but nothing is attached to IID_HabboAvatarEditor');
        }
        else
        {
            editor.openEditor(AvatarEditorIdEnum.MAIN_EDITOR, null, null, true);
            editor.loadOwnAvatarInEditor(AvatarEditorIdEnum.MAIN_EDITOR);
        }

        this._container.habboHelp?.events?.emit(
            HabboHelpTutorialEvent.DONE_AVATAR_EDITOR_OPENING,
            new HabboHelpTutorialEvent(HabboHelpTutorialEvent.DONE_AVATAR_EDITOR_OPENING)
        );
    }
}
