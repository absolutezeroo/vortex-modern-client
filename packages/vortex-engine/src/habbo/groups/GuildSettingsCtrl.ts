import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IRadioButtonWindow} from '@core/window/components/IRadioButtonWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IGuildManagementData} from '@habbo/communication/messages/incoming/users/IGuildManagementData';
import {Logger} from '@core/utils/Logger';
import {GuildSettingsData} from './GuildSettingsData';

const log = Logger.getLogger('habbo.groups.GuildSettingsCtrl');

/**
 * GuildSettingsCtrl
 *
 * The "who can join / who can decorate" pane — `step_cont_5` of the group management
 * window. Only the edit window reaches it; the creation wizard stops at step 4, which
 * is why nothing here is consulted while creating a group.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_3293` in WIN63,
 * `class_2447` in win63_version) and did not exist in the 2016 PRODUCTION build, so the
 * class name here is DERIVED from what it edits; every method name is recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/_SafeCls_3293.as
 */
export class GuildSettingsCtrl
{
    // AS3: .../_SafeCls_3293.as::TYPE_REGULAR
    public static readonly TYPE_REGULAR: number = 0;
    // AS3: .../_SafeCls_3293.as::TYPE_EXCLUSIVE
    public static readonly TYPE_EXCLUSIVE: number = 1;
    /**
     * AS3 constant is obfuscated in every tree (`_SafeStr_10368` / `const_68`). The name
     * is DERIVED from the radio button this value selects, `rb_type_private`.
     *
     * AS3: .../_SafeCls_3293.as::_SafeStr_10368
     */
    public static readonly TYPE_PRIVATE: number = 2;
    // AS3: .../_SafeCls_3293.as::TYPE_LARGE
    public static readonly TYPE_LARGE: number = 3;
    /**
     * AS3 constant is obfuscated in every tree (`_SafeStr_10346` / `const_73`) and no
     * code in any tree reads it, so there is nothing to derive a meaning from. Kept
     * under its value alone rather than invented.
     *
     * AS3: .../_SafeCls_3293.as::_SafeStr_10346
     */
    public static readonly TYPE_4: number = 4;
    // AS3: .../_SafeCls_3293.as::RIGHTS_MEMBERS
    public static readonly RIGHTS_MEMBERS: number = 0;
    /**
     * AS3 constant is obfuscated in every tree (`_SafeStr_11673` / `const_505`). The
     * name is DERIVED from its only use: the value the rights level takes when the
     * "members have rights" checkbox is *un*checked.
     *
     * AS3: .../_SafeCls_3293.as::_SafeStr_11673
     */
    public static readonly RIGHTS_ADMINS: number = 1;

    // AS3: .../_SafeCls_3293.as::_SafeStr_4556
    private _data: GuildSettingsData | null = null;
    // AS3: .../_SafeCls_3293.as::_SafeStr_6718
    private _typeSelector: ISelectorWindow | null = null;
    // AS3: .../_SafeCls_3293.as::_SafeStr_7593
    private _regularRadio: IRadioButtonWindow | null = null;
    // AS3: .../_SafeCls_3293.as::_SafeStr_8445
    private _exclusiveRadio: IRadioButtonWindow | null = null;
    // AS3: .../_SafeCls_3293.as::_SafeStr_8484
    private _privateRadio: IRadioButtonWindow | null = null;
    // AS3: .../_SafeCls_3293.as::_SafeStr_7932
    private _memberRightsCheckbox: ISelectableWindow | null = null;

    // AS3: .../_SafeCls_3293.as::prepare()
    prepare(window: IWindowContainer): void
    {
        const container = window.findChildByName('step_cont_5') as IWindowContainer | null;

        if(!container)
        {
            log.warn('prepare: the group management window has no "step_cont_5" child');

            return;
        }

        this._typeSelector = container.findChildByName('group_type_selector') as ISelectorWindow | null;

        this._regularRadio = container.findChildByName('rb_type_regular') as IRadioButtonWindow | null;
        if(this._regularRadio) this._regularRadio.procedure = this.onRegularGuildType;

        this._exclusiveRadio = container.findChildByName('rb_type_exclusive') as IRadioButtonWindow | null;
        if(this._exclusiveRadio) this._exclusiveRadio.procedure = this.onExclusiveGuildType;

        this._privateRadio = container.findChildByName('rb_type_private') as IRadioButtonWindow | null;
        if(this._privateRadio) this._privateRadio.procedure = this.onPrivateGuildType;

        this._memberRightsCheckbox = container.findChildByName('cb_member_rights') as ISelectableWindow | null;
        if(this._memberRightsCheckbox) this._memberRightsCheckbox.procedure = this.onMembersHaveRights;
    }

    // AS3: .../_SafeCls_3293.as::refresh()
    refresh(data: IGuildManagementData): void
    {
        this._data = new GuildSettingsData(data);

        if(!this._typeSelector) return;

        let radio: IRadioButtonWindow | null;

        switch(this._data.guildType)
        {
            case GuildSettingsCtrl.TYPE_EXCLUSIVE:
                radio = this._exclusiveRadio;
                break;
            case GuildSettingsCtrl.TYPE_PRIVATE:
                radio = this._privateRadio;
                break;
            case GuildSettingsCtrl.TYPE_REGULAR:
            default:
                radio = this._regularRadio;
                break;
        }

        if(radio) this._typeSelector.setSelected(radio);

        if(this._memberRightsCheckbox)
        {
            if(this._data.rightsLevel === GuildSettingsCtrl.RIGHTS_MEMBERS) this._memberRightsCheckbox.select();
            else this._memberRightsCheckbox.unselect();
        }

        this._typeSelector.invalidate();
    }

    // AS3: .../_SafeCls_3293.as::onRegularGuildType()
    private onRegularGuildType = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WE_SELECT' && this._data) this._data.guildType = GuildSettingsCtrl.TYPE_REGULAR;
    };

    // AS3: .../_SafeCls_3293.as::onExclusiveGuildType()
    private onExclusiveGuildType = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WE_SELECT' && this._data) this._data.guildType = GuildSettingsCtrl.TYPE_EXCLUSIVE;
    };

    // AS3: .../_SafeCls_3293.as::onPrivateGuildType()
    private onPrivateGuildType = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WE_SELECT' && this._data) this._data.guildType = GuildSettingsCtrl.TYPE_PRIVATE;
    };

    // AS3: .../_SafeCls_3293.as::onMembersHaveRights()
    private onMembersHaveRights = (event: WindowEvent, _window: IWindow): void =>
    {
        if(!this._data) return;

        if(event.type === 'WE_SELECT') this._data.rightsLevel = GuildSettingsCtrl.RIGHTS_MEMBERS;
        if(event.type === 'WE_UNSELECT') this._data.rightsLevel = GuildSettingsCtrl.RIGHTS_ADMINS;
    };

    // AS3: .../_SafeCls_3293.as::resetModified()
    resetModified(): void
    {
        if(this._data !== null && this._data.isModified) this._data.resetModified();
    }

    // AS3: .../_SafeCls_3293.as::get guildType()
    get guildType(): number
    {
        return this._data?.guildType ?? GuildSettingsCtrl.TYPE_REGULAR;
    }

    // AS3: .../_SafeCls_3293.as::get rightsLevel()
    get rightsLevel(): number
    {
        return this._data?.rightsLevel ?? GuildSettingsCtrl.RIGHTS_MEMBERS;
    }

    // AS3: .../_SafeCls_3293.as::get isInitialized()
    get isInitialized(): boolean
    {
        return this._data !== null;
    }
}
