import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {Pet} from './Pet';

/**
 * Interface for PetsModel — the pets-inventory tab controller (IInventoryModel).
 *
 * Based on AS3 com.sulake.habbo.inventory.pets.PetsModel.
 */
export interface IPetsModel extends IDisposable
{
    readonly pets: Map<number, Pet>;
    readonly roomSession: IRoomSession | null;
    readonly localization: IHabboLocalizationManager;

    isListInitialized(): boolean;
    setListInitialized(): void;
    requestInitialization(): void;

    addPet(pet: Pet): void;
    updatePets(pets: Map<number, Pet>): void;
    removePet(id: number): void;
    getPetById(id: number): Pet | null;

    categorySwitch(category: string): void;
    getWindowContainer(): unknown;
    closingInventoryView(): void;
    updateView(): void;

    placePetToRoom(id: number, skipServer?: boolean): boolean;
    resetUnseenItems(): void;
    isUnseen(id: number): boolean;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::selectItemById()
    // A string, as `IInventoryModel` declares it — AS3's PetsModel parses it to an int itself.
    selectItemById(itemId: string): void;
}
