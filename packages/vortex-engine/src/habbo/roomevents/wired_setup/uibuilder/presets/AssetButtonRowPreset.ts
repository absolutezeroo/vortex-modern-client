import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {AssetButtonParam} from '../params/AssetButtonParam';
import {WiredUIPreset} from './WiredUIPreset';
import {VerticalSplitterPreset} from './VerticalSplitterPreset';
import type {AssetButtonPreset} from './AssetButtonPreset';
import type {SimpleListViewPreset} from './SimpleListViewPreset';

/**
 * AssetButtonRowPreset — a horizontal row of asset buttons (some right-aligned), optionally separated
 * by vertical splitters, laid out by a SimpleListView inside a growing container.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/AssetButtonRowPreset.as
 */
export class AssetButtonRowPreset extends WiredUIPreset
{
    // AS3: AssetButtonRowPreset.as::_container
    private _container: IWindowContainer;

    // AS3: AssetButtonRowPreset.as::_list
    private _list: SimpleListViewPreset;

    // AS3: AssetButtonRowPreset.as::_buttons
    private _buttons: AssetButtonPreset[];

    // AS3: AssetButtonRowPreset.as::_items
    private _items: WiredUIPreset[];

    // AS3: AssetButtonRowPreset.as::AssetButtonRowPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, params: AssetButtonParam[])
    {
        super(roomEvents, presetManager, wiredStyle);

        this._buttons = [];
        this._items = [];

        for(const param of params)
        {
            const button = presetManager.createAssetButtonPreset(param.assetName, param.tooltip, param.onClick);

            this._buttons.push(button);

            if(param.alignRight)
            {
                this._items.push(button.alignRight());
            }
            else
            {
                this._items.push(button);
            }

            if(param.isFollowedBySplitter)
            {
                const height = button.window.height;

                if(height === 0)
                {
                    throw new Error('AssetButtonRowPreset requires button height to resolve splitter height');
                }

                this._items.push(new VerticalSplitterPreset(roomEvents, presetManager, wiredStyle, height));
            }
        }

        this._list = presetManager.createSimpleListView(false, this._items);
        this._list.spacing = wiredStyle.genericHorizontalSpacing;
        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._container.addChild(this._list.window);
    }

    // AS3: AssetButtonRowPreset.as::get buttons()
    get buttons(): AssetButtonPreset[]
    {
        return this._buttons;
    }

    // AS3: AssetButtonRowPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: AssetButtonRowPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._list.resizeToWidth(width);
        this._container.width = this._list.window.width;
        this._container.height = this._list.window.height;
    }

    // AS3: AssetButtonRowPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._list];
    }

    // AS3: AssetButtonRowPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._list = null as unknown as SimpleListViewPreset;
        this._buttons = null as unknown as AssetButtonPreset[];
        this._items = null as unknown as WiredUIPreset[];
    }
}
