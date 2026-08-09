import type {MeMenuSoundSettingsView} from './MeMenuSoundSettingsView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.toolbar.memenu.soundsettings.MeMenuSoundSettingsItem');

/**
 * Sound settings item for the me menu (UI, furni, or trax volume)
 *
 * In AS3 this creates a slider and on/off buttons for a single sound category,
 * delegates volume saving to MeMenuSoundSettingsView. Nearly identical to
 * SoundSettingsItem but references MeMenuSoundSettingsView instead.
 * In Vortex, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as
 */
export class MeMenuSoundSettingsItem
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::TYPE_UI_VOLUME
    public static readonly TYPE_UI_VOLUME: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::TYPE_FURNI_VOLUME
    public static readonly TYPE_FURNI_VOLUME: number = 1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::TYPE_TRAX_VOLUME
    public static readonly TYPE_TRAX_VOLUME: number = 2;
    private _parentView: MeMenuSoundSettingsView | null;

    constructor(parentView: MeMenuSoundSettingsView, type: number)
    {
        this._type = type;
        this._parentView = parentView;

        log.debug(`MeMenuSoundSettingsItem constructed: type=${type}`);
    }

    private _type: number;

    /**
	 * The sound type (UI, furni, or trax)
	 */
    get type(): number
    {
        return this._type;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::_volume
    private _volume: number = 0;

    /**
	 * The current volume value (0-1)
	 */
    get volume(): number
    {
        return this._volume;
    }

    /**
	 * Whether the item is disposed
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::get disposed()
    get disposed(): boolean
    {
        return this._parentView == null;
    }

    /**
	 * Save a volume value
	 *
	 * @param value Volume value (0-1)
	 * @param preview If true, only preview the volume (don't persist)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::saveVolume()
    public saveVolume(value: number, preview: boolean): void
    {
        this._volume = value;

        if(!this._parentView) return;

        switch(this._type)
        {
            case MeMenuSoundSettingsItem.TYPE_UI_VOLUME:
                this._parentView.saveVolume(value, -1, -1, !preview);
                break;
            case MeMenuSoundSettingsItem.TYPE_FURNI_VOLUME:
                this._parentView.saveVolume(-1, value, -1, !preview);
                break;
            case MeMenuSoundSettingsItem.TYPE_TRAX_VOLUME:
                this._parentView.saveVolume(-1, -1, value, !preview);
                break;
        }

        this._parentView.updateSettings();
    }

    /**
	 * Set the volume value externally (e.g. from settings sync)
	 *
	 * @param value Volume value (0-1)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::setValue()
    public setValue(value: number): void
    {
        this._volume = value;
    }

    /**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::onButtonClicked()
    public onButtonClicked(buttonName: string): void
    {
        switch(buttonName)
        {
            case 'sounds_off':
                this.saveVolume(0, false);
                break;
            case 'sounds_on':
                this.saveVolume(1, false);
                break;
            default:
                log.warn(`Me Menu Settings, Sound settings item: unknown button: ${buttonName}`);
        }
    }

    /**
	 * Dispose of this item
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as::dispose()
    public dispose(): void
    {
        if(this.disposed) return;

        this._parentView = null;
    }
}
