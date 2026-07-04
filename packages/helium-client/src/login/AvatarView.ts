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
 * Row thumbnails are rendered with the client's own avatarRenderManager
 * (same mechanism as AvatarCreateView's preview) instead of AS3's
 * habbo-imaging HTTP endpoint — that endpoint is an external image-generation
 * service the emulator may not implement at all, whereas the render manager
 * is already loaded client-side and needs no server support beyond the
 * figure/asset data every other avatar-rendering feature already depends on.
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
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';

/** Extracts a drawable canvas source from an engine avatar image (a PixiJS Texture backed by an OffscreenCanvas). */
function extractCanvasSource(image: unknown): CanvasImageSource | null
{
	const source = (image as {source?: {resource?: unknown}} | null)?.source?.resource;

	if(source && typeof (source as {width?: unknown}).width === 'number')
	{
		return source as CanvasImageSource;
	}

	return null;
}

export class AvatarView implements IAvatarImageListener
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

	/** Canvas per row, keyed by figure string, so avatarImageReady() knows what to redraw. */
	private _canvasByFigure: Map<string, HTMLCanvasElement> = new Map();

	/**
	 * Avatar images still waiting on an async part download — kept alive so their
	 * avatarImageReady() callback still fires, disposed on the next populateAvatars()
	 * pass. Same leak/cascade concern as AvatarCreateView._pendingImages: an early
	 * return without dispose() here would leave the listener registered forever.
	 */
	private _pendingImages: any[] = [];

	public disposed: boolean = false;

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

		this.disposePendingImages();
		this._rowElements = [];
		this._canvasByFigure.clear();
		this._listElement.innerHTML = '';
		this._SafeStr_1672 = avatars;

		avatars.forEach((avatar, index) =>
		{
			const row = document.createElement('button');

			row.className = 'habbo-char-row';
			row.dataset.index = String(index);

			const thumb = document.createElement('canvas');

			thumb.className = 'habbo-char-row__thumb';
			thumb.width = 64;
			thumb.height = 64;
			row.appendChild(thumb);
			this._canvasByFigure.set(avatar.figure, thumb);
			this.renderRowThumbnail(avatar, thumb);

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
	 * Renders a head-only avatar icon into `canvas` using the client's own
	 * avatarRenderManager (AS3: getAvatarUrl() + habbo-imaging HTTP fetch).
	 */
	private renderRowThumbnail(avatar: AvatarData, canvas: HTMLCanvasElement): void
	{
		const renderManager = this._context.avatarRenderManager;

		if(!renderManager || !avatar.figure) return;

		const image = renderManager.createAvatarImage(avatar.figure, 'h', avatar.gender, this, null);

		if(!image) return;

		if(image.isPlaceholder())
		{
			// Not downloaded yet — keep it alive so avatarImageReady() fires once it is;
			// tracked so the *next* populateAvatars() pass disposes it instead of leaking it.
			this._pendingImages.push(image);

			return;
		}

		image.setDirection('head', 2);

		const texture = image.getImage('head', true, 0.5);
		const ctx = canvas.getContext('2d');
		const source = ctx ? extractCanvasSource(texture) : null;

		if(ctx && source)
		{
			const srcW = (source as {width: number}).width;
			const srcH = (source as {height: number}).height;

			if(srcW > 0 && srcH > 0)
			{
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				const scale = Math.min(canvas.width / srcW, canvas.height / srcH);
				const drawW = srcW * scale;
				const drawH = srcH * scale;

				ctx.drawImage(source, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH);
			}
		}

		image.dispose();
	}

	/**
	 * AS3: avatarImageReady(figure:String) — IAvatarImageListener
	 * Called when an async-downloaded figure part becomes available; redraws
	 * just the row(s) whose figure matches instead of rebuilding the whole list.
	 */
	public avatarImageReady(figureString: string): void
	{
		if(this.disposed) return;

		const canvas = this._canvasByFigure.get(figureString);
		const avatar = this._SafeStr_1672.find((a) => a.figure === figureString);

		if(canvas && avatar)
		{
			this.renderRowThumbnail(avatar, canvas);
		}
	}

	private disposePendingImages(): void
	{
		for(const image of this._pendingImages)
		{
			image.dispose();
		}

		this._pendingImages = [];
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
		if(this.disposed) return;

		this.disposed = true;

		for(const row of this._rowElements)
		{
			row.removeEventListener('click', this._onAvatarClick);
		}

		this.disposePendingImages();
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onChooseAvatar);
		this._createButton.removeEventListener('click', this._onCreateAvatar);
		this._rowElements = [];
		this._canvasByFigure.clear();
		this._SafeStr_1672.length = 0;
		this._root.remove();
	}
}
