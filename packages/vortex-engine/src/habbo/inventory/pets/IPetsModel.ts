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
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::get pets()
    readonly pets: Map<number, Pet>;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::get roomSession()
    readonly roomSession: IRoomSession | null;
    readonly localization: IHabboLocalizationManager;

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::isListInitialized()
    isListInitialized(): boolean;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::setListInitialized()
    setListInitialized(): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::requestInitialization()
    requestInitialization(): void;

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::addPet()
    addPet(pet: Pet): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::updatePets()
    updatePets(pets: Map<number, Pet>): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::removePet()
    removePet(id: number): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::getPetById()
    getPetById(id: number): Pet | null;

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::categorySwitch()
    categorySwitch(category: string): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::getWindowContainer()
    getWindowContainer(): unknown;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::closingInventoryView()
    closingInventoryView(): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::updateView()
    updateView(): void;

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::placePetToRoom()
    placePetToRoom(id: number, skipServer?: boolean): boolean;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::resetUnseenItems()
    resetUnseenItems(): void;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::isUnseen()
    isUnseen(id: number): boolean;
    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::selectItemById()
    // A string, as `IInventoryModel` declares it — AS3's PetsModel parses it to an int itself.
    selectItemById(itemId: string): void;
}
