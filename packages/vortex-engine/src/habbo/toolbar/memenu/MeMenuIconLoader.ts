import type {HabboToolbar} from '../HabboToolbar';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserChangeMessageEventParser} from '@habbo/communication/messages/parser/room/action/UserChangeMessageEventParser';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserChangeMessageEvent} from '@habbo/communication/messages/incoming/room/action/UserChangeMessageEvent';
import {AvatarRenderEvent} from '@habbo/avatar/enum/AvatarRenderEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuIconLoader');

/**
 * Icon loading for the legacy me menu
 *
 * In AS3 this implements IAvatarImageListener, listens for UserObjectEvent
 * and UserChangeMessageEvent to update the me-menu avatar icon. Creates
 * cropped avatar images and sets them as the toolbar icon bitmap.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuIconLoader.as
 */
export class MeMenuIconLoader implements IAvatarImageListener
{
    private static readonly MAX_ICON_HEIGHT: number = 50;
    private static readonly HEAD_MARGIN: number = 3;

    private _toolbar: HabboToolbar | null;
    private _fullBitmap: ImageBitmap | null = null;
    private _headBitmap: ImageBitmap | null = null;
    private _userObjectEvent: UserObjectMessageEvent | null = null;
    private _userChangeEvent: UserChangeMessageEvent | null = null;
    private readonly _onAvatarRenderReady = (): void =>
    {
        this._currentFigure = '';
        this.setMeMenuToolbarIcon();
    };

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this._userObjectEvent = new UserObjectMessageEvent(this.onUserObjectEvent.bind(this));
        this._userChangeEvent = new UserChangeMessageEvent(this.onUserChangeEvent.bind(this));
        this._toolbar.communicationManager?.addHabboConnectionMessageEvent(this._userObjectEvent);
        this._toolbar.communicationManager?.addHabboConnectionMessageEvent(this._userChangeEvent);
        this._toolbar.avatarRenderManager?.events.on(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRenderReady);

        this.setMeMenuToolbarIcon();

        log.debug('MeMenuIconLoader constructed');
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
	 * Called when the avatar image becomes ready
	 *
	 * @param _key The avatar image key
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
	 * Handle user change event (figure change in room)
	 *
	 * @param id The user id (-1 means own user)
	 * @param figure The new figure string
	 */
    public onUserChange(id: number, figure: string): void
    {
        if(id === -1)
        {
            this.setMeMenuToolbarIcon(figure);
        }
    }

    /**
	 * Dispose of this icon loader
	 */
    public dispose(): void
    {
        if(this.disposed) return;

        if(this._userObjectEvent)
        {
            this._toolbar?.communicationManager?.removeHabboConnectionMessageEvent(this._userObjectEvent);
            this._userObjectEvent = null;
        }

        if(this._userChangeEvent)
        {
            this._toolbar?.communicationManager?.removeHabboConnectionMessageEvent(this._userChangeEvent);
            this._userChangeEvent = null;
        }

        this._toolbar?.avatarRenderManager?.events.off(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRenderReady);

        if(this._fullBitmap)
        {
            this._fullBitmap.close();
            this._fullBitmap = null;
        }

        if(this._headBitmap)
        {
            this._headBitmap.close();
            this._headBitmap = null;
        }

        this._toolbar = null;
    }

    private onUserObjectEvent(event: IMessageEvent): void
    {
        const parser = event.parser as UserObjectMessageParser;

        this.onUserObject(parser.figure);
    }

    private onUserChangeEvent(event: IMessageEvent): void
    {
        const parser = event.parser as UserChangeMessageEventParser;

        this.onUserChange(parser.id, parser.figure);
    }

    private setMeMenuToolbarIcon(figure?: string): void
    {
        if(!this._toolbar) return;

        const avatarRenderManager = this._toolbar.avatarRenderManager;
        const currentFigure = figure ?? this._toolbar.sessionDataManager?.figure ?? '';

        let fullBitmap: ImageBitmap | null = null;
        let headBitmap: ImageBitmap | null = null;

        if(avatarRenderManager)
        {
            if(currentFigure !== this._currentFigure)
            {
                const gender = this._toolbar.sessionDataManager?.gender ?? '';
                const avatarImage = avatarRenderManager.createAvatarImage(currentFigure, 'h', gender, this, null);

                if(avatarImage)
                {
                    avatarImage.setDirection('full', 2);

                    const fullTexture = avatarImage.getCroppedImage('full');
                    const headTexture = avatarImage.getCroppedImage('head');

                    if(fullTexture?.source?.resource instanceof OffscreenCanvas)
                    {
                        fullBitmap = this.offscreenToImageBitmap(fullTexture.source.resource);
                    }

                    if(headTexture?.source?.resource instanceof OffscreenCanvas)
                    {
                        headBitmap = this.offscreenToImageBitmap(headTexture.source.resource);
                    }

                    avatarImage.dispose();
                }

                this._currentFigure = currentFigure;

                if(this._fullBitmap)
                {
                    this._fullBitmap.close();
                }

                this._fullBitmap = fullBitmap;

                if(this._headBitmap)
                {
                    this._headBitmap.close();
                }

                this._headBitmap = headBitmap;
            }
            else
            {
                fullBitmap = this._fullBitmap;
                headBitmap = this._headBitmap;
            }
        }

        if(!this._toolbar) return;

        let iconBitmap: ImageBitmap | null = null;

        if(fullBitmap && headBitmap)
        {
            if(fullBitmap.height > MeMenuIconLoader.MAX_ICON_HEIGHT)
            {
                const cropped = new OffscreenCanvas(fullBitmap.width, MeMenuIconLoader.MAX_ICON_HEIGHT);
                const ctx = cropped.getContext('2d')!;
                let sy = 0;

                if(headBitmap.height > MeMenuIconLoader.MAX_ICON_HEIGHT - MeMenuIconLoader.HEAD_MARGIN)
                {
                    sy = headBitmap.height - MeMenuIconLoader.MAX_ICON_HEIGHT + MeMenuIconLoader.HEAD_MARGIN;
                }

                ctx.drawImage(
                    fullBitmap,
                    0, sy, fullBitmap.width, MeMenuIconLoader.MAX_ICON_HEIGHT,
                    0, 0, fullBitmap.width, MeMenuIconLoader.MAX_ICON_HEIGHT
                );

                iconBitmap = this.offscreenToImageBitmap(cropped);
            }
            else
            {
                iconBitmap = this.cloneImageBitmap(fullBitmap);
            }
        }

        this._toolbar.setIconBitmap('HTIE_ICON_MEMENU', iconBitmap);
    }

    private offscreenToImageBitmap(canvas: OffscreenCanvas): ImageBitmap | null
    {
        try
        {
            return canvas.transferToImageBitmap();
        }
        catch
        {
            return null;
        }
    }

    private cloneImageBitmap(bitmap: ImageBitmap): ImageBitmap | null
    {
        try
        {
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(bitmap, 0, 0);
            return canvas.transferToImageBitmap();
        }
        catch
        {
            return null;
        }
    }
}
