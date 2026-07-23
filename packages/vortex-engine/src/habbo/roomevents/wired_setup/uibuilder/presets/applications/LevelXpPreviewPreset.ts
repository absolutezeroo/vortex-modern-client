import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {Util} from '@habbo/roomevents/Util';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import {HtmlTextParam} from '../../params/HtmlTextParam';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {HtmlPreset} from '../HtmlPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * LevelXpPreviewPreset — a live list of "level N → X xp" rows for VariableLevelUp: one HTML row per
 * preview level, refreshed from the currently-configured curve via setPreviewXps(). Rows report
 * "Unreachable level" past the max level and "Out of bounds" beyond the safe integer range.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/LevelXpPreviewPreset.as
 */
export class LevelXpPreviewPreset extends WiredUIPreset
{
    // AS3: LevelXpPreviewPreset.as::_SafeStr_10345 (name derived: the out-of-bounds XP threshold)
    private static readonly OUT_OF_BOUNDS: number = 9223372036854776000;

    // AS3: LevelXpPreviewPreset.as::_SafeStr_4836 (name derived: the rows list view)
    private _listView: SimpleListViewPreset;

    // AS3: LevelXpPreviewPreset.as::_SafeStr_4565 (name derived: the container window)
    private _container: IWindowContainer;

    // AS3: LevelXpPreviewPreset.as::_previewLevels
    private _previewLevels: number[];

    // AS3: LevelXpPreviewPreset.as::_SafeStr_7210 (name derived: the per-row HTML presets)
    private _htmlPresets: HtmlPreset[];

    // AS3: LevelXpPreviewPreset.as::LevelXpPreviewPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, previewLevels: number[])
    {
        super(roomEvents, presetManager, wiredStyle);

        this._previewLevels = previewLevels;
        this._htmlPresets = [];
        const listItems: HtmlPreset[] = [];
        const htmlParam = new HtmlTextParam(0);

        for(const level of this._previewLevels)
        {
            const html = presetManager.createHtml(this.getText(level, '0'), htmlParam);
            this._htmlPresets.push(html);
            listItems.push(html);
        }

        this._listView = presetManager.createSimpleListView(true, listItems);
        this._listView.spacing = 1;
        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._container.addChild(this._listView.window);
    }

    // AS3: LevelXpPreviewPreset.as::getText()
    private getText(level: number, xp: string): string
    {
        return this._roomEvents.localization.getLocalizationWithParams('wiredfurni.params.levelup.preview.entry', '', 'lvl', '<font color="' + this.yellowColorHex + '">' + level + '</font>', 'xp', '<font color="' + this.yellowColorHex + '">' + xp + '</font>');
    }

    // AS3: LevelXpPreviewPreset.as::get yellowColorHex()
    private get yellowColorHex(): string
    {
        return Util.uintToHexColor(this._wiredStyle.yellowTextColor);
    }

    // AS3: LevelXpPreviewPreset.as::setPreviewXps()
    setPreviewXps(xps: number[]): void
    {
        for(let i = 0; i < this._previewLevels.length; i++)
        {
            const level = this._previewLevels[i];
            let text = 'Unreachable level';

            if(i < xps.length)
            {
                const xp = xps[i];

                if(xp > LevelXpPreviewPreset.OUT_OF_BOUNDS)
                {
                    text = 'Out of bounds';
                }
                else
                {
                    text = Math.round(xps[i]).toString();
                }
            }

            this._htmlPresets[i].text = this.getText(level, text);
        }
    }

    // AS3: LevelXpPreviewPreset.as::get previewLevels()
    get previewLevels(): number[]
    {
        return this._previewLevels;
    }

    // AS3: LevelXpPreviewPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: LevelXpPreviewPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this._listView.resizeToWidth(width);
        this._container.height = this._listView.window.height;
    }

    // AS3: LevelXpPreviewPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._listView];
    }

    // AS3: LevelXpPreviewPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._listView = null as unknown as SimpleListViewPreset;
        this._previewLevels = null as unknown as number[];
        this._htmlPresets = null as unknown as HtmlPreset[];
    }
}
