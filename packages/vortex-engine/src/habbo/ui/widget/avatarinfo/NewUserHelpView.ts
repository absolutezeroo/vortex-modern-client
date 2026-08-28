import type {IWindowContainer} from '@core/window/IWindowContainer';
import {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

/**
 * The one-line "click yourself to get started" bubble a new player sees on entering their first
 * room, in place of the own-avatar menu.
 *
 * AS3 substitutes it for `OwnAvatarMenuView` while `RoomEnterEffect.isRunning()` — so it is not an
 * extra bubble, it is *the* bubble for the length of the entry effect. Its only content is one
 * caption, and its only behaviour is fading out after a config-set delay it takes in its
 * constructor rather than at setup.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/NewUserHelpView.as
 */
export class NewUserHelpView extends AvatarContextInfoButtonView
{
    // AS3: NewUserHelpView.as::_caption
    private _caption: string = '';

    // AS3: NewUserHelpView.as::NewUserHelpView()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);

        this._caption = widget.localizations?.getLocalization('room.enter.infostand.caption', '') ?? '';
        this._autoHideDelay = widget.configuration?.getInteger('room.enter.infostand.fade.start.delay', 5000) ?? 5000;
    }

    /**
     * AS3 declares this `setup(view, userId, userName, roomIndex, userType)` — five parameters where
     * every sibling takes six, because there is no data object to hand over.
     */
    // AS3: NewUserHelpView.as::setup()
    public static setup(
        view: AvatarContextInfoButtonView,
        userId: number,
        userName: string,
        roomIndex: number,
        userType: number
    ): void
    {
        AvatarContextInfoButtonView.setupButtonView(view, userId, userName, roomIndex, userType, false);
    }

    // AS3: NewUserHelpView.as::get widget()
    private get widget(): AvatarInfoWidget
    {
        return this._widget as AvatarInfoWidget;
    }

    // AS3: NewUserHelpView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        if(!this._window)
        {
            this._window = this.widget.windowManager?.buildWidgetLayout('new_user_help') as IWindowContainer | null ?? null;

            if(!this._window) return;

            const help = this._window.findChildByName('help');

            if(help) help.caption = this._caption;

            this._window.invalidate();
        }

        this.activeView = this._window;
    }
}
