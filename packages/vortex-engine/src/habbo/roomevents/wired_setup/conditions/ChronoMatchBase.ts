import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {Component} from '@core/runtime/Component';

import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * ChronoMatchBase — abstract base for the timezone-aware chrono conditions (TimeMatches, DateMatches).
 * Owns the timezone dropdown: it reads the room's "wired.timezones" property, offers the currently
 * selected timezone first, and serializes the chosen timezone as the condition's stringParam.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4314`, no real name in any tree). It is abstract
 * (no `code` override) and never registered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4314.as
 */
export class ChronoMatchBase extends DefaultConditionType
{
    // AS3: _SafeCls_4314.as::_SafeStr_8401 (name derived: the currently selected timezone)
    private _selectedTimezone: string = '';

    // AS3: _SafeCls_4314.as::_timezoneDropdown
    private _timezoneDropdown: DropdownPreset | null = null;

    // AS3: _SafeCls_4314.as::_SafeStr_7358 (name derived: the timezone section)
    private _timezoneSection: SectionPreset | null = null;

    // AS3: _SafeCls_4314.as::_timezoneValues
    private _timezoneValues: string[] | null = null;

    // AS3: _SafeCls_4314.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const timezone = def.stringParam === '' ? this._selectedTimezone : def.stringParam;
        this.updateTimezoneOptions(timezone);
    }

    // AS3: _SafeCls_4314.as::createTimezoneSection()
    protected createTimezoneSection(presetManager: PresetManager): SectionPreset
    {
        this._timezoneDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.timezone'), this.buildTimezoneOptions(this._selectedTimezone)));
        this._timezoneSection = presetManager.createSection(this.l('time.timezone_selection'), this._timezoneDropdown);
        this._timezoneSection.visible = this._timezoneValues !== null && this._timezoneValues.length > 1;
        return this._timezoneSection;
    }

    // AS3: _SafeCls_4314.as::updateTimezoneOptions()
    private updateTimezoneOptions(timezone: string): void
    {
        if(this._timezoneDropdown === null)
        {
            this.buildTimezoneOptions(timezone);
            return;
        }

        const options = this.buildTimezoneOptions(timezone);
        const selectedId = options.length > 0 ? 0 : -1;
        this._timezoneDropdown.reinit(options, selectedId);

        if(this._timezoneSection !== null)
        {
            this._timezoneSection.visible = options.length > 1;
        }
    }

    // AS3: _SafeCls_4314.as::buildTimezoneOptions()
    private buildTimezoneOptions(timezone: string): ExpandableDropdownOption[]
    {
        const timezones = this.getTimezones(timezone);
        this._timezoneValues = timezones;

        const options: ExpandableDropdownOption[] = [];

        for(let i = 0; i < timezones.length; i++)
        {
            options.push(new ExpandableDropdownOption(i, timezones[i]));
        }

        return options;
    }

    // AS3: _SafeCls_4314.as::getTimezones()
    private getTimezones(current: string): string[]
    {
        // AS3 casts roomEngine to the core config-accessor interface (_SafeCls_49); in this port that
        // getProperty()/getBoolean()/interpolate() surface lives on Component, which RoomEngine extends.
        // The 2026 decompiler collapsed the property local (leaving a bogus `null.split(",")`);
        // reconstructed intent: read "wired.timezones", default to ["UTC"] when absent/empty, else split.
        const config = this.roomEvents.roomEngine as unknown as Component | null;
        const property = config === null ? null : config.getProperty('wired.timezones');
        const zones = (property === null || property === '') ? ['UTC'] : property.split(',');

        const result: string[] = [];

        if(current !== '')
        {
            result.push(current);
        }

        for(const zone of zones)
        {
            if(zone !== current)
            {
                result.push(zone);
            }
        }

        return result;
    }

    // AS3: _SafeCls_4314.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        if(this._timezoneDropdown === null || this._timezoneValues === null)
        {
            return '';
        }

        const id = this._timezoneDropdown.selectedId;

        if(id < 0 || id >= this._timezoneValues.length)
        {
            return '';
        }

        const timezone = this._timezoneValues[id];
        this._selectedTimezone = timezone;
        return timezone;
    }
}
