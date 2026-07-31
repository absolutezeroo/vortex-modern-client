/**
 * MysteryBoxContextMenuView — the one-button bubble over a mystery box.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/mysterybox/MysteryBoxContextMenuView.as
 *
 * The button's caption is the whole state of this view: "Open box" for the owner, "Use key" for
 * anyone else. Pressing it hands off to the widget, which starts the open flow on the wire.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IContextMenuParentWidget} from '@habbo/ui/widget/contextmenu/IContextMenuParentWidget';
import {FurnitureContextInfoView} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextInfoView';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';

export class MysteryBoxContextMenuView extends FurnitureContextInfoView
{
    // AS3: MysteryBoxContextMenuView.as::_isOwnerMode
    private _isOwnerMode: boolean = false;

    // AS3: MysteryBoxContextMenuView.as::MysteryBoxContextMenuView()
    constructor(widget: IContextMenuParentWidget)
    {
        super(widget);
    }

    // AS3: MysteryBoxContextMenuView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        if(this.minimized)
        {
            this.activeView = this.getMinimizedView();

            return;
        }

        if(this._window === null || this._window.disposed)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('mysterybox_menu', 0) as IWindowContainer | null;

            if(this._window === null) return;

            this._window.procedure = this.onMouseHoverEvent;

            const minimize = this._window.findChildByName('minimize');

            if(minimize) minimize.procedure = this.onMinimizeProc;
        }

        const buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

        if(buttons) buttons.procedure = this.buttonEventProc;

        this._buttons = buttons;

        this._window.visible = false;

        this.activeView = this._window;

        // AS3: `_SafeStr_4722 = false` — the hover freeze, cleared so the first update() positions
        // the bubble even if the pointer is already over where it will appear.
        this._mouseOver = false;

        this.refreshOwnerMode();
    }

    // AS3: MysteryBoxContextMenuView.as::refreshOwnerMode()
    private refreshOwnerMode(): void
    {
        if(this._window === null) return;

        const label = this._window.findChildByName('label') as ITextWindow | null;

        if(label) label.caption = `\${mysterybox.context.${this._isOwnerMode ? 'owner' : 'other'}.use}`;
    }

    /**
     * AS3 hands hover events to the ButtonMenuView base and only intercepts the click, which is
     * also what closes the bubble (`removeView` runs for any click, not just the "use" row).
     */
    // AS3: MysteryBoxContextMenuView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || this._window === null || this._window.disposed) return;

        if(event.type !== 'WME_CLICK')
        {
            this.applyButtonHover(event, window);

            return;
        }

        if(window.name === 'button' && window.parent?.name === 'use')
        {
            const widget = this._widget as FurnitureContextMenuWidget;

            if(this._roomObject !== null) widget.showMysteryBoxOpenDialog(this._roomObject);
        }

        this._widget.removeView(this, false);
    };

    // AS3: MysteryBoxContextMenuView.as::onMinimize()/onMinimizeHover() on the "minimize" region.
    private onMinimizeProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.setMinimized(true);

            return;
        }

        const icon = (window as IWindowContainer).findChildByName?.('icon');

        if(icon) icon.color = event.type === 'WME_OVER' ? 4282950861 : 16777215;
    };

    // AS3: MysteryBoxContextMenuView.as::set isOwnerMode()
    public set isOwnerMode(value: boolean)
    {
        this._isOwnerMode = value;

        this.refreshOwnerMode();
    }
}
