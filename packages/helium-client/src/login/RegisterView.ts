/**
 * RegisterView
 *
 * @see vortex-client/src/onBoardingHc/steps/OnBoardingHcStepRegister.as
 *
 * Registration screen (SCREEN_REGISTER = 5), redesigned as the right-hand
 * column of the split-screen layout (see login-ui.scss). User enters email,
 * password and password confirmation and submits to create a new account via
 * WebApiLoginProvider.register(). On success the server routes back to
 * LoginFlow.showSelectAvatar() -> SCREEN_AVATAR_CREATE.
 *
 * AS3 properties (OnBoardingHcStepRegister):
 * - _context: IOnBoardingHcContext
 * - _titleField: TextField ("${connection.login.register.title}")
 * - _registerButton: ColouredButton ("gfreen", "${connection.login.register.submit}")
 * - _cancelButton: ColouredButton ("red", "${generic.cancel}")
 * - _fieldWidth: int = 640
 * - _emailField / _passwordField / _confirmField: InputField
 * - _initialized: Boolean
 */
import type {ILoginContext} from './ILoginContext';

export class RegisterView
{
    private _context: ILoginContext;
    private _root: HTMLFormElement;

    /** AS3: _emailField */
    private _emailField: HTMLInputElement;

    /** AS3: _passwordField */
    private _passwordField: HTMLInputElement;

    /** AS3: _confirmField */
    private _confirmField: HTMLInputElement;

    /** Inline validation message shown above the buttons (AS3 has no equivalent — it just no-ops on invalid submit). */
    private _statusField: HTMLDivElement;

    /** AS3: _registerButton — ColouredButton("gfreen", "${connection.login.register.submit}") */
    private _registerButton: HTMLButtonElement;

    /** AS3: _cancelButton — ColouredButton("red", "${generic.cancel}") */
    private _cancelButton: HTMLButtonElement;

    /** AS3: _initialized */
    private _initialized: boolean = false;

    private _disposed: boolean = false;

    /**
	 * AS3: OnBoardingHcStepRegister(context:IOnBoardingHcContext)
	 */
    constructor(context: ILoginContext)
    {
        this._context = context;
        this._root = document.createElement('form');
        this._root.autocomplete = 'on';
        this._root.addEventListener('submit', this._onSubmit);
        this._emailField = document.createElement('input');
        this._passwordField = document.createElement('input');
        this._confirmField = document.createElement('input');
        this._statusField = document.createElement('div');
        this._registerButton = document.createElement('button');
        this._cancelButton = document.createElement('button');
    }

    get element(): HTMLFormElement
    {
        return this._root;
    }

    /**
	 * AS3: init()
	 */
    public init(): void
    {
        if(this._initialized) return;

        this._initialized = true;

        this.addTitleField();
        this.addInputFields();
        this.addButtons();
    }

    /**
	 * AS3: addTitleField() — "${connection.login.register.title}"
	 */
    private addTitleField(): void
    {
        const title = document.createElement('div');

        title.className = 'habbo-title';
        title.textContent = 'Create an account';
        this._root.appendChild(title);

        const subtitle = document.createElement('div');

        subtitle.className = 'habbo-subtitle-line';
        subtitle.textContent = "It only takes a moment — you'll pick your Habbo next.";
        this._root.appendChild(subtitle);
    }

    /**
	 * AS3: addInputFields()
	 * AS3: _emailField = new InputField(_context, 640, "${connection.login.email}", "", "${connection.login.missing_credentials}", "")
	 * AS3: _passwordField = new InputField(_context, 640, "${connection.login.password}", "", "", "", true)
	 * AS3: _confirmField = new InputField(_context, 640, "${connection.login.register.confirm_password}", "", "", "", true)
	 */
    private addInputFields(): void
    {
        const emailGroup = document.createElement('div');

        emailGroup.className = 'habbo-field';
        this._emailField.className = 'habbo-input';
        this._emailField.type = 'email';
        this._emailField.placeholder = 'your@email.com';
        this._emailField.autocomplete = 'email';
        emailGroup.appendChild(this._emailField);
        this._root.appendChild(emailGroup);

        const pwdGroup = document.createElement('div');

        pwdGroup.className = 'habbo-field';
        this._passwordField.className = 'habbo-input';
        this._passwordField.type = 'password';
        this._passwordField.placeholder = 'Password (min. 6 characters)';
        this._passwordField.autocomplete = 'new-password';
        pwdGroup.appendChild(this._passwordField);
        this._root.appendChild(pwdGroup);

        const confirmGroup = document.createElement('div');

        confirmGroup.className = 'habbo-field';
        this._confirmField.className = 'habbo-input';
        this._confirmField.type = 'password';
        this._confirmField.placeholder = 'Confirm password';
        this._confirmField.autocomplete = 'new-password';
        confirmGroup.appendChild(this._confirmField);
        this._root.appendChild(confirmGroup);

        this._statusField.className = 'habbo-status';
        this._root.appendChild(this._statusField);
    }

    /**
	 * AS3: addButtons() — Cancel (red) and Submit (gfreen) buttons.
	 */
    public addButtons(): void
    {
        const container = document.createElement('div');

        container.className = 'habbo-btn-row';

        // AS3: _cancelButton = new ColouredButton("red", "${generic.cancel}", ...)
        this._cancelButton.type = 'button';
        this._cancelButton.className = 'habbo-btn habbo-btn--red';
        this._cancelButton.textContent = 'Back';
        this._cancelButton.addEventListener('click', this._onCancel);
        container.appendChild(this._cancelButton);

        // AS3: _registerButton = new ColouredButton("gfreen", "${connection.login.register.submit}", ...)
        this._registerButton.type = 'submit';
        this._registerButton.className = 'habbo-btn habbo-btn--green habbo-btn--arrow';
        this._registerButton.textContent = 'Create account';
        container.appendChild(this._registerButton);

        this._root.appendChild(container);
    }

    /** Native form submission (Enter key or Create-account button) validates and registers. */
    private _onSubmit = (e: SubmitEvent): void =>
    {
        e.preventDefault();
        this._onRegister();
    };

    /**
	 * AS3: onRegister(registerButton:Button)
	 * Validates email/password/confirm and delegates to context.registerAccount().
	 */
    private _onRegister = (): void =>
    {
        const email = this._emailField.value.trim();
        const password = this._passwordField.value;
        const confirmPassword = this._confirmField.value;

        this._statusField.textContent = '';

        if(!email || email.length === 0)
        {
            return;
        }

        if(!password || password.length < 6)
        {
            this._statusField.textContent = 'Password must be at least 6 characters.';

            return;
        }

        if(password !== confirmPassword)
        {
            this._statusField.textContent = 'Passwords do not match.';

            return;
        }

        this._context.registerAccount(email, password);
    };

    /**
	 * AS3: onCancel(cancelButton:Button)
	 * Go back to the Login screen.
	 */
    private _onCancel = (): void =>
    {
        this._context.showScreen(2);
    };

    /**
	 * Focus the email input when the view is shown.
	 */
    public focus(): void
    {
        setTimeout(() => this._emailField.focus(), 50);
    }

    /**
	 * AS3: dispose()
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._root.removeEventListener('submit', this._onSubmit);
        this._cancelButton.removeEventListener('click', this._onCancel);
        this._root.remove();
    }
}
