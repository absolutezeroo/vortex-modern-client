import type {IConnection} from '@core/communication/connection/IConnection';
import {SetActivatedBadgesComposer} from '@habbo/communication/messages/outgoing/inventory/SetActivatedBadgesComposer';
import type {IBadgeData, BadgeFilterType, IBadgesModel} from './IBadgesModel';
import {BadgeFilter} from './IBadgesModel';
import {BadgeRarityEnum} from '@habbo/communication/enum/BadgeRarityEnum';
import {Badge} from './Badge';

/**
 * Manages badge inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.BadgesModel (ENGINE only)
 */
export class BadgesModel implements IBadgesModel
{
    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::MAX_ACTIVE_BADGE_COUNT
    private static readonly MAX_ACTIVE_BADGE_COUNT = 5;
    private _allBadges: Badge[] = [];
    private _activeBadges: Badge[] = [];
    private _activeBadgeSet: Set<Badge> = new Set();
    private _badgeSlots: Map<string, number> = new Map();

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::_communication
    // AS3 takes the whole communication manager as its third constructor argument and only ever
    // reads `.connection` off it; the port is handed the connection directly.
    private _connection: IConnection | null;

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::_availableRareBadgeRarityIds
    private _availableRareBadgeRarityIds: number[] = [];

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::_hasCommonBadgeRarityGroup
    private _hasCommonBadgeRarityGroup: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::isUncommonBadgeRarityEnabled()
    // AS3 reads `inventory.getBoolean("badge_rarity.uncommon")` off the owning component. This
    // model is not handed the inventory (see `_connection` above for the same trade), so the
    // lookup arrives as a predicate, matching how `updateBadge()` already receives its two
    // localization lookups.
    private _isUncommonBadgeRarityEnabled: () => boolean;

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::BadgesModel()
    constructor(connection: IConnection | null = null, isUncommonBadgeRarityEnabled: () => boolean = () => false)
    {
        this._connection = connection;
        this._isUncommonBadgeRarityEnabled = isUncommonBadgeRarityEnabled;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    get maxActiveCount(): number
    {
        return BadgesModel.MAX_ACTIVE_BADGE_COUNT;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.resetBadges();
        this._disposed = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::initBadges()
    // AS3's badgeId int field feeds ONLY the code->id map the unseen-tracker joins against
    // (isUnseen(4, badgeId)) - it never marks a badge as worn. A badge starts inactive here in
    // every case; "active" only ever comes later from updateBadge()/updateBadgeData(), which
    // route through startWearingBadge()/stopWearingBadge() (the Set-synced path). Pushing directly
    // into _activeBadges here, bypassing _activeBadgeSet, was invented and desynced the two - a
    // later stopWearingBadge() would find nothing to delete from the Set and never remove the
    // badge from the array, then a later startWearingBadge() would push a duplicate.
    initBadges(
        badges: IBadgeData[],
        getName: (id: string) => string,
        getDesc: (id: string) => string
    ): void
    {
        this.resetBadges();

        for(const data of badges)
        {
            const isUnseen = false; // Will be updated by store via updateUnseenItems

            if(data.slotId > 0)
            {
                this._badgeSlots.set(data.badgeId, data.slotId);
            }

            const name = getName(data.badgeId);
            const desc = getDesc(data.badgeId);

            // TODO(AS3): AS3 passes `(data.ownerCount, data.badgeRarityId)` as the last two
            // arguments here. This server does not send them in the bulk list: AS3's list parser
            // (sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3564.as::parse())
            // reads four fields per badge — slotId, badgeCode, ownerCount, badgeRarityId — while
            // vortex-emulator's BadgesEventMessageComposerSerializer.cs writes only the first two,
            // and this port's BadgesMessageParser matches the emulator. So every badge loaded at
            // login gets rarity 0 until that serializer writes the two missing integers and the
            // parser reads them. The live-award path (BadgeReceivedEvent) does carry both on both
            // sides and is wired.
            const badge = new Badge(data.badgeId, name, desc, isUnseen);

            if(isUnseen)
            {
                this._allBadges.unshift(badge);
            }
            else
            {
                this._allBadges.push(badge);
            }
        }

        this.refreshAvailableRareBadgeRarityIds();
    }

    /**
	 * Add a badge, or refresh one already held
	 *
	 * @param ownerCount How many players hold the badge
	 * @param badgeRarityId The badge's rarity bracket
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::updateBadge()
    // `ownerCount`/`badgeRarityId` sit in AS3's positions (third and fourth after the code); the
    // two localization lookups trail them because AS3 reads those off `controller.localization`
    // rather than taking them as arguments.
    updateBadge(
        badgeId: string,
        isInUse: boolean,
        slotId: number,
        ownerCount: number,
        badgeRarityId: number,
        getName: (id: string) => string,
        getDesc: (id: string) => string
    ): Badge | null
    {
        // Store slot if provided
        if(slotId > 0 && !this._badgeSlots.has(badgeId))
        {
            this._badgeSlots.set(badgeId, slotId);
        }

        let badge = this.getBadge(badgeId);

        if(badge)
        {
            // Both fields move after the badge is first held — the owner count as other players
            // earn it, the rarity bracket as that count crosses a threshold.
            badge.updateMetadata(ownerCount, badgeRarityId);

            // Update existing badge
            if(badge.isInUse !== isInUse)
            {
                if(isInUse)
                {
                    this.startWearingBadge(badge);
                }
                else
                {
                    this.stopWearingBadge(badge);
                }
            }
        }
        else
        {
            // Create new badge
            const isUnseen = false; // Will be updated by store
            const name = getName(badgeId);
            const desc = getDesc(badgeId);

            badge = new Badge(badgeId, name, desc, isUnseen, ownerCount, badgeRarityId);

            if(isUnseen)
            {
                this._allBadges.unshift(badge);
            }
            else
            {
                this._allBadges.push(badge);
            }

            if(isInUse)
            {
                this.startWearingBadge(badge);
            }
        }

        this.refreshAvailableRareBadgeRarityIds();

        return badge;
    }

    /**
	 * The distinct standalone rarity brackets present in this inventory, ascending
	 *
	 * A copy, as in AS3 — callers filter badge grids with it and must not mutate the source.
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getAvailableRareBadgeRarityIds()
    getAvailableRareBadgeRarityIds(): number[]
    {
        return this._availableRareBadgeRarityIds.slice();
    }

    /**
	 * Whether any held badge falls outside the standalone rarity brackets
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::hasCommonBadgeRarityGroup()
    hasCommonBadgeRarityGroup(): boolean
    {
        return this._hasCommonBadgeRarityGroup;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::isUncommonBadgeRarityEnabled()
    isUncommonBadgeRarityEnabled(): boolean
    {
        return this._isUncommonBadgeRarityEnabled();
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::isStandaloneBadgeRarity()
    isStandaloneBadgeRarity(badgeRarityId: number): boolean
    {
        return BadgeRarityEnum.isStandaloneTier(badgeRarityId, this.isUncommonBadgeRarityEnabled());
    }

    /**
	 * Recompute which rarity brackets the badge grid can offer as filters
	 *
	 * Rebuilt from scratch on every badge change, as in AS3: a badge arriving or leaving can add
	 * or remove a whole bracket.
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::refreshAvailableRareBadgeRarityIds()
    private refreshAvailableRareBadgeRarityIds(): void
    {
        this._availableRareBadgeRarityIds = [];
        this._hasCommonBadgeRarityGroup = false;

        const seen = new Set<number>();

        for(const badge of this._allBadges)
        {
            if(!badge) continue;

            if(!this.isStandaloneBadgeRarity(badge.badgeRarityId))
            {
                this._hasCommonBadgeRarityGroup = true;
            }
            else if(!seen.has(badge.badgeRarityId))
            {
                seen.add(badge.badgeRarityId);
                this._availableRareBadgeRarityIds.push(badge.badgeRarityId);
            }
        }

        // AS3 sorts with flag 16 — Array.NUMERIC, ascending.
        this._availableRareBadgeRarityIds.sort((a, b) => a - b);
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::removeBadge()
    removeBadge(badgeId: string): boolean
    {
        for(let i = 0; i < this._allBadges.length; i++)
        {
            const badge = this._allBadges[i];

            if(badge.badgeId === badgeId)
            {
                this._allBadges.splice(i, 1);
                this.stopWearingBadge(badge);
                badge.dispose();

                return true;
            }
        }

        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::toggleBadgeWearing()
    toggleBadgeWearing(badgeId: string): Badge | null
    {
        const badge = this.getBadge(badgeId);

        if(!badge) return null;

        // AS3 has no MAX_ACTIVE_BADGE_COUNT cap here at all - toggleBadgeWearing() is a pure
        // toggle; the invented guard below silently blocked legitimate activations.
        if(badge.isInUse)
        {
            this.stopWearingBadge(badge);
        }
        else
        {
            this.startWearingBadge(badge);
        }

        this.saveBadgeSelection();

        return badge;
    }

    /**
     * AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::saveBadgeSelection()
     *
     * The whole worn set goes up on every toggle, not a delta — the composer pads to five
     * slot/id pairs and the server replaces the selection wholesale. `addActivatedBadge()`
     * ignores anything past the fifth, which the varargs constructor reproduces by indexing.
     */
    saveBadgeSelection(): void
    {
        const active = this.getBadges(BadgeFilter.ACTIVE);

        this._connection?.send(
            new SetActivatedBadgesComposer(...active.map(badge => badge.badgeId))
        );
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadges()
    getBadges(filter: BadgeFilterType = BadgeFilter.ALL): Badge[]
    {
        switch(filter)
        {
            case BadgeFilter.ALL:
                return [...this._allBadges];

            case BadgeFilter.INACTIVE:
                return this._allBadges.filter(b => !b.isInUse);

            case BadgeFilter.ACTIVE:
                return [...this._activeBadges];

            default:
                return [];
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadge()
    getBadge(badgeId: string): Badge | null
    {
        for(const badge of this._allBadges)
        {
            if(badge.badgeId === badgeId)
            {
                return badge;
            }
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadgeFromActive()
    getBadgeFromActive(index: number): Badge | null
    {
        if(index < 0 || index >= this._activeBadges.length)
        {
            return null;
        }

        return this._activeBadges[index];
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadgeFromInactive()
    getBadgeFromInactive(index: number): Badge | null
    {
        const inactive = this.getBadges(BadgeFilter.INACTIVE);

        if(index < 0 || index >= inactive.length)
        {
            return null;
        }

        return inactive[index];
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::getSelectedBadge()
    getSelectedBadge(filter: BadgeFilterType = BadgeFilter.ALL): Badge | null
    {
        const badges = this.getBadges(filter);

        for(const badge of badges)
        {
            if(badge.isSelected)
            {
                return badge;
            }
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::setBadgeSelected()
    setBadgeSelected(badgeId: string): void
    {
        for(const badge of this._allBadges)
        {
            badge.isSelected = badge.badgeId === badgeId;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::forceSelection()
    forceSelection(): void
    {
        if(this.getSelectedBadge() !== null)
        {
            return;
        }

        // Try to select first inactive badge
        const inactive = this.getBadges(BadgeFilter.INACTIVE);

        if(inactive.length > 0)
        {
            inactive[0].isSelected = true;

            return;
        }

        // Fall back to first active badge
        if(this._activeBadges.length > 0)
        {
            this._activeBadges[0].isSelected = true;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::removeSelections()
    removeSelections(): void
    {
        for(const badge of this._allBadges)
        {
            badge.isSelected = false;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::resetUnseenItems()
    resetUnseenItems(): string[]
    {
        const resetIds: string[] = [];

        for(const badge of this._allBadges)
        {
            if(badge.isUnseen)
            {
                badge.isUnseen = false;
                resetIds.push(badge.badgeId);
            }
        }

        return resetIds;
    }

    updateUnseenItems(unseenIds: number[]): void
    {
        // Badge unseen tracking uses slot IDs
        const unseenSlots = new Set(unseenIds);

        for(const [badgeId, slotId] of this._badgeSlots)
        {
            if(unseenSlots.has(slotId))
            {
                const badge = this.getBadge(badgeId);

                if(badge)
                {
                    badge.isUnseen = true;

                    // Move to top
                    const index = this._allBadges.indexOf(badge);

                    if(index > 0)
                    {
                        this._allBadges.splice(index, 1);
                        this._allBadges.unshift(badge);
                    }
                }
            }
        }
    }

    getActiveBadgeIds(): string[]
    {
        return this._activeBadges.map(b => b.badgeId);
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::resetBadges()
    private resetBadges(): void
    {
        for(const badge of this._allBadges)
        {
            badge.dispose();
        }

        this._allBadges.length = 0;
        this._activeBadges.length = 0;
        this._activeBadgeSet.clear();
        this._badgeSlots.clear();

        // AS3 clears both rarity-group fields here as well as in the constructor and dispose().
        this._availableRareBadgeRarityIds = [];
        this._hasCommonBadgeRarityGroup = false;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::startWearingBadge()
    private startWearingBadge(badge: Badge): void
    {
        if(!this._activeBadgeSet.has(badge))
        {
            this._activeBadgeSet.add(badge);
            this._activeBadges.push(badge);
        }

        badge.isInUse = true;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/BadgesModel.as::stopWearingBadge()
    private stopWearingBadge(badge: Badge): void
    {
        if(this._activeBadgeSet.delete(badge))
        {
            const index = this._activeBadges.indexOf(badge);

            if(index > -1)
            {
                this._activeBadges.splice(index, 1);
            }
        }

        badge.isInUse = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::updateView()
    // TODO(AS3): no-op until BadgesView (habbo/inventory/badges/BadgesView.as) is ported.
    updateView(): void
    {
        // Intentional no-op — matches AS3's `if(var_18 != null)` guard.
    }
}
