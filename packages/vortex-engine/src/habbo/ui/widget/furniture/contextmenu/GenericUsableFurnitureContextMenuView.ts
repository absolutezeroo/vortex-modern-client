import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IContextMenuParentWidget} from '@habbo/ui/widget/contextmenu/IContextMenuParentWidget';
import {RoomWidgetFurniActionMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniActionMessage';
import {FurnitureContextInfoView} from './FurnitureContextInfoView';

const log = Logger.getLogger('habbo.ui.widget.furniture.contextmenu.GenericUsableFurnitureContextMenuView');

/**
 * GenericUsableFurnitureContextMenuView
 *
 * The context bubble over generic usable furniture: its own layout, a name row, and a single Use button that
 * goes out as `RWFAM_USE` through the widget's message listener.
 *
 * Sibling of `FriendFurniContextMenuView` — same shape, different layout and message.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/GenericUsableFurnitureContextMenuView.as
 */
export class GenericUsableFurnitureContextMenuView extends FurnitureContextInfoView
{
    // AS3: .../contextmenu/GenericUsableFurnitureContextMenuView.as::GenericUsableFurnitureContextMenuView()
    constructor(widget: IContextMenuParentWidget)
    {
        super(widget);
    }

    // AS3: .../contextmenu/GenericUsableFurnitureContextMenuView.as::_SafeStr_8829
    private _objectCategory: number = 0;

    // AS3: .../contextmenu/GenericUsableFurnitureContextMenuView.as::set objectCategory()
    public set objectCategory(value: number)
    {
        this._objectCategory = value;
    }

    // AS3: .../contextmenu/GenericUsableFurnitureContextMenuView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(this._widget === null || this._widget.assets === null || this._widget.windowManager === null) return;

        if(FurnitureContextInfoView._minimized)
        {
            this.activeView = this.getMinimizedView();

            return;
        }

        if(this._window === null)
        {
            const asset = this._widget.assets.getAssetByName('generic_usable_menu') as XmlAsset | null;

            if(asset === null || asset === undefined)
            {
                log.warn('Missing layout "generic_usable_menu" - the bubble cannot open');

                return;
            }

            this._window = this._widget.windowManager.buildFromXML(
                asset.content as unknown as string, 0
            ) as IWindowContainer | null;

            if(this._window === null) return;

            this._window.addEventListener('WME_OVER', this.onMouseHoverEvent);
            this._window.addEventListener('WME_OUT', this.onMouseHoverEvent);

            const minimize = this._window.findChildByName('minimize');

            if(minimize !== null)
            {
                minimize.addEventListener('WME_CLICK', this.onMinimize);
                minimize.addEventListener('WME_OVER', this.onMinimizeHover);
                minimize.addEventListener('WME_OUT', this.onMinimizeHover);
            }
        }

        const furniName = this._window.findChildByName('furni_name');

        if(furniName !== null)
        {
            furniName.caption = '${furni.generic_usable.name}';
        }

        const buttons = this._window.findChildByName('buttons');

        if(buttons !== null)
        {
            buttons.procedure = this.buttonEventProc;
        }

        this._window.visible = false;

        this.activeView = this._window;

        // `_SafeStr_4722` in AS3, `_mouseOver` here: cleared so the bubble repositions.
        this._mouseOver = false;
    }

    /**
     * Tints the minimise icon on hover. AS3 inherits this from `ContextInfoView`; this port
     * folded that method into a private `onMinimizedProc` on the minimised bubble, so the
     * normal window's copy lives in each subclass.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/contextmenu/ContextInfoView.as::onMinimizeHover()
    private onMinimizeHover = (event: WindowEvent, window: IWindow): void =>
    {
        const icon = (window as IWindowContainer).findChildByName?.('icon');

        if(icon)
        {
            icon.color = event.type === 'WME_OVER' ? 4282950861 : 16777215;
        }
    };

    // AS3: .../contextmenu/GenericUsableFurnitureContextMenuView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || this._window === null || this._window.disposed) return;

        let consumed = false;

        if(event.type === 'WME_CLICK')
        {
            if(window?.name === 'button' && window.parent?.name === 'use')
            {
                const objectId = this.roomObject?.getId() ?? -1;

                if(objectId !== -1)
                {
                    this._widget.messageListener?.processWidgetMessage(
                        new RoomWidgetFurniActionMessage(RoomWidgetFurniActionMessage.USE, objectId, this._objectCategory)
                    );
                }
            }

            consumed = true;
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(consumed)
        {
            this._widget.removeView(this, false);
        }
    };
}
