/**
 * LoginView
 *
 * @see sources/win63_2021_version/login/LoginView.as
 * @see vortex-client/src/onBoardingHc/steps/OnBoardingHcStepLogin.as
 *
 * Email/password login screen (SCREEN_LOGIN = 2), redesigned as the right-hand
 * column of the split-screen layout (see login-ui.scss) instead of the AS3
 * screen's own absolute-positioned fields.
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
 * - _registerButton: ColouredButton ("gfreen") (OnBoardingHcStepLogin.as)
 */
import type {ILoginContext} from './ILoginContext';

export class LoginView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;

	/** AS3: _SafeStr_4568 — InputField (email) */
	private _SafeStr_4568: HTMLInputElement;

	/** AS3: _SafeStr_4569 — InputField (password) */
	private _SafeStr_4569: HTMLInputElement;

	/** AS3: _saveButton — ColouredButton("gfreen", "${connection.login.play}") */
	private _saveButton: HTMLButtonElement;

	/** AS3: _cancelButton — ColouredButton("red", "${generic.cancel}") */
	private _cancelButton: HTMLButtonElement;

	/** AS3: _registerButton — ColouredButton("gfreen", "${connection.login.register}") */
	private _registerButton: HTMLButtonElement;

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
		this._registerButton = document.createElement('button');
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
		this.addHelpLinks();
		this.addButtons();
	}

	/**
	 * AS3: addTitleField() — "${connection.login.title}"
	 */
	private addTitleField(): void
	{
		const title = document.createElement('div');

		title.className = 'habbo-title';
		title.textContent = 'Login';
		this._root.appendChild(title);

		const subtitle = document.createElement('div');

		subtitle.className = 'habbo-subtitle-line';
		subtitle.textContent = 'Please enter your Habbo email and password.';
		this._root.appendChild(subtitle);
	}

	/**
	 * AS3: addInputFields()
	 * AS3: _SafeStr_4568 = new InputField(_context, 640, "${connection.login.email}", CommunicationUtils.readSOLString("login"), "${connection.login.missing_credentials}", "")
	 * AS3: _SafeStr_4569 = new InputField(_context, 640, "${connection.login.password}", CommunicationUtils.restorePassword(), "", "", true)
	 */
	private addInputFields(): void
	{
		const emailGroup = document.createElement('div');

		emailGroup.className = 'habbo-field';
		this._SafeStr_4568.className = 'habbo-input';
		this._SafeStr_4568.type = 'email';
		this._SafeStr_4568.placeholder = 'your@email.com';
		this._SafeStr_4568.autocomplete = 'email';

		// AS3: CommunicationUtils.readSOLString("login") — equivalent: localStorage
		const savedLogin = localStorage.getItem('login');

		if(savedLogin)
		{
			this._SafeStr_4568.value = savedLogin;
		}

		emailGroup.appendChild(this._SafeStr_4568);
		this._root.appendChild(emailGroup);

		const pwdGroup = document.createElement('div');

		pwdGroup.className = 'habbo-field';
		this._SafeStr_4569.className = 'habbo-input';
		this._SafeStr_4569.type = 'password';
		this._SafeStr_4569.placeholder = 'Password';
		this._SafeStr_4569.autocomplete = 'current-password';
		this._SafeStr_4569.addEventListener('keydown', this._onKeydown);
		pwdGroup.appendChild(this._SafeStr_4569);
		this._root.appendChild(pwdGroup);
	}

	/**
	 * AS3: onRegister flow, surfaced as a "Need some help?" link instead of the
	 * full-size ColouredButton AS3 uses — see login-ui.scss header comment.
	 */
	private addHelpLinks(): void
	{
		const heading = document.createElement('div');

		heading.className = 'habbo-help-heading';
		heading.textContent = 'Need some help?';
		this._root.appendChild(heading);

		const list = document.createElement('div');

		list.className = 'habbo-link-list';

		this._registerButton.className = 'habbo-link';
		this._registerButton.textContent = "I don't have an account";
		this._registerButton.addEventListener('click', this._onRegister);
		list.appendChild(this._registerButton);

		this._root.appendChild(list);
	}

	/**
	 * AS3: addButtons() — Cancel (red) and Play (gfreen) buttons.
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

		// AS3: _saveButton = new ColouredButton("gfreen", "${connection.login.play}", ...)
		this._saveButton.className = 'habbo-btn habbo-btn--green habbo-btn--arrow';
		this._saveButton.textContent = "Let's Go!";
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
	 * AS3: onRegister(registerButton:Button) — OnBoardingHcStepLogin.as
	 * Go to the Register screen.
	 */
	private _onRegister = (): void =>
	{
		this._context.showScreen(5);
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
		this._registerButton.removeEventListener('click', this._onRegister);
		this._root.remove();
	}
}
