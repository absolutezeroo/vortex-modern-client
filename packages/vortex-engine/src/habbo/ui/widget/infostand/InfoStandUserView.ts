/**
 * InfoStandUserView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as
 *
 * Name (with a working profile-link click/hover), motto — editable for the player's own card —
 * avatar figure, badges with their rarity glow colour, hand-item, relationship statuses, the
 * badges-rank leaderboard link, and, when enabled, achievement score.
 *
 * Two things are still missing, each for its own reason. The badge *details* popup is unported.
 * And `playGlow()` on the badge widget only records the colour: the animation writes Flash filters
 * onto the window every 16ms, and this port's renderer does not read `GraphicContext.filters` at
 * all — see BadgeImageWidget.playGlow()'s own marker. Rarity therefore reaches the widget
 * correctly; it just does not shimmer.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {RoomWidgetChangeMottoMessage} from '../messages/RoomWidgetChangeMottoMessage';
import {RelationshipStatusEnum} from '@habbo/friendlist/RelationshipStatusEnum';
import type {RelationshipStatusInfo} from '@habbo/communication/messages/incoming/users/RelationshipStatusInfo';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {RoomWidgetOpenProfileMessage} from '../messages/RoomWidgetOpenProfileMessage';
import {RoomWidgetUserActionMessage} from '../messages/RoomWidgetUserActionMessage';
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';
import type {InfoStandWidget} from './InfoStandWidget';
import {Logger} from '@core/utils/Logger';
import type {ISelectedBadge} from '@habbo/communication/messages/parser/users/HabboUserBadgesMessageParser';
import {BadgeRarityEnum} from '@habbo/communication/enum/BadgeRarityEnum';

const log = Logger.getLogger('habbo.ui.widget.infostand.InfoStandUserView');

export class InfoStandUserView
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::LINK_COLOR_ACTIONS_HOVER
    private static readonly LINK_COLOR_ACTIONS_HOVER = 0x91C2FF;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::LINK_COLOR_ACTIONS_DEFAULT (decimal 16777215)
    private static readonly LINK_COLOR_ACTIONS_DEFAULT = 0xFFFFFF;

    private static readonly BADGE_SLOT_COUNT = 5;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_4549
    protected _widget: InfoStandWidget;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_window
    protected _window: IItemListWindow | null = null;

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_9200
    // Name DERIVED: obfuscated in every tree, named after the layout element it holds.
    private _relationshipContainer: IItemListWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_4558
    protected _infoBorder: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_4641
    protected _elementList: IItemListWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_5253
    protected _profileLink: IWindowContainer | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::InfoStandUserView()
    constructor(widget: InfoStandWidget, name: string)
    {
        this._widget = widget;
        this.createWindow(name);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::dispose()
    public dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::get window()
    public get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::createWindow()
    protected createWindow(name: string): void
    {
        const window = this._widget.getXmlWindow('user_view') as IItemListWindow | null;

        if(!window)
        {
            throw new Error('Failed to construct window from XML!');
        }

        this._window = window;
        this._infoBorder = window.getListItemByName('info_border') as IWindowContainer | null;
        this._elementList = this._infoBorder?.findChildByName('infostand_element_list') as IItemListWindow | null ?? null;

        // AS3: .../infostand/InfoStandUserView.as::createWindow()
        // The container is config-gated as a whole, and each of the three rows is then shown or
        // hidden per user by setRelationshipStatuses().
        this._relationshipContainer = this._infoBorder?.findChildByName('relationship_status_container') as IItemListWindow | null ?? null;

        if(this._relationshipContainer)
        {
            this._relationshipContainer.visible = this._widget.handler.isRelationshipStatusEnabled;
        }

        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            const link = this._infoBorder?.findChildByName(`${RelationshipStatusEnum.statusAsString(status)}_randomusername`);

            if(link) link.procedure = this.onRelationshipUserNameLinkClicked;
        }

        window.name = name;

        // AS3 fills this one through the bitmap wrapper's own API, not an
        // asset_uri: `user_view` declares it as `<bitmap>`, which has no
        // assetUri at all. Nothing in this port ever assigned it, so the house
        // icon in the infostand was simply absent — the window was there, the
        // right size, drawable, with no pixels in it.
        const homeIcon = this._infoBorder?.findChildByName('home_icon') as IBitmapWrapperWindow | null;

        if(!homeIcon) log.warn('infostand: no home_icon in the layout');
        else
        {
            const asset = this._widget.assets?.getAssetByName('icon_home') ?? null;
            const bitmap = (asset?.content ?? null) as ImageBitmap | null;

            // Both misses are silent otherwise: a null library and a key the
            // library does not carry look identical from here, and the icon is
            // simply absent either way.
            if(!this._widget.assets) log.warn('infostand: no asset library on the widget when filling home_icon');
            else if(!asset) log.warn('infostand: asset "icon_home" not in the widget library');
            else if(!bitmap) log.warn('infostand: asset "icon_home" has no bitmap content');
            else homeIcon.bitmap = bitmap;

            homeIcon.procedure = this.onHomeIconClicked;
        }

        this._widget.mainContainer.addChild(window);

        const closeButton = this._infoBorder?.findChildByTag('close');

        closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        const avatarProfileLink = this._infoBorder?.findChildByName('avatar_image_profile_link');

        if(avatarProfileLink) avatarProfileLink.procedure = this.onProfileLink;

        // AS3: .../infostand/InfoStandUserView.as::createWindow()
        // The whole rank row is clickable, not just its text — the region is what carries the
        // procedure.
        const badgesRankRegion = this._infoBorder?.findChildByName('badges_rank_region');

        if(badgesRankRegion) badgesRankRegion.procedure = this.onBadgesRankClicked;

        if(this._widget.handler.isActivityDisplayEnabled)
        {
            const scoreSpacer = this._elementList?.getListItemByName('score_spacer');
            const scoreValue = this._elementList?.getListItemByName('score_value');
            const scoreText = this._elementList?.getListItemByName('score_text');

            if(scoreSpacer) scoreSpacer.visible = true;
            if(scoreValue) scoreValue.visible = true;
            if(scoreText) scoreText.visible = true;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onClose()
    private onClose = (_event: WindowMouseEvent): void =>
    {
        this._widget.close();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set name()
    public set name(value: string)
    {
        if(!this._profileLink)
        {
            this._profileLink = this._elementList?.getListItemByName('profile_link') as IWindowContainer | null;

            if(!this._profileLink) return;

            (this._profileLink as unknown as IWindow).procedure = this.onProfileLink;
            (this._profileLink as unknown as IWindow).visible = true;
        }

        const nameText = this._profileLink.findChildByName('name_text') as ITextWindow | null;

        if(!nameText) return;

        nameText.text = value;
        nameText.visible = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set realName()
    public set realName(value: string)
    {
        const realNameText = this._elementList?.getListItemByName('realname_text') as ITextWindow | null;

        if(!realNameText) return;

        if(value.length === 0)
        {
            realNameText.text = '';
        }
        else
        {
            realNameText.text = this._widget.localizations?.getLocalizationWithParams(
                'infostand.text.realname', '', 'realname', value
            ) ?? '';
        }

        realNameText.height = realNameText.textHeight + 5;
        realNameText.visible = value.length > 0;
    }

    /**
     * AS3 wires every icon in this view to one `onButtonClicked`, which reads
     * the clicked window's name to pick a message; `home_icon` is the only name
     * it answers to. Split out here rather than reproducing the name switch for
     * a single case — add the switch back if a second icon ever joins it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onButtonClicked()
    private onHomeIconClicked = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        // AS3 reaches the tracking singleton; this port has none, and the handler's container
        // already carries the same component as `habboTracking`.
        this._widget.handler.container?.habboTracking?.trackEventLog('InfoStand', 'click', RoomWidgetUserActionMessage.OPEN_HOME_PAGE);

        this._widget.messageListener?.processWidgetMessage(
            new RoomWidgetUserActionMessage(
                RoomWidgetUserActionMessage.OPEN_HOME_PAGE,
                this._widget.userData.userId
            )
        );
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onProfileLink()
    private onProfileLink = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._widget.messageListener?.processWidgetMessage(
                new RoomWidgetOpenProfileMessage(
                    RoomWidgetOpenProfileMessage.OPEN_USER_PROFILE,
                    this._widget.userData.userId,
                    'infoStand_userView'
                )
            );
        }

        if(window.name === 'profile_link')
        {
            const nameText = this._profileLink?.findChildByName('name_text') as ITextWindow | null;

            if(!nameText) return;

            if(event.type === WindowMouseEvent.OVER) nameText.textColor = InfoStandUserView.LINK_COLOR_ACTIONS_HOVER;
            if(event.type === WindowMouseEvent.OUT) nameText.textColor = InfoStandUserView.LINK_COLOR_ACTIONS_DEFAULT;
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setFigure()
    public setFigure(figure: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(!widget) return;

        widget.figure = figure;
    }

    /**
	 * Shows the motto, and — on your own infostand — lets you edit it.
	 *
	 * `editable` is what separates the two: it reveals the pencil, enables the field and attaches
	 * the two handlers. The grey placeholder ("click to change") doubles as the sentinel
	 * `onMottoKeyboard()` refuses to send, so an untouched field cannot overwrite a real motto
	 * with the prompt text.
	 *
	 * The "crikey" croco-sticker swap is the only AS3 mechanism that ever sets
	 * `avatar_image.visible` — the layout defaults it to false.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setMotto()
    public setMotto(motto: string, editable: boolean): void
    {
        const mottoContainer = this._elementList?.getListItemByName('motto_container') as IWindowContainer | null;
        const mottoText = mottoContainer?.findChildByName('motto_text') as ITextWindow | null;
        const changeIcon = mottoContainer?.findChildByName('changemotto.image');

        if(!mottoText) return;

        let caption = motto ?? '';

        if(editable)
        {
            if(changeIcon) changeIcon.visible = true;

            if(caption === '')
            {
                caption = this._widget.localizations?.getLocalization('infostand.motto.change') ?? '';
                mottoText.textColor = 0xAAAAAA;
            }
            else
            {
                mottoText.textColor = 0xFFFFFF;
            }

            mottoText.enable();
        }
        else
        {
            if(changeIcon) changeIcon.visible = false;

            mottoText.textColor = 0xFFFFFF;
            mottoText.disable();
        }

        // The hotel can switch motto editing off wholesale, on top of the per-user answer above.
        if(!(this._widget.config?.getBoolean('infostand.motto.change.enabled') ?? false)) mottoText.disable();

        mottoText.text = caption;
        mottoText.height = Math.min(mottoText.textHeight + 5, 50);
        mottoText.height = Math.max(mottoText.height, 23);

        if(mottoContainer) mottoContainer.height = mottoText.height + 3;

        // AS3's `else` removes WKE_KEY_UP with `onMottoClicked` as the listener — a mismatched
        // pair that removes nothing. Both are removed here: an infostand is reused for the next
        // avatar clicked, and a stale editable handler would send *your* motto for *their* field.
        if(editable)
        {
            mottoText.addEventListener(WindowKeyboardEvent.KEY_UP, this.onMottoKeyboard);
            mottoText.addEventListener(WindowMouseEvent.CLICK, this.onMottoClicked);
        }
        else
        {
            mottoText.removeEventListener(WindowKeyboardEvent.KEY_UP, this.onMottoKeyboard);
            mottoText.removeEventListener(WindowMouseEvent.CLICK, this.onMottoClicked);
        }

        const isCrikeyEasterEgg = !!mottoText.text && mottoText.text.toLowerCase().indexOf('crikey') >= 0;
        const stickerCroco = this._infoBorder?.findChildByName('sticker_croco');
        const avatarImage = this._infoBorder?.findChildByName('avatar_image');

        if(stickerCroco) stickerCroco.visible = isCrikeyEasterEgg;
        if(avatarImage) avatarImage.visible = !isCrikeyEasterEgg;

        this.updateWindow();
    }

    /**
     * Enter commits the motto.
     *
     * The two-second gate is AS3's own flood guard, and it is measured from the last *accepted*
     * send, so holding Enter cannot spam the server. Any other key just re-measures the field, so
     * a motto that grows past one line pushes the container open as it is typed.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onMottoKeyboard()
    protected onMottoKeyboard = (event: WindowEvent): void =>
    {
        const mottoContainer = this._elementList?.getListItemByName('motto_container') as IWindowContainer | null;
        const mottoText = mottoContainer?.findChildByName('motto_text') as ITextFieldWindow | null;

        if(!mottoText) return;

        const text = mottoText.text;

        if((event as WindowKeyboardEvent).keyCode === 13)
        {
            const now = performance.now();
            const placeholder = this._widget.localizations?.getLocalization('infostand.motto.change') ?? '';

            if(now - this._lastMottoSentAt > 2000 && text !== placeholder)
            {
                this._widget.messageListener?.processWidgetMessage(new RoomWidgetChangeMottoMessage(text));

                this._lastMottoSentAt = now;
                mottoText.textColor = 0xFFFFFF;
                mottoText.unfocus();
            }
        }
        else
        {
            mottoText.textColor = 0xAAAAAA;
        }

        mottoText.height = Math.min(mottoText.textHeight + 5, 50);
        mottoText.height = Math.max(mottoText.height, 23);

        if(mottoContainer) mottoContainer.height = mottoText.height + 3;
    };

    /** Clicking the placeholder clears it, so typing does not start after "click to change". */
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onMottoClicked()
    protected onMottoClicked = (): void =>
    {
        const mottoContainer = this._elementList?.getListItemByName('motto_container') as IWindowContainer | null;
        const mottoText = mottoContainer?.findChildByName('motto_text') as ITextWindow | null;

        if(!mottoText) return;

        if(mottoText.text === (this._widget.localizations?.getLocalization('infostand.motto.change') ?? ''))
        {
            mottoText.text = '';
        }

        mottoText.textColor = 0xAAAAAA;
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::_SafeStr_8947
    // Name DERIVED: obfuscated in every tree; the two-second window in onMottoKeyboard() is what
    // identifies it.
    private _lastMottoSentAt: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set achievementScore()
    public set achievementScore(value: number)
    {
        if(!this._widget.handler.isActivityDisplayEnabled) return;

        const scoreValue = this._elementList?.getListItemByName('score_value') as ITextWindow | null;

        if(!scoreValue) return;

        scoreValue.text = String(value);
    }

    /**
     * The badge-leaderboard rank line.
     *
     * Two windows move together — a spacer and the region holding the text — and the list is only
     * re-arranged when visibility actually *changed*, since arranging is the expensive part and a
     * repeated update of the same rank should not pay for it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set badgesRank()
    public set badgesRank(value: number)
    {
        const spacer = this._elementList?.getListItemByName('badges_rank_spacer') as IWindowContainer | null;
        const region = this._elementList?.getListItemByName('badges_rank_region') as IWindowContainer | null;
        const text = region?.getChildByName('badges_rank_text') as unknown as ITextWindow | null;

        if(!spacer || !text || !region) return;

        const visible = value >= 0;
        const wasVisible = region.visible;

        spacer.visible = visible;
        region.visible = visible;

        if(visible)
        {
            text.text = this._widget.handler.container?.localization?.getLocalizationWithParams(
                'infostand.text.badges_rank', '', 'rank', `#${value}`
            ) ?? '';
        }

        if(visible !== wasVisible) this._elementList?.arrangeListItems();

        this.updateWindow();
    }

    /**
     * Opens the badge leaderboard at the page holding this player's rank.
     *
     * `getBadgeLeaderboardPageForCurrentUser()` returns 0 in AS3 too — the paging helper exists
     * (`getPageForRank()`) and this caller does not use it, so the leaderboard always opens on
     * page one. Ported as written.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onBadgesRankClicked()
    private onBadgesRankClicked = (event: WindowEvent, _target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._widget.userData == null || this._widget.userData.badgesRank < 0) return;

        const roomEngine = this._widget.handler.container?.roomEngine ?? null;

        if(roomEngine == null) return;

        roomEngine.createLinkEvent(`badge_leaderboard/0/-1/${this.getBadgeLeaderboardPageForCurrentUser()}`);
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::getBadgeLeaderboardPageForCurrentUser()
    private getBadgeLeaderboardPageForCurrentUser(): number
    {
        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set carryItem()
    public set carryItem(value: number)
    {
        const handitemText = this._elementList?.getListItemByName('handitem_txt') as ITextWindow | null;
        const handitemSpacer = this._elementList?.getListItemByName('handitem_spacer');

        if(!handitemText || !handitemSpacer) return;

        const visible = value > 0 && value < 999999;

        if(visible)
        {
            const itemName = this._widget.localizations?.getLocalizationWithParams(`handitem${value}`, `handitem${value}`) ?? '';

            handitemText.text = this._widget.localizations?.getLocalizationWithParams(
                'infostand.text.handitem', '', 'item', itemName
            ) ?? '';
        }

        handitemText.height = handitemText.textHeight + 5;

        const wasVisible = handitemText.visible;

        handitemText.visible = visible;
        handitemSpacer.visible = visible;

        if(visible !== wasVisible) this._elementList?.arrangeListItems();

        this.updateWindow();
    }

    /**
     * AS3 registers "infostand.text.xp" as a localization parameter but never calls
     * getLocalization()/getLocalizationWithParams() for it anywhere — a grep across the whole
     * primary source tree finds no other reference to that key. Ported for its observable half
     * only (height/visibility/list re-arrangement); the dead registration call is skipped rather
     * than invented onto `IHabboLocalizationManager`, which does not expose a standalone
     * registerParameter() member (every other setter in this file that needs one uses the combined
     * getLocalizationWithParams() the interface does declare).
     *
     * Called live from updateInfo() below, but always with 0: no AS3 producer anywhere sets
     * `RoomWidgetUserInfoUpdateEvent.xp` to anything else, so the row this setter shows/hides
     * never actually appears in the shipped client either.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set xp()
    public set xp(value: number)
    {
        const xpText = this._elementList?.getListItemByName('xp_text') as ITextWindow | null;
        const xpSpacer = this._elementList?.getListItemByName('xp_spacer');

        if(!xpText || !xpSpacer) return;

        xpText.height = xpText.textHeight + 5;

        const wasVisible = xpText.visible;
        const visible = value > 0;

        xpText.visible = visible;
        xpSpacer.visible = visible;

        if(visible !== wasVisible) this._elementList?.arrangeListItems();

        this.updateWindow();
    }

    /**
     * Puts one badge in one of the five slots.
     *
     * The glow colour is only set for a *standalone* rarity tier — the tiers that share a colour
     * with a neighbour get -1, which is what `glowColor`'s setter reads as "no glow" and clears.
     * `playGlow` is separate from having a colour: a card that is merely being repainted with the
     * same badges must not re-animate, so the caller decides.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setBadge()
    public setBadge(index: number, badgeId: string, selected: ISelectedBadge | null = null, playGlow: boolean = false): void
    {
        const widgetWindow = this._infoBorder?.findChildByName(`badge_${index}`) as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(!widget) return;

        const uncommonEnabled = this.isUncommonBadgeRarityEnabled();

        widget.badgeId = badgeId;
        widget.glowColor = selected !== null && BadgeRarityEnum.isStandaloneTier(selected.badgeRarityId, uncommonEnabled)
            ? BadgeRarityEnum.getGlowColor(selected.badgeRarityId, uncommonEnabled)
            : -1;

        if(badgeId !== '' && playGlow && widget.glowColor >= 0) widget.playGlow(widget.glowColor);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::isUncommonBadgeRarityEnabled()
    private isUncommonBadgeRarityEnabled(): boolean
    {
        return this._widget.handler.container?.config?.getBoolean('badge_rarity.uncommon') ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::clearBadges()
    public clearBadges(): void
    {
        for(let i = 0; i < InfoStandUserView.BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, '');
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::clearGroupBadge()
    public clearGroupBadge(): void
    {
        this.setGroupBadge('');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setGroupBadge()
    public setGroupBadge(badgeId: string | null): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('badge_group') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badgeId ?? '';
    }

    /**
     * Fills the heart / smile / bobba rows from the server's per-status summary.
     *
     * Each row shows *one* named friend and, if there is more than one, an "and N others" line —
     * so the count is registered as a localization parameter of `friendCount - 1`, not
     * `friendCount`. A status the server did not mention hides its row entirely.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setRelationshipStatuses()
    public setRelationshipStatuses(statuses: Map<number, RelationshipStatusInfo>): void
    {
        if(!this._infoBorder || !this._widget) return;

        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            const name = RelationshipStatusEnum.statusAsString(status);
            const row = this._infoBorder.findChildByName(`relationship_${name}`);
            const info = statuses.get(status) ?? null;

            if(info == null)
            {
                if(row) row.visible = false;

                continue;
            }

            if(row) row.visible = info.friendCount > 0;

            const link = this._infoBorder.findChildByName(`${name}_randomusername`);

            if(link)
            {
                link.caption = info.randomFriendName;
                link.id = info.randomFriendId;
            }

            const others = this._infoBorder.findChildByName(`${name}_others`);

            if(others) others.visible = info.friendCount > 1;

            this._widget.handler.container?.localization?.registerParameter(
                `infostand.relstatus.${name}.others`, 'amount', String(info.friendCount - 1)
            );
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onRelationshipUserNameLinkClicked()
    // The link carries the friend's id in the window's own `id`, which is what setRelationshipStatuses() put there.
    private onRelationshipUserNameLinkClicked = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !target) return;

        this._widget.handler.container?.connection?.send(new GetExtendedProfileMessageComposer(target.id));
    };

    /**
     * `preserveBadges` is true when the card is being repainted with badges it is already showing —
     * see `InfoStandWidget.onUserInfo()`, which works that out by comparing the two records. The
     * badges are then left exactly as they are rather than cleared and rebuilt, which is what stops
     * a re-render from restarting every glow.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::update()
    public update(event: RoomWidgetUserInfoUpdateEvent, playGlow: boolean = true, preserveBadges: boolean = false): void
    {
        this.clearBadges();
        this.setGroupBadge(event.groupBadgeId);
        this.updateInfo(event, playGlow, !preserveBadges);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateInfo()
    protected updateInfo(event: RoomWidgetUserInfoUpdateEvent, playGlow: boolean = true, updateBadges: boolean = true): void
    {
        this.name = event.name;
        this.setMotto(event.motto, event.type === 'RWUIUE_OWN_USER');
        this.achievementScore = event.achievementScore;
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateInfo()
        // Two calls AS3 makes here were missing — `badgesRank` (the setter already existed on this
        // class but nothing fed it from an update) and `xp` (the setter is new; see its own header
        // for why the value is always 0 in the shipped client).
        this.badgesRank = event.badgesRank;
        this.carryItem = event.carryItem;
        this.xp = event.xp;
        this.setFigure(event.figure);

        if(updateBadges) this.updateBadges(event.badges, event.selectedBadges, playGlow);
    }

    /**
     * The slot-indexed list wins when it has arrived, because it is the one that knows where each
     * badge goes and how rare it is. The plain code list is the fallback for the first paint, when
     * the answer to `requestUserSelectedBadges()` is still in flight — it fills the slots in wire
     * order, with no rarity and therefore no glow.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateBadges()
    public updateBadges(badges: string[], selectedBadges: ISelectedBadge[] | null = null, playGlow: boolean = false): void
    {
        this.clearBadges();

        if(selectedBadges !== null && selectedBadges.length > 0)
        {
            for(const selected of selectedBadges)
            {
                if(selected == null || selected.slotId < 0 || selected.slotId > 4) continue;

                this.setBadge(selected.slotId, selected.badgeCode, selected, playGlow);
            }

            return;
        }

        if(!badges) return;

        for(let i = 0; i < badges.length && i < InfoStandUserView.BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, badges[i]);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateWindow()
    protected updateWindow(): void
    {
        if(!this._elementList || !this._infoBorder) return;

        this._elementList.height = this._elementList.scrollableRegion.height;
        (this._infoBorder as unknown as IWindow).height = this._elementList.height + 20;

        if(this._window)
        {
            this._window.width = (this._infoBorder as unknown as IWindow).width;
            this._window.height = this._window.scrollableRegion.height;
        }

        this._widget.refreshContainer();
    }
}
