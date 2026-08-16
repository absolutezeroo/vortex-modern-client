import type {HabbiconEntryModel} from './HabbiconEntryModel';

/**
 * Which action the tile's popup offers, decided entirely by the entry's flags.
 *
 * **The `owned` branch is dead on its false side.** `resolve()` returns early when `favorite` is
 * set, so by the time it tests `favorite ? ... : 'add_favorite'` the answer can only ever be
 * `add_favorite`. Transcribed as AS3 wrote it — the ternary is redundant, not wrong.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconPopupMode.as
 */
export class HabbiconPopupMode
{
    // AS3: HabbiconPopupMode.as::CLAIM
    static readonly CLAIM: string = 'claim';

    // AS3: HabbiconPopupMode.as::PURCHASE
    static readonly PURCHASE: string = 'purchase';

    // AS3: HabbiconPopupMode.as::ADD_FAVORITE
    static readonly ADD_FAVORITE: string = 'add_favorite';

    // AS3: HabbiconPopupMode.as::REMOVE_FAVORITE
    static readonly REMOVE_FAVORITE: string = 'remove_favorite';

    // AS3: HabbiconPopupMode.as::INFO
    static readonly INFO: string = 'info';

    // AS3: HabbiconPopupMode.as::resolve()
    static resolve(entry: HabbiconEntryModel | null): string
    {
        if(!entry) return HabbiconPopupMode.PURCHASE;

        if(entry.favorite) return HabbiconPopupMode.REMOVE_FAVORITE;

        if(entry.owned)
        {
            return entry.favorite ? HabbiconPopupMode.REMOVE_FAVORITE : HabbiconPopupMode.ADD_FAVORITE;
        }

        if(entry.claimable) return HabbiconPopupMode.CLAIM;

        if(entry.isReward || !entry.purchasable) return HabbiconPopupMode.INFO;

        return HabbiconPopupMode.PURCHASE;
    }
}
