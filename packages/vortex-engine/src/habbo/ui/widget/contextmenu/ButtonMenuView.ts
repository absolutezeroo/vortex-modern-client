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
import {ContextInfoView} from './ContextInfoView';

// AS3 button/link/icon colors (uint constants from ContextInfoView/ButtonMenuView).
const BUTTON_COLOR_DEFAULT: number = 4281149991;
const BUTTON_COLOR_HOVER: number = 4282950861;
const BUTTON_COLOR_MODERATE_HOVER: number = 4288230144;
const LABEL_COLOR_ENABLED: number = 16777215;
const LABEL_COLOR_DISABLED: number = 5789011;
const ICON_COLOR_ENABLED: number = 13947341;
const ICON_COLOR_DISABLED: number = 5789011;
const LINK_COLOR_ACTIONS_DEFAULT: number = 16777215;
const LINK_COLOR_ACTIONS_HOVER: number = 9552639;
const LINK_COLOR_MODERATE_DEFAULT: number = 16744755;
const LINK_COLOR_MODERATE_HOVER: number = 16756591;

export class ButtonMenuView extends ContextInfoView
{
    protected _buttons: IItemListWindow | null = null;

    // AS3: ButtonMenuView.as::showButtonGrid()
    // AS3 adaptation: only toggles the grid's visibility; the per-cell icon
    // bitmaps ship in the own_avatar_menu layout already.
    // TODO(AS3): re-derive each sign icon via setImageAsset(cell.icon).
    protected showButtonGrid(name: string, visible: boolean = true): void
    {
        if(!this._buttons) return;

        const grid = this._buttons.getListItemByName(name);

        if(grid) grid.visible = visible;
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
            label.textColor = effectiveEnabled && !vipIcon ? LABEL_COLOR_ENABLED : LABEL_COLOR_DISABLED;
        }

        const icon = button.getChildByName('icon');

        if(icon)
        {
            icon.color = effectiveEnabled ? ICON_COLOR_ENABLED : ICON_COLOR_DISABLED;

            if(label)
            {
                if(icon.tags.indexOf('arrow_left') !== -1)
                {
                    icon.x = label.x + (label.width - label.textWidth) / 2 - icon.width - 8;
                }

                if(icon.tags.indexOf('arrow_right') !== -1)
                {
                    icon.x = label.x + (label.width + label.textWidth) / 2 + 8;
                }
            }

            icon.visible = vipIcon || ducketIcon;
        }

        if(vipIcon)
        {
            const vip = button.getChildByName('icon_vip');

            if(vip) vip.visible = vipIcon;
        }

        if(ducketIcon)
        {
            const ducket = button.getChildByName('icon_ducket');

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
                ? (window.tags.indexOf('moderate') > -1 ? BUTTON_COLOR_MODERATE_HOVER : BUTTON_COLOR_HOVER)
                : BUTTON_COLOR_DEFAULT;
        }
        else if(window.tags.indexOf('link') > -1)
        {
            const text = (window as IWindowContainer).getChildAt(0) as ITextWindow | null;

            if(text)
            {
                if(window.tags.indexOf('actions') > -1)
                {
                    text.textColor = isOver ? LINK_COLOR_ACTIONS_HOVER : LINK_COLOR_ACTIONS_DEFAULT;
                }
                else if(window.tags.indexOf('moderate') > -1)
                {
                    text.textColor = isOver ? LINK_COLOR_MODERATE_HOVER : LINK_COLOR_MODERATE_DEFAULT;
                }
            }
        }

        if(window.name === 'profile_link')
        {
            const nameText = (window as IWindowContainer).findChildByName('name') as ITextWindow | null;

            if(nameText) nameText.textColor = isOver ? LINK_COLOR_ACTIONS_HOVER : LINK_COLOR_ACTIONS_DEFAULT;
        }
    };

    // AS3: ButtonMenuView.as::dispose()
    public override dispose(): void
    {
        this._buttons = null;
        super.dispose();
    }
}
