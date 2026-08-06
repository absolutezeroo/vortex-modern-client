/**
 * Your song disks are all known — the inventory list arrived and every song on it has its
 * metadata. The controller holds this back until the last outstanding song-info answer lands.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/SongDiskInventoryReceivedEvent.as
 */
export class SongDiskInventoryReceivedEvent
{
    // AS3: .../SongDiskInventoryReceivedEvent.as::SONG_DISK_INVENTORY_RECEIVED
    // The constant's value carries AS3's own typo ("RECEIVENT"); it is a wire-visible string in
    // the sense that every listener matches on it, so it is kept exactly.
    static readonly SONG_DISK_INVENTORY_RECEIVED: string = 'SDIR_SONG_DISK_INVENTORY_RECEIVENT_EVENT';

    readonly type: string;

    // AS3: .../SongDiskInventoryReceivedEvent.as::SongDiskInventoryReceivedEvent()
    constructor(type: string)
    {
        this.type = type;
    }
}
