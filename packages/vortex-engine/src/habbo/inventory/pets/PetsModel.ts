import type {IPetsModel} from './IPetsModel';
import type {Pet} from './Pet';

/**
 * Manages pet inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.pets.PetsModel (ENGINE only)
 */
export class PetsModel implements IPetsModel
{
    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _isListInitialized: boolean = false;

    get isListInitialized(): boolean
    {
        return this._isListInitialized;
    }

    private _pets: Map<number, Pet> = new Map();

    get pets(): Map<number, Pet>
    {
        return this._pets;
    }

    dispose(): void
    {
        if(this._disposed) return;

        for(const pet of this._pets.values())
        {
            pet.dispose();
        }

        this._pets.clear();
        this._disposed = true;
    }

    addPet(pet: Pet): boolean
    {
        if(this._pets.has(pet.id))
        {
            return false;
        }

        this._pets.set(pet.id, pet);

        return true;
    }

    updatePets(pets: Map<number, Pet>): {
        added: number[];
        removed: number[];
    }
    {
        const existingIds = new Set(this._pets.keys());
        const newIds = new Set(pets.keys());

        const added: number[] = [];
        const removed: number[] = [];

        // Find pets to remove
        for(const id of existingIds)
        {
            if(!newIds.has(id))
            {
                const pet = this._pets.get(id);

                if(pet)
                {
                    pet.dispose();
                }

                this._pets.delete(id);
                removed.push(id);
            }
        }

        // Find pets to add
        for(const [id, pet] of pets)
        {
            if(!existingIds.has(id))
            {
                this._pets.set(id, pet);
                added.push(id);
            }
        }

        this._isListInitialized = true;

        return {added, removed};
    }

    removePet(id: number): Pet | null
    {
        const pet = this._pets.get(id);

        if(pet)
        {
            this._pets.delete(id);
            pet.dispose();

            return pet;
        }

        return null;
    }

    getPetById(id: number): Pet | null
    {
        return this._pets.get(id) ?? null;
    }

    getPetsArray(): Pet[]
    {
        return Array.from(this._pets.values());
    }

    getSelectedPet(): Pet | null
    {
        for(const pet of this._pets.values())
        {
            if(pet.isSelected)
            {
                return pet;
            }
        }

        return null;
    }

    selectPet(id: number): void
    {
        this.removeSelections();

        const pet = this._pets.get(id);

        if(pet)
        {
            pet.isSelected = true;
        }
    }

    removeSelections(): void
    {
        for(const pet of this._pets.values())
        {
            pet.isSelected = false;
        }
    }

    resetUnseenItems(): number[]
    {
        const resetIds: number[] = [];

        for(const pet of this._pets.values())
        {
            if(pet.isUnseen)
            {
                pet.isUnseen = false;
                resetIds.push(pet.id);
            }
        }

        return resetIds;
    }

    updateUnseenItems(unseenIds: number[]): void
    {
        const unseenSet = new Set(unseenIds);

        for(const pet of this._pets.values())
        {
            pet.isUnseen = unseenSet.has(pet.id);
        }
    }

    isUnseen(id: number): boolean
    {
        return this._pets.get(id)?.isUnseen ?? false;
    }

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::updateView()
    // TODO(AS3): no-op until PetsView (habbo/inventory/pets/PetsView.as) is ported.
    updateView(): void
    {
        // Intentional no-op — matches AS3's `if(var_18 == null) return;` guard.
    }
}
