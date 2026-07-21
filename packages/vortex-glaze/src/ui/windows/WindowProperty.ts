import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {TYPE_CODE_TO_NAME} from '@core/window/enum/WindowType';
import {WindowParam} from '@core/window/enum/WindowParam';
import {EditorEvents, type EditorState} from '../../state/EditorState';
import {GLAZE_THEMES} from '../../ops/ThemeOps';

interface IListLike { addListItem(item: IWindow): IWindow; destroyListItems(): void; }
interface IFinder { findChildByName(n: string): IWindow | null; }
interface IInputWidget { text: string; addEventListener(type: string, cb: () => void): void; }
interface ICheckWidget { isSelected: boolean; addEventListener(type: string, cb: () => void): void; }
interface IDropWidget { populate(items: unknown[]): void; selection: number; addEventListener(type: string, cb: () => void): void; }
interface IThemeManagerLike
{
    getStyle(themeName: string, elementType: number, intent: string): number;
    getThemeAndIntent(elementType: number, style: number): { theme: string; intent: string };
}

interface ISelectOption { label: string; value: number; }

const MIN_LIMIT = -2147483648;
const MAX_LIMIT = 2147483647;

/**
 * WindowProperty — the "Property Editor", rendered as Habbo widget rows.
 *
 * For the selected node it builds label+widget rows (Illumina `input`, `checkbox`,
 * `dropmenu`) inside the frame's itemlist, each bound to a `WindowController`
 * setter. Because every setter invalidates, edits redraw the edited window live.
 * Rebuilds on selection; geometry inputs refresh in place on `GEOMETRY_CHANGED`.
 */
export class WindowProperty
{
    private readonly _state: EditorState;
    private readonly _list: IListLike;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private _liveInputs: Array<{ input: IInputWidget; read: () => string }> = [];
    private _rebuildScheduled = false;

    public constructor(state: EditorState, list: IWindow)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._list = list as unknown as IListLike;

        state.events.on(EditorEvents.SELECTION_CHANGED, this._scheduleRebuild);
        state.events.on(EditorEvents.LAYOUT_CHANGED, this._scheduleRebuild);
        state.events.on(EditorEvents.GEOMETRY_CHANGED, this._onGeometry);

        this._rebuild();
    }

    /** Coalesces rebuilds into a microtask (a widget must not be disposed while
     *  still processing its own event). */
    private readonly _scheduleRebuild = (): void =>
    {
        if(this._rebuildScheduled)
        {
            return;
        }

        this._rebuildScheduled = true;
        queueMicrotask(() =>
        {
            this._rebuildScheduled = false;
            this._rebuild();
        });
    };

    private readonly _rebuild = (): void =>
    {
        this._list.destroyListItems();
        this._liveInputs = [];

        const win = this._state.selected as unknown as WindowController | null;

        if(!win || win.disposed)
        {
            return;
        }

        this.buildCommon(win);
        this.buildFlags(win);
    };

    private readonly _onGeometry = (): void =>
    {
        for(const {input, read} of this._liveInputs)
        {
            input.text = read();
        }
    };

    private buildCommon(win: WindowController): void
    {
        this.group('Common Properties');
        this.inputRow('type', '', () => `${TYPE_CODE_TO_NAME[win.type] ?? 'null'} (${win.type})`, null);
        this.inputRow('name', 'string', () => win.name, (v) => { win.name = v; });
        this.inputRow('caption', 'string', () => win.caption, (v) => { win.caption = v; });
        this.inputRow('tags', 'string', () => win.tags.join(', '), (v) =>
        {
            win.tags = v.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
        });
        this.inputRow('id', 'uint', () => String(win.id), (v) => { const n = Number(v); if(!Number.isNaN(n)) win.id = n; });

        const tm = this.themeManager();

        if(tm)
        {
            const {theme, intent} = tm.getThemeAndIntent(win.type, win.style);

            this.optionDropRow('theme', GLAZE_THEMES, theme, (name) =>
            {
                const cur = tm.getThemeAndIntent(win.type, win.style);

                win.style = tm.getStyle(name, win.type, cur.intent);
            });
            this.inputRow('intent', 'string', () => intent, null);
        }

        this.inputRow('style', 'uint', () => String(win.style), (v) => { const n = Number(v); if(!Number.isNaN(n)) win.style = n; });
        this.inputRow('dynamicStyle', 'string', () => win.dynamicStyle, (v) => { win.dynamicStyle = v; });
        this.inputRow('color', 'uint', () => `0x${(win.color >>> 0).toString(16).padStart(8, '0')}`, (v) =>
        {
            const c = parseInt(v.replace(/^0x/i, ''), 16);

            if(!Number.isNaN(c)) win.color = c >>> 0;
        });
        this.inputRow('blend', 'number', () => String(win.blend), (v) => { const n = Number(v); if(!Number.isNaN(n)) win.blend = n; });
        this.checkRow('background', () => win.background, (b) => { win.background = b; });
        this.checkRow('clipping', () => win.clipping, (b) => { win.clipping = b; });
        this.checkRow('visible', () => win.visible, (b) => { win.visible = b; });

        this.group('Geometry');
        this.inputRow('x', 'int', () => String(win.x), (v) => this.setNum(v, (n) => { win.x = n; }), true);
        this.inputRow('y', 'int', () => String(win.y), (v) => this.setNum(v, (n) => { win.y = n; }), true);
        this.inputRow('width', 'int', () => String(win.width), (v) => this.setNum(v, (n) => { win.width = n; }), true);
        this.inputRow('height', 'int', () => String(win.height), (v) => this.setNum(v, (n) => { win.height = n; }), true);
        this.inputRow('width min', 'int', () => this.fmtLimit(win.limits.minWidth, MIN_LIMIT), (v) => this.setLimit(v, MIN_LIMIT, (n) => { win.limits.minWidth = n; }));
        this.inputRow('width max', 'int', () => this.fmtLimit(win.limits.maxWidth, MAX_LIMIT), (v) => this.setLimit(v, MAX_LIMIT, (n) => { win.limits.maxWidth = n; }));
        this.inputRow('height min', 'int', () => this.fmtLimit(win.limits.minHeight, MIN_LIMIT), (v) => this.setLimit(v, MIN_LIMIT, (n) => { win.limits.minHeight = n; }));
        this.inputRow('height max', 'int', () => this.fmtLimit(win.limits.maxHeight, MAX_LIMIT), (v) => this.setLimit(v, MAX_LIMIT, (n) => { win.limits.maxHeight = n; }));
        this.inputRow('threshold', 'uint', () => String(win.mouseThreshold), (v) => this.setNum(v, (n) => { win.mouseThreshold = n; }));
    }

    private themeManager(): IThemeManagerLike | null
    {
        const wm = this._wm as unknown as { getThemeManager?: () => IThemeManagerLike };

        return wm.getThemeManager ? wm.getThemeManager() : null;
    }

    private optionDropRow(label: string, options: string[], current: string, onSelect: (value: string) => void): void
    {
        const row = this._wm.buildWidgetLayout('glaze_prop_drop_xml');

        if(!row) return;

        const finder = row as unknown as IFinder;
        const labelEl = finder.findChildByName('glaze_drow_label');
        const drop = finder.findChildByName('glaze_drow_drop') as unknown as IDropWidget | null;

        if(labelEl) (labelEl as unknown as { text: string }).text = label;

        if(drop)
        {
            drop.populate(options);

            const idx = options.indexOf(current);

            drop.selection = idx >= 0 ? idx : 0;
            drop.addEventListener('WE_SELECTED', () =>
            {
                const value = options[drop.selection];

                if(value)
                {
                    this._state.pushHistory();
                    onSelect(value);
                    this._state.notifyTreeChanged();
                }
            });
        }

        this._list.addListItem(row);
    }

    private buildFlags(win: WindowController): void
    {
        this.group('Flags');
        this.dropRow(win, 'horizontal scaling', WindowParam.RELATIVE_HORIZONTAL_SCALE_MASK, [
            {label: 'fixed', value: WindowParam.RELATIVE_HORIZONTAL_SCALE_FIXED},
            {label: 'move', value: WindowParam.RELATIVE_HORIZONTAL_SCALE_MOVE},
            {label: 'stretch', value: WindowParam.RELATIVE_HORIZONTAL_SCALE_STRETCH},
            {label: 'center', value: WindowParam.RELATIVE_HORIZONTAL_SCALE_CENTER}
        ]);
        this.dropRow(win, 'vertical scaling', WindowParam.RELATIVE_VERTICAL_SCALE_MASK, [
            {label: 'fixed', value: WindowParam.RELATIVE_VERTICAL_SCALE_FIXED},
            {label: 'move', value: WindowParam.RELATIVE_VERTICAL_SCALE_MOVE},
            {label: 'stretch', value: WindowParam.RELATIVE_VERTICAL_SCALE_STRETCH},
            {label: 'center', value: WindowParam.RELATIVE_VERTICAL_SCALE_CENTER}
        ]);
        this.dropRow(win, 'horizontal align', 0xC0000, [
            {label: 'left', value: WindowParam.ON_RESIZE_ALIGN_LEFT},
            {label: 'right', value: WindowParam.ON_RESIZE_ALIGN_RIGHT},
            {label: 'center', value: WindowParam.ON_RESIZE_ALIGN_CENTER}
        ]);
        this.dropRow(win, 'vertical align', 0x300000, [
            {label: 'top', value: WindowParam.ON_RESIZE_ALIGN_TOP},
            {label: 'bottom', value: WindowParam.ON_RESIZE_ALIGN_BOTTOM},
            {label: 'middle', value: WindowParam.ON_RESIZE_ALIGN_MIDDLE}
        ]);
        this.flagRow(win, 'input event processor', WindowParam.INPUT_EVENT_PROCESSOR);
        this.flagRow(win, 'use parent graphic context', WindowParam.USE_PARENT_GRAPHIC_CONTEXT);
        this.flagRow(win, 'bound to parent rect', WindowParam.BOUND_TO_PARENT_RECT);
        this.flagRow(win, 'expand to accommodate children', WindowParam.EXPAND_TO_ACCOMMODATE_CHILDREN);
        this.flagRow(win, 'mouse dragging target', WindowParam.MOUSE_DRAGGING_TARGET);
        this.flagRow(win, 'mouse scaling target', WindowParam.MOUSE_SCALING_TARGET);
        this.flagRow(win, 'force clipping', WindowParam.FORCE_CLIPPING);
        this.flagRow(win, 'inherit caption', WindowParam.INHERIT_CAPTION);
    }

    // ---- Row builders ------------------------------------------------------

    private group(title: string): void
    {
        const row = this._wm.buildWidgetLayout('glaze_prop_group_xml');
        const label = row ? (row as unknown as IFinder).findChildByName('glaze_group_label') : null;

        if(label) (label as unknown as { text: string }).text = title;
        if(row) this._list.addListItem(row);
    }

    private inputRow(label: string, type: string, read: () => string, write: ((v: string) => void) | null, live: boolean = false): void
    {
        const row = this._wm.buildWidgetLayout('glaze_prop_input_xml');

        if(!row) return;

        const finder = row as unknown as IFinder;
        const labelEl = finder.findChildByName('glaze_prow_label');
        const typeEl = finder.findChildByName('glaze_prow_type');
        const input = finder.findChildByName('glaze_prow_input') as unknown as IInputWidget | null;

        if(labelEl) (labelEl as unknown as { text: string }).text = label;
        if(typeEl) (typeEl as unknown as { text: string }).text = type;

        if(input)
        {
            input.text = read();

            if(write)
            {
                input.addEventListener('WE_CHANGE', () =>
                {
                    // Coalesce per-field so typing several chars = one undo step.
                    this._state.pushHistory(`prop:${label}`);
                    write(input.text);
                    this._state.notifyTreeChanged();
                });
            }

            if(live)
            {
                this._liveInputs.push({input, read});
            }
        }

        this._list.addListItem(row);
    }

    private checkRow(label: string, read: () => boolean, write: (b: boolean) => void): void
    {
        const row = this._wm.buildWidgetLayout('glaze_prop_check_xml');

        if(!row) return;

        const finder = row as unknown as IFinder;
        const labelEl = finder.findChildByName('glaze_crow_label');
        const check = finder.findChildByName('glaze_crow_check') as unknown as ICheckWidget | null;

        if(labelEl) (labelEl as unknown as { text: string }).text = label;

        if(check)
        {
            check.isSelected = read();
            check.addEventListener('WE_SELECTED', () => { this._state.pushHistory(); write(true); this._state.notifyTreeChanged(); });
            check.addEventListener('WE_UNSELECTED', () => { this._state.pushHistory(); write(false); this._state.notifyTreeChanged(); });
        }

        this._list.addListItem(row);
    }

    private flagRow(win: WindowController, label: string, flag: number): void
    {
        this.checkRow(label, () => win.testParamFlag(flag), (b) => { win.setParamFlag(flag, b); });
    }

    private dropRow(win: WindowController, label: string, mask: number, options: ISelectOption[]): void
    {
        const row = this._wm.buildWidgetLayout('glaze_prop_drop_xml');

        if(!row) return;

        const finder = row as unknown as IFinder;
        const labelEl = finder.findChildByName('glaze_drow_label');
        const drop = finder.findChildByName('glaze_drow_drop') as unknown as IDropWidget | null;

        if(labelEl) (labelEl as unknown as { text: string }).text = label;

        if(drop)
        {
            drop.populate(options.map((o) => o.label));

            const current = win.param & mask;
            const idx = options.findIndex((o) => o.value === current);

            drop.selection = idx >= 0 ? idx : 0;
            drop.addEventListener('WE_SELECTED', () =>
            {
                const value = options[drop.selection]?.value ?? 0;

                this._state.pushHistory();
                win.setParamFlag(mask, false);

                if(value !== 0) win.setParamFlag(value, true);

                this._state.notifyTreeChanged();
            });
        }

        this._list.addListItem(row);
    }

    private setNum(v: string, apply: (n: number) => void): void
    {
        const n = Number(v);

        if(!Number.isNaN(n)) apply(n);
    }

    private setLimit(v: string, sentinel: number, apply: (n: number) => void): void
    {
        const raw = v.trim();

        if(raw === '') { apply(sentinel); return; }

        const n = Number(raw);

        if(!Number.isNaN(n)) apply(n);
    }

    private fmtLimit(value: number, sentinel: number): string
    {
        return value === sentinel ? '' : String(value);
    }

    public dispose(): void
    {
        this._state.events.off(EditorEvents.SELECTION_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.LAYOUT_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.GEOMETRY_CHANGED, this._onGeometry);
        this._list.destroyListItems();
    }
}
