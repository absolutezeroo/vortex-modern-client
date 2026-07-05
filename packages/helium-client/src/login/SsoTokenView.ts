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
	private _root: HTMLFormElement;

	/** AS3: _SafeStr_4547 — title TextField */
	private _SafeStr_4547: HTMLDivElement | null = null;

	/** AS3: _saveButton — ColouredButton("gfreen", "${connection.login.play}") */
	private _saveButton: HTMLButtonElement;

	/** AS3: _cancelButton — ColouredButton("red", "${generic.cancel}") */
	private _cancelButton: HTMLButtonElement;

	/** AS3: _registerButton — ColouredButton("gfreen", "${connection.login.register}") (OnBoardingHcStepSsoToken.as) */
	private _registerButton: HTMLButtonElement;

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
		this._root = document.createElement('form');
		this._root.addEventListener('submit', this._onSubmit);
		this._SafeStr_4570 = document.createElement('input');
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
		this._registerButton = document.createElement('button');
	}

	get element(): HTMLFormElement
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
		this.addHelpLinks();
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
			this._SafeStr_4547.className = 'habbo-title';
			// AS3: "${connection.login.title}"
			this._SafeStr_4547.textContent = 'Login';
			this._root.appendChild(this._SafeStr_4547);

			const subtitle = document.createElement('div');

			subtitle.className = 'habbo-subtitle-line';
			subtitle.textContent = 'Paste your SSO ticket to jump back in.';
			this._root.appendChild(subtitle);
		}
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

		this._registerButton.type = 'button';
		this._registerButton.className = 'habbo-link';
		this._registerButton.textContent = "I don't have an account";
		this._registerButton.addEventListener('click', this._onRegister);
		list.appendChild(this._registerButton);

		this._root.appendChild(list);
	}

	/**
	 * AS3: addInputFields()
	 * Creates token input: InputField(_context, 640, "${connection.login.code.prompt}", "", "${connection.login.useTicket}", "", true)
	 * The last param (true) = password mode
	 */
	private addInputFields(): void
	{
		const group = document.createElement('div');

		group.className = 'habbo-field';

		// Input — AS3: InputField with password=true, error="${connection.login.useTicket}"
		this._SafeStr_4570.className = 'habbo-input';
		this._SafeStr_4570.type = 'password';
		this._SafeStr_4570.placeholder = 'SSO ticket';
		this._SafeStr_4570.autocomplete = 'off';
		this._SafeStr_4570.spellcheck = false;

		// AS3: addEventListener("change", onInputChange) + addEventListener("keyDown", onInputKeyboardEvent)
		// Enter-triggers-login (the AS3 keyDown behavior) is now handled by the
		// form's native "submit" event (see constructor + _onSubmit) instead.
		this._SafeStr_4570.addEventListener('input', this._onInputChange);

		group.appendChild(this._SafeStr_4570);

		// AS3: _SafeStr_4570.x = 0; _SafeStr_4570.y = 100;
		this._root.appendChild(group);
	}

	/**
	 * AS3: onInputKeyboardEvent(_arg_1:KeyboardEvent)
	 * Native form submission (Enter key or Play button) triggers login if button is active.
	 */
	private _onSubmit = (e: SubmitEvent): void =>
	{
		e.preventDefault();

		if(!this._saveButton.disabled)
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

		container.className = 'habbo-btn-row';

		// AS3: _cancelButton = new ColouredButton("red", "${generic.cancel}", new Rectangle(0, 300, 0, 40), true, onCancel, 0xD8D8D8)
		this._cancelButton.type = 'button';
		this._cancelButton.className = 'habbo-btn habbo-btn--red';
		this._cancelButton.textContent = 'Back';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// AS3: _saveButton = new ColouredButton("gfreen", "${connection.login.play}", ..., true, onLogin, ...)
		this._saveButton.type = 'submit';
		this._saveButton.className = 'habbo-btn habbo-btn--green habbo-btn--arrow';
		this._saveButton.textContent = "Let's Go!";
		// AS3: _saveButton.active = false
		this._saveButton.disabled = true;
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * AS3: onRegister(registerButton:Button) — OnBoardingHcStepSsoToken.as
	 * Go to the Register screen.
	 */
	private _onRegister = (): void =>
	{
		this._context.showScreen(5);
	};

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
		this._root.removeEventListener('submit', this._onSubmit);
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._registerButton.removeEventListener('click', this._onRegister);
		this._root.remove();
	}
}
