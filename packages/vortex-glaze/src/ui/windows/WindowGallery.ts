import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {TYPE_NAME_TO_CODE} from '@core/window/enum/WindowType';
import {type EditorState} from '../../state/EditorState';

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IFinder { findChildByName(n: string): IWindow | null; }
interface IListLike { addListItem(item: IWindow): IWindow; destroyListItems(): void; }

const GALLERY_LAYER = 3;
const MAX_IMAGES = 120;
const BITMAP_TYPES = new Set([TYPE_NAME_TO_CODE.static_bitmap, TYPE_NAME_TO_CODE.bitmap]);

/**
 * WindowGallery — Glaze's Image Gallery, listing every bundled image.
 *
 * A popup frame (layer 3) with a scrollable list of the registered image assets
 * (thumbnail + name). Clicking one assigns it to the selected node's `assetUri`
 * when that node is a bitmap, otherwise sets it as the canvas background image.
 */
export class WindowGallery
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private _frame: IWindow | null = null;

    public constructor(state: EditorState)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
    }

    public toggle(): void
    {
        if(this._frame && !this._frame.disposed)
        {
            this.close();

            return;
        }

        this.open();
    }

    private open(): void
    {
        const frame = this._wm.buildWidgetLayout('glaze_gallery_xml', GALLERY_LAYER);

        if(!frame) return;

        if(!frame.parent)
        {
            const desktop = this._wm.getDesktop(GALLERY_LAYER);

            if(desktop) (desktop as unknown as IContainerLike).addChild(frame);
        }

        (frame as unknown as WindowController).center();
        (frame as unknown as WindowController).procedure = (event: WindowEvent): void =>
        {
            if(event.type === 'WE_CLOSE' || event.type === 'WE_CLOSED')
            {
                this.close();
            }
        };

        this._frame = frame;
        this._state.modalOpen = true;

        const list = (frame as unknown as IFinder).findChildByName('glaze_gallery_list');

        if(list) this.populate(list as unknown as IListLike);
    }

    private populate(list: IListLike): void
    {
        const bundle = this._state.runtime.imageBundle;
        const names = bundle.listKeys('images/')
            .map((k) => k.split('/').pop()!.replace(/\.png$/, ''))
            .sort()
            .slice(0, MAX_IMAGES);

        for(const name of names)
        {
            const row = this._wm.buildWidgetLayout('glaze_gallery_row_xml');

            if(!row) continue;

            const finder = row as unknown as IFinder;
            const img = finder.findChildByName('glaze_grow_img');
            const label = finder.findChildByName('glaze_grow_label');

            if(img) (img as unknown as { assetUri: string }).assetUri = name;
            if(label) (label as unknown as { text: string }).text = name;

            (row as unknown as WindowController).procedure = (event: WindowEvent): void =>
            {
                if(event.type === WindowMouseEvent.CLICK) this.pick(name);
            };

            list.addListItem(row);
        }
    }

    private pick(name: string): void
    {
        const sel = this._state.selected as unknown as (WindowController & { assetUri?: string }) | null;

        if(sel && !sel.disposed && BITMAP_TYPES.has(sel.type))
        {
            (sel as unknown as { assetUri: string }).assetUri = name;
            this._state.notifyTreeChanged();
        }
        else
        {
            const url = this._state.runtime.imageBundle.getUrl(`images/${name}.png`);

            if(url)
            {
                const img = new Image();

                img.onload = (): void => { this._state.canvasBg.image = img; };
                img.src = url;
            }
        }

        this.close();
    }

    private close(): void
    {
        this._frame?.destroy();
        this._frame = null;
        this._state.modalOpen = false;
    }

    public dispose(): void
    {
        this.close();
    }
}
