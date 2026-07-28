/**
 * TrophyView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/TrophyView.as
 *
 * The ordinary engraved-trophy frame: a tinted background plate, a themed header, and the
 * three engraving fields. Used for every view type except the two Niko ones.
 */
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ITrophyFurniWidget} from './ITrophyFurniWidget';
import type {ITrophyView} from './ITrophyView';
import {TrophyTheme} from './TrophyTheme';

export class TrophyView implements ITrophyView
{
    private _widget: ITrophyFurniWidget | null;
    private _window: IWindowContainer | null = null;

    // AS3: TrophyView.as::TrophyView()
    constructor(widget: ITrophyFurniWidget)
    {
        this._widget = widget;
    }

    /**
     * AS3: TrophyView.as::showInterface()
     *
     * AS3 resolves the layout itself (`assets.getAssetByName("trophy")` -> `XmlAsset` ->
     * `windowManager.buildFromXML()`); this port's window manager owns that lookup, so the
     * two steps collapse into `buildWidgetLayout('trophy')`. The `false` return on a missing
     * asset is preserved — it is the only way the caller learns the frame never opened.
     */
    public showInterface(): boolean
    {
        if(!this._widget) return false;

        if(this._window === null)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('trophy') as IWindowContainer | null;

            if(this._window === null) return false;
        }

        this._window.center();

        const close = this._window.findChildByName('close');

        if(close !== null) close.procedure = this.onMouseEvent;

        const titleBg = this._window.findChildByName('title_bg');

        if(titleBg !== null) titleBg.color = this._widget.headerColor;

        const title = this._window.findChildByName('title') as ITextWindow | null;

        if(title !== null) title.text = this._widget.frameTitle;

        const greeting = this._window.findChildByName('greeting') as ITextWindow | null;

        // AS3 replaces a literal backslash-r sequence, not a carriage return: the engraving
        // arrives from the wire with "\r" written out as two characters.
        if(greeting !== null) greeting.text = this._widget.message.replace(/\\r/g, '\n');

        const date = this._window.findChildByName('date') as ITextWindow | null;

        if(date !== null) date.text = this._widget.date;

        const name = this._window.findChildByName('name') as ITextWindow | null;

        if(name !== null) name.text = this._widget.name;

        const asset = this._widget.assets?.getAssetByName(
            TrophyTheme.getBackgroundAssetName(this._widget.backgroundTheme)
        ) as BitmapDataAsset | null;

        const background = this._window.findChildByName('trophy_bg') as IBitmapWrapperWindow | null;

        // AS3 tints the plate before checking the asset, so an unresolved bitmap still leaves
        // the colour applied.
        if(background !== null) background.color = this._widget.color;

        const content = asset?.content as ImageBitmap | null;

        if(content && background !== null)
        {
            background.bitmap = content;
        }

        return true;
    }

    // AS3: TrophyView.as::disposeInterface()
    public disposeInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: TrophyView.as::onMouseEvent()
    private onMouseEvent = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.disposeInterface();
        }
    };

    // AS3: TrophyView.as::dispose()
    public dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._widget = null;
    }
}
