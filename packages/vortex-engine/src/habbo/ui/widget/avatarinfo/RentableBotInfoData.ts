import type {BotSkillData} from '@habbo/communication/messages/parser/room/bot/BotSkillData';
import type {RoomWidgetRentableBotInfoUpdateEvent} from '../events/RoomWidgetRentableBotInfoUpdateEvent';

/**
 * RentableBotInfoData — the rentable-bot state the context menu is built from, kept between
 * updates the way `PetInfoData` is for pets.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2578.as
 *
 * **The class name is DERIVED** — obfuscated in every tree, with no 2016 counterpart. It is named
 * after its role: the sibling of `PetInfoData` for `RentableBotMenuView`, which is the only class
 * that reads it.
 *
 * Two skill views coexist on purpose: `botSkills` is the plain id list that arrives with the info
 * event, `botSkillsWithCommands` the richer list that arrives on its own event and carries each
 * skill's stored data (the in-client links and NUX steps are built from it).
 */
export class RentableBotInfoData
{
    // AS3: .../_SafeCls_2578.as::_SafeStr_4872
    private _id: number = -1;
    // AS3: .../_SafeCls_2578.as::_SafeStr_7722
    private _roomIndex: number = 0;
    // AS3: .../_SafeCls_2578.as::_SafeStr_8027
    private _isIgnored: boolean = false;
    // AS3: .../_SafeCls_2578.as::_SafeStr_8234
    private _amIOwner: boolean = false;
    // AS3: .../_SafeCls_2578.as::_SafeStr_8101
    private _amIAnyRoomController: boolean = false;
    // AS3: .../_SafeCls_2578.as::_SafeStr_7871
    private _carryItemType: number = 0;
    // AS3: .../_SafeCls_2578.as::_botSkills
    private _botSkills: number[] = [];
    // AS3: .../_SafeCls_2578.as::_SafeStr_6153
    private _botSkillsWithCommands: BotSkillData[] = [];
    // AS3: .../_SafeCls_2578.as::_name
    private _name: string = '';

    // AS3: .../_SafeCls_2578.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: .../_SafeCls_2578.as::set id()
    public set id(value: number)
    {
        this._id = value;
    }

    // AS3: .../_SafeCls_2578.as::get roomIndex()
    public get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: .../_SafeCls_2578.as::set roomIndex()
    public set roomIndex(value: number)
    {
        this._roomIndex = value;
    }

    // AS3: .../_SafeCls_2578.as::get isIgnored()
    public get isIgnored(): boolean
    {
        return this._isIgnored;
    }

    // AS3: .../_SafeCls_2578.as::set isIgnored()
    public set isIgnored(value: boolean)
    {
        this._isIgnored = value;
    }

    // AS3: .../_SafeCls_2578.as::get amIOwner()
    public get amIOwner(): boolean
    {
        return this._amIOwner;
    }

    // AS3: .../_SafeCls_2578.as::set amIOwner()
    public set amIOwner(value: boolean)
    {
        this._amIOwner = value;
    }

    // AS3: .../_SafeCls_2578.as::get amIAnyRoomController()
    public get amIAnyRoomController(): boolean
    {
        return this._amIAnyRoomController;
    }

    // AS3: .../_SafeCls_2578.as::set amIAnyRoomController()
    public set amIAnyRoomController(value: boolean)
    {
        this._amIAnyRoomController = value;
    }

    // AS3: .../_SafeCls_2578.as::get carryItemType()
    public get carryItemType(): number
    {
        return this._carryItemType;
    }

    // AS3: .../_SafeCls_2578.as::set carryItemType()
    public set carryItemType(value: number)
    {
        this._carryItemType = value;
    }

    // AS3: .../_SafeCls_2578.as::get botSkills()
    public get botSkills(): number[]
    {
        return this._botSkills;
    }

    // AS3: .../_SafeCls_2578.as::set botSkills()
    public set botSkills(value: number[])
    {
        this._botSkills = value;
    }

    // AS3: .../_SafeCls_2578.as::get botSkillsWithCommands()
    public get botSkillsWithCommands(): BotSkillData[]
    {
        return this._botSkillsWithCommands;
    }

    // AS3: .../_SafeCls_2578.as::set botSkillsWithCommands()
    public set botSkillsWithCommands(value: BotSkillData[])
    {
        this._botSkillsWithCommands = value;
    }

    // AS3: .../_SafeCls_2578.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: .../_SafeCls_2578.as::populate()
    // The commands list belongs to one bot: selecting a different one drops it, so the menu never
    // shows the previous bot's links while the new bot's skill list is still on its way.
    public populate(event: RoomWidgetRentableBotInfoUpdateEvent): void
    {
        if(event.webID !== this._id) this._botSkillsWithCommands = [];

        this._id = event.webID;
        this._roomIndex = event.userRoomId;
        this._amIOwner = event.amIOwner;
        this._amIAnyRoomController = event.amIAnyRoomController;
        this._carryItemType = event.carryItem;
        this._botSkills = event.botSkills;
        this._name = event.name;
    }

    // AS3: .../_SafeCls_2578.as::cloneAndSetSkillsWithCommands()
    // Rebuilds the plain id list off the richer one, so both views agree once the skill list lands.
    public cloneAndSetSkillsWithCommands(skills: BotSkillData[]): void
    {
        this._botSkills = skills.map((skill) => skill.id);
        this._botSkillsWithCommands = skills.slice();
    }
}
