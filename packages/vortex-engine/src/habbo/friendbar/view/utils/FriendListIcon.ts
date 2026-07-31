import type {IAssetLibrary} from '@core/assets';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {Icon} from './Icon';

/**
 * FriendListIcon
 *
 * The friend-list lamp on the bar. Two animations share one timer: a 4-frame hover
 * cycle and a 2-frame notify blink, hover winning when both are on.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/utils/FriendListIcon.as
 */
export class FriendListIcon extends Icon
{
    /** **Name derived** from its use: the faster of the two delays, used on hover. */
    // AS3: .../view/utils/FriendListIcon.as::HOVER_DELAY
    private static readonly HOVER_DELAY: number = 200;

    // AS3: .../view/utils/FriendListIcon.as::NOTIFY_DELAY
    private static readonly NOTIFY_DELAY: number = 500;

    // AS3: .../view/utils/FriendListIcon.as::FriendListIcon()
    constructor(assets: IAssetLibrary, canvas: IBitmapWrapperWindow)
    {
        super();

        this._assets = assets;
        this.alignment = Icon.ALIGN_CENTER | Icon.ALIGN_MIDDLE;
        this.image = this.getImage('icon_friendlist_png');
        this.canvas = canvas;
    }

    // AS3: .../view/utils/FriendListIcon.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../view/utils/FriendListIcon.as::notify()
    override notify(notifying: boolean): void
    {
        super.notify(notifying);

        this.enable(notifying);
        this.toggleTimer(notifying || this._hover, this._hover ? FriendListIcon.HOVER_DELAY : FriendListIcon.NOTIFY_DELAY);

        if(!this._notifying && !this._hover)
        {
            this.image = this.getImage('icon_friendlist_png');
        }
    }

    // AS3: .../view/utils/FriendListIcon.as::hover()
    override hover(hover: boolean): void
    {
        super.hover(hover);

        this.toggleTimer(hover || this._notifying, this._hover ? FriendListIcon.HOVER_DELAY : FriendListIcon.NOTIFY_DELAY);

        if(!this._notifying && !this._hover)
        {
            this.image = this.getImage('icon_friendlist_png');
        }
    }

    /**
     * Verbatim from AS3, quirk included: the override never calls `super.enable()` and
     * ignores its argument — it re-reads the *existing* `disabled` flag and only dims
     * the canvas. So this icon's disabled state is only ever changed by
     * `Icon.notify()`'s force-enable, never by a caller passing false.
     */
    // AS3: .../view/utils/FriendListIcon.as::enable()
    override enable(_enabled: boolean): void
    {
        if(this.canvas !== null)
        {
            (this.canvas as unknown as {blend: number}).blend = this.disabled ? 0.5 : 1;
        }
    }

    // AS3: .../view/utils/FriendListIcon.as::onTimerEvent()
    protected override onTimerEvent(): void
    {
        if(this._hover)
        {
            this._frame = ++this._frame % 4;
            this.image = this.getImage(`icon_friendlist_hover_${this._frame}_png`);
        }
        else if(this._notifying)
        {
            this._frame = ++this._frame % 2;
            this.image = this.getImage(`icon_friendlist_notify_${this._frame}_png`);
        }
    }

    private getImage(name: string): ImageBitmap | null
    {
        return (this._assets?.getAssetByName(name)?.content as ImageBitmap | null) ?? null;
    }

    // AS3: .../view/utils/FriendListIcon.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._assets = null;

        super.dispose();
    }
}
