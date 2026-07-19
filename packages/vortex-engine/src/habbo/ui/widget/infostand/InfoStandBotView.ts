/**
 * InfoStandBotView
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as
 *
 * Phase 1 (identity only) port, same scope cut as InfoStandUserView.ts:
 * badge hover/details popup deferred (badge display itself is ported).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';
import type {InfoStandWidget} from './InfoStandWidget';

const BADGE_SLOT_COUNT = 5;

export class InfoStandBotView
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::_SafeStr_4549
    private _widget: InfoStandWidget;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::_window
    private _window: IItemListWindow | null = null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::_SafeStr_4558
    private _infoBorder: IWindowContainer | null = null;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::_SafeStr_4641
    private _elementList: IItemListWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::InfoStandBotView()
    constructor(widget: InfoStandWidget, name: string)
    {
        this._widget = widget;
        this.createWindow(name);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::dispose()
    public dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::get window()
    public get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::createWindow()
    private createWindow(name: string): void
    {
        const window = this._widget.getXmlWindow('bot_view') as IItemListWindow | null;

        if(!window)
        {
            throw new Error('Failed to construct window from XML!');
        }

        this._window = window;
        this._infoBorder = window.getListItemByName('info_border') as IWindowContainer | null;
        this._elementList = this._infoBorder?.findChildByName('infostand_element_list') as IItemListWindow | null ?? null;

        window.name = name;
        this._widget.mainContainer.addChild(window);

        const closeButton = this._infoBorder?.findChildByTag('close');

        closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onClose);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::onClose()
    private onClose = (_event: WindowMouseEvent): void =>
    {
        this._widget.close();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::setFigure()
    public setFigure(figure: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(!widget) return;

        widget.figure = figure;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::set name()
    public set name(value: string)
    {
        const nameText = this._elementList?.getListItemByName('name_text') as ITextWindow | null;

        if(!nameText) return;

        nameText.text = value;
        nameText.visible = true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::setMotto()
    public setMotto(motto: string): void
    {
        const mottoContainer = this._elementList?.getListItemByName('motto_container') as IWindowContainer | null;
        const mottoText = mottoContainer?.findChildByName('motto_text') as ITextWindow | null;

        if(!mottoText) return;

        mottoText.text = motto ?? '';
        mottoText.height = Math.min(mottoText.textHeight + 5, 50);
        mottoText.height = Math.max(mottoText.height, 23);

        if(mottoContainer) mottoContainer.height = mottoText.height + 3;

        this.updateWindow();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::set achievementScore()
    public set achievementScore(value: number)
    {
        if(!this._widget.handler.isActivityDisplayEnabled) return;

        const scoreValue = this._elementList?.getListItemByName('score_value') as ITextWindow | null;

        if(!scoreValue) return;

        scoreValue.text = String(value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::set carryItem()
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::setBadge()
    public setBadge(index: number, badgeId: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName(`badge_${index}`) as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badgeId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::clearBadges()
    public clearBadges(): void
    {
        for(let i = 0; i < BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, '');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::update()
    public update(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.clearBadges();
        this.updateInfo(event);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::updateInfo()
    private updateInfo(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.name = event.name;
        this.setMotto(event.motto);
        this.achievementScore = event.achievementScore;
        this.carryItem = event.carryItem;
        this.setFigure(event.figure);
        this.updateBadges(event.badges);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::updateBadges()
    // TS deviation: AS3 loops the full `badges` array with no slot-count guard
    // (a latent out-of-bounds risk if a bot ever had >5 badges); capped at
    // BADGE_SLOT_COUNT here since setBadge() targets a fixed 5-slot layout.
    public updateBadges(badges: string[]): void
    {
        if(!badges) return;

        for(let i = 0; i < badges.length && i < BADGE_SLOT_COUNT; i++)
        {
            this.setBadge(i, badges[i]);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandBotView.as::updateWindow()
    private updateWindow(): void
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
