import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {MeMenuSoundSettingsView} from './MeMenuSoundSettingsView';
import {Logger} from '@core/utils/Logger';
import {MeMenuSoundSettingsSlider} from './MeMenuSoundSettingsSlider';

const log = Logger.getLogger('habbo.ui.widget.memenu.soundsettings.MeMenuSoundSettingsItem');

/**
 * One row of the sound page: a mute button, a full-volume button and the slider between them.
 *
 * The two end buttons are shortcuts, not toggles — they set 0 and 1 outright. Their icons are
 * swapped between a coloured and a white version to show both hover and the current state, which
 * is why the hover-out handler has to consult the volume before restoring anything.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/soundsettings/MeMenuSoundSettingsItem.as
 */
export class MeMenuSoundSettingsItem implements IDisposable
{
    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::TYPE_UI_VOLUME
    public static readonly TYPE_UI_VOLUME: number = 0;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::TYPE_FURNI_VOLUME
    public static readonly TYPE_FURNI_VOLUME: number = 1;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::TYPE_TRAX_VOLUME
    public static readonly TYPE_TRAX_VOLUME: number = 2;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::UNCHANGED
    // Name DERIVED: the −1 AS3 passes for the two volumes this row does not own.
    private static readonly UNCHANGED: number = -1;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::_type
    // Name DERIVED (`_SafeStr_4778`): which of the three volumes this row edits.
    private _type: number;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::_volume
    // Left **undefined** by AS3 until the first save or `setValue()`, which is why the icons start
    // in the "not muted" state whatever the real volume is. Initialised to 0 here, the same value
    // an unassigned AS3 Number would coerce to in the `== 0` test that reads it first.
    private _volume: number = 0;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::_window
    private _window: IWindowContainer | null;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::_slider
    // Name DERIVED (`_SafeStr_5849`).
    private _slider: MeMenuSoundSettingsSlider | null = null;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::_view
    // Name DERIVED (`_SafeStr_5091`): nulling this is what marks the item disposed.
    private _view: MeMenuSoundSettingsView | null;

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::MeMenuSoundSettingsItem()
    constructor(view: MeMenuSoundSettingsView, type: number, window: IWindowContainer | null)
    {
        this._type = type;
        this._view = view;
        this._window = window;

        this._slider = new MeMenuSoundSettingsSlider(
            this,
            (this._window?.findChildByName('volume_container') as IWindowContainer | null) ?? null,
            view.widget?.assets ?? null,
            0,
            1
        );

        for(const name of ['sounds_off', 'sounds_on'])
        {
            const button = this._window?.findChildByName(name) ?? null;

            if(button === null) continue;

            button.addEventListener('WME_CLICK', this.onButtonClicked);
            button.addEventListener('WME_OVER', this.onButtonOver);
            button.addEventListener('WME_OUT', this.onButtonOut);
        }

        this.updateSoundIcons();
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::get disposed()
    // Derived from `_view`, not from a flag — and `dispose()` never nulls it, so an item can be
    // disposed twice. AS3's, kept.
    public get disposed(): boolean
    {
        return this._view === null;
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::setValue()
    public setValue(value: number): void
    {
        this._slider?.setValue(value);
        this.updateSoundIcons();
    }

    /**
     * Forwards to the view with −1 in the two slots this row does not own, which is the view's
     * signal to keep its current value there. `store` false means preview.
     */
    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::saveVolume()
    public saveVolume(volume: number, store: boolean): void
    {
        this._volume = volume;

        const unchanged = MeMenuSoundSettingsItem.UNCHANGED;

        switch(this._type)
        {
            case MeMenuSoundSettingsItem.TYPE_UI_VOLUME:
                this._view?.saveVolume(volume, unchanged, unchanged, store);
                break;

            case MeMenuSoundSettingsItem.TYPE_FURNI_VOLUME:
                this._view?.saveVolume(unchanged, volume, unchanged, store);
                break;

            case MeMenuSoundSettingsItem.TYPE_TRAX_VOLUME:
                this._view?.saveVolume(unchanged, unchanged, volume, store);
                break;
        }

        this.updateSoundIcons();
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::dispose()
    // Guarded on `disposed`, which reads `_view` — and `_view` is never nulled here, so the guard
    // never fires. AS3's, kept.
    public dispose(): void
    {
        if(this.disposed) return;

        if(this._slider !== null)
        {
            this._slider.dispose();
            this._slider = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::updateSoundIcons()
    // Muted lights the *off* icon and greys the on icon; any other volume does the reverse. There
    // is no third state — a half volume looks the same as full.
    private updateSoundIcons(): void
    {
        const view = this._view;

        if(view === null) return;

        if(this._volume === 0)
        {
            this.setBitmapWrapperContent('sounds_on_icon', view.soundsOnIconWhite);
            this.setBitmapWrapperContent('sounds_off_icon', view.soundsOffIconColor);

            return;
        }

        this.setBitmapWrapperContent('sounds_on_icon', view.soundsOnIconColor);
        this.setBitmapWrapperContent('sounds_off_icon', view.soundsOffIconWhite);
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::onButtonOver()
    // The two `*_icon` cases are unreachable — the icons are not the windows the listeners were
    // attached to. AS3's, kept.
    private onButtonOver = (event: {target?: unknown}): void =>
    {
        const view = this._view;
        const name = (event.target as IWindow | null)?.name ?? '';

        if(view === null) return;

        switch(name)
        {
            case 'sounds_off_icon':
            case 'sounds_off':
                this.setBitmapWrapperContent('sounds_off_icon', view.soundsOffIconColor);
                break;

            case 'sounds_on_icon':
            case 'sounds_on':
                this.setBitmapWrapperContent('sounds_on_icon', view.soundsOnIconColor);
                break;
        }
    };

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::onButtonOut()
    // Restores the white icon only if that end is *not* the current value — hovering off the mute
    // button while muted leaves it lit.
    private onButtonOut = (event: {target?: unknown}): void =>
    {
        const view = this._view;
        const name = (event.target as IWindow | null)?.name ?? '';

        if(view === null) return;

        switch(name)
        {
            case 'sounds_off':
                if(this._volume !== 0) this.setBitmapWrapperContent('sounds_off_icon', view.soundsOffIconWhite);
                break;

            case 'sounds_on':
                if(this._volume !== 1) this.setBitmapWrapperContent('sounds_on_icon', view.soundsOnIconWhite);
                break;
        }
    };

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::onButtonClicked()
    // Both ends preview rather than store, like a drag — the commit happens on dispose.
    private onButtonClicked = (event: {target?: unknown}): void =>
    {
        const name = (event.target as IWindow | null)?.name ?? '';

        switch(name)
        {
            case 'sounds_off':
                this.saveVolume(0, false);
                break;

            case 'sounds_on':
                this.saveVolume(1, false);
                break;

            default:
                log.debug(`Me Menu Settings, Sound settings item: unknown button: ${name}`);
        }
    };

    // AS3: .../soundsettings/MeMenuSoundSettingsItem.as::setBitmapWrapperContent()
    // AS3 clones the BitmapData because the window takes ownership and disposes it; this port's
    // bitmap windows do not, so the shared ImageBitmap is handed over directly.
    private setBitmapWrapperContent(name: string, bitmap: ImageBitmap | null): void
    {
        const wrapper = this._window?.findChildByName(name) as IBitmapWrapperWindow | null;

        if(wrapper === null || wrapper === undefined || bitmap === null) return;

        wrapper.bitmap = bitmap;
    }
}
