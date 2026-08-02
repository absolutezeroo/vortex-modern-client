import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IContextMenuParentWidget} from '@habbo/ui/widget/contextmenu/IContextMenuParentWidget';
import type {FurnitureContextMenuWidget} from './FurnitureContextMenuWidget';
import {FurnitureContextInfoView} from './FurnitureContextInfoView';

const log = Logger.getLogger('habbo.ui.widget.furniture.contextmenu.MonsterPlantSeedContextMenuView');

/**
 * MonsterPlantSeedContextMenuView
 *
 * The context bubble over a monsterplant seed: its own layout, a name row, and a single Use
 * button.
 *
 * Unlike its siblings, Use does not send anything — it hands over to the widget's plant-seed
 * confirmation dialog, and only that dialog talks to the server.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/contextmenu/MonsterPlantSeedContextMenuView.as
 */
export class MonsterPlantSeedContextMenuView extends FurnitureContextInfoView
{
    // AS3: .../contextmenu/MonsterPlantSeedContextMenuView.as::MonsterPlantSeedContextMenuView()
    constructor(widget: IContextMenuParentWidget)
    {
        super(widget);
    }

    // AS3: .../contextmenu/MonsterPlantSeedContextMenuView.as::_SafeStr_8829
    private _objectCategory: number = 0;

    // AS3: .../contextmenu/MonsterPlantSeedContextMenuView.as::set objectCategory()
    public set objectCategory(value: number)
    {
        this._objectCategory = value;
    }

    // AS3: .../contextmenu/MonsterPlantSeedContextMenuView.as::updateWindow()
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
            const asset = this._widget.assets.getAssetByName('monsterplant_seed_menu') as XmlAsset | null;

            if(asset === null || asset === undefined)
            {
                log.warn('Missing layout "monsterplant_seed_menu" - the bubble cannot open');

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
            furniName.caption = '${furni.mnstr_seed.name}';
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

    // AS3: .../contextmenu/MonsterPlantSeedContextMenuView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || this._window === null || this._window.disposed) return;

        let consumed = false;

        if(event.type === 'WME_CLICK')
        {
            if(window?.name === 'button' && window.parent?.name === 'use')
            {
                const widget = this._widget as FurnitureContextMenuWidget | null;
                const roomObject = this.roomObject;

                if(widget !== null && roomObject !== null)
                {
                    widget.showPlantSeedConfirmationDialog(roomObject);
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
