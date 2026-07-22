import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {GuildMembership} from '@habbo/communication/messages/incoming/users/GuildMembership';
import type {GuildMembershipsMessageEvent} from '@habbo/communication/messages/incoming/users/GuildMembershipsMessageEvent';
import {GetGuildMembershipsMessageComposer} from '@habbo/communication/messages/outgoing/users/GetGuildMembershipsMessageComposer';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * UsersInGroup — the "select users belonging to a group" wired selector: a radio group choosing
 * between "any group" and "a specific group", the latter revealing a group dropdown populated from
 * the player's guild memberships (requested on edit, throttled, refreshed by onGuildMemberships). The
 * chosen group id is stored in stringParam (empty for "any group").
 *
 * Body is byte-identical to the condition ActorIsGroupMember. (This AS3 class keeps its real name.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/UsersInGroup.as
 */
export class UsersInGroup extends DefaultSelectorType
{
    // AS3: UsersInGroup.as::REQUEST_TIMEOUT (seconds between membership requests)
    private static readonly REQUEST_TIMEOUT: number = 5;

    // AS3: UsersInGroup.as::_SafeStr_7031 (name derived: the any-group / specific-group radio)
    private _typeRadio!: RadioGroupPreset;

    // AS3: UsersInGroup.as::_groupDropdown
    private _groupDropdown!: DropdownPreset;

    // AS3: UsersInGroup.as::_SafeStr_7036 (name derived: the cached guild memberships)
    private _guilds: GuildMembership[] | null = null;

    // AS3: UsersInGroup.as::_SafeStr_4935 (name derived: the group id to preselect)
    private _selectedGroupId: number = -1;

    // AS3: UsersInGroup.as::_SafeStr_9417 (name derived: the last membership request time, ms)
    private _lastRequestTime: number = 0;

    // AS3: UsersInGroup.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_IN_GROUP;
    }

    // AS3: UsersInGroup.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: UsersInGroup.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._groupDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.group'), []));
        this._typeRadio = presetManager.createRadioGroup([new RadioButtonParam(0, this.l('grouptype.0')), new RadioButtonParam(1, this.l('grouptype.1'), null, this._groupDropdown)]);
        const section = presetManager.createSection(this.l('groupselection'), this._typeRadio);
        builder.addElements(section);
    }

    // AS3: UsersInGroup.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._selectedGroupId = def.stringParam === '' ? -1 : Number.parseInt(def.stringParam, 10);
        this.initGuilds(this._guilds ?? []);
        this.maybeGetGuildMemberships();
        this._typeRadio.selected = def.stringParam !== '' ? 1 : 0;
    }

    // AS3: UsersInGroup.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        if(this._typeRadio.selected !== 1)
        {
            return '';
        }

        const selected = this._groupDropdown.selected;

        if(selected === null)
        {
            return '';
        }

        return selected.id.toString();
    }

    // AS3: UsersInGroup.as::onGuildMemberships() — receives a GuildMembershipsMessageEvent (typed
    // `unknown` on the IWiredElement contract; cast here).
    override onGuildMemberships(event: unknown): void
    {
        this.initGuilds((event as GuildMembershipsMessageEvent).guilds);
    }

    // AS3: UsersInGroup.as::maybeGetGuildMemberships()
    private maybeGetGuildMemberships(): void
    {
        const now = Date.now();

        if(now > this._lastRequestTime + 1000 * UsersInGroup.REQUEST_TIMEOUT)
        {
            this._lastRequestTime = now;
            this.roomEvents.send(new GetGuildMembershipsMessageComposer());
        }
    }

    // AS3: UsersInGroup.as::initGuilds()
    private initGuilds(guilds: GuildMembership[]): void
    {
        this._guilds = guilds;

        const options: ExpandableDropdownOption[] = [];

        for(const guild of this._guilds)
        {
            options.push(new ExpandableDropdownOption(guild.groupId, guild.groupName));
        }

        this._groupDropdown.reinit(options, this._selectedGroupId);
    }
}
