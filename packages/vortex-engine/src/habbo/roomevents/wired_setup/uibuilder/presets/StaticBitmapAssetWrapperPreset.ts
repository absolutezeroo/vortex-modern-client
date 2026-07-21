import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * StaticBitmapAssetWrapperPreset — a fixed-width preset displaying a bitmap loaded by asset URI
 * through the static bitmap view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/StaticBitmapAssetWrapperPreset.as
 */
export class StaticBitmapAssetWrapperPreset extends WiredUIPreset
{
    // AS3: StaticBitmapAssetWrapperPreset.as::_container
    private _container: IStaticBitmapWrapperWindow;

    // AS3: StaticBitmapAssetWrapperPreset.as::StaticBitmapAssetWrapperPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, assetUri: string)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('static_bitmap_view') as unknown as IStaticBitmapWrapperWindow;
        this._container.assetUri = assetUri;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::get assetUri()
    get assetUri(): string
    {
        return this._container.assetUri;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::set assetUri()
    set assetUri(value: string)
    {
        this._container.assetUri = value;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: StaticBitmapAssetWrapperPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IStaticBitmapWrapperWindow;
    }
}
