import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {type EditorState} from '../../state/EditorState';
import {downloadLayout, importLayoutXml, saveLayout} from '../../ops/LayoutSerializer';
import {distributeChildren} from '../../ops/StructuralOps';
import {toggleLocalisation} from '../../ops/LocaliseOps';
import type {WindowGallery} from './WindowGallery';

const log = Logger.getLogger('GlazeToolbar');

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IFinder { findChildByName(n: string): IWindow | null; }
interface IDropWidget { populate(items: unknown[]): void; selection: number; addEventListener(type: string, cb: () => void): void; }
interface IInputWidget { text: string; addEventListener(type: string, cb: () => void): void; }

/** Cap the layout dropdown so populating doesn't build hundreds of item windows. */
const DROPDOWN_LIMIT = 200;

/**
 * WindowToolbar — the top action bar, built from Habbo button widgets.
 *
 * Buttons are Illumina `button` widgets laid out left-to-right inside the toolbar
 * container; a `dropmenu` selects a registered layout to edit. Actions with a
 * concrete behavior are wired (Open/Import, Reload, Save, Save As/Export, Save
 * Screenshot); the rest log a notice until their subsystem lands.
 */
export class WindowToolbar
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _bar: IWindow;
    private _x = 92;
    private _x2 = 12;
    private _fileInput: HTMLInputElement | null = null;
    private readonly _gallery: WindowGallery | null;

    public constructor(state: EditorState, bar: IWindow, gallery: WindowGallery | null)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._bar = bar;
        this._gallery = gallery;

        this.build();
    }

    private build(): void
    {
        this.layoutDropdown();
        this.button('Open', () => this.importFile());
        this.button('Reload', () => this.reload());
        this.button('Save', () => void this.save());
        this.button('Save As', () => downloadLayout(this._state));
        this.button('Import', () => this.importFile());
        this.button('Export', () => downloadLayout(this._state));
        this.button('Refresh Assets', () => this.reload());
        this.button('Localise', () => void toggleLocalisation(this._state));
        this.button('Save Screenshot', () => this.saveScreenshot());
        this.button('Generate Screenshots', () => this.saveScreenshot());
        this.button('Batch Theme Convert', () => log.info('Batch Theme Convert — batch over the whole asset set, not implemented'));
        this.button('Background', () => this.toggleBackground());
        this.button('Canvas Back Color', () => this.cycleBackColor());
        this.button('Load Image', () => this.loadImage());
        this.button('Image Gallery', () => this._gallery?.toggle());

        this.buildRow2();
    }

    private toggleBackground(): void
    {
        const bg = this._state.canvasBg;

        bg.image = null;
        bg.mode = bg.mode === 'checker' ? 'solid' : 'checker';
    }

    private cycleBackColor(): void
    {
        const palette = [0xffe7e7f4, 0xffffffff, 0xffcfd2e0, 0xff33333f, 0xff2b6b78];
        const bg = this._state.canvasBg;
        const i = palette.indexOf(bg.color >>> 0);

        bg.image = null;
        bg.mode = 'solid';
        bg.color = palette[(i + 1) % palette.length];
    }

    private loadImage(): void
    {
        const input = document.createElement('input');

        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (): void =>
        {
            const file = input.files?.[0];

            if(!file) return;

            const url = URL.createObjectURL(file);
            const img = new Image();

            img.onload = (): void => { this._state.canvasBg.image = img; };
            img.src = url;
        };
        input.click();
    }

    private buildRow2(): void
    {
        this.label('Snap', this._x2, 48, 34);
        this._x2 += 38;
        this.snapInput();
        this.button2('Align L', () => this._state.alignSelected('left'));
        this.button2('Align R', () => this._state.alignSelected('right'));
        this.button2('Align T', () => this._state.alignSelected('top'));
        this.button2('Align B', () => this._state.alignSelected('bottom'));
        this.button2('Center H', () => this._state.alignSelected('hcenter'));
        this.button2('Center V', () => this._state.alignSelected('vmiddle'));
        this.button2('Distribute V', () => distributeChildren(this._state, 'v'));
        this.button2('Distribute H', () => distributeChildren(this._state, 'h'));
    }

    private label(text: string, x: number, y: number, width: number): void
    {
        const lbl = this._wm.buildWidgetLayout('glaze_label_xml');

        if(!lbl) return;

        // The layout root IS the text element.
        (lbl as unknown as { text: string }).text = text;
        (this._bar as unknown as IContainerLike).addChild(lbl);
        (lbl as unknown as WindowController).rectangle = {x, y, width, height: 16};
    }

    private snapInput(): void
    {
        const box = this._wm.buildWidgetLayout('glaze_smallinput_xml');

        if(!box) return;

        const input = (box as unknown as IFinder).findChildByName('glaze_siinput') as unknown as IInputWidget | null;

        (this._bar as unknown as IContainerLike).addChild(box);
        (box as unknown as WindowController).rectangle = {x: this._x2, y: 45, width: 54, height: 22};
        this._x2 += 62;

        if(input)
        {
            input.text = String(this._state.snap);
            input.addEventListener('WE_CHANGE', () => { this._state.snap = Number(input.text) || 0; });
        }
    }

    private button2(caption: string, onClick: () => void): void
    {
        const btn = this._wm.buildWidgetLayout('glaze_button_xml');

        if(!btn) return;

        const bc = btn as unknown as WindowController;
        const width = Math.max(44, caption.length * 7 + 18);

        bc.caption = caption;
        (this._bar as unknown as IContainerLike).addChild(btn);
        bc.rectangle = {x: this._x2, y: 44, width, height: 26};
        bc.procedure = (event: WindowEvent): void =>
        {
            if(event.type === WindowMouseEvent.CLICK) onClick();
        };

        this._x2 += width + 5;
    }

    private layoutDropdown(): void
    {
        const dd = this._wm.buildWidgetLayout('glaze_dropdown_xml');

        if(!dd)
        {
            return;
        }

        (this._bar as unknown as IContainerLike).addChild(dd);
        (dd as unknown as WindowController).rectangle = {x: this._x, y: 9, width: 210, height: 24};
        this._x += 216;

        const drop = dd as unknown as IDropWidget;
        const names = this._state.getLayoutNames().slice(0, DROPDOWN_LIMIT);

        drop.populate(names);
        drop.addEventListener('WE_SELECTED', () =>
        {
            const name = names[drop.selection];

            if(name)
            {
                this._state.openLayout(name);
            }
        });
    }

    private button(caption: string, onClick: () => void): void
    {
        const btn = this._wm.buildWidgetLayout('glaze_button_xml');

        if(!btn)
        {
            return;
        }

        const bc = btn as unknown as WindowController;
        const width = Math.max(44, caption.length * 7 + 20);

        bc.caption = caption;
        (this._bar as unknown as IContainerLike).addChild(btn);
        bc.rectangle = {x: this._x, y: 9, width, height: 26};
        bc.procedure = (event: WindowEvent): void =>
        {
            if(event.type === WindowMouseEvent.CLICK)
            {
                onClick();
            }
        };

        this._x += width + 5;
    }

    private reload(): void
    {
        const name = this._state.currentLayoutName;

        if(name)
        {
            this._state.openLayout(name);
        }
    }

    private async save(): Promise<void>
    {
        const result = await saveLayout(this._state);

        log.info(`Save: ${result.message}`);
    }

    private saveScreenshot(): void
    {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;

        if(!canvas)
        {
            return;
        }

        const a = document.createElement('a');

        a.href = canvas.toDataURL('image/png');
        a.download = `${this._state.currentLayoutName ?? 'glaze'}.png`;
        a.click();
    }

    private importFile(): void
    {
        if(!this._fileInput)
        {
            this._fileInput = document.createElement('input');
            this._fileInput.type = 'file';
            this._fileInput.accept = '.xml';
            this._fileInput.style.display = 'none';
            document.body.appendChild(this._fileInput);
        }

        const input = this._fileInput;

        input.value = '';
        input.onchange = (): void =>
        {
            const file = input.files?.[0];

            if(!file)
            {
                return;
            }

            const reader = new FileReader();

            reader.onload = (): void =>
            {
                const xml = String(reader.result ?? '');
                const name = `imported_${file.name.replace(/\.xml$/i, '').replace(/[^A-Za-z0-9_]/g, '_')}`;

                if(!importLayoutXml(this._state, xml, name))
                {
                    log.warn('Import failed');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    public dispose(): void
    {
        this._fileInput?.remove();
        this._fileInput = null;
    }
}
