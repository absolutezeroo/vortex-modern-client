/**
 * The counters across the album header.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconAlbumStats.as
 */
export class HabbiconAlbumStats
{
    // AS3: HabbiconAlbumStats.as::ownedHabbicons
    ownedHabbicons: number = 0;

    // AS3: HabbiconAlbumStats.as::completedSets
    completedSets: number = 0;

    // AS3: HabbiconAlbumStats.as::collected
    collected: number = 0;

    // AS3: HabbiconAlbumStats.as::total
    total: number = 0;

    // AS3: HabbiconAlbumStats.as::get progressRatio()
    get progressRatio(): number
    {
        return this.total <= 0 ? 0 : Math.max(0, Math.min(1, this.collected / this.total));
    }
}
