export class RoomId 
{
    private static readonly PREVIEW_ROOM_ID_BASE = 2_147_418_112;

    public static makeRoomPreviewerId(id: number): number
    {
        return (id & 0xFFFF) + this.PREVIEW_ROOM_ID_BASE;
    }

    public static isRoomPreviewerId(id: number): boolean
    {
        return id >= this.PREVIEW_ROOM_ID_BASE;
    }
}