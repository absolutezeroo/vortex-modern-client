/**
 * Badge data model
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.Badge (ENGINE only)
 */
export class Badge
{
    constructor(
        badgeId: string,
        name: string,
        description: string,
        isUnseen: boolean = false
    )
    {
        this._badgeId = badgeId;
        this._name = name;
        this._description = description;
        this._isUnseen = isUnseen;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_badgeId
    private _badgeId: string;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get badgeId()
    get badgeId(): string
    {
        return this._badgeId;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_name
    private _name: string;

    get name(): string
    {
        return this._name;
    }

    private _description: string;

    get description(): string
    {
        return this._description;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_isInUse
    private _isInUse: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get isInUse()
    get isInUse(): boolean
    {
        return this._isInUse;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isInUse()
    set isInUse(value: boolean)
    {
        this._isInUse = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_isSelected
    private _isSelected: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get isSelected()
    get isSelected(): boolean
    {
        return this._isSelected;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isSelected()
    set isSelected(value: boolean)
    {
        this._isSelected = value;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_isUnseen
    private _isUnseen: boolean = false;

    get isUnseen(): boolean
    {
        return this._isUnseen;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isUnseen()
    set isUnseen(value: boolean)
    {
        this._isUnseen = value;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::dispose()
    dispose(): void
    {
        // Nothing to clean up for ENGINE-only version
    }
}
