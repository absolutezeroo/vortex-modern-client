import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';

import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconProgressBarView} from './HabbiconProgressBarView';

/**
 * One row of the left-hand set rail: the collection's title, its progress bar, and an icon taken
 * from its *first habbicon* — not from the collection icon sheet, which the set page uses instead.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconSetRailRowView.as
 */
export class HabbiconSetRailRowView implements IDisposable
{
    // AS3: HabbiconSetRailRowView.as::BACKGROUND_IDLE
    private static readonly BACKGROUND_IDLE: number = 16313302;

    // AS3: HabbiconSetRailRowView.as::BACKGROUND_HOVER
    private static readonly BACKGROUND_HOVER: number = 16773830;

    // AS3: HabbiconSetRailRowView.as::BACKGROUND_ACTIVE
    private static readonly BACKGROUND_ACTIVE: number = 15781766;

    // AS3: HabbiconSetRailRowView.as::BORDER_IDLE
    private static readonly BORDER_IDLE: number = 15920341;

    // AS3: HabbiconSetRailRowView.as::BORDER_ACTIVE
    private static readonly BORDER_ACTIVE: number = 16777215;

    // AS3: HabbiconSetRailRowView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconSetRailRowView.as::_SafeStr_4833 (name derived: the set this row is for)
    private _set: HabbiconSetModel | null = null;

    // AS3: HabbiconSetRailRowView.as::_progressView
    private _progressView: HabbiconProgressBarView | null;

    // AS3: HabbiconSetRailRowView.as::_SafeStr_7074 (name derived: the selection callback)
    private _onSelected: ((set: HabbiconSetModel) => void) | null;

    // AS3: HabbiconSetRailRowView.as::_active
    private _active: boolean = false;

    // AS3: HabbiconSetRailRowView.as::_SafeStr_5943 (name derived: the pointer is over the row)
    private _hover: boolean = false;

    // AS3: HabbiconSetRailRowView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconSetRailRowView.as::HabbiconSetRailRowView()
    constructor(template: IWindowContainer, onSelected: ((set: HabbiconSetModel) => void) | null)
    {
        this._window = template.clone() as IWindowContainer;
        this._onSelected = onSelected;
        this._progressView = new HabbiconProgressBarView(this.setRowProgressBar);

        this._window.addEventListener('WME_CLICK', this.onClicked);
        this._window.addEventListener('WME_OVER', this.onOver);
        this._window.addEventListener('WME_OUT', this.onOut);
    }

    // AS3: HabbiconSetRailRowView.as::initialize()
    initialize(set: HabbiconSetModel): void
    {
        this._set = set;

        if(this._window !== null) (this._window as unknown as IWindow).visible = true;

        const title = this.setRowTitle;

        if(title !== null) title.text = set.title;

        this.updateIcon();
        this.refreshProgress(false);

        this._active = false;
        this._hover = false;

        this.updateLook();
    }

    // AS3: HabbiconSetRailRowView.as::setActive()
    setActive(active: boolean): void
    {
        this._active = active;
        this.updateLook();
    }

    // AS3: HabbiconSetRailRowView.as::refreshProgress()
    refreshProgress(animate: boolean): void
    {
        if(this._set === null) return;

        this._progressView?.setRatio(this._set.progressRatio, animate);

        const text = this.setRowProgressText;

        if(text !== null) text.text = `${this._set.completed} / ${this._set.total}`;
    }

    // AS3: HabbiconSetRailRowView.as::update()
    update(delta: number): void
    {
        this._progressView?.update(delta);
    }

    // AS3: HabbiconSetRailRowView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconSetRailRowView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: HabbiconSetRailRowView.as::get _SafeStr_8409() (name derived: the set this row is for)
    get set(): HabbiconSetModel | null
    {
        return this._set;
    }

    /**
	 * The icon is the *first* habbicon's preview, so a set whose artwork has not loaded yet simply
	 * hides the slot rather than leaving the previous set's icon in it.
	 */
    // AS3: HabbiconSetRailRowView.as::updateIcon()
    private updateIcon(): void
    {
        const target = this.setIcon;

        if(target === null) return;

        this.clearIcon();

        let preview: ImageBitmap | null = null;

        if(this._set !== null && this._set.habbicons.length > 0)
        {
            preview = HabbiconAssetManager.getPreviewBitmap(this._set.habbicons[0].habbiconId, false);
        }

        if(preview !== null)
        {
            target.disposesBitmap = true;
            target.bitmap = preview;
            (target as unknown as IWindow).visible = true;
            (target as unknown as IWindow).invalidate();
        }
        else
        {
            (target as unknown as IWindow).visible = false;
        }
    }

    /**
	 * The bitmap handed over is the manager's cached preview, not a clone: `createImageBitmap` is
	 * async and the AS3 clone cannot be reproduced synchronously. `disposesBitmap` is still set as
	 * AS3 sets it, so a window that does dispose its bitmap behaves the same — but this port's
	 * bitmap wrapper only drops the reference.
	 */
    // AS3: HabbiconSetRailRowView.as::clearIcon()
    private clearIcon(): void
    {
        const target = this.setIcon;

        if(target === null || target.bitmap === null) return;

        target.bitmap = null;
        (target as unknown as IWindow).invalidate();
    }

    // AS3: HabbiconSetRailRowView.as::updateLook()
    private updateLook(): void
    {
        const background = this._active
            ? HabbiconSetRailRowView.BACKGROUND_ACTIVE
            : (this._hover ? HabbiconSetRailRowView.BACKGROUND_HOVER : HabbiconSetRailRowView.BACKGROUND_IDLE);
        const border = this._active || this._hover
            ? HabbiconSetRailRowView.BORDER_ACTIVE
            : HabbiconSetRailRowView.BORDER_IDLE;

        const backgroundWindow = this.setRowBackground;

        if(backgroundWindow !== null) backgroundWindow.color = 0xFF000000 | background;

        if(this._window !== null) (this._window as unknown as IWindow).color = 0xFF000000 | border;
    }

    // AS3: HabbiconSetRailRowView.as::onClicked()
    private onClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onSelected !== null && this._set !== null) this._onSelected(this._set);
    };

    // AS3: HabbiconSetRailRowView.as::onOver()
    private onOver = (_event: WindowMouseEvent): void =>
    {
        this._hover = true;
        this.updateLook();
    };

    // AS3: HabbiconSetRailRowView.as::onOut()
    private onOut = (_event: WindowMouseEvent): void =>
    {
        this._hover = false;
        this.updateLook();
    };

    // AS3: HabbiconSetRailRowView.as::get setRowTitle()
    private get setRowTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('set_row_title') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconSetRailRowView.as::get setRowProgressBar()
    private get setRowProgressBar(): IWindowContainer | null
    {
        return (this._window?.findChildByName('set_row_progress_bar') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconSetRailRowView.as::get setRowProgressText()
    private get setRowProgressText(): ITextWindow | null
    {
        return (this._window?.findChildByName('set_row_progress_text') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconSetRailRowView.as::get setRowBackground()
    private get setRowBackground(): IWindow | null
    {
        return this._window?.findChildByName('set_row_background') ?? null;
    }

    // AS3: HabbiconSetRailRowView.as::get setIcon()
    private get setIcon(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('set_icon') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: HabbiconSetRailRowView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        const parent = (this._window as unknown as IWindow | null)?.parent ?? null;

        if(parent !== null && this._window !== null)
        {
            (parent as unknown as IWindowContainer).removeChild(this._window as unknown as IWindow);
        }

        this._window?.removeEventListener('WME_CLICK', this.onClicked);
        this._window?.removeEventListener('WME_OVER', this.onOver);
        this._window?.removeEventListener('WME_OUT', this.onOut);

        this.clearIcon();

        if(this._progressView !== null)
        {
            this._progressView.dispose();
            this._progressView = null;
        }

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._set = null;
        this._onSelected = null;
        this._disposed = true;
    }
}
