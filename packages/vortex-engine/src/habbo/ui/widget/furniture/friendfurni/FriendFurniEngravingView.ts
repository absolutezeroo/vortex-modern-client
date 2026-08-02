import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {FriendFurniEngravingWidget} from './FriendFurniEngravingWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.friendfurni.FriendFurniEngravingView');

/**
 * FriendFurniEngravingView
 *
 * The plaque on a friendship furni: two names, a date, and the two avatars facing each
 * other. Subclasses differ only by which layout they open — the behaviour is all here.
 *
 * The stuff data is positional, and the positions are AS3's: 1 and 2 are the names, 3 and 4
 * the figures, 5 the date. Slot 0 is not read.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/friendfurni/FriendFurniEngravingView.as
 */
export class FriendFurniEngravingView implements IAvatarImageListener
{
    // AS3: .../friendfurni/FriendFurniEngravingView.as::FriendFurniEngravingView()
    constructor(widget: FriendFurniEngravingWidget, stuffData: StringArrayStuffData)
    {
        this._widget = widget;
        this._stuffData = stuffData;
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::_SafeStr_4549
    private _widget: FriendFurniEngravingWidget | null;

    // AS3: .../friendfurni/FriendFurniEngravingView.as::_SafeStr_6565
    private _stuffData: StringArrayStuffData | null;

    // AS3: .../friendfurni/FriendFurniEngravingView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../friendfurni/FriendFurniEngravingView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../friendfurni/FriendFurniEngravingView.as::get stuffData()
    protected get stuffData(): StringArrayStuffData | null
    {
        return this._stuffData;
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::get widget()
    protected get widget(): FriendFurniEngravingWidget | null
    {
        return this._widget;
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::open()
    public open(): void
    {
        this.createWindow();
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::close()
    public close(): void
    {
        this.destroyWindow();
    }

    /**
     * AS3 throws `IllegalOperationError` here — the base view is abstract and every concrete
     * one overrides it.
     */
    // AS3: .../friendfurni/FriendFurniEngravingView.as::assetName()
    protected assetName(): string
    {
        throw new Error('Must implement in concrete view!');
    }

    /**
     * The right-hand avatar is turned to direction 4 so the pair faces inwards; the left one
     * keeps the default. A figure still rendering comes back as a placeholder and is skipped
     * — `avatarImageReady()` fills it in when it arrives.
     */
    // AS3: .../friendfurni/FriendFurniEngravingView.as::createWindow()
    private createWindow(): void
    {
        if(this._window !== null || this._widget === null || this._stuffData === null) return;

        const asset = this._widget.assets?.getAssetByName(this.assetName()) as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn(`Missing engraving layout "${this.assetName()}"`);

            return;
        }

        this._window = this._widget.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.windowProc;
        this._window.center();

        const nameLeft = this._window.findChildByName('name_left');
        const nameRight = this._window.findChildByName('name_right');
        const date = this._window.findChildByName('date');

        if(nameLeft !== null) nameLeft.caption = this._stuffData.getValue(1);
        if(nameRight !== null) nameRight.caption = this._stuffData.getValue(2);
        if(date !== null) date.caption = this._stuffData.getValue(5);

        const renderManager = this._widget.engravingWidgetHandler?.container?.avatarRenderManager ?? null;

        if(renderManager === null) return;

        const leftImage = renderManager.createAvatarImage(this._stuffData.getValue(3), 'h', null, this, null);
        const rightImage = renderManager.createAvatarImage(this._stuffData.getValue(4), 'h', null, this, null);

        if(leftImage !== null && !leftImage.isPlaceholder())
        {
            this.setAvatarImage('avatar_left', leftImage.getCroppedImage('full') as ImageBitmap | null);
        }

        if(rightImage !== null && !rightImage.isPlaceholder())
        {
            rightImage.setDirection('full', 4);

            this.setAvatarImage('avatar_right', rightImage.getCroppedImage('full') as ImageBitmap | null);
        }
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::avatarImageReady()
    public avatarImageReady(figure: string): void
    {
        const renderManager = this._widget?.engravingWidgetHandler?.container?.avatarRenderManager ?? null;

        if(renderManager === null || this._stuffData === null) return;

        if(figure === this._stuffData.getValue(3))
        {
            const image = renderManager.createAvatarImage(figure, 'h', null, this, null);

            this.setAvatarImage('avatar_left', (image?.getCroppedImage('full') as ImageBitmap | null) ?? null);
        }

        if(figure === this._stuffData.getValue(4))
        {
            const image = renderManager.createAvatarImage(figure, 'h', null, this, null);

            image?.setDirection('full', 4);

            this.setAvatarImage('avatar_right', (image?.getCroppedImage('full') as ImageBitmap | null) ?? null);
        }
    }

    /**
     * AS3's `setElementImage()` allocates a bitmap the size of the slot and blits the avatar
     * into its centre, or hands a `Bitmap` to a display-object wrapper. This port assigns the
     * bitmap: compositing two `ImageBitmap`s needs a canvas round-trip for what is a centring
     * offset, and the layout sizes the slot to the avatar already.
     */
    // AS3: .../friendfurni/FriendFurniEngravingView.as::setAvatarImage()
    private setAvatarImage(name: string, bitmap: ImageBitmap | null): void
    {
        if(bitmap === null || this._window === null) return;

        const target = this._window.findChildByName(name) as IBitmapWrapperWindow | null;

        if(target === null || target.disposed) return;

        target.bitmap = bitmap;
        target.invalidate();
    }

    // AS3: .../friendfurni/FriendFurniEngravingView.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /** Closing goes through the widget, not the view — the widget owns which stuff id is open. */
    // AS3: .../friendfurni/FriendFurniEngravingView.as::windowProc()
    private windowProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(window?.name === 'header_button_close')
        {
            this._widget?.close(this._widget.stuffId);
        }
    };

    // AS3: .../friendfurni/FriendFurniEngravingView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.destroyWindow();

        this._widget = null;
        this._stuffData = null;
        this._disposed = true;
    }
}
