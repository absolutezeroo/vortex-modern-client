import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

/**
 * The single "I'm done decorating" button that floats over your own avatar while the room is in
 * decorate mode.
 *
 * It is the odd one out among the context views, and deliberately so:
 *
 * - **it never detaches.** `activeView`'s setter is overridden to *only assign*, dropping the
 *   base's reparenting; `show()` and `hide()` then flip `visible` on that same window. So the view
 *   is built once when decorate mode starts and toggled thereafter, where every sibling is torn
 *   down and rebuilt.
 * - **it sets itself up in its own constructor**, taking the user id, name and room index as
 *   arguments — there is no static `setup()` to call afterwards.
 * - `maximumBlend` is 0.8, so it stays slightly translucent even at rest.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/DecorateModeView.as
 */
export class DecorateModeView extends AvatarContextInfoButtonView
{
    // AS3: DecorateModeView.as::DecorateModeView()
    constructor(widget: AvatarInfoWidget, userId: number, userName: string, roomIndex: number)
    {
        super(widget);

        this._autoHideEnabled = false;

        AvatarContextInfoButtonView.setupButtonView(this, userId, userName, roomIndex, 1);
    }

    // AS3: DecorateModeView.as::get widget()
    private get widget(): AvatarInfoWidget
    {
        return this._widget as AvatarInfoWidget;
    }

    // AS3: DecorateModeView.as::get maximumBlend()
    public override get maximumBlend(): number
    {
        return 0.8;
    }

    /**
     * AS3: DecorateModeView.as::set activeView()
     *
     * Assignment only — the base's version reparents the previous view away, and this one must not,
     * because `show()`/`hide()` reuse the same window rather than rebuilding it.
     */
    // AS3: DecorateModeView.as::set activeView()
    protected override set activeView(value: IWindowContainer | null)
    {
        if(!value) return;

        this._activeView = value;
    }

    protected override get activeView(): IWindowContainer | null
    {
        return this._activeView;
    }

    // AS3: DecorateModeView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        if(!this._window)
        {
            this._window = this.widget.windowManager?.buildWidgetLayout('own_avatar_decorating') as IWindowContainer | null ?? null;

            if(!this._window) return;

            this._window.procedure = this.eventProc;

            this._buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

            if(this._buttons) this._buttons.procedure = this.eventProc;

            this.updateButtons();
        }

        this.activeView = this._window;
    }

    // AS3: DecorateModeView.as::show()
    public override show(): void
    {
        if(this._activeView === null) return;

        this._activeView.visible = true;
        this._activeView.activate();
    }

    // AS3: DecorateModeView.as::hide()
    public override hide(_fade: boolean): void
    {
        if(this._activeView !== null) this._activeView.visible = false;

        this._mouseOver = false;
    }

    // AS3: DecorateModeView.as::isVisible()
    public isVisible(): boolean
    {
        return this._activeView !== null && this._activeView.visible;
    }

    // AS3: DecorateModeView.as::updateButtons()
    public updateButtons(): void
    {
        this.showButton('decorate');
    }

    /**
     * The one button leaves decorate mode. Hover is forwarded to the base *and* recorded, because
     * the base's position logic skips its update while the pointer is over the view.
     */
    // AS3: DecorateModeView.as::eventProc()
    private eventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'button' && window.parent?.name === 'decorate')
            {
                this.widget.isUserDecorating = false;
            }

            return;
        }

        this.buttonEventProc(event, window);

        if(event.type === 'WME_OVER') this._mouseOver = true;
        else if(event.type === 'WME_OUT') this._mouseOver = false;
    };
}
