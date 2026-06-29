/**
 * AvatarView
 *
 * @see sources/win63_2021_version/login/AvatarView.as
 *
 * Avatar selection screen (SCREEN_AVATARS = 3).
 * Displays up to 7 avatar thumbnails loaded from habbo-imaging API.
 * User selects an avatar and confirms to proceed with login.
 *
 * AS3 embeds: avatar_halo_png, avatar_glow_png, placeholder_avatar
 *
 * AS3 properties:
 * - _context: ILoginContext
 * - _SafeStr_4547: TextField (title)
 * - _saveButton: ColouredButton ("gfreen")
 * - _cancelButton: ColouredButton ("red")
 * - _SafeStr_527: Boolean (init guard)
 * - _SafeStr_1672: Vector.<AvatarData>
 * - _SafeStr_4548: int = 10 (spacing)
 * - _SafeStr_3305: String (baseUrl)
 * - _SafeStr_4549: Sprite (info panel)
 * - _avatarDescription: TextField (motto)
 * - _avatarName: TextField (name)
 * - _SafeStr_4550: int (selected index)
 * - _SafeStr_4551: Vector.<DisplayObjectContainer> (avatar containers)
 * - _SafeStr_4552: Bitmap (halo, blendMode="overlay")
 * - _avatarGlow: Bitmap (glow, blendMode="add")
 */
import type {ILoginContext} from './ILoginContext';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import placeholderUrl from '../assets/images/placeholder_avatar.png';
import haloUrl from '../assets/images/avatar_halo.png';
import glowUrl from '../assets/images/avatar_glow.png';

export class AvatarView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;

	/** AS3: _SafeStr_4547 — title TextField */
	private _SafeStr_4547: HTMLDivElement | null = null;

	/** AS3: _saveButton — ColouredButton("gfreen") */
	private _saveButton: HTMLButtonElement;

	/** AS3: _cancelButton — ColouredButton("red") */
	private _cancelButton: HTMLButtonElement;

	/** AS3: _SafeStr_527 — init guard */
	private _SafeStr_527: boolean = false;

	/** AS3: _SafeStr_1672 — Vector.<AvatarData> */
	private _SafeStr_1672: AvatarData[] = [];

	/** AS3: _SafeStr_4548 = 10 (spacing) */
	private _SafeStr_4548: number = 10;

	/** AS3: _SafeStr_3305 — base URL for habbo-imaging */
	private _SafeStr_3305: string = '';

	/** AS3: _SafeStr_4549 — info panel Sprite */
	private _SafeStr_4549: HTMLDivElement | null = null;

	/** AS3: _avatarDescription — TextField (motto) */
	private _avatarDescription: HTMLDivElement | null = null;

	/** AS3: _avatarName — TextField (name) */
	private _avatarName: HTMLDivElement | null = null;

	/** AS3: _SafeStr_4550 — selected avatar index */
	private _SafeStr_4550: number = 0;

	/** AS3: _SafeStr_4551 — Vector.<DisplayObjectContainer> */
	private _SafeStr_4551: HTMLDivElement[] = [];

	/** AS3: _SafeStr_4552 — halo bitmap (blendMode="overlay") */
	private _SafeStr_4552: HTMLImageElement | null = null;

	/** AS3: _avatarGlow — glow bitmap (blendMode="add") */
	private _avatarGlow: HTMLImageElement | null = null;

	private _disposed: boolean = false;

	/**
	 * AS3: AvatarView(_arg_1:ILoginContext)
	 */
	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		Object.assign(this._root.style, {
			position: 'relative',
		} as Partial<CSSStyleDeclaration>);
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
	}

	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * AS3: set baseUrl(_arg_1:String)
	 */
	set baseUrl(value: string)
	{
		this._SafeStr_3305 = value;
	}

	/**
	 * AS3: init()
	 */
	public init(): void
	{
		this._SafeStr_4550 = 0;

		if(this._SafeStr_527) return;

		this._SafeStr_527 = true;

		// AS3: _SafeStr_4549 = new Sprite(); addChild(_SafeStr_4549)
		this._SafeStr_4549 = document.createElement('div');
		Object.assign(this._SafeStr_4549.style, {
			marginTop: '10px',
			padding: '12px 16px',
			background: 'rgba(0, 0, 0, 0.3)',
			borderRadius: '8px',
			minWidth: '260px',
			display: 'none',
		} as Partial<CSSStyleDeclaration>);

		// AS3: _avatarName = LoaderUI.createTextField("", 20, 0xFFFFFF, false, true, false, false)
		this._avatarName = document.createElement('div');
		Object.assign(this._avatarName.style, {
			fontSize: '20px',
			fontWeight: 'bold',
			color: '#FFFFFF',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
			width: '260px',
		} as Partial<CSSStyleDeclaration>);

		// AS3: _avatarDescription = LoaderUI.createTextField("", 18, 8309486, false)
		// 8309486 = 0x7EAD6E
		this._avatarDescription = document.createElement('div');
		Object.assign(this._avatarDescription.style, {
			fontSize: '18px',
			color: '#7EAD6E',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
			width: '260px',
			marginTop: '4px',
		} as Partial<CSSStyleDeclaration>);

		this._SafeStr_4549.appendChild(this._avatarName);
		this._SafeStr_4549.appendChild(this._avatarDescription);
		this._root.appendChild(this._SafeStr_4549);

		// AS3: _avatarGlow = new avatar_glow_png(); _avatarGlow.blendMode = "add"
		this._avatarGlow = document.createElement('img');
		this._avatarGlow.src = glowUrl;
		this._avatarGlow.draggable = false;
		Object.assign(this._avatarGlow.style, {
			position: 'absolute',
			pointerEvents: 'none',
			// AS3: blendMode = "add" → closest CSS: mix-blend-mode: screen
			mixBlendMode: 'screen',
			display: 'none',
			zIndex: '5',
		} as Partial<CSSStyleDeclaration>);

		// AS3: _SafeStr_4552 = new avatar_halo_png(); _SafeStr_4552.blendMode = "overlay"
		this._SafeStr_4552 = document.createElement('img');
		this._SafeStr_4552.src = haloUrl;
		this._SafeStr_4552.draggable = false;
		Object.assign(this._SafeStr_4552.style, {
			position: 'absolute',
			pointerEvents: 'none',
			mixBlendMode: 'overlay',
			display: 'none',
			zIndex: '4',
		} as Partial<CSSStyleDeclaration>);

		// AS3: addTitleField()
		this.addTitleField();

		// AS3: addChild(_SafeStr_4552); addChild(_avatarGlow)
		this._root.appendChild(this._SafeStr_4552);
		this._root.appendChild(this._avatarGlow);

		// AS3: addButtons()
		this.addButtons();
	}

	/**
	 * AS3: addTitleField()
	 * Creates title: "${connection.login.account.choose}" — white 40px bold
	 */
	private addTitleField(): void
	{
		if(!this._SafeStr_4547)
		{
			this._SafeStr_4547 = document.createElement('div');
			Object.assign(this._SafeStr_4547.style, {
				fontSize: '40px',
				fontWeight: 'bold',
				color: '#FFFFFF',
				fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
				width: '500px',
				textAlign: 'left',
				marginBottom: '10px',
				textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
			} as Partial<CSSStyleDeclaration>);
			// AS3: "${connection.login.account.choose}"
			this._SafeStr_4547.textContent = 'Choose your character';
			this._root.appendChild(this._SafeStr_4547);
		}
	}

	/**
	 * AS3: addButtons()
	 */
	public addButtons(): void
	{
		const container = document.createElement('div');

		Object.assign(container.style, {
			display: 'flex',
			gap: '12px',
			marginTop: '24px',
		} as Partial<CSSStyleDeclaration>);

		const btnStyle: Partial<CSSStyleDeclaration> = {
			display: 'inline-block',
			minWidth: '140px',
			height: '44px',
			padding: '0 24px',
			border: 'none',
			borderRadius: '6px',
			fontSize: '18px',
			fontWeight: 'bold',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
			cursor: 'pointer',
			textAlign: 'center',
			lineHeight: '44px',
		};

		// AS3: _cancelButton = new ColouredButton("red", "${generic.cancel}", ...)
		Object.assign(this._cancelButton.style, { ...btnStyle, background: '#E53935', color: '#FFFFFF' });
		this._cancelButton.textContent = 'Cancel';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// AS3: _saveButton = new ColouredButton("gfreen", "${connection.login.play}", ...)
		Object.assign(this._saveButton.style, { ...btnStyle, background: '#4CAF50', color: '#FFFFFF' });
		this._saveButton.textContent = 'Play';
		// AS3: _saveButton.active = false
		this._saveButton.disabled = true;
		this._saveButton.addEventListener('click', this._onChooseAvatar);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * AS3: populateAvatars(_arg_1:Vector.<AvatarData>)
	 * Populates the avatar grid with up to 7 avatars.
	 */
	public populateAvatars(avatars: AvatarData[]): void
	{
		// Clear existing
		for(const item of this._SafeStr_4551)
		{
			item.removeEventListener('click', this._onAvatarClick);
			item.remove();
		}

		this._SafeStr_4551.length = 0;
		this._SafeStr_1672 = avatars;

		// AS3: max 7 avatars (if _local_6 > 6 break)
		let index = 0;

		for(const avatar of avatars)
		{
			if(index > 6) break;

			const container = document.createElement('div');

			// AS3: _local_2 = ((_local_6 + 1) * _SafeStr_4548) + (_local_6 * 100)
			const xPos = ((index + 1) * this._SafeStr_4548) + (index * 100);

			Object.assign(container.style, {
				position: 'absolute',
				left: xPos + 'px',
				top: '50px',
				width: '100px',
				height: '130px',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: '8px',
				background: 'rgba(0, 0, 0, 0.2)',
			} as Partial<CSSStyleDeclaration>);
			container.dataset.index = String(index);

			// Placeholder image
			const placeholder = document.createElement('img');

			placeholder.src = placeholderUrl;
			placeholder.alt = avatar.name;
			placeholder.draggable = false;
			Object.assign(placeholder.style, {
				maxWidth: '90px',
				maxHeight: '120px',
				objectFit: 'contain',
				pointerEvents: 'none',
			} as Partial<CSSStyleDeclaration>);
			container.appendChild(placeholder);

			// Load avatar image from habbo-imaging
			const avatarImg = document.createElement('img');

			avatarImg.style.position = 'absolute';
			avatarImg.style.top = '0';
			avatarImg.style.left = '0';
			avatarImg.style.width = '100%';
			avatarImg.style.height = '100%';
			avatarImg.style.objectFit = 'contain';
			avatarImg.draggable = false;

			const url = this.getAvatarUrl(avatar);

			avatarImg.src = url;

			// AS3: avatarImageLoadCompleteHandler removes placeholder at index 0
			avatarImg.onload = (): void =>
			{
				if(placeholder.parentNode)
				{
					placeholder.remove();
				}

				// AS3: show glow/halo and re-highlight
				if(this._avatarGlow) this._avatarGlow.style.display = '';
				if(this._SafeStr_4552) this._SafeStr_4552.style.display = '';
				this.hilightAvatar(this._SafeStr_4551[this._SafeStr_4550]);
			};

			avatarImg.onerror = (): void =>
			{
				avatarImg.remove();
			};

			container.appendChild(avatarImg);
			container.addEventListener('click', this._onAvatarClick);

			// Insert before info panel
			if(this._SafeStr_4549)
			{
				this._root.insertBefore(container, this._SafeStr_4549);
			}
			else
			{
				this._root.appendChild(container);
			}

			this._SafeStr_4551.push(container);
			index++;
		}

		if(avatars.length > 0)
		{
			this.updateDescription();
			this._SafeStr_4550 = 0;
			this._saveButton.disabled = false;

			// AS3: _avatarGlow.visible = true; _SafeStr_4552.visible = true
			if(this._avatarGlow) this._avatarGlow.style.display = '';
			if(this._SafeStr_4552) this._SafeStr_4552.style.display = '';
			this.hilightAvatar(this._SafeStr_4551[this._SafeStr_4550]);

			// Show info panel
			if(this._SafeStr_4549) this._SafeStr_4549.style.display = '';
		}
		else
		{
			this._saveButton.disabled = true;
		}
	}

	/**
	 * AS3: onAvatarClick(_arg_1:MouseEvent)
	 */
	private _onAvatarClick = (e: Event): void =>
	{
		const target = e.currentTarget as HTMLDivElement;
		const index = parseInt(target.dataset.index ?? '0', 10);

		this._SafeStr_4550 = index;
		this.updateDescription();
		this.hilightAvatar(this._SafeStr_4551[this._SafeStr_4550]);
		this._saveButton.disabled = false;
	};

	/**
	 * AS3: hilightAvatar(_arg_1:DisplayObject)
	 * Positions glow and halo centered on the selected avatar container.
	 */
	private hilightAvatar(container: HTMLDivElement | undefined): void
	{
		if(!container) return;

		const containerX = parseInt(container.style.left, 10) || 0;
		const containerY = parseInt(container.style.top, 10) || 0;
		const containerW = container.offsetWidth || 100;
		const containerH = container.offsetHeight || 130;

		// AS3: _local_2 = int(_arg_1.x + (_arg_1.width / 2))
		const centerX = containerX + (containerW / 2);
		const centerY = containerY + (containerH / 2);

		// AS3: _avatarGlow.x = _local_2 - (_avatarGlow.width / 2)
		// AS3: _avatarGlow.y = (_local_3 - (_avatarGlow.height / 2)) + 15
		if(this._avatarGlow)
		{
			const glowW = this._avatarGlow.naturalWidth || 150;
			const glowH = this._avatarGlow.naturalHeight || 150;

			this._avatarGlow.style.left = (centerX - (glowW / 2)) + 'px';
			this._avatarGlow.style.top = (centerY - (glowH / 2) + 15) + 'px';
		}

		// AS3: _SafeStr_4552.x = _local_2 - (_SafeStr_4552.width / 2)
		// AS3: _SafeStr_4552.y = (_local_3 + _SafeStr_4552.height) - 40
		if(this._SafeStr_4552)
		{
			const haloW = this._SafeStr_4552.naturalWidth || 100;
			const haloH = this._SafeStr_4552.naturalHeight || 30;

			this._SafeStr_4552.style.left = (centerX - (haloW / 2)) + 'px';
			this._SafeStr_4552.style.top = (centerY + haloH - 40) + 'px';
		}
	}

	/**
	 * AS3: updateDescription()
	 * Updates the name and motto labels for the selected avatar.
	 */
	private updateDescription(): void
	{
		if(!this._SafeStr_1672 || this._SafeStr_1672.length === 0) return;

		const avatar = this._SafeStr_1672[this._SafeStr_4550];

		if(this._avatarName) this._avatarName.textContent = avatar.name;
		if(this._avatarDescription) this._avatarDescription.textContent = avatar.motto;
	}

	/**
	 * AS3: getAvatarUrl(_arg_1:AvatarData):String
	 * Builds the habbo-imaging URL for an avatar.
	 */
	private getAvatarUrl(avatar: AvatarData): string
	{
		// AS3: if((_SafeStr_3305.indexOf("local") > -1) || (_SafeStr_3305.indexOf("127.0.0.1") > -1))
		if(this._SafeStr_3305.indexOf('local') > -1 || this._SafeStr_3305.indexOf('127.0.0.1') > -1)
		{
			return 'https://www.habbo.com/habbo-imaging/avatarimage?size=m&figure=' + avatar.figure + '&direction=2';
		}

		return this._SafeStr_3305 + '/habbo-imaging/avatarimage?user=' + avatar.name;
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
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		for(const item of this._SafeStr_4551)
		{
			item.removeEventListener('click', this._onAvatarClick);
		}

		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onChooseAvatar);
		this._SafeStr_4551.length = 0;
		this._SafeStr_1672.length = 0;
		this._root.remove();
	}
}
