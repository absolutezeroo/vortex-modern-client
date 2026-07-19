import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {FlatCategory} from '@habbo/communication/messages/incoming/navigator/FlatCategory';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {UpdateRoomCategoryAndTradeSettingsComposer} from '@habbo/communication/messages/outgoing/room/settings/UpdateRoomCategoryAndTradeSettingsComposer';

type IPopulatable = { populate(items: string[]): void; selection: number };

/**
 * Modal dialog to enforce room category and trade mode selection.
 * Shown when a room owner hasn't yet set a proper category/trade setting.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/EnforceCategoryCtrl.as
 */
export class EnforceCategoryCtrl
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindowContainer | null = null;
    private _categorySelection: number = 0;
    private _tradeModeSelection: number = 0;
    private _availableCategories: FlatCategory[] = [];

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    show(_flatId: number): void
    {
        if(!this._navigator) return;

        this.close();

        const win = this._navigator.getXmlWindow('enforce_category') as IWindowContainer | null;

        if(win === null) return;

        this._window = win;

        const closeBtnHeader = win.findChildByName('header_button_close');

        if(closeBtnHeader !== null) closeBtnHeader.visible = false;

        const tradeDropdown = win.findChildByName('trade_mode') as unknown as IPopulatable | null;

        if(tradeDropdown !== null)
        {
            tradeDropdown.populate([
                '${navigator.roomsettings.trade_not_allowed}',
                '${navigator.roomsettings.trade_not_with_Controller}',
                '${navigator.roomsettings.trade_allowed}',
            ]);
            tradeDropdown.selection = 0;
        }

        this._availableCategories = [];

        for(const cat of this._navigator.data.visibleCategories)
        {
            if(!cat.automatic && (!cat.staffOnly || (cat.staffOnly && this._navigator.sessionData?.hasSecurity(7))))
            {
                this._availableCategories.push(cat);
            }
        }

        const categoryDropdown = win.findChildByName('category') as unknown as IPopulatable | null;

        if(categoryDropdown !== null)
        {
            categoryDropdown.populate(this._availableCategories.map((cat) => cat.visibleName));
            categoryDropdown.selection = 0;
        }

        const okBtn = win.findChildByName('ok');

        if(okBtn !== null)
        {
            okBtn.addEventListener('WME_CLICK', this._onOkClick);
        }

        win.addEventListener('WE_SELECTED', this._onSelected);

        (win as unknown as { center(): void }).center?.();
        win.visible = true;
    }

    close(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as { dispose(): void }).dispose();
            this._window = null;
        }
    }

    dispose(): void
    {
        this.close();
        this._navigator = null;
    }

    private _onOkClick = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        const catIndex = Math.max(0, this._categorySelection);
        const cat = this._availableCategories[catIndex];

        if(cat === undefined) return;

        this._navigator.send(
            new UpdateRoomCategoryAndTradeSettingsComposer(
                this._navigator.data.currentRoomId,
                cat.nodeId,
                this._tradeModeSelection
            )
        );

        this.close();
    };

    private _onSelected = (event: WindowEvent): void =>
    {
        const target = event.target as unknown as { name: string; selection: number } | null;

        if(target === null) return;

        switch(target.name)
        {
            case 'category':
                this._categorySelection = target.selection;
                break;

            case 'trade_mode':
                this._tradeModeSelection = target.selection;
                break;
        }
    };
}
