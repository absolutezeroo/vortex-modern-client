import type {IAssetLibrary} from '@core/assets';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {Icon} from './Icon';

/**
 * MessengerIcon
 *
 * The messenger lamp. Simpler than its sibling: no hover animation, and disabling it
 * hides the canvas outright rather than dimming it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/utils/MessengerIcon.as
 */
export class MessengerIcon extends Icon
{
    // AS3: .../view/utils/MessengerIcon.as::NOTIFY_DELAY
    private static readonly NOTIFY_DELAY: number = 500;

    // AS3: .../view/utils/MessengerIcon.as::MessengerIcon()
    constructor(assets: IAssetLibrary, canvas: IBitmapWrapperWindow)
    {
        super();

        this._assets = assets;
        this.alignment = Icon.ALIGN_CENTER | Icon.ALIGN_MIDDLE;
        this.image = this.getImage('icon_messenger_png');
        this.canvas = canvas;
    }

    // AS3: .../view/utils/MessengerIcon.as::_assets
    private _assets: IAssetLibrary | null;

    /** Starts on frame 1, so the blink's first visible state is the lit one. */
    // AS3: .../view/utils/MessengerIcon.as::notify()
    override notify(notifying: boolean): void
    {
        super.notify(notifying);

        this.image = this.getImage(notifying ? 'icon_messenger_notify_1_png' : 'icon_messenger_png');
        this.toggleTimer(notifying, MessengerIcon.NOTIFY_DELAY);
    }

    // AS3: .../view/utils/MessengerIcon.as::hover()
    override hover(hover: boolean): void
    {
        super.hover(hover);
    }

    // AS3: .../view/utils/MessengerIcon.as::enable()
    override enable(enabled: boolean): void
    {
        super.enable(enabled);

        if(this.canvas !== null)
        {
            (this.canvas as unknown as {visible: boolean}).visible = enabled;
        }
    }

    // AS3: .../view/utils/MessengerIcon.as::onTimerEvent()
    protected override onTimerEvent(): void
    {
        if(this._notifying)
        {
            this._frame = this._frame === 1 ? 0 : 1;
            this.image = this.getImage(`icon_messenger_notify_${this._frame}_png`);
        }
    }

    private getImage(name: string): ImageBitmap | null
    {
        return (this._assets?.getAssetByName(name)?.content as ImageBitmap | null) ?? null;
    }

    // No dispose() override: unlike FriendListIcon, AS3's MessengerIcon does not declare
    // one and leaves `_assets` set. `Icon.dispose()` still stops the timer and drops the
    // image and canvas.
}
