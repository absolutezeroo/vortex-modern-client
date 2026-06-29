/**
 * LoginView
 *
 * @see sources/win63_2021_version/login/LoginView.as
 *
 * Email/password login screen (SCREEN_LOGIN = 2).
 * User enters credentials and submits to initiate Web API login.
 *
 * AS3 properties:
 * - _context: ILoginContext
 * - _SafeStr_4547: TextField (title)
 * - _saveButton: ColouredButton ("gfreen")
 * - _cancelButton: ColouredButton ("red")
 * - _SafeStr_4568: InputField (email)
 * - _loginAreaWidth: int = 640
 * - _SafeStr_4569: InputField (password)
 * - _SafeStr_527: Boolean (init guard)
 */
import type {ILoginContext} from './ILoginContext';

export class LoginView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;

	/** AS3: _SafeStr_4547 — title TextField */
	private _SafeStr_4547: HTMLDivElement | null = null;

	/** AS3: _saveButton — ColouredButton("gfreen", "${connection.login.play}") */
	private _saveButton: HTMLButtonElement;

	/** AS3: _cancelButton — ColouredButton("red", "${generic.cancel}") */
	private _cancelButton: HTMLButtonElement;

	/** AS3: _SafeStr_4568 — InputField (email) */
	private _SafeStr_4568: HTMLInputElement;

	/** AS3: _loginAreaWidth = 640 */
	private _loginAreaWidth: number = 640;

	/** AS3: _SafeStr_4569 — InputField (password) */
	private _SafeStr_4569: HTMLInputElement;

	/** AS3: _SafeStr_527 — init guard */
	private _SafeStr_527: boolean = false;

	private _disposed: boolean = false;

	/**
	 * AS3: LoginView(_arg_1:ILoginContext)
	 */
	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._SafeStr_4568 = document.createElement('input');
		this._SafeStr_4569 = document.createElement('input');
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
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
		this.addInputFields();
		this.addButtons();
	}

	/**
	 * AS3: addTitleField()
	 * Creates title: "${connection.login.title}" — white 40px bold
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
	 * Creates email and password input fields.
	 * AS3: _SafeStr_4568 = new InputField(_context, 640, "${connection.login.email}", CommunicationUtils.readSOLString("login"), "${connection.login.missing_credentials}", "")
	 * AS3: _SafeStr_4569 = new InputField(_context, 640, "${connection.login.password}", CommunicationUtils.restorePassword(), "", "", true)
	 */
	private addInputFields(): void
	{
		const inputStyle: Partial<CSSStyleDeclaration> = {
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
		};

		const labelStyle: Partial<CSSStyleDeclaration> = {
			display: 'block',
			fontSize: '16px',
			color: '#FFFFFF',
			marginBottom: '6px',
			fontWeight: 'bold',
			fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
		};

		// Email field — AS3: "${connection.login.email}" with default from CommunicationUtils.readSOLString("login")
		const emailGroup = document.createElement('div');

		Object.assign(emailGroup.style, { marginBottom: '16px' } as Partial<CSSStyleDeclaration>);

		const emailLabel = document.createElement('label');

		Object.assign(emailLabel.style, labelStyle);
		emailLabel.textContent = 'Email';
		emailGroup.appendChild(emailLabel);

		Object.assign(this._SafeStr_4568.style, inputStyle);
		this._SafeStr_4568.type = 'email';
		this._SafeStr_4568.placeholder = 'Enter your email...';
		this._SafeStr_4568.autocomplete = 'email';

		// AS3: CommunicationUtils.readSOLString("login") — equivalent: localStorage
		const savedLogin = localStorage.getItem('login');

		if(savedLogin)
		{
			this._SafeStr_4568.value = savedLogin;
		}

		emailGroup.appendChild(this._SafeStr_4568);

		// AS3: _SafeStr_4568.x = 0; _SafeStr_4568.y = 100
		this._root.appendChild(emailGroup);

		// Password field — AS3: "${connection.login.password}" with password=true
		const pwdGroup = document.createElement('div');

		Object.assign(pwdGroup.style, { marginBottom: '16px' } as Partial<CSSStyleDeclaration>);

		const pwdLabel = document.createElement('label');

		Object.assign(pwdLabel.style, labelStyle);
		pwdLabel.textContent = 'Password';
		pwdGroup.appendChild(pwdLabel);

		Object.assign(this._SafeStr_4569.style, inputStyle);
		this._SafeStr_4569.type = 'password';
		this._SafeStr_4569.placeholder = 'Enter your password...';
		this._SafeStr_4569.autocomplete = 'current-password';
		this._SafeStr_4569.addEventListener('keydown', this._onKeydown);
		pwdGroup.appendChild(this._SafeStr_4569);
		this._root.appendChild(pwdGroup);
	}

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
		this._saveButton.addEventListener('click', this._onLogin);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * Enter key in password field triggers login.
	 */
	private _onKeydown = (e: KeyboardEvent): void =>
	{
		if(e.key === 'Enter' && !this._saveButton.disabled)
		{
			this._onLogin();
		}
	};

	/**
	 * AS3: saveOutfit(_arg_1:Button)
	 * Triggers login with email and password.
	 */
	private _onLogin = (): void =>
	{
		const email = this._SafeStr_4568.value.trim();
		const password = this._SafeStr_4569.value;

		if(email && password)
		{
			this._context.initLogin(email, password);
		}
	};

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
	 * Focus the email input when the view is shown.
	 */
	public focus(): void
	{
		setTimeout(() => this._SafeStr_4568.focus(), 50);
	}

	/**
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._SafeStr_4569.removeEventListener('keydown', this._onKeydown);
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onLogin);
		this._root.remove();
	}
}
