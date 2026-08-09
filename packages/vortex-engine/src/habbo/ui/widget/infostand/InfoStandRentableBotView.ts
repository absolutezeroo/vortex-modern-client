/**
 * InfoStandRentableBotView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandRentableBotView.as
 *
 * The click panel for a rentable bot: name, motto, hand item, owner line, avatar, badge, and the
 * move/rotate/pick buttons. Built from the `rentable_bot_view` layout, which ships verbatim and
 * already carries every child this reads.
 *
 * Two AS3 members are deliberately not ported and say so at their call site:
 * `createPercentageBar()` (dead in AS3 — nothing calls it, the rent bar it drew was removed) and
 * the rent-expiry fields, whose own AS3 body already writes "N/A" into a pair of children this
 * layout does not have.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {
    RemoveBotFromFlatMessageComposer
} from '@habbo/communication/messages/outgoing/room/bot/RemoveBotFromFlatMessageComposer';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {Logger} from '@core/utils/Logger';

import type {RoomWidgetRentableBotInfoUpdateEvent} from '../events/RoomWidgetRentableBotInfoUpdateEvent';
import {RoomWidgetFurniActionMessage} from '../messages/RoomWidgetFurniActionMessage';
import type {InfoStandWidget} from './InfoStandWidget';

const log = Logger.getLogger('habbo.ui.widget.infostand.InfoStandRentableBotView');

export class InfoStandRentableBotView
{
    // AS3: .../InfoStandRentableBotView.as::BUTTONS_MAX_WIDTH
    private static readonly BUTTONS_MAX_WIDTH: number = 250;
    // AS3: .../InfoStandRentableBotView.as::BUTTON_HEIGHT
    private static readonly BUTTON_HEIGHT: number = 25;
    // AS3: .../InfoStandRentableBotView.as::BUTTON_MARGIN
    private static readonly BUTTON_MARGIN: number = 5;

    // AS3: .../InfoStandRentableBotView.as::_SafeStr_4549
    private _widget: InfoStandWidget;
    // AS3: .../InfoStandRentableBotView.as::_window
    private _window: IItemListWindow | null = null;
    // AS3: .../InfoStandRentableBotView.as::_SafeStr_4558
    private _infoBorder: IWindowContainer | null = null;
    // AS3: .../InfoStandRentableBotView.as::_SafeStr_4641
    private _elementList: IItemListWindow | null = null;
    // AS3: .../InfoStandRentableBotView.as::_buttonsContainer
    private _buttonsContainer: IWindowContainer | null = null;
    // AS3: .../InfoStandRentableBotView.as::_SafeStr_6226 — the bot's webID, what pickup sends.
    private _botId: number = -1;
    // AS3: .../InfoStandRentableBotView.as::_SafeStr_8538 — its room index, what move/rotate take.
    private _userRoomId: number = -1;

    // AS3: .../InfoStandRentableBotView.as::InfoStandRentableBotView()
    // AS3 also takes the catalog and HabboTracking; it stores both and reads neither (the rent
    // flow that used them is gone with createPercentageBar()), so they are left out here.
    constructor(widget: InfoStandWidget, name: string)
    {
        this._widget = widget;
        this.createWindow(name);
    }

    // AS3: .../InfoStandRentableBotView.as::get window()
    public get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../InfoStandRentableBotView.as::createWindow()
    private createWindow(name: string): void
    {
        const window = this._widget.getXmlWindow('rentable_bot_view') as IItemListWindow | null;

        if(!window)
        {
            throw new Error('Failed to construct window from XML!');
        }

        this._window = window;
        this._infoBorder = window.getListItemByName('info_border') as IWindowContainer | null;
        this._elementList = (this._infoBorder?.findChildByName('infostand_element_list') as IItemListWindow | null) ?? null;

        window.name = name;
        this._widget.mainContainer.addChild(window);

        this._infoBorder?.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        this._buttonsContainer = window.getListItemByName('button_list') as IWindowContainer | null;

        if(this._buttonsContainer === null) return;

        const buttons: IWindow[] = [];

        this._buttonsContainer.groupChildrenWithTag('CMD_BUTTON', buttons, -1);

        for(const button of buttons)
        {
            button.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);

            // AS3 runs this as a second loop over the same array: each button's own region is
            // sized to it up-front, then kept in step by onButtonResized().
            if(button.parent) button.parent.width = button.width;

            button.addEventListener(WindowEvent.WE_RESIZED, this.onButtonResized);
        }
    }

    // AS3: .../InfoStandRentableBotView.as::update()
    public update(event: RoomWidgetRentableBotInfoUpdateEvent): void
    {
        this._botId = event.webID;
        this._userRoomId = event.userRoomId;

        this.setFieldText('name_text', true, event.name);
        this.setFieldText('description_text', true, event.motto);

        if(event.ownerId > -1)
        {
            this._widget.localizations?.registerParameter('infostand.text.botowner', 'name', event.ownerName);
            this.setFieldText(
                'owner_text', true,
                this._widget.localizations?.getLocalization('infostand.text.botowner') ?? ''
            );
        }
        else
        {
            this.setFieldText('owner_text', false, '');
        }

        const roomSession = this._widget.handler.container?.roomSession ?? null;
        const playTestMode = roomSession !== null && roomSession.playTestMode;

        this.updateRentExpireField();
        this.setCarryItem(event.carryItem);

        const badges = event.badges;

        this.setBadge(badges && badges.length > 0 ? badges[0] : '');
        this.setFigure(event.figure);

        // AS3: an owner (or any room controller) may pick the bot up; moving and rotating it also
        // needs rights but is additionally blocked while the room is in play-test mode.
        const canPick = event.ownerId > -1 && (event.amIOwner || event.amIAnyRoomController);
        const canMove = event.ownerId > -1
            && !playTestMode
            && (event.myRoomControllerLevel >= 1 || event.amIOwner || event.amIAnyRoomController);

        this.showButton('whisper', false);
        this.showButton('ignore', false);
        this.showButton('unignore', false);
        this.showButton('move', canMove);
        this.showButton('rotate', canMove);
        this.showButton('pick', canPick);

        this.updateWindow();
    }

    // AS3: .../InfoStandRentableBotView.as::updateRentExpireField()
    // AS3's whole body is these two calls: the rent bar was removed and the fields left behind, so
    // it blanks them. This layout has neither child; setFieldText() no-ops for both.
    private updateRentExpireField(): void
    {
        this.setFieldText('expire_time_left', false, 'N/A');
        this.setFieldText('expire_time_info', false, '');
    }

    // AS3: .../InfoStandRentableBotView.as::setCarryItem()
    public setCarryItem(value: number): void
    {
        const handitemText = this._elementList?.getListItemByName('handitem_text') as ITextWindow | null;
        const handitemSpacer = this._elementList?.getListItemByName('handitem_spacer') ?? null;

        if(!handitemText || !handitemSpacer) return;

        const visible = value > 0 && value < 999999;

        if(visible)
        {
            const itemName = this._widget.localizations?.getLocalization(`handitem${value}`, `handitem${value}`) ?? '';

            this._widget.localizations?.registerParameter('infostand.text.handitem', 'item', itemName);
        }

        handitemText.height = handitemText.textHeight + 5;

        const wasVisible = handitemText.visible;

        handitemText.visible = visible;
        handitemSpacer.visible = visible;

        if(visible !== wasVisible) this._elementList?.arrangeListItems();

        this.updateWindow();
    }

    // AS3: .../InfoStandRentableBotView.as::setFieldText()
    private setFieldText(name: string, visible: boolean, text: string): void
    {
        if(this._elementList === null) return;

        let field = this._elementList.getListItemByName(name) as ITextWindow | null;

        if(field === null)
        {
            const container = this._elementList.getListItemByName('description_container') as IWindowContainer | null;

            if(container === null) return;

            field = container.findChildByName(name) as ITextWindow | null;

            if(field === null) return;
        }

        field.text = text;
        field.visible = visible;
    }

    // AS3: .../InfoStandRentableBotView.as::setFigure()
    private setFigure(figure: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('avatar_image') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IAvatarImageWidget | null;

        if(widget) widget.figure = figure;
    }

    // AS3: .../InfoStandRentableBotView.as::setBadge()
    private setBadge(badgeId: string): void
    {
        const widgetWindow = this._infoBorder?.findChildByName('badge') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badgeId;
    }

    // AS3: .../InfoStandRentableBotView.as::onButtonClicked()
    private onButtonClicked = (event: WindowMouseEvent): void =>
    {
        const name = (event.target as IWindow | null)?.name ?? '';

        switch(name)
        {
            case 'move':
                this._widget.messageListener?.processWidgetMessage(
                    new RoomWidgetFurniActionMessage(
                        RoomWidgetFurniActionMessage.MOVE, this._userRoomId,
                        RoomObjectCategoryEnum.OBJECT_CATEGORY_USER
                    )
                );
                break;
            case 'rotate':
                this._widget.messageListener?.processWidgetMessage(
                    new RoomWidgetFurniActionMessage(
                        RoomWidgetFurniActionMessage.ROTATE, this._userRoomId,
                        RoomObjectCategoryEnum.OBJECT_CATEGORY_USER
                    )
                );
                break;
            case 'pick':
                // AS3 sends this one straight down the connection rather than through a widget
                // message, and it takes the bot's webID — not the room index the two above use.
                this._widget.handler.container?.connection?.send(new RemoveBotFromFlatMessageComposer(this._botId));
                break;
            default:
                log.debug(`Unhandled rentable-bot button "${name}"`);
        }
    };

    // AS3: .../InfoStandRentableBotView.as::onClose()
    private onClose = (_event: WindowMouseEvent): void =>
    {
        this._widget.close();
    };

    // AS3: .../InfoStandRentableBotView.as::showButton()
    private showButton(name: string, visible: boolean): void
    {
        if(this._buttonsContainer === null) return;

        const button = this._buttonsContainer.getChildByName(name);

        if(button !== null)
        {
            button.visible = visible;
            this.arrangeButtons();
        }
    }

    // AS3: .../InfoStandRentableBotView.as::onButtonResized()
    private onButtonResized = (event: WindowEvent): void =>
    {
        const window = (event as unknown as {window?: IWindow}).window ?? null;
        const region = window?.parent ?? null;

        if(region && region.tags.indexOf('CMD_BUTTON_REGION') > -1)
        {
            region.width = window!.width;
        }
    };

    // AS3: .../InfoStandRentableBotView.as::arrangeButtons()
    // Right-aligned, wrapping onto a new row when the next region would cross the left edge.
    private arrangeButtons(): void
    {
        if(this._buttonsContainer === null) return;

        this._buttonsContainer.width = InfoStandRentableBotView.BUTTONS_MAX_WIDTH;

        const regions: IWindow[] = [];

        this._buttonsContainer.groupChildrenWithTag('CMD_BUTTON_REGION', regions, -1);
        regions.reverse();

        let x = InfoStandRentableBotView.BUTTONS_MAX_WIDTH;
        let y = 0;

        for(const region of regions)
        {
            if(!region.visible) continue;

            if(x - region.width < 0)
            {
                x = InfoStandRentableBotView.BUTTONS_MAX_WIDTH;
                y += InfoStandRentableBotView.BUTTON_HEIGHT + InfoStandRentableBotView.BUTTON_MARGIN;
            }

            region.x = x - region.width;
            region.y = y;
            x = region.x - InfoStandRentableBotView.BUTTON_MARGIN;
        }

        this._buttonsContainer.height = y + InfoStandRentableBotView.BUTTON_HEIGHT;
        this.updateWindow();
    }

    // AS3: .../InfoStandRentableBotView.as::updateWindow()
    private updateWindow(): void
    {
        if(this._elementList === null || this._infoBorder === null || this._buttonsContainer === null) return;

        const infoBorder = this._infoBorder as unknown as IWindow;
        const buttons = this._buttonsContainer as unknown as IWindow;

        // AS3 opens with `_buttonsContainer.width = _buttonsContainer.width` — a no-op read-back
        // that only matters in Flash, where the setter re-runs the container's layout pass. Left
        // out rather than transcribed as a line that does nothing here.
        buttons.visible = buttons.width > 0;

        this._elementList.height = this._elementList.scrollableRegion.height;
        infoBorder.height = this._elementList.height + 20;

        if(this._window === null) return;

        this._window.width = Math.max(infoBorder.width, buttons.width);
        this._window.height = this._window.scrollableRegion.height;

        // The narrower of the two hugs the right edge; the wider one starts at 0.
        if(infoBorder.width < buttons.width)
        {
            infoBorder.x = this._window.width - infoBorder.width;
            buttons.x = 0;
        }
        else
        {
            buttons.x = this._window.width - buttons.width;
            infoBorder.x = 0;
        }

        this._widget.refreshContainer();
    }

    // AS3: .../InfoStandRentableBotView.as::dispose()
    public dispose(): void
    {
        this._buttonsContainer = null;
        this._elementList = null;
        this._infoBorder = null;

        this._window?.dispose();
        this._window = null;
    }
}
