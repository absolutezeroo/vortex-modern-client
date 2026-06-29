import type {HabboToolbar} from '../../HabboToolbar';
import {SoundSettingsItem} from './SoundSettingsItem';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SoundSettingsView');

/**
 * Sound settings panel view
 *
 * In AS3 this creates a window with three sound setting items (UI, furni, trax),
 * manages volume state and syncs with the sound manager. In Helium, UI rendering
 * is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/settings/SoundSettingsView.as
 */
export class SoundSettingsView
{
	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		this._uiVolumeItem = new SoundSettingsItem(this, SoundSettingsItem.TYPE_UI_VOLUME);
		this._furniVolumeItem = new SoundSettingsItem(this, SoundSettingsItem.TYPE_FURNI_VOLUME);
		this._traxVolumeItem = new SoundSettingsItem(this, SoundSettingsItem.TYPE_TRAX_VOLUME);

		this.updateSettings();

		log.debug('SoundSettingsView constructed');
	}

	private _toolbar: HabboToolbar | null;

	/**
	 * The toolbar reference
	 */
	get toolbar(): HabboToolbar | null
	{
		return this._toolbar;
	}

	private _uiVolumeItem: SoundSettingsItem | null = null;

	/**
	 * The UI volume item
	 */
	get uiVolumeItem(): SoundSettingsItem | null
	{
		return this._uiVolumeItem;
	}

	private _furniVolumeItem: SoundSettingsItem | null = null;

	/**
	 * The furni volume item
	 */
	get furniVolumeItem(): SoundSettingsItem | null
	{
		return this._furniVolumeItem;
	}

	private _traxVolumeItem: SoundSettingsItem | null = null;

	/**
	 * The trax volume item
	 */
	get traxVolumeItem(): SoundSettingsItem | null
	{
		return this._traxVolumeItem;
	}

	private _genericVolume: number = 1;

	/**
	 * The current generic (UI) volume
	 */
	get genericVolume(): number
	{
		return this._genericVolume;
	}

	private _furniVolume: number = 1;

	/**
	 * The current furni volume
	 */
	get furniVolume(): number
	{
		return this._furniVolume;
	}

	private _traxVolume: number = 1;

	/**
	 * The current trax volume
	 */
	get traxVolume(): number
	{
		return this._traxVolume;
	}

	/**
	 * Update settings from the sound manager
	 */
	public updateSettings(): void
	{
		// In AS3: reads from toolbar.soundManager
		// In Helium, these would be synced from the sound manager
		if (this._uiVolumeItem)
		{
			this._uiVolumeItem.setValue(this._genericVolume);
		}

		if (this._furniVolumeItem)
		{
			this._furniVolumeItem.setValue(this._furniVolume);
		}

		if (this._traxVolumeItem)
		{
			this._traxVolumeItem.setValue(this._traxVolume);
		}
	}

	/**
	 * Save volume values
	 *
	 * @param genericVolume UI volume (-1 to keep current)
	 * @param furniVolume Furni volume (-1 to keep current)
	 * @param traxVolume Trax volume (-1 to keep current)
	 * @param persist If true, persist the volume. If false, just preview.
	 */
	public saveVolume(genericVolume: number, furniVolume: number, traxVolume: number, persist: boolean = true): void
	{
		const effectiveFurni = furniVolume !== -1 ? furniVolume : this._furniVolume;
		const effectiveGeneric = genericVolume !== -1 ? genericVolume : this._genericVolume;
		const effectiveTrax = traxVolume !== -1 ? traxVolume : this._traxVolume;

		if (persist)
		{
			if (!this._toolbar) return;

			this._genericVolume = effectiveGeneric;
			this._furniVolume = effectiveFurni;
			this._traxVolume = effectiveTrax;

			// In AS3: toolbar.soundManager.furniVolume = effectiveFurni
			// In AS3: toolbar.soundManager.genericVolume = effectiveGeneric
			// In AS3: toolbar.soundManager.traxVolume = effectiveTrax
		}
		else
		{
			// In AS3: toolbar.soundManager.previewVolume(effectiveGeneric, effectiveFurni, effectiveTrax)
		}
	}

	/**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
	public onButtonClicked(buttonName: string): void
	{
		if (buttonName === 'back_btn')
		{
			this.dispose();
		}
		else
		{
			log.warn(`Me Menu Settings View: unknown button: ${buttonName}`);
		}
	}

	/**
	 * Dispose of this view
	 */
	public dispose(): void
	{
		this.saveVolume(this._genericVolume, this._furniVolume, this._traxVolume);

		if (this._uiVolumeItem)
		{
			this._uiVolumeItem.dispose();
			this._uiVolumeItem = null;
		}

		if (this._furniVolumeItem)
		{
			this._furniVolumeItem.dispose();
			this._furniVolumeItem = null;
		}

		if (this._traxVolumeItem)
		{
			this._traxVolumeItem.dispose();
			this._traxVolumeItem = null;
		}

		this._toolbar = null;
	}
}
