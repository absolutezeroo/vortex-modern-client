/**
 * ButtonMenuView — a ContextInfoView whose content is a vertical list of button
 * rows, with hover coloring.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import {ContextInfoView} from './ContextInfoView';

export class ButtonMenuView extends ContextInfoView
{
    /**
	 * Six of the colours this view used to redeclare now come from ContextInfoView, where AS3
	 * declares them protected: BUTTON_COLOR_DEFAULT/HOVER, ICON_COLOR_ENABLED/DISABLED and
	 * LINK_COLOR_ACTIONS_DEFAULT/HOVER. Only the two moderate link colours are AS3's own here.
	 */
    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::LINK_COLOR_MODERATE_DEFAULT
    private static readonly LINK_COLOR_MODERATE_DEFAULT: number = 16744755;

    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::LINK_COLOR_MODERATE_HOVER
    private static readonly LINK_COLOR_MODERATE_HOVER: number = 16756591;

    /**
	 * The named children a menu button can carry, and the gap an arrow keeps from its label
	 *
	 * The two arrows are matched on the icon's *tags*, not its name, because a layout tags the one
	 * icon window rather than shipping two — which is why these are strings and not child names.
	 */
    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::ICON_MARGIN
    protected static readonly ICON_MARGIN: number = 8;

    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::ICON_VIP
    protected static readonly ICON_VIP: string = 'icon_vip';

    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::ICON_DUCKET
    protected static readonly ICON_DUCKET: string = 'icon_ducket';

    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::ICON_ARROW_LEFT
    protected static readonly ICON_ARROW_LEFT: string = 'arrow_left';

    // AS3: .../src/com/sulake/habbo/ui/widget/contextmenu/ButtonMenuView.as::ICON_ARROW_RIGHT
    protected static readonly ICON_ARROW_RIGHT: string = 'arrow_right';

    // TS-only: the three below have no AS3 constant — the original writes these values as literals
    // at the call site, and this port names them rather than repeating the numbers.
    private static readonly BUTTON_COLOR_MODERATE_HOVER: number = 4288230144;

    private static readonly LABEL_COLOR_ENABLED: number = 16777215;

    private static readonly LABEL_COLOR_DISABLED: number = 5789011;

    protected _buttons: IItemListWindow | null = null;

    /**
     * Shows or hides one grid of icon buttons, and repaints every cell's icon.
     *
     * The icon's *asset name is its window name* — AS3 passes `icon.name` straight back into
     * `setImageAsset()`. That is what makes the sign grid work: thirteen cells, each named after
     * the sign it shows, all filled from one loop.
     */
    // AS3: ButtonMenuView.as::showButtonGrid()
    protected showButtonGrid(name: string, visible: boolean = true): void
    {
        if(!this._buttons) return;

        const grid = this._buttons.getListItemByName(name) as unknown as IItemGridWindow | null;

        if(!grid) return;

        (grid as unknown as IWindow).visible = visible;

        for(let i = 0; i < grid.numGridItems; i++)
        {
            const cell = grid.getGridItemAt(i) as unknown as IWindowContainer | null;
            const icon = cell?.findChildByTag('icon') ?? null;

            if(icon !== null) this.setImageAsset(icon, icon.name, true);
        }
    }

    // AS3: ButtonMenuView.as::showButton()
    protected showButton(
        name: string,
        visible: boolean = true,
        enabled: boolean = true,
        vipIcon: boolean = false,
        ducketIcon: boolean = false
    ): void
    {
        if(!this._buttons) return;

        const row = this._buttons.getListItemByName(name) as IWindowContainer | null;

        if(!row) return;

        row.visible = visible;

        const button = row.getChildByName('button') as IWindowContainer | null;

        if(!button) return;

        const effectiveEnabled = enabled || vipIcon;

        if(effectiveEnabled) button.enable();
        else button.disable();

        const label = button.getChildByName('label') as ITextWindow | null;

        if(label)
        {
            label.textColor = effectiveEnabled && !vipIcon ? ButtonMenuView.LABEL_COLOR_ENABLED : ButtonMenuView.LABEL_COLOR_DISABLED;
        }

        const icon = button.getChildByName('icon');

        if(icon)
        {
            icon.color = effectiveEnabled ? ButtonMenuView.ICON_COLOR_ENABLED : ButtonMenuView.ICON_COLOR_DISABLED;

            if(label)
            {
                if(icon.tags.indexOf(ButtonMenuView.ICON_ARROW_LEFT) !== -1)
                {
                    icon.x = label.x + (label.width - label.textWidth) / 2 - icon.width - ButtonMenuView.ICON_MARGIN;
                }

                if(icon.tags.indexOf(ButtonMenuView.ICON_ARROW_RIGHT) !== -1)
                {
                    icon.x = label.x + (label.width + label.textWidth) / 2 + ButtonMenuView.ICON_MARGIN;
                }
            }

            icon.visible = vipIcon || ducketIcon;
        }

        if(vipIcon)
        {
            const vip = button.getChildByName(ButtonMenuView.ICON_VIP);

            if(vip) vip.visible = vipIcon;
        }

        if(ducketIcon)
        {
            const ducket = button.getChildByName(ButtonMenuView.ICON_DUCKET);

            if(ducket) ducket.visible = ducketIcon;
        }
    }

    // AS3: ButtonMenuView.as::buttonEventProc() — hover coloring for buttons/links.
    protected buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        this.applyButtonHover(event, window);
    };

    // Hover coloring, callable via `this` from subclasses (buttonEventProc is an
    // arrow field, so it cannot be reached through `super`).
    protected applyButtonHover(event: WindowEvent, window: IWindow): void
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        const isOver = event.type === 'WME_OVER';
        const isOut = event.type === 'WME_OUT';

        if(!isOver && !isOut) return;

        if(window.name === 'button')
        {
            window.color = isOver
                ? (window.tags.indexOf('moderate') > -1 ? ButtonMenuView.BUTTON_COLOR_MODERATE_HOVER : ButtonMenuView.BUTTON_COLOR_HOVER)
                : ButtonMenuView.BUTTON_COLOR_DEFAULT;
        }
        else if(window.tags.indexOf('link') > -1)
        {
            const text = (window as IWindowContainer).getChildAt(0) as ITextWindow | null;

            if(text)
            {
                if(window.tags.indexOf('actions') > -1)
                {
                    text.textColor = isOver ? ButtonMenuView.LINK_COLOR_ACTIONS_HOVER : ButtonMenuView.LINK_COLOR_ACTIONS_DEFAULT;
                }
                else if(window.tags.indexOf('moderate') > -1)
                {
                    text.textColor = isOver ? ButtonMenuView.LINK_COLOR_MODERATE_HOVER : ButtonMenuView.LINK_COLOR_MODERATE_DEFAULT;
                }
            }
        }

        if(window.name === 'profile_link')
        {
            const nameText = (window as IWindowContainer).findChildByName('name') as ITextWindow | null;

            if(nameText) nameText.textColor = isOver ? ButtonMenuView.LINK_COLOR_ACTIONS_HOVER : ButtonMenuView.LINK_COLOR_ACTIONS_DEFAULT;
        }
    };

    // AS3: ButtonMenuView.as::dispose()
    public override dispose(): void
    {
        this._buttons = null;
        super.dispose();
    }
}
