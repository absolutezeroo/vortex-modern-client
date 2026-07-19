import type {HabboToolbar} from '../HabboToolbar';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {FigureUpdateMessageParser} from '@habbo/communication/messages/parser/avatar/FigureUpdateMessageParser';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {FigureUpdateMessageEvent} from '@habbo/communication/messages/incoming/avatar/FigureUpdateMessageEvent';
import {AvatarRenderEvent} from '@habbo/avatar/enum/AvatarRenderEvent';
import {HabboFaceFocuser} from '@habbo/utils/HabboFaceFocuser';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuNewIconLoader');

/**
 * Icon loading for the new me menu variant
 *
 * Implements IAvatarImageListener. Listens for UserObjectEvent and
 * FigureUpdateEvent to update the me-menu avatar icon. Creates cropped
 * avatar images via AvatarRenderManager and sets them as the toolbar
 * icon bitmap.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as
 */
export class MeMenuNewIconLoader implements IAvatarImageListener
{
    private _toolbar: HabboToolbar | null;
    private _fullBitmap: ImageBitmap | null = null;
    private _userObjectEvent: UserObjectMessageEvent | null = null;
    private _figureUpdateEvent: FigureUpdateMessageEvent | null = null;
    private readonly _onAvatarRenderReady = (): void =>
    {
        this._currentFigure = '';
        this.setMeMenuToolbarIcon();
    };

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this._userObjectEvent = new UserObjectMessageEvent(this.onUserObjectEvent.bind(this));
        this._figureUpdateEvent = new FigureUpdateMessageEvent(this.onFigureUpdateEvent.bind(this));
        this._toolbar.communicationManager?.addHabboConnectionMessageEvent(this._userObjectEvent);
        this._toolbar.communicationManager?.addHabboConnectionMessageEvent(this._figureUpdateEvent);
        this._toolbar.avatarRenderManager?.events.on(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRenderReady);

        this.setMeMenuToolbarIcon();

        log.debug('MeMenuNewIconLoader constructed');
    }

    private _currentFigure: string = '';

    /**
	 * The current figure string being displayed
	 */
    get currentFigure(): string
    {
        return this._currentFigure;
    }

    /**
	 * Whether the loader is disposed
	 */
    get disposed(): boolean
    {
        return this._toolbar == null;
    }

    /**
	 * Called when the avatar image becomes ready (IAvatarImageListener)
	 *
	 * @param _key The avatar image key
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as avatarImageReady()
	 */
    public avatarImageReady(_key: string): void
    {
        this._currentFigure = '';
        this.setMeMenuToolbarIcon();
    }

    /**
	 * Handle user object event (initial login)
	 *
	 * @param figure The user's figure string
	 */
    public onUserObject(figure: string): void
    {
        this.setMeMenuToolbarIcon(figure);
    }

    /**
	 * Handle figure update event
	 *
	 * @param figure The new figure string
	 */
    public onFigureUpdate(figure: string): void
    {
        if(this.disposed) return;

        this.setMeMenuToolbarIcon(figure);
    }

    /**
	 * Dispose of this icon loader
	 *
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as dispose()
	 */
    public dispose(): void
    {
        if(this.disposed) return;

        if(this._userObjectEvent)
        {
            this._toolbar?.communicationManager?.removeHabboConnectionMessageEvent(this._userObjectEvent);
            this._userObjectEvent = null;
        }

        if(this._figureUpdateEvent)
        {
            this._toolbar?.communicationManager?.removeHabboConnectionMessageEvent(this._figureUpdateEvent);
            this._figureUpdateEvent = null;
        }

        this._toolbar?.avatarRenderManager?.events.off(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRenderReady);

        if(this._fullBitmap)
        {
            this._fullBitmap.close();
            this._fullBitmap = null;
        }

        this._toolbar = null;
    }

    private onUserObjectEvent(event: IMessageEvent): void
    {
        const parser = event.parser as UserObjectMessageParser;

        this.onUserObject(parser.figure);
    }

    private onFigureUpdateEvent(event: IMessageEvent): void
    {
        const parser = event.parser as FigureUpdateMessageParser;

        this.onFigureUpdate(parser.figure);
    }

    /**
	 * Render the avatar and set it as the toolbar icon bitmap.
	 *
	 * Uses AvatarRenderManager to create a cropped avatar image,
	 * converts it to ImageBitmap, and passes it to toolbar.setIconBitmap().
	 * If the avatar is taller than MAX_ICON_HEIGHT, crops from the top.
	 *
	 * @param figure Optional figure string override
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as setMeMenuToolbarIcon()
	 */
    private setMeMenuToolbarIcon(figure?: string): void
    {
        if(!this._toolbar) return;

        const avatarRenderManager = this._toolbar.avatarRenderManager;
        const currentFigure = figure ?? this._toolbar.sessionDataManager?.figure ?? '';

        if(!currentFigure) return;

        let faceBitmap: ImageBitmap | null = null;

        if(avatarRenderManager)
        {
            if(currentFigure !== this._currentFigure)
            {
                const gender = this._toolbar.sessionDataManager?.gender ?? '';
                const avatarImage = avatarRenderManager.createAvatarImage(currentFigure, 'h', gender, this, null);

                if(avatarImage)
                {
                    if(!avatarImage.isPlaceholder())
                    {
                        faceBitmap = HabboFaceFocuser.focusUserFace(avatarImage, 'full', 3, 1);
                    }

                    avatarImage.dispose();
                }

                this._currentFigure = currentFigure;

                if(this._fullBitmap)
                {
                    this._fullBitmap.close();
                }

                this._fullBitmap = faceBitmap;
            }
            else
            {
                faceBitmap = this._fullBitmap;
            }
        }

        if(!this._toolbar) return;

        let iconBitmap: ImageBitmap | null = null;

        if(faceBitmap)
        {
            iconBitmap = HabboFaceFocuser.cutCircleFromBitmap(faceBitmap, 20);
        }

        this._toolbar.setIconBitmap('HTIE_ICON_MEMENU', iconBitmap);
    }
}
