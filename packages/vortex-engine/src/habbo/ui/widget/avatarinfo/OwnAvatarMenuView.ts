/**
 * OwnAvatarMenuView — the bubble menu shown next to your own avatar.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/OwnAvatarMenuView.as
 *
 * Mode-driven button grid (normal / club-dances / expressions / signs). Each
 * button dispatches a RoomWidget* message through the widget's messageListener,
 * which the room desktop routes to the handler that registered that type.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {RoomWidgetMessage} from '../messages/RoomWidgetMessage';
import {RoomWidgetUserActionMessage} from '../messages/RoomWidgetUserActionMessage';
import {RoomWidgetChangePostureMessage} from '../messages/RoomWidgetChangePostureMessage';
import {RoomWidgetDanceMessage} from '../messages/RoomWidgetDanceMessage';
import {RoomWidgetAvatarExpressionMessage} from '../messages/RoomWidgetAvatarExpressionMessage';
import {RoomWidgetRequestWidgetMessage} from '../messages/RoomWidgetRequestWidgetMessage';
import {RoomWidgetOpenProfileMessage} from '../messages/RoomWidgetOpenProfileMessage';
import {AvatarExpressionEnum} from '../enums/AvatarExpressionEnum';
import {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import type {AvatarInfoData} from './AvatarInfoData';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

const MODE_NORMAL: number = 0;
const MODE_CLUB_DANCES: number = 1;
const MODE_NAME_CHANGE: number = 2;
const MODE_EXPRESSIONS: number = 3;
const MODE_SIGNS: number = 4;

export class OwnAvatarMenuView extends AvatarContextInfoButtonView
{
    private static _receptionShown: boolean = false;

    private _data: AvatarInfoData | null = null;
    private _mode: number = MODE_NORMAL;

    // AS3: OwnAvatarMenuView.as::OwnAvatarMenuView()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);
        this._autoHideEnabled = false;
    }

    // AS3: OwnAvatarMenuView.as::setup()
    public static setup(
        view: OwnAvatarMenuView,
        userId: number,
        userName: string,
        roomIndex: number,
        userType: number,
        data: AvatarInfoData
    ): void
    {
        if(!view || !view.widget) return;

        view._data = data;

        const config = view.widget.configuration;

        if(!OwnAvatarMenuView._receptionShown
            && (config?.getInteger('new.identity', 0) ?? 0) > 0
            && (config?.getBoolean('new.user.reception.enabled') ?? false))
        {
            view._mode = MODE_NORMAL;
            OwnAvatarMenuView._receptionShown = true;
        }
        else if(view.widget.isDancing && view.widget.hasClub && !view.widget.hasEffectOn)
        {
            view._mode = MODE_CLUB_DANCES;
        }
        else if(data.allowNameChange && view.widget.useMinimizedOwnAvatarMenu)
        {
            view._mode = MODE_NAME_CHANGE;
        }
        else
        {
            view._mode = MODE_NORMAL;
        }

        AvatarContextInfoButtonView.setupButtonView(view, userId, userName, roomIndex, userType, false);
    }

    // AS3: OwnAvatarMenuView.as::get widget()
    private get widget(): AvatarInfoWidget
    {
        return this._widget as AvatarInfoWidget;
    }

    // AS3: OwnAvatarMenuView.as::dispose()
    public override dispose(): void
    {
        this._data = null;
        super.dispose();
    }

    // AS3: OwnAvatarMenuView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        // AS3: collapsed state → show the small minimized bubble instead.
        if(this.minimized)
        {
            const minimizedView = this.getMinimizedView();

            if(minimizedView) this.activeView = minimizedView;

            return;
        }

        if(!this._window)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('own_avatar_menu') as IWindowContainer | null;

            if(!this._window) return;

            // AS3: the bubble is dismissed on avatar deselect; the port has no
            // empty-space deselect event, so use the window system's click-away.
            this._window.procedure = this.windowProc;

            const minimize = this._window.findChildByName('minimize');

            if(minimize) minimize.procedure = this.onMinimize;
        }

        this._buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

        if(this._buttons) this._buttons.procedure = this.buttonEventProc;

        const signsGrid = this._window.findChildByName('signs_grid') as IWindowContainer | null;

        if(signsGrid)
        {
            for(let i = 0; i < signsGrid.numChildren; i++)
            {
                const cell = signsGrid.getChildAt(i) as IWindowContainer | null;
                const button = cell?.findChildByName('button');

                if(button) button.procedure = this.gridEventProc;
            }
        }

        const profileLink = this._window.findChildByName('profile_link');

        if(profileLink) profileLink.procedure = this.buttonEventProc;

        const nameWindow = this._window.findChildByName('name') as ITextWindow | null;

        if(nameWindow) nameWindow.caption = this._userName;

        this._window.visible = false;
        this.activeView = this._window;
        this.updateButtons();
    }

    // AS3: OwnAvatarMenuView.as::updateButtons()
    public updateButtons(): void
    {
        if(!this._window || !this._data || !this._buttons) return;

        this._buttons.autoArrangeItems = false;

        const count = this._buttons.numListItems;

        for(let i = 0; i < count; i++)
        {
            const item = this._buttons.getListItemAt(i);

            if(item) item.visible = false;
        }

        const riding = this.widget.isCurrentUserRiding;

        switch(this._mode)
        {
            case MODE_NORMAL:
                this.showButton('change_name', this._data.allowNameChange);
                this.showButton('decorate', this.decorateModeSupported() && (this._data.myRoomControllerLevel >= 1 || this._data.amIOwner));
                this.showButton('change_looks');
                this.showButton('dance_menu', this.widget.hasClub && !riding, !this.widget.hasEffectOn);
                this.showButton('dance', !this.widget.hasClub && !this.widget.isDancing && !riding, !this.widget.hasEffectOn);
                this.showButton('dance_stop', !this.widget.hasClub && this.widget.isDancing && !riding);
                this.showButton('effects', !riding);
                this.showButton('handitem', this._data.carryItemType > 0 && this._data.carryItemType < 999999
                    && (this.widget.configuration?.getBoolean('handitem.drop.enabled') ?? false));
                this.showButton((this.widget.configuration?.getBoolean('avatar.expressions_menu.enabled') ?? false) ? 'expressions' : 'wave');
                this.showButton('signs', this.widget.configuration?.getBoolean('avatar.signs.enabled') ?? false);
                break;
            case MODE_CLUB_DANCES:
                this.showButton('dance_stop', true, this.widget.isDancing);
                this.showButton('dance_1');
                this.showButton('dance_2');
                this.showButton('dance_3');
                this.showButton('dance_4');
                this.showButton('back');
                break;
            case MODE_NAME_CHANGE:
                this.showButton('change_name');
                this.showButton('more');
                break;
            case MODE_EXPRESSIONS:
                this.showButton('wave', true, !this.widget.isSwimming);
                this.showButton('laugh', true, !this.widget.hasEffectOn && !this.widget.isSwimming && this.widget.hasVip, !this.widget.hasVip);
                this.showButton('blow', true, !this.widget.hasEffectOn && !this.widget.isSwimming && this.widget.hasVip, !this.widget.hasVip);
                this.showButton('67', this.widget.configuration?.getBoolean('avatar.expression.67.enabled') ?? false,
                    !this.widget.hasEffectOn && !this.widget.isSwimming && this.widget.hasVip, !this.widget.hasVip);
                this.showButton('idle', true);
                if((this.widget.configuration?.getBoolean('avatar.sitting.enabled') ?? false) && !this.widget.isSwimming && !riding)
                {
                    this.showButton('sit', this.widget.ownAvatarPosture === 'std');
                    this.showButton('stand', this.widget.canStandUp);
                }
                this.showButton('back');
                break;
            case MODE_SIGNS:
                this.showButtonGrid('signs_grid');
                this.showButton('back');
                break;
        }

        this._buttons.autoArrangeItems = true;
        this._buttons.visible = true;
    }

    // AS3: OwnAvatarMenuView.as::gridEventProc()
    private gridEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        let handled = false;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'button')
            {
                handled = true;

                const parentName = window.parent?.name ?? '';
                const underscore = parentName.lastIndexOf('_');
                const prefix = parentName.substr(0, underscore);
                const id = parseInt(parentName.substr(underscore + 1), 10);

                if(prefix === 'sign')
                {
                    this.widget.sendSignRequest(id);
                }
            }
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(handled)
        {
            this._widget.removeView(this, false);
        }
    };

    // AS3: OwnAvatarMenuView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        let close = false;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'button')
            {
                const vipIcon = (window as IWindowContainer).getChildByName('icon_vip');

                if(vipIcon && vipIcon.visible && !this.widget.hasVip)
                {
                    this.widget.catalog?.openClubCenter();

                    return;
                }

                close = true;
                const action = window.parent?.name ?? '';
                const message = this.resolveButtonAction(action);

                if(message)
                {
                    this._widget.messageListener?.processWidgetMessage(message);
                }
                else if(action === 'expressions' || action === 'dance_menu' || action === 'signs'
                    || action === 'back' || action === 'more' || action === 'decorate' || action === 'change_looks')
                {
                    close = false;
                    this.handleViewAction(action);
                }
            }

            if(window.name === 'profile_link')
            {
                close = true;
                this._widget.messageListener?.processWidgetMessage(
                    new RoomWidgetOpenProfileMessage(RoomWidgetOpenProfileMessage.OPEN_USER_PROFILE, this.userId, 'ownAvatarContextMenu')
                );
            }
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(close && !this.disposed)
        {
            this._widget.removeView(this, false);
        }
    };

    // AS3: OwnAvatarMenuView.as::buttonEventProc() — the message-producing cases.
    private resolveButtonAction(action: string): RoomWidgetMessage | null
    {
        switch(action)
        {
            case 'change_name':
                return new RoomWidgetUserActionMessage(RoomWidgetUserActionMessage.START_NAME_CHANGE);
            case 'sit':
                return new RoomWidgetChangePostureMessage(RoomWidgetChangePostureMessage.SIT);
            case 'stand':
                return new RoomWidgetChangePostureMessage(RoomWidgetChangePostureMessage.STAND);
            case 'wave':
                return new RoomWidgetAvatarExpressionMessage(AvatarExpressionEnum.WAVE);
            case 'blow':
                return new RoomWidgetAvatarExpressionMessage(AvatarExpressionEnum.BLOW);
            case '67':
                return (this.widget.configuration?.getBoolean('avatar.expression.67.enabled') ?? false)
                    ? new RoomWidgetAvatarExpressionMessage(AvatarExpressionEnum.EXPRESSION_67)
                    : null;
            case 'laugh':
                return new RoomWidgetAvatarExpressionMessage(AvatarExpressionEnum.LAUGH);
            case 'idle':
                return new RoomWidgetAvatarExpressionMessage(AvatarExpressionEnum.IDLE);
            case 'dance':
                return new RoomWidgetDanceMessage(1);
            case 'dance_stop':
                return new RoomWidgetDanceMessage(RoomWidgetDanceMessage.STOP);
            case 'dance_1':
            case 'dance_2':
            case 'dance_3':
            case 'dance_4':
                return new RoomWidgetDanceMessage(parseInt(action.charAt(action.length - 1), 10));
            case 'effects':
                return new RoomWidgetRequestWidgetMessage(RoomWidgetRequestWidgetMessage.REQUEST_EFFECTS);
            case 'handitem':
                return new RoomWidgetUserActionMessage(RoomWidgetUserActionMessage.DROP_CARRY_ITEM, this.userId);
            case 'wired_inspect':
                return new RoomWidgetUserActionMessage('RWUAM_WIRED_INSPECT', this.userId);
            default:
                return null;
        }
    }

    // AS3: OwnAvatarMenuView.as::buttonEventProc() — the mode-switching / widget-call cases.
    private handleViewAction(action: string): void
    {
        switch(action)
        {
            case 'expressions':
                this.changeMode(MODE_EXPRESSIONS);
                break;
            case 'dance_menu':
                this.changeMode(MODE_CLUB_DANCES);
                break;
            case 'signs':
                this.changeMode(MODE_SIGNS);
                break;
            case 'back':
                this.changeMode(MODE_NORMAL);
                break;
            case 'more':
                this.widget.useMinimizedOwnAvatarMenu = false;
                this.changeMode(MODE_NORMAL);
                break;
            case 'change_looks':
                this.widget.openAvatarEditor();
                break;
            case 'decorate':
                if(this.decorateModeSupported()) this.widget.isUserDecorating = true;
                break;
        }
    }

    // AS3: OwnAvatarMenuView.as::changeMode()
    private changeMode(mode: number): void
    {
        this._mode = mode;
        this.updateButtons();
    }

    // AS3: OwnAvatarMenuView.as::decorateModeSupported()
    private decorateModeSupported(): boolean
    {
        return this.widget.hasClub;
    }

    // Close the bubble when the user clicks outside it (the port's stand-in for
    // AS3's RWROUE_OBJECT_DESELECTED dismissal).
    private windowProc = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK_AWAY')
        {
            this._widget.removeView(this, false);
        }
    };
}
