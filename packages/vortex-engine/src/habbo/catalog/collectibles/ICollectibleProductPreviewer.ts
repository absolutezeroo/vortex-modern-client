import type {IDisposable} from '@core/runtime/IDisposable';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';

/**
 * The preview surface `CollectiblesController.previewIcon()`/`previewImage()` draw into.
 *
 * One setter per kind of thing a collectible can be — a rendered furni image, an avatar, a badge, a
 * pet, an effect — because each is drawn by a different widget. Every setter clears the others
 * first, so the surface only ever shows one at a time.
 *
 * It extends `IGetImageListener` because a furni render can arrive late: the controller hands over
 * an `ImageResult` whose `data` may still be null, and the previewer keeps the id to match the
 * `imageReady()` that follows.
 *
 * Name DERIVED: obfuscated in every tree (`_SafeCls_2382`), named for its one implementor,
 * `CollectibleProductPreviewer`, which is not obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/_SafeCls_2382.as
 */
export interface ICollectibleProductPreviewer extends IGetImageListener, IDisposable
{
    // AS3: _SafeCls_2382.as::clearPreviewer()
    clearPreviewer(): void;

    // AS3: _SafeCls_2382.as::set imageResult()
    imageResult: ImageResult | null;

    // AS3: _SafeCls_2382.as::set avatarResult()
    avatarResult: string;

    // AS3: _SafeCls_2382.as::set badgeResult()
    badgeResult: string;

    // AS3: _SafeCls_2382.as::set petResult()
    petResult: string;

    // AS3: _SafeCls_2382.as::setEffectResult()
    setEffectResult(figure: string, effectId: number): void;

    // AS3: _SafeCls_2382.as::setUnknownImage()
    setUnknownImage(): void;

    /**
     * Declared on `CollectibleProductPreviewer` rather than on AS3's interface, but every caller
     * reaches it through the interface type, so it belongs here.
     */
    // AS3: CollectibleProductPreviewer.as::setPlaceholder()
    setPlaceholder(): void;
}
