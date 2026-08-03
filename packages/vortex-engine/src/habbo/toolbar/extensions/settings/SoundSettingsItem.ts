import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {
    IStaticBitmapWrapperWindow
} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import {MeMenuSoundSettingsSlider} from '@habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsSlider';
import type {SoundSettingsView} from './SoundSettingsView';

const log = Logger.getLogger('habbo.toolbar.extensions.settings.SoundSettingsItem');

/**
 * SoundSettingsItem
 *
 * One volume row: a slider plus mute and full-volume shortcuts, wired to whichever of the
 * three channels this row was built for. It holds no volume of its own beyond the last
 * value it wrote — the view owns the numbers and the sound manager owns the truth.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/settings/SoundSettingsItem.as
 */
export class SoundSettingsItem
{
    // AS3: .../SoundSettingsItem.as::TYPE_UI_VOLUME
    public static readonly TYPE_UI_VOLUME: number = 0;

    // AS3: .../SoundSettingsItem.as::TYPE_FURNI_VOLUME
    public static readonly TYPE_FURNI_VOLUME: number = 1;

    // AS3: .../SoundSettingsItem.as::TYPE_TRAX_VOLUME
    public static readonly TYPE_TRAX_VOLUME: number = 2;

    // AS3: .../SoundSettingsItem.as::_SafeStr_4778
    private _type: number;

    /**
     * AS3 declares this with no initializer, so it starts NaN — and `setValue()` never
     * writes it, only `saveVolume()` does. The icons therefore read "on" until the player
     * first touches the row, whatever the stored volume is. `0` here would mute them all
     * on open instead, so the NaN is deliberate.
     */
    // AS3: .../SoundSettingsItem.as::_volume
    private _volume: number = Number.NaN;

    // AS3: .../SoundSettingsItem.as::_window
    private _window: IWindowContainer | null;

    // AS3: .../SoundSettingsItem.as::_SafeStr_5849
    private _slider: MeMenuSoundSettingsSlider | null = null;

    // AS3: .../SoundSettingsItem.as::_SafeStr_5091
    private _view: SoundSettingsView | null;

    // AS3: .../SoundSettingsItem.as::SoundSettingsItem()
    constructor(view: SoundSettingsView, type: number, window: IWindowContainer | null)
    {
        this._type = type;
        this._view = view;
        this._window = window;

        this._slider = new MeMenuSoundSettingsSlider(
            this,
            (window?.findChildByName('volume_container') ?? null) as IWindowContainer | null,
            view.toolbar?.assets ?? null,
            0,
            1
        );

        window?.findChildByName('sounds_off')?.addEventListener('WME_CLICK', this.onButtonClicked);
        window?.findChildByName('sounds_on')?.addEventListener('WME_CLICK', this.onButtonClicked);

        this.updateSoundIcons();
    }

    // AS3: .../SoundSettingsItem.as::get disposed()
    get disposed(): boolean
    {
        return this._view === null;
    }

    /**
     * `save` false previews the volume without storing it — that is what a slider drag
     * sends, so the player hears the change while moving without every intermediate
     * position being written back.
     */
    // AS3: .../SoundSettingsItem.as::saveVolume()
    saveVolume(volume: number, save: boolean): void
    {
        this._volume = volume;

        switch(this._type)
        {
            case SoundSettingsItem.TYPE_UI_VOLUME:
                this._view?.saveVolume(volume, -1, -1, save);
                break;
            case SoundSettingsItem.TYPE_FURNI_VOLUME:
                this._view?.saveVolume(-1, volume, -1, save);
                break;
            case SoundSettingsItem.TYPE_TRAX_VOLUME:
                this._view?.saveVolume(-1, -1, volume, save);
                break;
        }

        this.updateSoundIcons();
        this._view?.updateSettings();
    }

    /** Muted lights the crossed-out icon; anything above zero lights the other one. */
    // AS3: .../SoundSettingsItem.as::updateSoundIcons()
    private updateSoundIcons(): void
    {
        if(this._volume === 0)
        {
            this.setBitmap('sounds_on_icon', 'sounds_on_white');
            this.setBitmap('sounds_off_icon', 'sounds_off_color');
        }
        else
        {
            this.setBitmap('sounds_on_icon', 'sounds_on_color');
            this.setBitmap('sounds_off_icon', 'sounds_off_white');
        }
    }

    // AS3: .../SoundSettingsItem.as::onButtonClicked()
    private onButtonClicked = (event: WindowEvent): void =>
    {
        const name = (event.target as unknown as IWindow | null)?.name ?? '';

        switch(name)
        {
            case 'sounds_off':
                this.saveVolume(0, false);
                break;
            case 'sounds_on':
                this.saveVolume(1, false);
                break;
            default:
                log.warn(`Me Menu Settings, Sound settings item: unknown button: ${name}`);
        }
    };

    // AS3: .../SoundSettingsItem.as::setBitmap()
    private setBitmap(name: string, asset: string): void
    {
        const bitmap = this._window?.findChildByName(name) as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap !== null && bitmap !== undefined) bitmap.assetUri = `toolbar_memenu_settings_${asset}`;
    }

    // AS3: .../SoundSettingsItem.as::setValue()
    setValue(value: number): void
    {
        this._slider?.setValue(value);
        this.updateSoundIcons();
    }

    /**
     * AS3 never clears `_SafeStr_5091`, so `disposed` stays false and a second call runs
     * the body again — harmless, since both members are nulled. Kept as written.
     */
    // AS3: .../SoundSettingsItem.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        if(this._slider)
        {
            this._slider.dispose();
            this._slider = null;
        }

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
