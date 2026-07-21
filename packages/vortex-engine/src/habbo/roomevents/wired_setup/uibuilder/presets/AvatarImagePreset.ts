import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * AvatarImagePreset — hosts the avatar-image widget (found by name in the layout) and exposes its
 * figure string.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/AvatarImagePreset.as
 */
export class AvatarImagePreset extends WiredUIPreset
{
    // AS3: AvatarImagePreset.as::_container
    private _container: IWindowContainer;

    // AS3: AvatarImagePreset.as::_avatarWidget
    private _avatarWidget: IAvatarImageWidget | null = null;

    // AS3: AvatarImagePreset.as::AvatarImagePreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('avatar_image_view') as unknown as IWindowContainer;

        const host = this._container.findChildByName('avatar_image') as unknown as IWidgetWindow | null;

        if(host != null)
        {
            this._avatarWidget = host.widget as IAvatarImageWidget;
        }
    }

    // AS3: AvatarImagePreset.as::set figure()
    set figure(value: string)
    {
        if(this._avatarWidget != null)
        {
            this._avatarWidget.figure = value;
        }
    }

    // AS3: AvatarImagePreset.as::get figure()
    get figure(): string
    {
        return this._avatarWidget?.figure ?? (null as unknown as string);
    }

    // AS3: AvatarImagePreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: AvatarImagePreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: AvatarImagePreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: AvatarImagePreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._avatarWidget = null;
    }
}
