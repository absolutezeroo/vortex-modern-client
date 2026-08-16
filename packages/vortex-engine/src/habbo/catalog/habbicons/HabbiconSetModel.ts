import type {HabbiconEntryModel} from './HabbiconEntryModel';

/**
 * One collection as the album draws it: its habbicons, the reward for completing it, and the bundle
 * price for buying the lot.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconSetModel.as
 */
export class HabbiconSetModel
{
    // AS3: HabbiconSetModel.as::id
    id: string = '';

    // AS3: HabbiconSetModel.as::collectionId
    collectionId: number = 0;

    // AS3: HabbiconSetModel.as::name
    name: string = '';

    // AS3: HabbiconSetModel.as::title
    title: string = '';

    // AS3: HabbiconSetModel.as::description
    description: string = '';

    // AS3: HabbiconSetModel.as::_SafeStr_6778 (name derived: the set's own artwork)
    bitmap: ImageBitmap | null = null;

    // AS3: HabbiconSetModel.as::habbicons
    habbicons: HabbiconEntryModel[] = [];

    // AS3: HabbiconSetModel.as::rewardHabbicon
    rewardHabbicon: HabbiconEntryModel | null = null;

    // AS3: HabbiconSetModel.as::completed
    completed: number = 0;

    // AS3: HabbiconSetModel.as::total
    total: number = 0;

    // AS3: HabbiconSetModel.as::priceCredits
    priceCredits: number = 0;

    // AS3: HabbiconSetModel.as::priceActivityPoints
    priceActivityPoints: number = 0;

    // AS3: HabbiconSetModel.as::activityPointType
    activityPointType: number = 0;

    // AS3: HabbiconSetModel.as::canBuy
    canBuy: boolean = false;

    // AS3: HabbiconSetModel.as::get complete()
    get complete(): boolean
    {
        return this.total > 0 && this.completed >= this.total;
    }

    // AS3: HabbiconSetModel.as::get progressRatio()
    get progressRatio(): number
    {
        return this.total <= 0 ? 0 : Math.max(0, Math.min(1, this.completed / this.total));
    }
}
