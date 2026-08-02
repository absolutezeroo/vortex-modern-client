/**
 * AvatarView
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/AvatarView.as
 *
 * The character picker (SCREEN_AVATARS = 3), shown when the account has more than one avatar. Up
 * to seven avatars are laid out in a row as habbo-imaging renders, with a glow and a halo bitmap
 * tracking the selected one and an information balloon underneath carrying its name and motto.
 *
 * Each avatar starts as `placeholder_avatar` with the remote image loading behind it; the
 * placeholder is removed when the image lands (`removeChildAt(0)`).
 */
import {Logger} from '@core/utils/Logger';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import type {DisplayObject} from '../onBoardingHcUi/display/DisplayObject';
import type {DisplayMouseEvent} from '../onBoardingHcUi/display/DisplayObject';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import type {ILoginContext} from './ILoginContext';
import {ImageLoader} from './ImageLoader';
import type {ImageLoaderEvent} from './ImageLoaderEvent';

const log = Logger.getLogger('client.login.AvatarView');

export class AvatarView extends Sprite
{
    // AS3: _context
    private _context: ILoginContext;

    // AS3: _titleField
    private _titleField: LocalizedTextField | null = null;

    // AS3: _saveButton
    private _saveButton: ColouredButton | null = null;

    // AS3: _cancelButton
    private _cancelButton: ColouredButton | null = null;

    // AS3: _initialized
    private _initialized: boolean = false;

    // AS3: _avatars
    private _avatars: AvatarData[] | null = null;

    // AS3: _spaceBetweenImages
    private _spaceBetweenImages: number = 10;

    // AS3: _baseUrl
    private _baseUrl: string = '';

    // AS3: _informationPanel
    private _informationPanel: Sprite | null = null;

    // AS3: _avatarMotto
    private _avatarMotto: LocalizedTextField | null = null;

    // AS3: _avatarName
    private _avatarName: LocalizedTextField | null = null;

    // AS3: _selectedIndex
    private _selectedIndex: number = 0;

    // AS3: _avatarImages
    private _avatarImages: Sprite[] = [];

    // AS3: _avatarHalo
    private _avatarHalo: Bitmap | null = null;

    // AS3: _avatarGlow
    private _avatarGlow: Bitmap | null = null;

    // AS3: AvatarView(_arg_1:ILoginContext)
    constructor(context: ILoginContext)
    {
        super();

        this._context = context;
        this.init();
        this.addEventListener('addedToStage', this._onAddedToStage);
    }

    // AS3: set baseUrl(_arg_1:String)
    public set baseUrl(value: string)
    {
        this._baseUrl = value;
    }

    /**
     * AS3: init()
     *
     * Resets the selection on every call — the guard below only protects the construction.
     */
    public init(): void
    {
        this._selectedIndex = 0;

        if(this._initialized) return;

        this._initialized = true;
        this._informationPanel = new Sprite();
        this.addChild(this._informationPanel);

        const balloon = LoaderUI.createBalloon(640, 100, 0, false, 995918, 'none');

        this._informationPanel.addChild(balloon);
        this._informationPanel.y = 180;
        this._avatarMotto = LoaderUI.createTextField('', 18, 8309486, false);
        this._avatarName = LoaderUI.createTextField('', 20, 16777215, false, true, false, false);
        this._avatarName.width = 260;
        this._avatarName.x = 50;
        this._avatarMotto.x = 50;
        this._avatarMotto.width = 260;
        this._informationPanel.addChild(this._avatarMotto);
        this._informationPanel.addChild(this._avatarName);
        LoaderUI.lineUpVertically(balloon, 15 - balloon.height, this._avatarName, 20, this._avatarMotto);

        this._avatarGlow = new Bitmap(LoginAssets.get('avatar_glow'));

        // AS3 blendMode "add" — Canvas2D spells additive blending "lighter".
        this._avatarGlow.blendMode = 'lighter';
        this._avatarGlow.visible = false;
        this._avatarHalo = new Bitmap(LoginAssets.get('avatar_halo'));
        this._avatarHalo.blendMode = 'overlay';
        this._avatarHalo.visible = false;
        this.addTitleField();
        this.addChild(this._avatarHalo);
        this.addChild(this._avatarGlow);
        this.addButtons();
    }

    // AS3: addButtons()
    public addButtons(): void
    {
        this._cancelButton = new ColouredButton(
            'red',
            '${generic.cancel}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onCancel,
            14211288
        );
        this.addChild(this._cancelButton);
        this._saveButton = new ColouredButton(
            'gfreen',
            '${connection.login.play}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onChooseAvatar,
            14211288
        );
        this._saveButton.active = false;
        this.addChild(this._saveButton);
    }

    /**
     * AS3: populateAvatars(_arg_1:Vector.<AvatarData>)
     *
     * Seven at most — AS3 breaks on `index > 6`.
     */
    public populateAvatars(avatars: AvatarData[]): void
    {
        this._avatarImages = [];
        this._avatars = avatars;

        let index = 0;

        for(const avatar of avatars)
        {
            if(index > 6) break;

            log.debug(`Adding avatar: ${avatar.name}`);

            const holder = new Sprite();
            const placeholder = new Bitmap(LoginAssets.get('placeholder_avatar'));
            const image = new Bitmap();

            this._avatarImages.push(holder);
            holder.addChild(placeholder);
            holder.addChild(image);
            this.addChild(holder);
            holder.name = String(index);
            holder.addEventListener('click', this._onAvatarClick);
            holder.x = (index + 1) * this._spaceBetweenImages + index * 100;
            holder.y = 50;
            ImageLoader.createLoader(image, this.getAvatarUrl(avatar), this._avatarImageLoadCompleteHandler);
            index++;
        }

        if(avatars.length > 0)
        {
            this.updateDescription();
            this._selectedIndex = 0;

            if(this._saveButton)
            {
                this._saveButton.active = true;
            }

            if(this._avatarGlow) this._avatarGlow.visible = true;

            if(this._avatarHalo) this._avatarHalo.visible = true;

            this.hilightAvatar(this._avatarImages[this._selectedIndex]);

            return;
        }

        if(this._saveButton)
        {
            this._saveButton.active = false;
        }
    }

    // AS3: addTitleField()
    private addTitleField(): void
    {
        if(this._titleField) return;

        this._titleField = LoaderUI.createTextField(
            '${connection.login.account.choose}',
            40,
            16777215,
            false,
            true,
            false,
            false,
            'left'
        );
        this._titleField.x = 0;
        this._titleField.y = 0;
        this._titleField.width = 500;
        this._titleField.multiline = false;
        this._titleField.thickness = 50;
        this.addChild(this._titleField);
    }

    /**
     * AS3: getAvatarUrl(_arg_1:AvatarData):String
     *
     * Against a local web API there is no imaging endpoint to hit, so AS3 falls back to
     * habbo.com's and renders the figure string instead of the user name.
     */
    private getAvatarUrl(avatar: AvatarData): string
    {
        let url = `${this._baseUrl}/habbo-imaging/avatarimage?user=${avatar.name}`;

        if(this._baseUrl.indexOf('local') > -1 || this._baseUrl.indexOf('127.0.0.1') > -1)
        {
            url = `https://www.habbo.com/habbo-imaging/avatarimage?size=m&figure=${avatar.figure}&direction=2`;
        }

        return url;
    }

    // AS3: updateDescription()
    private updateDescription(): void
    {
        if(this._avatars == null || this._avatars.length === 0) return;

        const avatar = this._avatars[this._selectedIndex];

        if(this._avatarName) this._avatarName.text = avatar.name;

        if(this._avatarMotto) this._avatarMotto.text = avatar.motto;
    }

    /**
     * AS3: hilightAvatar(_arg_1:DisplayObject)
     *
     * The glow sits centred on the avatar, the halo below its feet.
     */
    private hilightAvatar(target: DisplayObject | null): void
    {
        if(!target || !this._avatarGlow || !this._avatarHalo) return;

        const centreX = Math.trunc(target.x + target.width / 2);
        const centreY = Math.trunc(target.y + target.height / 2);

        this._avatarGlow.x = centreX - this._avatarGlow.width / 2;
        this._avatarGlow.y = centreY - this._avatarGlow.height / 2 + 15;
        this._avatarHalo.x = centreX - this._avatarHalo.width / 2;
        this._avatarHalo.y = centreY + this._avatarHalo.height - 40;
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        const timer = new Timer(20, 1);

        timer.addEventListener('timerComplete', this._onAlignElements);
        timer.start();
    };

    // AS3: onAlignElements(_arg_1:TimerEvent)
    private _onAlignElements = (): void =>
    {
        if(!this._saveButton || !this._cancelButton || !this._informationPanel) return;

        LoaderUI.lineUpVerticallyRevers(this._saveButton, 20, this._informationPanel);
        LoaderUI.alignAnchors(this._informationPanel, 0, 'r', this._saveButton);
        LoaderUI.lineUpHorizontallyRevers(this._saveButton, 20, this._cancelButton);
        log.debug(
            '(avatar) Information panel: '
            + `${[this._informationPanel.x, this._informationPanel.y, this._informationPanel.width, this._informationPanel.height]}`
        );
    };

    // AS3: onAvatarClick(_arg_1:MouseEvent)
    private _onAvatarClick = (event: DisplayMouseEvent): void =>
    {
        this._selectedIndex = parseInt(String(event.currentTarget?.name ?? '0'), 10);
        this.updateDescription();
        this.hilightAvatar(this._avatarImages[this._selectedIndex]);

        if(this._saveButton)
        {
            this._saveButton.active = true;
        }
    };

    /**
     * AS3: avatarImageLoadCompleteHandler(_arg_1:Event)
     *
     * `removeChildAt(0)` drops the placeholder now that the real image is under it.
     */
    private _avatarImageLoadCompleteHandler = (event: ImageLoaderEvent): void =>
    {
        event.loader.parent?.removeChildAt(0);

        if(this._avatarGlow) this._avatarGlow.visible = true;

        if(this._avatarHalo) this._avatarHalo.visible = true;

        this.hilightAvatar(this._avatarImages[this._selectedIndex]);
    };

    // AS3: onCancel(_arg_1:Button)
    private _onCancel = (): void =>
    {
        this._context.showScreen(2);
    };

    // AS3: onChooseAvatar(_arg_1:Button)
    private _onChooseAvatar = (): void =>
    {
        if(!this._avatars) return;

        this._context.loginWithAvatar(this._avatars[this._selectedIndex]);
    };

    // AS3: dispose()
    public dispose(): void
    {
        this._saveButton?.dispose();
        this._cancelButton?.dispose();
    }
}
