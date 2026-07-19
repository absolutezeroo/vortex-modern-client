import type {IBadgeData, BadgeFilterType, IBadgesModel} from './IBadgesModel';
import {BadgeFilter} from './IBadgesModel';
import {Badge} from './Badge';

/**
 * Manages badge inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.BadgesModel (ENGINE only)
 */
export class BadgesModel implements IBadgesModel
{
    private static readonly MAX_ACTIVE_BADGE_COUNT = 5;
    private _allBadges: Badge[] = [];
    private _activeBadges: Badge[] = [];
    private _activeBadgeSet: Set<Badge> = new Set();
    private _badgeSlots: Map<string, number> = new Map();

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    get maxActiveCount(): number
    {
        return BadgesModel.MAX_ACTIVE_BADGE_COUNT;
    }

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
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::updateBadge()
    // TODO(AS3): AS3 also takes ownerCount/badgeRarityId and calls badge.updateMetadata(ownerCount,
    // badgeRarityId) on the existing-badge path, then refreshes a rarity-group flag
    // (refreshAvailableRareBadgeRarityIds()) - Badge.ts/IBadgeData have no rarity/ownerCount fields
    // at all yet (a separate, unported badge-rarity feature), so there is nothing to update.
    updateBadge(
        badgeId: string,
        isInUse: boolean,
        slotId: number,
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

            badge = new Badge(badgeId, name, desc, isUnseen);

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

        return badge;
    }

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
    // TODO(AS3): AS3 also calls saveBadgeSelection() here, sending a SetActivatedBadgesComposer
    // with every active badge's id - BadgesModel has no connection reference to send through
    // (this whole model is currently unreachable from any live handler), so it's left uncalled
    // rather than invented against a composer/connection wiring that doesn't exist yet.
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

        return badge;
    }

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

    getBadgeFromActive(index: number): Badge | null
    {
        if(index < 0 || index >= this._activeBadges.length)
        {
            return null;
        }

        return this._activeBadges[index];
    }

    getBadgeFromInactive(index: number): Badge | null
    {
        const inactive = this.getBadges(BadgeFilter.INACTIVE);

        if(index < 0 || index >= inactive.length)
        {
            return null;
        }

        return inactive[index];
    }

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

    setBadgeSelected(badgeId: string): void
    {
        for(const badge of this._allBadges)
        {
            badge.isSelected = badge.badgeId === badgeId;
        }
    }

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

    removeSelections(): void
    {
        for(const badge of this._allBadges)
        {
            badge.isSelected = false;
        }
    }

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
    }

    private startWearingBadge(badge: Badge): void
    {
        if(!this._activeBadgeSet.has(badge))
        {
            this._activeBadgeSet.add(badge);
            this._activeBadges.push(badge);
        }

        badge.isInUse = true;
    }

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

    // AS3: sources/win63_version/habbo/inventory/badges/BadgesModel.as::updateView()
    // TODO(AS3): no-op until BadgesView (habbo/inventory/badges/BadgesView.as) is ported.
    updateView(): void
    {
        // Intentional no-op — matches AS3's `if(var_18 != null)` guard.
    }
}
