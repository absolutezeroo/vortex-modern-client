/**
 * Badge data model
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as
 * (engine-only: AS3's `_window`/`_badgeImage` half belongs to `BadgesView`, unported)
 */
export class Badge
{
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::Badge()
    // AS3 takes the owning model first and `(ownerCount, badgeRarityId)` last; the model is not
    // threaded here because this port's `Badge` has no view half to call back into.
    constructor(
        badgeId: string,
        name: string,
        description: string,
        isUnseen: boolean = false,
        ownerCount: number = 0,
        badgeRarityId: number = 0
    )
    {
        this._badgeId = badgeId;
        this._name = name;
        this._description = description;
        this._isUnseen = isUnseen;
        this._ownerCount = ownerCount;
        this._badgeRarityId = badgeRarityId;
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

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_ownerCount
    private _ownerCount: number = 0;

    /**
	 * How many players hold this badge
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get ownerCount()
    get ownerCount(): number
    {
        return this._ownerCount;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_badgeRarityId
    private _badgeRarityId: number = 0;

    /**
	 * The badge's rarity bracket
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get badgeRarityId()
    get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }

    /**
	 * Refresh the two server-owned metadata fields
	 *
	 * Both arrive on every badge message, and both can move after the badge is first held — the
	 * owner count as other players earn it, the rarity bracket as that count crosses a threshold.
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::updateMetadata()
    updateMetadata(ownerCount: number, badgeRarityId: number): void
    {
        this._ownerCount = ownerCount;
        this._badgeRarityId = badgeRarityId;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::dispose()
    dispose(): void
    {
        // Nothing to clean up for ENGINE-only version
    }
}
