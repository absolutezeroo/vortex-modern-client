/**
 * InfoStandUserView
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as
 *
 * Phase 1 (identity only) port: name (with a working profile-link click/
 * hover), motto (read-only), avatar figure, badges, hand-item, and (when
 * enabled) achievement score. Deferred as explicit TODO(AS3), matching
 * InfoStandWidgetHandler's Phase 1 scope cut: badge glow/rarity/details
 * popup, relationship status display, motto editing, badges-rank
 * leaderboard link, home-page button, and group badge (the handler never
 * populates group data yet).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {RoomWidgetOpenProfileMessage} from '../messages/RoomWidgetOpenProfileMessage';
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';
import type {InfoStandWidget} from './InfoStandWidget';

// AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::LINK_COLOR_ACTIONS_HOVER
const LINK_COLOR_HOVER = 0x91C2FF;
const LINK_COLOR_DEFAULT = 0xFFFFFF;

const BADGE_SLOT_COUNT = 5;

export class InfoStandUserView
{
    protected _widget: InfoStandWidget;
    protected _window: IItemListWindow | null = null;
    protected _infoBorder: IWindowContainer | null = null;
    protected _elementList: IItemListWindow | null = null;
    protected _profileLink: IWindowContainer | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::InfoStandUserView()
    constructor(widget: InfoStandWidget, name: string)
    {
        this._widget = widget;
        this.createWindow(name);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::dispose()
    public dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::get window()
    public get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::createWindow()
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

        // TODO(AS3): relationship_status_container display (config-gated,
        // populated via setRelationshipStatuses()) — deferred, keep hidden.
        const relationshipContainer = this._infoBorder?.findChildByName('relationship_status_container');

        if(relationshipContainer) relationshipContainer.visible = false;

        window.name = name;
        this._widget.mainContainer.addChild(window);

        const closeButton = this._infoBorder?.findChildByTag('close');

        closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        const avatarProfileLink = this._infoBorder?.findChildByName('avatar_image_profile_link');

        if(avatarProfileLink) avatarProfileLink.procedure = this.onProfileLink;

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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onClose()
    private onClose = (_event: WindowMouseEvent): void =>
    {
        this._widget.close();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set name()
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

    /**
	 * Clicking the name link (profile_link) or the avatar image
	 * (avatar_image_profile_link, wired in createWindow()) both open the
	 * clicked user's extended profile — matches AS3's InfoStandUserView.as
	 * wiring both regions to this same procedure.
	 */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::onProfileLink()
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

            if(event.type === WindowMouseEvent.OVER) nameText.textColor = LINK_COLOR_HOVER;
            if(event.type === WindowMouseEvent.OUT) nameText.textColor = LINK_COLOR_DEFAULT;
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setFigure()
    public setFigure(figure: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(!widget) return;

        widget.figure = figure;
    }

    /**
	 * TODO(AS3): motto editing itself (WKE_KEY_UP/WME_CLICK handlers, the
	 * RoomWidgetChangeMottoMessage send) is not ported — displays read-only,
	 * matching the Phase 1 scope cut. The "crikey" croco-sticker swap below
	 * IS ported: it's not display polish, it's the only AS3 mechanism that
	 * ever sets avatar_image.visible (the layout defaults it to false).
	 */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setMotto()
    public setMotto(motto: string, _editable: boolean): void
    {
        const mottoContainer = this._elementList?.getListItemByName('motto_container') as IWindowContainer | null;
        const mottoText = mottoContainer?.findChildByName('motto_text') as ITextWindow | null;
        const changeIcon = mottoContainer?.findChildByName('changemotto.image');

        if(!mottoText) return;

        if(changeIcon) changeIcon.visible = false;

        mottoText.text = motto ?? '';
        mottoText.textColor = 0xFFFFFF;
        mottoText.height = Math.min(mottoText.textHeight + 5, 50);
        mottoText.height = Math.max(mottoText.height, 23);

        if(mottoContainer) mottoContainer.height = mottoText.height + 3;

        const isCrikeyEasterEgg = !!mottoText.text && mottoText.text.toLowerCase().indexOf('crikey') >= 0;
        const stickerCroco = this._infoBorder?.findChildByName('sticker_croco');
        const avatarImage = this._infoBorder?.findChildByName('avatar_image');

        if(stickerCroco) stickerCroco.visible = isCrikeyEasterEgg;
        if(avatarImage) avatarImage.visible = !isCrikeyEasterEgg;

        this.updateWindow();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set achievementScore()
    public set achievementScore(value: number)
    {
        if(!this._widget.handler.isActivityDisplayEnabled) return;

        const scoreValue = this._elementList?.getListItemByName('score_value') as ITextWindow | null;

        if(!scoreValue) return;

        scoreValue.text = String(value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::set carryItem()
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setBadge()
    public setBadge(index: number, badgeId: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName(`badge_${index}`) as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badgeId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::clearBadges()
    public clearBadges(): void
    {
        for(let i = 0; i < BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, '');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::clearGroupBadge()
    public clearGroupBadge(): void
    {
        this.setGroupBadge('');
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::setGroupBadge()
    public setGroupBadge(badgeId: string | null): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('badge_group') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badgeId ?? '';
    }

    /**
	 * TODO(AS3): setRelationshipStatuses() — populates the relationship_status_container
	 * rows (heart/smile/bobba) hidden in createWindow() above; deferred with the
	 * rest of the relationship-status feature (needs RoomSessionFavouriteGroupUpdateEvent
	 * wiring, not part of the Phase 1 identity scope).
	 */
    public setRelationshipStatuses(_statuses: unknown): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::update()
    // TODO(AS3): badge glow/preserve tracking (selectedBadges, playGlow) not
    // carried — see InfoStandWidget.onUserInfo()'s same scope cut.
    public update(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.clearBadges();
        this.setGroupBadge(event.groupBadgeId);
        this.updateInfo(event);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateInfo()
    protected updateInfo(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.name = event.name;
        this.setMotto(event.motto, event.type === 'RWUIUE_OWN_USER');
        this.achievementScore = event.achievementScore;
        this.carryItem = event.carryItem;
        this.setFigure(event.figure);
        this.updateBadges(event.badges);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateBadges()
    // TODO(AS3): AS3 prefers `selectedBadges` (slot-indexed, rarity-aware) over
    // the plain `badges` array when present — not tracked in Phase 1, always
    // falls through to the plain-badges branch.
    public updateBadges(badges: string[]): void
    {
        this.clearBadges();

        if(!badges) return;

        for(let i = 0; i < badges.length && i < BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, badges[i]);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserView.as::updateWindow()
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
