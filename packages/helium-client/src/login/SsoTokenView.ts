/**
 * SsoTokenView
 *
 * @see sources/win63_2021_version/login/SsoTokenView.as
 *
 * SSO token input screen (SCREEN_SSO_TOKEN = 4).
 * User pastes an SSO token in format "hh<env>.<uuid1>.<uuid2>".
 * Validates on keystroke, extracts environment ID, and triggers login.
 *
 * AS3 properties:
 * - _context: LoginFlow
 * - _SafeStr_4547: TextField (title)
 * - _saveButton: ColouredButton ("gfreen")
 * - _cancelButton: ColouredButton ("red")
 * - _loginAreaWidth: int = 640
 * - _SafeStr_4570: InputField (token input)
 * - _SafeStr_527: Boolean (init guard)
 */
import type {ILoginContext} from './ILoginContext';

export class SsoTokenView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;

	/** AS3: _SafeStr_4547 — title TextField */
	private _SafeStr_4547: HTMLDivElement | null = null;

	/** AS3: _saveButton — ColouredButton("gfreen", "${connection.login.play}") */
	private _saveButton: HTMLButtonElement;

	/** AS3: _cancelButton — ColouredButton("red", "${generic.cancel}") */
	private _cancelButton: HTMLButtonElement;

	/** AS3: _loginAreaWidth = 640 */
	private _loginAreaWidth: number = 640;

	/** AS3: _SafeStr_4570 — InputField (token input) */
	private _SafeStr_4570: HTMLInputElement;

	/** AS3: _SafeStr_527 — init guard */
	private _SafeStr_527: boolean = false;

	private _disposed: boolean = false;

	/**
	 * AS3: SsoTokenView(_arg_1:LoginFlow)
	 */
	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._SafeStr_4570 = document.createElement('input');
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
	}

	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * AS3: init()
	 * Guard prevents double initialization (_SafeStr_527 pattern).
	 */
	public init(): void
	{
		if(this._SafeStr_527) return;

		this._SafeStr_527 = true;

		this.addTitleField();
		this.addInputFields();
		this.addButtons();
	}

	/**
	 * AS3: addTitleField()
	 * Creates title: "${connection.login.title}" — white 40px bold
	 * AS3: LoaderUI.createTextField("${connection.login.title}", 40, 0xFFFFFF, false, true, false, false, "left")
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
				marginBottom: '20px',
				textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
			} as Partial<CSSStyleDeclaration>);
			// AS3: "${connection.login.title}"
			this._SafeStr_4547.textContent = 'Habbo Login';
			this._root.appendChild(this._SafeStr_4547);
		}
	}

	/**
	 * AS3: addInputFields()
	 * Creates token input: InputField(_context, 640, "${connection.login.code.prompt}", "", "${connection.login.useTicket}", "", true)
	 * The last param (true) = password mode
	 */
	private addInputFields(): void
	{
		const group = document.createElement('div');

		Object.assign(group.style, {
			marginBottom: '16px',
		} as Partial<CSSStyleDeclaration>);

		// Label — AS3: "${connection.login.code.prompt}"
		const label = document.createElement('label');

		Object.assign(label.style, {
			display: 'block',
			fontSize: '16px',
			color: '#FFFFFF',
			marginBottom: '6px',
			fontWeight: 'bold',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
		} as Partial<CSSStyleDeclaration>);
		label.textContent = 'SSO Ticket';
		group.appendChild(label);

		// Input — AS3: InputField with password=true, error="${connection.login.useTicket}"
		Object.assign(this._SafeStr_4570.style, {
			width: '100%',
			maxWidth: this._loginAreaWidth + 'px',
			height: '40px',
			padding: '0 12px',
			border: '2px solid rgba(255, 255, 255, 0.3)',
			borderRadius: '6px',
			background: 'rgba(0, 0, 0, 0.3)',
			color: '#FFFFFF',
			fontSize: '16px',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
			outline: 'none',
			boxSizing: 'border-box',
		} as Partial<CSSStyleDeclaration>);
		this._SafeStr_4570.type = 'password';
		this._SafeStr_4570.placeholder = 'Enter your SSO ticket...';
		this._SafeStr_4570.autocomplete = 'off';
		this._SafeStr_4570.spellcheck = false;

		// AS3: addEventListener("change", onInputChange) + addEventListener("keyDown", onInputKeyboardEvent)
		this._SafeStr_4570.addEventListener('input', this._onInputChange);
		this._SafeStr_4570.addEventListener('keydown', this._onInputKeyboardEvent);

		group.appendChild(this._SafeStr_4570);

		// AS3: _SafeStr_4570.x = 0; _SafeStr_4570.y = 100;
		this._root.appendChild(group);
	}

	/**
	 * AS3: onInputKeyboardEvent(_arg_1:KeyboardEvent)
	 * Enter key (charCode 13) triggers login if button is active.
	 */
	private _onInputKeyboardEvent = (e: KeyboardEvent): void =>
	{
		if(e.key === 'Enter' && !this._saveButton.disabled)
		{
			this._onLogin();
		}
	};

	/**
	 * AS3: onInputChange(_arg_1:Event)
	 * Validates token on every keystroke, enables/disables Play button.
	 */
	private _onInputChange = (): void =>
	{
		const result: string[] = [];

		if(this.validateToken(result))
		{
			// AS3: _context.updateEnvironment(_local_2[0], true)
			this._context.updateEnvironment(result[0], true);
			this._saveButton.disabled = false;
		}
		else
		{
			this._saveButton.disabled = true;
		}
	};

	/**
	 * AS3: addButtons()
	 * Creates Cancel (red) and Play (gfreen) buttons.
	 */
	public addButtons(): void
	{
		const container = document.createElement('div');

		Object.assign(container.style, {
			display: 'flex',
			gap: '12px',
			marginTop: '24px',
		} as Partial<CSSStyleDeclaration>);

		// AS3: _cancelButton = new ColouredButton("red", "${generic.cancel}", new Rectangle(0, 300, 0, 40), true, onCancel, 0xD8D8D8)
		Object.assign(this._cancelButton.style, {
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
			background: '#E53935',
			color: '#FFFFFF',
		} as Partial<CSSStyleDeclaration>);
		this._cancelButton.textContent = 'Cancel';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// AS3: _saveButton = new ColouredButton("gfreen", "${connection.login.play}", ..., true, onLogin, ...)
		Object.assign(this._saveButton.style, {
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
			background: '#4CAF50',
			color: '#FFFFFF',
		} as Partial<CSSStyleDeclaration>);
		this._saveButton.textContent = 'Play';
		// AS3: _saveButton.active = false
		this._saveButton.disabled = true;
		this._saveButton.addEventListener('click', this._onLogin);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * AS3: onLogin(_arg_1:Button)
	 * Validates token and calls context.initLoginWithSsoToken().
	 * AS3: token = _local_2[1] + "." + _local_2[2]
	 */
	private _onLogin = (): void =>
	{
		const result: string[] = [];

		if(this.validateToken(result))
		{
			// AS3: _context.initLoginWithSsoToken(_local_2[0], _local_2[1] + "." + _local_2[2])
			this._context.initLoginWithSsoToken(result[0], result[1] + '.' + result[2]);
		}
		else
		{
			this._saveButton.disabled = true;
		}
	};

	/**
	 * AS3: validateToken(_arg_1:Vector.<String>):Boolean
	 *
	 * Strictly validates: exactly 3 parts separated by "."
	 * Extracts environment from prefix: strip "hh", replace "br"→"pt", "us"→"en"
	 * Pushes [envId, uuid1, uuid2] into the result vector.
	 *
	 * @param result - Output array: [envId, uuid1, uuid2]
	 * @returns true if valid
	 */
	private validateToken(result: string[]): boolean
	{
		const text = this._SafeStr_4570.value;

		if(!text) return false;
		if(text.length === 0) return false;

		const parts = text.split('.');

		// AS3: if(_local_3.length != 3) return false
		if(parts.length !== 3) return false;

		// AS3: _local_2 = _local_3[0].replace("hh", "")
		let envId = parts[0].replace('hh', '');

		// AS3: _local_2 = _local_2.replace("br", "pt")
		envId = envId.replace('br', 'pt');

		// AS3: _local_2 = _local_2.replace("us", "en")
		envId = envId.replace('us', 'en');

		result.push(envId);
		result.push(parts[1]);
		result.push(parts[2]);

		return true;
	}

	/**
	 * AS3: onCancel(_arg_1:Button)
	 * Go back to Environment screen.
	 */
	private _onCancel = (): void =>
	{
		this._context.showScreen(1);
	};

	/**
	 * AS3: ready()
	 * Enable the Play button.
	 */
	public ready(): void
	{
		if(this._saveButton)
		{
			this._saveButton.disabled = false;
		}
	}

	/**
	 * Focus the token input when the view is shown.
	 */
	public focus(): void
	{
		setTimeout(() => this._SafeStr_4570.focus(), 50);
	}

	/**
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._SafeStr_4570.removeEventListener('input', this._onInputChange);
		this._SafeStr_4570.removeEventListener('keydown', this._onInputKeyboardEvent);
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onLogin);
		this._root.remove();
	}
}
