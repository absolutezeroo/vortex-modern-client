import type {IPlaneDrawingData} from '@room/object/visualization/IPlaneDrawingData';
import {RenderRoomMessageComposer} from './RenderRoomMessageComposer';

/**
 * Asks the server to render the room as its thumbnail.
 *
 * Identical payload to {@link RenderRoomMessageComposer} — the only difference is the header and
 * that the constructor packs immediately instead of leaving it to `isSendable()`, so `setZoom()`
 * and `addEffectData()` have no effect on this one.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/camera/RenderRoomThumbnailMessageComposer.as
 * (`_SafeCls_2272` in the primary tree; header 1985 from WIN63's registry)
 */
export class RenderRoomThumbnailMessageComposer extends RenderRoomMessageComposer
{
    // AS3: .../outgoing/camera/RenderRoomThumbnailMessageComposer.as::RenderRoomThumbnailMessageComposer()
    constructor(
        planes: IPlaneDrawingData[],
        sprites: string,
        modifiers: string,
        roomId: number,
        topSecurityLevel: number
    )
    {
        super(planes, sprites, modifiers, roomId, topSecurityLevel);

        this.compressData();
    }
}
