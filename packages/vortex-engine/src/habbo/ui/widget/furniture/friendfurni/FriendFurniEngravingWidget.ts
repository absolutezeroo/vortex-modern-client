import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {FriendFurniEngravingWidgetHandler} from '@habbo/ui/handler/FriendFurniEngravingWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {FriendFurniEngravingView} from './FriendFurniEngravingView';
import {HabboweenEngravingView} from './HabboweenEngravingView';
import {LoveLockEngravingView} from './LoveLockEngravingView';
import {WildWestEngravingView} from './WildWestEngravingView';

/**
 * FriendFurniEngravingWidget
 *
 * Picks which plaque to show from the furni's engraving type — 0 love lock, 3 wild west,
 * 4 Habboween — and owns the one view that is open at a time.
 *
 * `close()` takes a stuff id rather than closing unconditionally: a second engraving opening
 * must not close the first from under it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/friendfurni/FriendFurniEngravingWidget.as
 */
export class FriendFurniEngravingWidget extends RoomWidgetBase
{
    /** Engraving type ids, as `furniture_friendfurni_engraving_type` carries them. */
    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::open() case 0
    private static readonly ENGRAVING_TYPE_LOVE_LOCK: number = 0;

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::open() case 3
    private static readonly ENGRAVING_TYPE_WILD_WEST: number = 3;

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::open() case 4
    private static readonly ENGRAVING_TYPE_HABBOWEEN: number = 4;

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::FriendFurniEngravingWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        if(this.engravingWidgetHandler !== null)
        {
            this.engravingWidgetHandler.widget = this;
        }
    }

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::_stuffId
    private _stuffId: number = -1;

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::_SafeStr_5500
    private _view: FriendFurniEngravingView | null = null;

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::get stuffId()
    public get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::get engravingWidgetHandler()
    public get engravingWidgetHandler(): FriendFurniEngravingWidgetHandler | null
    {
        return this.widgetHandler as FriendFurniEngravingWidgetHandler | null;
    }

    /**
     * An unknown engraving type leaves `_view` null in AS3 and then dereferences it — ported
     * with the guard, since the effect either way is "nothing opens".
     */
    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::open()
    public open(stuffId: number, engravingType: number, stuffData: StringArrayStuffData): void
    {
        this.close(this._stuffId);

        this._stuffId = stuffId;

        switch(engravingType)
        {
            case FriendFurniEngravingWidget.ENGRAVING_TYPE_LOVE_LOCK:
                this._view = new LoveLockEngravingView(this, stuffData);
                break;
            case FriendFurniEngravingWidget.ENGRAVING_TYPE_WILD_WEST:
                this._view = new WildWestEngravingView(this, stuffData);
                break;
            case FriendFurniEngravingWidget.ENGRAVING_TYPE_HABBOWEEN:
                this._view = new HabboweenEngravingView(this, stuffData);
                break;
        }

        this._view?.open();
    }

    // AS3: .../friendfurni/FriendFurniEngravingWidget.as::close()
    public close(stuffId: number): void
    {
        if(stuffId === this._stuffId && this._view !== null)
        {
            this._view.dispose();
            this._view = null;
            this._stuffId = -1;
        }
    }

    // TS-only: AS3 leaves the base class's dispose(); the open view has to go with it.
    public override dispose(): void
    {
        if(this.disposed) return;

        this._view?.dispose();
        this._view = null;

        super.dispose();
    }
}
