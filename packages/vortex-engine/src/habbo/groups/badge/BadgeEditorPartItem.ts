import type {IAssetReceiver} from '@core/window/IAssetReceiver';
import type {GuildBadgePartData} from '@habbo/communication/messages/incoming/users/GuildBadgePartData';
import type {GuildColorData} from '@habbo/communication/messages/incoming/users/GuildColorData';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from '../HabboGroupsManager';
import type {BadgeSelectPartCtrl} from './BadgeSelectPartCtrl';
import type {BadgeLayerOptions} from './BadgeLayerOptions';

const log = Logger.getLogger('habbo.groups.badge.BadgeEditorPartItem');

/**
 * BadgeEditorPartItem
 *
 * One badge part, and the compositing that turns it into a picture: the part image and
 * its mask are fetched from the badge-part image library, the part is tinted to the
 * chosen colour, and the mask — the bit that must stay untinted, typically an outline
 * or highlight — is laid back over the top.
 *
 * Constructed with no part data it is the "empty" cell that heads the overlay part
 * grid, and simply carries the `badge_part_empty` image with nothing to load.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeEditorPartItem.as
 */
export class BadgeEditorPartItem implements IAssetReceiver
{
    // AS3: .../BadgeEditorPartItem.as::BASE_PART
    public static readonly BASE_PART: number = 0;
    // AS3: .../BadgeEditorPartItem.as::LAYER_PART
    public static readonly LAYER_PART: number = 1;
    // AS3: .../BadgeEditorPartItem.as::IMAGE_WIDTH
    public static readonly IMAGE_WIDTH: number = 39;
    // AS3: .../BadgeEditorPartItem.as::IMAGE_HEIGHT
    public static readonly IMAGE_HEIGHT: number = 39;
    // AS3: .../BadgeEditorPartItem.as::CELL_WIDTH
    public static readonly CELL_WIDTH: number = 13;
    // AS3: .../BadgeEditorPartItem.as::CELL_HEIGHT
    public static readonly CELL_HEIGHT: number = 13;

    // AS3: .../BadgeEditorPartItem.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_4839
    private _selectPartCtrl: BadgeSelectPartCtrl | null;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_7780
    private _partIndex: number;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_4778
    private _partType: number;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_8485
    private _libraryUrl: string;
    // AS3: .../BadgeEditorPartItem.as::_fileName
    private _fileName: string = '';
    // AS3: .../BadgeEditorPartItem.as::_maskFileName
    private _maskFileName: string = '';
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_4582
    private _image: ImageBitmap | null = null;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_4905
    private _maskImage: ImageBitmap | null = null;
    // AS3: .../BadgeEditorPartItem.as::_composite
    private _composite: ImageBitmap | null = null;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_8448
    private _hasMask: boolean = false;
    // AS3: .../BadgeEditorPartItem.as::_isLoaded
    private _isLoaded: boolean = false;
    // AS3: .../BadgeEditorPartItem.as::_SafeStr_7631
    private _isEmptyPart: boolean = false;
    // AS3: .../badge/BadgeEditorPartItem.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../BadgeEditorPartItem.as::BadgeEditorPartItem()
    constructor(groupsManager: HabboGroupsManager, selectPartCtrl: BadgeSelectPartCtrl, partIndex: number, partType: number, part: GuildBadgePartData | null = null)
    {
        this._partIndex = partIndex;
        this._groupsManager = groupsManager;
        this._selectPartCtrl = selectPartCtrl;
        this._partType = partType;
        this._libraryUrl = groupsManager.getProperty('image.library.badgepart.url');

        if(part === null)
        {
            this._isLoaded = true;
            this._isEmptyPart = true;
            this._image = groupsManager.getButtonImage('badge_part_empty');

            return;
        }

        const fileName = part.fileName.replace('.gif', '').replace('.png', '');
        const maskFileName = part.maskFileName.replace('.gif', '').replace('.png', '');

        this._hasMask = maskFileName.length > 0;
        this._fileName = `${this._libraryUrl}badgepart_${fileName}.png`;
        this._maskFileName = `${this._libraryUrl}badgepart_${maskFileName}.png`;

        const resourceManager = groupsManager.windowManager?.resourceManager;

        if(!resourceManager)
        {
            log.warn('BadgeEditorPartItem: no resource manager, badge part images cannot be loaded');

            return;
        }

        resourceManager.retrieveAsset(this._fileName, this);
        resourceManager.retrieveAsset(this._maskFileName, this);
    }

    // AS3: .../BadgeEditorPartItem.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../BadgeEditorPartItem.as::get partIndex()
    get partIndex(): number
    {
        return this._partIndex;
    }

    // AS3: .../BadgeEditorPartItem.as::receiveAsset()
    receiveAsset(asset: ImageBitmap, uri: string): void
    {
        if(this._disposed) return;

        const resourceManager = this._groupsManager?.windowManager?.resourceManager;

        if(!resourceManager) return;

        if(resourceManager.isSameAsset(this._fileName, uri)) this._image = asset;

        if(resourceManager.isSameAsset(this._maskFileName, uri)) this._maskImage = asset;

        this.checkIsImageLoaded();
    }

    // AS3: .../BadgeEditorPartItem.as::checkIsImageLoaded()
    private checkIsImageLoaded(): void
    {
        if(this._image === null) return;

        if(this._hasMask && this._maskImage === null) return;

        this._isLoaded = true;

        if(this._partType === BadgeEditorPartItem.BASE_PART) this._selectPartCtrl?.onBaseImageLoaded(this);
        else this._selectPartCtrl?.onLayerImageLoaded(this);
    }

    /**
     * The part tinted to `options.colorIndex` and placed on `options`' grid cell.
     *
     * AS3 does this with `copyPixels` + a `ColorTransform` per-channel multiply, then
     * merges the mask over it. Canvas reaches the same result with a `multiply` blend
     * over the whole surface followed by `destination-in`, which restores the part's own
     * alpha and so crops the tint back to the part's silhouette.
     */
    // AS3: .../badge/BadgeEditorPartItem.as::getComposite()
    getComposite(options: BadgeLayerOptions | null): ImageBitmap | null
    {
        if(!this._isLoaded) return null;

        if(this._isEmptyPart) return this._image;

        if(!options || !this._image) return null;

        const colors = this._groupsManager?.guildEditorData?.badgeColors;
        const color: GuildColorData | null = colors && options.colorIndex >= 0 && options.colorIndex < colors.length
            ? colors[options.colorIndex]
            : null;

        if(!color || typeof OffscreenCanvas === 'undefined') return null;

        const position = this.getPosition(options);

        this._composite?.close();

        const canvas = new OffscreenCanvas(BadgeEditorPartItem.IMAGE_WIDTH, BadgeEditorPartItem.IMAGE_HEIGHT);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.drawImage(this._image, position.x, position.y);
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
        context.fillRect(0, 0, BadgeEditorPartItem.IMAGE_WIDTH, BadgeEditorPartItem.IMAGE_HEIGHT);
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(this._image, position.x, position.y);
        context.globalCompositeOperation = 'source-over';

        if(this._hasMask && this._maskImage) context.drawImage(this._maskImage, position.x, position.y);

        this._composite = canvas.transferToImageBitmap();

        return this._composite;
    }

    /**
     * A detached copy of `source`.
     *
     * Every AS3 caller of `getComposite()` copies the result into a fresh BitmapData
     * before handing it to a window, because the item reuses and disposes its own
     * `_composite` on the next call. The same applies here — an ImageBitmap handed
     * straight to a window would be closed out from under it — so the copy is not
     * optional bookkeeping, it is what keeps the previously-rendered layers alive.
     *
     * AS3: .../BadgeEditorPartItem.as::getComposite() (the `new BitmapData(...).copyPixels(...)`
     * its callers wrap it in, e.g. BadgeSelectPartCtrl::setGridItemImage())
     */
    // AS3: .../badge/BadgeEditorPartItem.as::getComposite() (its callers' copy step)
    static copyBitmap(source: ImageBitmap | null): ImageBitmap | null
    {
        if(!source || typeof OffscreenCanvas === 'undefined' || source.width < 1 || source.height < 1) return null;

        const canvas = new OffscreenCanvas(source.width, source.height);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.drawImage(source, 0, 0);

        return canvas.transferToImageBitmap();
    }

    /**
     * Centres the part on its 3x3 cell, then clamps it inside the badge so a part wider
     * than a cell still fits rather than being cut off at the edge.
     */
    // AS3: .../badge/BadgeEditorPartItem.as::getPosition()
    private getPosition(options: BadgeLayerOptions): {x: number; y: number}
    {
        const image = this._image as ImageBitmap;

        let x = BadgeEditorPartItem.CELL_WIDTH * options.gridX + BadgeEditorPartItem.CELL_WIDTH / 2 - image.width / 2;
        let y = BadgeEditorPartItem.CELL_HEIGHT * options.gridY + BadgeEditorPartItem.CELL_HEIGHT / 2 - image.height / 2;

        if(x < 0) x = 0;

        if(x + image.width > BadgeEditorPartItem.IMAGE_WIDTH) x = BadgeEditorPartItem.IMAGE_WIDTH - image.width;

        if(y < 0) y = 0;

        if(y + image.height > BadgeEditorPartItem.IMAGE_HEIGHT) y = BadgeEditorPartItem.IMAGE_HEIGHT - image.height;

        return {x: Math.floor(x), y: Math.floor(y)};
    }

    // AS3: .../BadgeEditorPartItem.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._image?.close();
        this._image = null;
        this._maskImage?.close();
        this._maskImage = null;
        this._composite?.close();
        this._composite = null;
        this._fileName = '';
        this._maskFileName = '';
        this._selectPartCtrl = null;
        this._groupsManager = null;
        this._disposed = true;
    }
}
