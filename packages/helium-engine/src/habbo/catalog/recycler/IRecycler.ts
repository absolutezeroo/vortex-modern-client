import type {FurniSlotItem} from './FurniSlotItem';
import type {IRecyclerVisualization} from './IRecyclerVisualization';
import type {PrizeLevelContainer} from './PrizeLevelContainer';

/**
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as
 */
export interface IRecycler
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::init()
    init(visualization?: IRecyclerVisualization | null): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::cancel()
    cancel(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::empty()
    empty(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::getSlotContent()
    getSlotContent(slotId: number): FurniSlotItem | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::placeObjectAtSlot()
    placeObjectAtSlot(
        slotId: number,
        id: number,
        category: number,
        typeId: number,
        xxxExtra: string | null,
        findNewSlotId?: boolean
    ): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::releaseSlot()
    releaseSlot(slotId: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::executeRecycler()
    executeRecycler(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::isReadyToRecycle()
    isReadyToRecycle(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::hasEnoughDuckets()
    hasEnoughDuckets(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::get timeout()
    readonly timeout: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::get ducketCost()
    readonly ducketCost: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::getPrizeTable()
    getPrizeTable(callback: (prizes: PrizeLevelContainer[]) => void): PrizeLevelContainer[] | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::get numberOfSlots()
    readonly numberOfSlots: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::secondsToWait()
    secondsToWait(): number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::get recyclerDisabled()
    readonly recyclerDisabled: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecycler.as::setNextRecycleAllowedTimestamp()
    setNextRecycleAllowedTimestamp(timestamp: number): void;
}
