import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IAssetReceiver} from '../IAssetReceiver';
import type {IResourceManager} from '../IResourceManager';
import type {IStaticBitmapWrapperWindow} from './IStaticBitmapWrapperWindow';
import {BitmapDataController} from './BitmapDataController';
import type {PropertyStruct} from '../utils/PropertyStruct';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for static bitmap wrapper windows.
 *
 * Extends BitmapDataController and implements IAssetReceiver. When `assetUri`
 * is set, requests the asset from the ResourceManager. When the asset is
 * delivered via `receiveAsset()`, stores it as `_bitmapData` and auto-sizes.
 *
 * @see sources/win63_version/core/window/components/StaticBitmapWrapperController.as
 */
export class StaticBitmapWrapperController extends BitmapDataController implements IStaticBitmapWrapperWindow, IAssetReceiver
{
    private _ownsBitmapData: boolean = false;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
    }

    private _assetUri: string = '';

    /**
	 * The asset URI for this static bitmap.
	 * Setting this triggers an asset request via the ResourceManager.
	 */
    public get assetUri(): string
    {
        return this._assetUri;
    }

    public set assetUri(value: string)
    {
        if(this._assetUri === value) return;

        this._assetUri = value ?? '';

        if(!this._assetUri)
        {
            if(this._ownsBitmapData && this._bitmapData)
            {
                this._bitmapData.close();
            }

            this._bitmapData = null;
            this._ownsBitmapData = false;
            this._context.invalidate(this, null, 1);

            return;
        }

        const resourceManager = (this._context as unknown as {
            getResourceManager(): IResourceManager | null
        }).getResourceManager();

        if(resourceManager)
        {
            resourceManager.retrieveAsset(this._assetUri, this);
        }
    }

    public override get properties(): unknown[]
    {
        const props = super.properties;

        props.unshift(this.createProperty('asset_uri', this._assetUri));

        return props;
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            if(prop.key === 'asset_uri')
            {
                this.assetUri = (prop.value as string) ?? '';
            }
        }

        super.properties = value;
    }

    /**
	 * Callback from ResourceManager when the asset is loaded.
	 */
    public receiveAsset(bitmap: ImageBitmap, uri: string): void
    {
        if(this._disposed) return;

        const resourceManager = (this._context as unknown as {
            getResourceManager(): IResourceManager | null
        }).getResourceManager();

        if(resourceManager && !resourceManager.isSameAsset(this._assetUri, uri)) return;

        this._bitmapData = bitmap;
        this._ownsBitmapData = false;

        this.fitSize();
        this._context.invalidate(this, null, 1);
    }

    public override clone(): IWindow
    {
        const cloned = super.clone() as StaticBitmapWrapperController;

        if(this._assetUri)
        {
            cloned._assetUri = this._assetUri;
            cloned._ownsBitmapData = false;
        }

        return cloned;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        if(this._ownsBitmapData && this._bitmapData)
        {
            this._bitmapData.close();
            this._bitmapData = null;
        }

        this._ownsBitmapData = false;

        super.dispose();
    }
}
