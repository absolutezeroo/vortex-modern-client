/**
 * BreedPetView — the small "breed with this one" bubble raised over every eligible partner
 * after RWUAM_REQUEST_BREED_PET.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/BreedPetView.as
 *
 * One instance per candidate pet (AvatarInfoWidgetHandler::activateBreedMenuForPets builds the
 * list); clicking `breed` opens the monsterplant breeding confirmation for that pair and clears
 * every bubble of the round.
 *
 * AS3 adaptation: the window's WME_OVER/WME_OUT listeners become one `procedure`, as in the
 * other pet bubbles.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {UseProductItem} from '../events/UseProductItem';
import {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

// AS3: BreedPetView.as::MODE_NORMAL — the only mode resolveMode() ever produces.
const MODE_NORMAL: number = 0;

export class BreedPetView extends AvatarContextInfoButtonView
{
    private _mode: number = MODE_NORMAL;
    private _item: UseProductItem | null = null;
    private _canBreed: boolean = false;

    // AS3: BreedPetView.as::BreedPetView()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);
        this._autoHideEnabled = false;
    }

    // AS3: BreedPetView.as::setup()
    public static setup(
        view: BreedPetView,
        userId: number,
        userName: string,
        roomIndex: number,
        userType: number,
        item: UseProductItem,
        canBreed: boolean
    ): void
    {
        if(!view) return;

        view._item = item;
        view._canBreed = canBreed;

        AvatarContextInfoButtonView.setupButtonView(view, userId, userName, roomIndex, userType, false);
    }

    // AS3: BreedPetView.as::get objectId()
    public get objectId(): number
    {
        return this._item?.id ?? -1;
    }

    // AS3: BreedPetView.as::get requestRoomObjectId()
    public get requestRoomObjectId(): number
    {
        return this._item?.requestRoomObjectId ?? -1;
    }

    // AS3: BreedPetView.as::get widget()
    private get widget(): AvatarInfoWidget
    {
        return this._widget as AvatarInfoWidget;
    }

    // AS3: BreedPetView.as::resolveMode()
    // AS3 reads the room id and then unconditionally assigns MODE_NORMAL; the read has no
    // effect, so only the assignment is kept.
    private resolveMode(): void
    {
        this._mode = MODE_NORMAL;
    }

    // AS3: BreedPetView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        this.resolveMode();

        if(this.minimized)
        {
            const minimizedView = this.getMinimizedView();

            if(minimizedView) this.activeView = minimizedView;

            return;
        }

        if(!this._window)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('breed_pet_menu') as IWindowContainer | null;

            if(!this._window) return;

            this._window.procedure = this.windowProc;

            const minimize = this._window.findChildByName('minimize');

            if(minimize) minimize.procedure = this.onMinimize;
        }

        this._buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

        if(this._buttons) this._buttons.procedure = this.buttonEventProc;

        const nameWindow = this._window.findChildByName('name') as ITextWindow | null;

        if(nameWindow) nameWindow.caption = this._userName;

        this._window.visible = false;
        this.activeView = this._window;
        this.updateButtons();
    }

    // AS3: BreedPetView.as::updateButtons()
    public updateButtons(): void
    {
        if(!this._window || !this._buttons) return;

        this._buttons.autoArrangeItems = false;

        const count = this._buttons.numListItems;

        for(let i = 0; i < count; i++)
        {
            const item = this._buttons.getListItemAt(i);

            if(item) item.visible = false;
        }

        if(this._mode === MODE_NORMAL && this._canBreed)
        {
            this.showButton('breed');
        }

        this._buttons.autoArrangeItems = true;
        this._buttons.visible = true;
    }

    // AS3: BreedPetView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        let close = false;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'button' && window.parent?.name === 'breed' && this._item)
            {
                close = true;
                this.widget.showBreedMonsterPlantsConfirmationView(
                    this._item.requestRoomObjectId, this._item.targetRoomObjectId, false
                );
            }
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(close) this.widget.removeBreedPetViews();
    };

    // AS3: BreedPetView.as::updateWindow() — the WME_OVER/WME_OUT listeners on _window.
    private windowProc = (event: WindowEvent, window: IWindow): void =>
    {
        this.onMouseHoverEvent(event, window);
    };

    // AS3: BreedPetView.as::changeMode()
    private changeMode(mode: number): void
    {
        this._mode = mode;
        this.updateButtons();
    }

    // AS3: BreedPetView.as::dispose()
    public override dispose(): void
    {
        this._item?.dispose();
        this._item = null;

        super.dispose();
    }
}
