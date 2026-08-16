import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconAlbumStats} from './HabbiconAlbumStats';

/**
 * Everything the hub shows, rebuilt from scratch on every shop-data update.
 *
 * The three set lists are the three tabs; only `sets` is searched, because the other two hold the
 * same objects filtered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconAlbumModel.as
 */
export class HabbiconAlbumModel
{
    // AS3: HabbiconAlbumModel.as::sets
    sets: HabbiconSetModel[] = [];

    // AS3: HabbiconAlbumModel.as::_SafeStr_5959 (name derived: the OWNED tab's groups)
    ownedGroups: HabbiconSetModel[] = [];

    // AS3: HabbiconAlbumModel.as::favouriteGroups
    favouriteGroups: HabbiconSetModel[] = [];

    // AS3: HabbiconAlbumModel.as::_SafeStr_4737 (name derived: the header counters)
    stats: HabbiconAlbumStats = new HabbiconAlbumStats();

    // AS3: HabbiconAlbumModel.as::findSetById()
    findSetById(id: string): HabbiconSetModel | null
    {
        for(const set of this.sets)
        {
            if(set !== null && set.id === id) return set;
        }

        return null;
    }

    // AS3: HabbiconAlbumModel.as::findSetByCollectionId()
    findSetByCollectionId(collectionId: number): HabbiconSetModel | null
    {
        for(const set of this.sets)
        {
            if(set !== null && set.collectionId === collectionId) return set;
        }

        return null;
    }

    /**
	 * The reward habbicon is checked *after* the set's own list, and only once that list has been
	 * walked — a reward can therefore never shadow a plain entry with the same id.
	 */
    // AS3: HabbiconAlbumModel.as::findEntryByHabbiconId()
    findEntryByHabbiconId(habbiconId: number): HabbiconEntryModel | null
    {
        for(const set of this.sets)
        {
            if(set === null) continue;

            for(const entry of set.habbicons)
            {
                if(entry !== null && entry.habbiconId === habbiconId) return entry;
            }

            if(set.rewardHabbicon !== null && set.rewardHabbicon.habbiconId === habbiconId)
            {
                return set.rewardHabbicon;
            }
        }

        return null;
    }
}
