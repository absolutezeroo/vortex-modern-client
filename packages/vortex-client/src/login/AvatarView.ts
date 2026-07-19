/**
 * AvatarView
 *
 * @see sources/win63_2021_version/login/AvatarView.as
 * @see vortex-client/src/onBoardingHc/steps/OnBoardingHcStepAvatarSelect.as
 *
 * Avatar selection screen (SCREEN_AVATARS = 3).
 * Redesigned as a vertical list of character rows (name + small avatar icon +
 * a checkmark on the selected row) in the split-screen's right-hand column,
 * matching the modern habbo.com "Select a Character" screen — see
 * login-ui.scss header comment for why this replaced AS3's horizontal
 * thumbnail strip with glow/halo highlight bitmaps.
 *
 * Row thumbnails use AS3's original approach — a habbo-imaging HTTP endpoint
 * fetched via <img> — rather than client-side rendering through
 * avatarRenderManager. This was briefly replaced with client-side canvas
 * rendering because the emulator had no working habbo-imaging endpoint at
 * all; now that one exists (nitro-imager, proxied through the assets host —
 * see habbo.imaging.avatar.url in common_configuration_txt.txt), the
 * AS3-faithful approach is back and is simpler and lighter than composing a
 * full avatar client-side just for a 32px list icon.
 *
 * AS3 properties:
 * - _context: ILoginContext
 * - _SafeStr_4547: TextField (title)
 * - _saveButton: ColouredButton ("gfreen")
 * - _cancelButton: ColouredButton ("red")
 * - _SafeStr_527: Boolean (init guard)
 * - _SafeStr_1672: Vector.<AvatarData>
 * - _SafeStr_4550: int (selected index)
 * - _createButton: ColouredButton ("gfreen", "${login.select_avatar.create_avatar}")
 */
import type {ILoginContext} from './ILoginContext';
import type {AvatarData} from '@habbo/communication/login/AvatarData';

export class AvatarView
{
    private _context: ILoginContext;
    private _root: HTMLDivElement;

    /** AS3: _saveButton — ColouredButton("gfreen") */
    private _saveButton: HTMLButtonElement;

    /** AS3: _cancelButton — ColouredButton("red") */
    private _cancelButton: HTMLButtonElement;

    /** AS3: _createButton — ColouredButton("gfreen", "${login.select_avatar.create_avatar}") */
    private _createButton: HTMLButtonElement;

    /** AS3: _SafeStr_527 — init guard */
    private _SafeStr_527: boolean = false;

    /** AS3: _SafeStr_1672 — Vector.<AvatarData> */
    private _SafeStr_1672: AvatarData[] = [];

    /** AS3: _SafeStr_4550 — selected avatar index */
    private _SafeStr_4550: number = 0;

    private _listElement: HTMLDivElement | null = null;
    private _rowElements: HTMLButtonElement[] = [];

    private _disposed: boolean = false;

    /**
	 * AS3: AvatarView(_arg_1:ILoginContext)
	 */
    constructor(context: ILoginContext)
    {
        this._context = context;
        this._root = document.createElement('div');
        this._saveButton = document.createElement('button');
        this._cancelButton = document.createElement('button');
        this._createButton = document.createElement('button');
    }

    get element(): HTMLDivElement
    {
        return this._root;
    }

    /**
	 * AS3: init()
	 */
    public init(): void
    {
        if(this._SafeStr_527) return;

        this._SafeStr_527 = true;

        this.addTitleField();

        this._listElement = document.createElement('div');
        this._listElement.className = 'habbo-char-list';
        this._root.appendChild(this._listElement);

        this.addButtons();
    }

    /**
	 * AS3: addTitleField()
	 * Creates title: "${connection.login.account.choose}" — white 40px bold
	 */
    private addTitleField(): void
    {
        const title = document.createElement('div');

        title.className = 'habbo-title';
        // AS3: "${connection.login.account.choose}"
        title.textContent = 'Select a Character';
        this._root.appendChild(title);

        const subtitle = document.createElement('div');

        subtitle.className = 'habbo-subtitle-line';
        subtitle.textContent = 'Choose from your list of characters to play.';
        this._root.appendChild(subtitle);
    }

    /**
	 * AS3: addButtons()
	 */
    public addButtons(): void
    {
        const container = document.createElement('div');

        container.className = 'habbo-btn-row';

        // AS3: _cancelButton = new ColouredButton("red", "${generic.cancel}", ...)
        this._cancelButton.className = 'habbo-btn habbo-btn--red';
        this._cancelButton.textContent = 'Back';
        this._cancelButton.addEventListener('click', this._onCancel);
        container.appendChild(this._cancelButton);

        // AS3: _createButton = new ColouredButton("gfreen", "${login.select_avatar.create_avatar}", ...)
        this._createButton.className = 'habbo-link';
        this._createButton.textContent = 'Create a new character';
        this._createButton.addEventListener('click', this._onCreateAvatar);
        container.appendChild(this._createButton);

        // AS3: _saveButton = new ColouredButton("gfreen", "${connection.login.play}", ...)
        this._saveButton.className = 'habbo-btn habbo-btn--green habbo-btn--arrow';
        this._saveButton.textContent = 'Play!';
        // AS3: _saveButton.active = false
        this._saveButton.disabled = true;
        this._saveButton.addEventListener('click', this._onChooseAvatar);
        container.appendChild(this._saveButton);

        this._root.appendChild(container);
    }

    /**
	 * AS3: populateAvatars(_arg_1:Vector.<AvatarData>)
	 * Populates the character list.
	 */
    public populateAvatars(avatars: AvatarData[]): void
    {
        if(!this._listElement) return;

        for(const row of this._rowElements)
        {
            row.removeEventListener('click', this._onAvatarClick);
        }

        this._rowElements = [];
        this._listElement.innerHTML = '';
        this._SafeStr_1672 = avatars;

        avatars.forEach((avatar, index) =>
        {
            const row = document.createElement('button');

            row.className = 'habbo-char-row';
            row.dataset.index = String(index);

            const thumb = document.createElement('img');

            thumb.className = 'habbo-char-row__thumb';
            thumb.alt = '';
            thumb.draggable = false;
            thumb.src = this.getAvatarUrl(avatar);
            row.appendChild(thumb);

            const name = document.createElement('span');

            name.className = 'habbo-char-row__name';
            name.textContent = avatar.name;
            row.appendChild(name);

            const check = document.createElement('span');

            check.className = 'habbo-char-row__check';
            check.textContent = '✓';
            check.style.visibility = 'hidden';
            row.appendChild(check);

            row.addEventListener('click', this._onAvatarClick);
            this._listElement!.appendChild(row);
            this._rowElements.push(row);
        });

        this._SafeStr_4550 = 0;
        this._saveButton.disabled = avatars.length === 0;
        this.updateSelection();
    }

    /**
	 * AS3: onAvatarClick(_arg_1:MouseEvent)
	 */
    private _onAvatarClick = (e: Event): void =>
    {
        const target = e.currentTarget as HTMLButtonElement;

        this._SafeStr_4550 = parseInt(target.dataset.index ?? '0', 10);
        this._saveButton.disabled = false;
        this.updateSelection();
    };

    /**
	 * Highlights the selected row (AS3: hilightAvatar() positioned the glow/halo bitmaps;
	 * the list redesign just toggles a selected-row style instead).
	 */
    private updateSelection(): void
    {
        this._rowElements.forEach((row, index) =>
        {
            const selected = index === this._SafeStr_4550;

            row.classList.toggle('is-selected', selected);

            const check = row.querySelector<HTMLSpanElement>('.habbo-char-row__check');

            if(check)
            {
                check.style.visibility = selected ? 'visible' : 'hidden';
            }
        });
    }

    /**
	 * AS3: getAvatarUrl(_arg_1:AvatarData):String
	 * Builds the habbo-imaging URL for a small head-only avatar icon.
	 *
	 * AS3 branched on baseUrl containing "local"/"127.0.0.1" to fall back to
	 * real habbo.com, and used a "user="-keyed lookup against the live
	 * production imaging service otherwise. Neither branch applies here: our
	 * imaging service (nitro-imager) doesn't do server-side username lookups,
	 * so this always builds a "figure="-keyed URL against our own endpoint.
	 */
    private getAvatarUrl(avatar: AvatarData): string
    {
        const baseUrl = this._context.getProperty('habbo.imaging.avatar.url') ?? '/habbo-imaging/avatarimage';
        const params = new URLSearchParams({
            figure: avatar.figure,
            gender: avatar.gender || 'M',
            direction: '2',
            headonly: '1',
            size: 's',
        });

        return `${baseUrl}?${params.toString()}`;
    }

    /**
	 * AS3: onCancel(_arg_1:Button)
	 * Go back to Login screen.
	 */
    private _onCancel = (): void =>
    {
        this._context.showScreen(2);
    };

    /**
	 * AS3: onChooseAvatar(_arg_1:Button)
	 * Confirms avatar selection and triggers login.
	 */
    private _onChooseAvatar = (): void =>
    {
        if(this._SafeStr_1672.length > 0)
        {
            this._context.loginWithAvatar(this._SafeStr_1672[this._SafeStr_4550]);
        }
    };

    /**
	 * AS3: onCreateAvatar(createAvatarButton:Button) — OnBoardingHcStepAvatarSelect.as
	 * Go to the AvatarCreate screen.
	 */
    private _onCreateAvatar = (): void =>
    {
        this._context.showScreen(6);
    };

    /**
	 * AS3: dispose()
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        for(const row of this._rowElements)
        {
            row.removeEventListener('click', this._onAvatarClick);
        }

        this._cancelButton.removeEventListener('click', this._onCancel);
        this._saveButton.removeEventListener('click', this._onChooseAvatar);
        this._createButton.removeEventListener('click', this._onCreateAvatar);
        this._rowElements = [];
        this._SafeStr_1672.length = 0;
        this._root.remove();
    }
}
