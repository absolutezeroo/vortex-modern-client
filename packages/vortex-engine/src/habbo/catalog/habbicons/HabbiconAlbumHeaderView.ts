import type {IDisposable} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconAlbumStats} from './HabbiconAlbumStats';
import {HabbiconProgressBarView} from './HabbiconProgressBarView';

/**
 * The strip across the top of the hub: overall progress, how many habbicons are owned, how many sets
 * are complete.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconAlbumHeaderView.as
 */
export class HabbiconAlbumHeaderView implements IDisposable
{
    // AS3: HabbiconAlbumHeaderView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconAlbumHeaderView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconAlbumHeaderView.as::_progressView
    private _progressView: HabbiconProgressBarView | null;

    // AS3: HabbiconAlbumHeaderView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconAlbumHeaderView.as::HabbiconAlbumHeaderView()
    constructor(controller: HabbiconController, window: IWindowContainer | null)
    {
        this._controller = controller;
        this._window = window;
        this._progressView = new HabbiconProgressBarView(this.albumProgressBar);
    }

    // AS3: HabbiconAlbumHeaderView.as::refresh()
    refresh(stats: HabbiconAlbumStats, animate: boolean): void
    {
        this._progressView?.setRatio(stats.progressRatio, animate);

        const progressText = this.albumProgressText;

        if(progressText !== null)
        {
            progressText.text = this._controller?.localizationManager?.getLocalizationWithParams(
                'habbicon_book.album_progress.count',
                '',
                'collected', String(stats.collected),
                'total', String(stats.total)
            ) ?? '';
        }

        const owned = this.ownedHabbiconsValue;
        const completed = this.setsCompletedValue;

        if(owned !== null) owned.text = String(stats.ownedHabbicons);
        if(completed !== null) completed.text = String(stats.completedSets);
    }

    // AS3: HabbiconAlbumHeaderView.as::update()
    update(delta: number): void
    {
        this._progressView?.update(delta);
    }

    // AS3: HabbiconAlbumHeaderView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconAlbumHeaderView.as::get albumProgressBar()
    private get albumProgressBar(): IWindowContainer | null
    {
        return (this._window?.findChildByName('album_progress_bar') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconAlbumHeaderView.as::get albumProgressText()
    private get albumProgressText(): ITextWindow | null
    {
        return (this._window?.findChildByName('album_progress_text') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconAlbumHeaderView.as::get ownedHabbiconsValue()
    private get ownedHabbiconsValue(): ITextWindow | null
    {
        return (this._window?.findChildByName('owned_habbicons_value') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconAlbumHeaderView.as::get setsCompletedValue()
    private get setsCompletedValue(): ITextWindow | null
    {
        return (this._window?.findChildByName('sets_completed_value') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconAlbumHeaderView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._progressView !== null)
        {
            this._progressView.dispose();
            this._progressView = null;
        }

        this._controller = null;
        this._window = null;
        this._disposed = true;
    }
}
