/**
 * EnvironmentView
 *
 * @see sources/win63_2021_version/login/EnvironmentView.as
 *
 * Server/environment selection screen (SCREEN_ENVIRONMENT = 1).
 * Displays flag icons for each available hotel environment in a grid.
 * User selects a hotel, then proceeds to Login or SSO Token screen.
 *
 * AS3 constants:
 * - ITEMS_PER_ROW = 9
 * - THUMB_SIZE = 160
 * - THUMB_SCALE = 0.5
 * - SPACING = 10
 *
 * AS3 properties:
 * - _SafeStr_4554: Vector.<Bitmap> (flag bitmaps)
 * - _SafeStr_4547: TextField (title)
 * - _SafeStr_4555: Bitmap (balloon)
 * - _environmentName: TextField
 * - _SafeStr_4556: int (selected index)
 * - _loginButton: Button
 * - _environmentImageContainers: Array (Sprite wrappers)
 * - _chosenIcon: Bitmap (flag_icon_selected_png)
 * - _SafeStr_4548: int = 10 (spacing)
 * - _SafeStr_4557: Array (env IDs)
 * - _SafeStr_527: Boolean (init guard)
 * - _SafeStr_4558: Sprite (highlight container with flag_icon_selected)
 */
import type {ILoginContext} from './ILoginContext';

// Import flag icons
import flagEnUrl from '../assets/images/flag_icons_en.png';
import flagPtUrl from '../assets/images/flag_icons_pt.png';
import flagDeUrl from '../assets/images/flag_icons_de.png';
import flagEsUrl from '../assets/images/flag_icons_es.png';
import flagFiUrl from '../assets/images/flag_icons_fi.png';
import flagFrUrl from '../assets/images/flag_icons_fr.png';
import flagItUrl from '../assets/images/flag_icons_it.png';
import flagNlUrl from '../assets/images/flag_icons_nl.png';
import flagTrUrl from '../assets/images/flag_icons_tr.png';
import flagDevUrl from '../assets/images/flag_icons_dev.png';
import flagSelectedUrl from '../assets/images/flags_icon_selected.png';

/** AS3: ITEMS_PER_ROW = 9 */
const ITEMS_PER_ROW = 9;

/** AS3: THUMB_SIZE = 160 */
const THUMB_SIZE = 160;

/** AS3: THUMB_SCALE = 0.5 */
const THUMB_SCALE = 0.5;

/** AS3: SPACING = 10 */
const SPACING = 10;

/**
 * Map of environment ID -> flag image URL.
 * Order matches AS3: en, pt, de, es, fi, fr, it, nl, tr, dev
 *
 * "s2" (Sandbox, see common_configuration_txt.txt's live.environment.list=en/s2) has no
 * dedicated flag asset — there was never a country to represent, it's a test hotel — so
 * it shares the "dev" icon rather than silently rendering with an empty src.
 */
const FLAG_IMAGES: Record<string, string> = {
    'en': flagEnUrl,
    'pt': flagPtUrl,
    'de': flagDeUrl,
    'es': flagEsUrl,
    'fi': flagFiUrl,
    'fr': flagFrUrl,
    'it': flagItUrl,
    'nl': flagNlUrl,
    'tr': flagTrUrl,
    'dev': flagDevUrl,
    's2': flagDevUrl,
};

export class EnvironmentView 
{
    private _context: ILoginContext;
    private _root: HTMLDivElement;

    /** AS3: _SafeStr_4547 — title TextField */
    private _SafeStr_4547: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4555 — balloon (info area, initially hidden) */
    private _SafeStr_4555: HTMLDivElement | null = null;

    /** AS3: _environmentName — TextField for selected environment name */
    private _environmentName: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4556 — selected index */
    private _SafeStr_4556: number = 0;

    /** AS3: _loginButton */
    private _loginButton: HTMLButtonElement;

    /** AS3: _environmentImageContainers — array of Sprite wrappers */
    private _environmentImageContainers: HTMLDivElement[] = [];

    /** AS3: _SafeStr_4558 — highlight sprite with flag_icon_selected */
    private _SafeStr_4558: HTMLDivElement | null = null;

    /** AS3: _SafeStr_4557 — array of environment IDs */
    private _SafeStr_4557: string[] | null = null;

    /** AS3: _SafeStr_527 — init guard */
    private _SafeStr_527: boolean = false;

    private _disposed: boolean = false;

    /**
     * AS3: EnvironmentView(_arg_1:LoginFlow)
     */
    constructor(context: ILoginContext) 
    {
        this._context = context;
        this._root = document.createElement('div');
        this._loginButton = document.createElement('button');
    }

    get element(): HTMLDivElement 
    {
        return this._root;
    }

    /**
     * AS3: get environmentId():String
     */
    get environmentId(): string 
    {
        return this._SafeStr_4557 ? this._SafeStr_4557[this._SafeStr_4556] : 'en';
    }

    /**
     * AS3: get environmentAvailable():Boolean
     */
    get environmentAvailable(): boolean 
    {
        const currentEnvId = this._context.getProperty('environment.id');

        return this._SafeStr_4557 ? this._SafeStr_4557.indexOf(currentEnvId ?? '') > -1 : false;
    }

    /**
     * AS3: init()
     */
    public init(): void 
    {
        if(this._SafeStr_527) return;

        this._SafeStr_527 = true;

        // AS3: _SafeStr_4554 = new Vector.<Bitmap>()
        if(this._SafeStr_4557 === null) 
        {
            this.initEnvironmentImages();
        }

        this.updateEnvironment();
        this.initView();
    }

    /**
     * AS3: updateEnvironment()
     * Reads current environment.id from config and selects it.
     */
    public updateEnvironment(): void 
    {
        if(!this._SafeStr_4557) return;

        const currentEnvId = this._context.getProperty('environment.id');
        const index = this._SafeStr_4557.indexOf(currentEnvId ?? '');

        if(index === -1) 
        {
            this._SafeStr_4556 = 0;
        }
        else 
        {
            this._SafeStr_4556 = index;
        }

        this.chooseEnvironment();
    }

    /**
     * AS3: initView()
     * Builds the full DOM tree: title, highlight, flags grid, name label, buttons.
     */
    public initView(): void 
    {
        if(!this._SafeStr_4557) return;

        // AS3: addTitleField()
        this.addTitleField();

        // AS3: _SafeStr_4555 = LoaderUI.createBalloon(640, 100, 0, false, 995918, "none")
        // Hidden balloon — we create a hidden info area
        this._SafeStr_4555 = document.createElement('div');
        this._SafeStr_4555.style.display = 'none';
        this._root.appendChild(this._SafeStr_4555);

        // Grid container (relatively positioned so the absolute highlight below and
        // the flag containers share the same coordinate space).
        const gridContainer = document.createElement('div');

        Object.assign(gridContainer.style, {
            position: 'relative',
            margin: '20px auto',
        } as Partial<CSSStyleDeclaration>);

        // AS3: _SafeStr_4558 = new Sprite(); _chosenIcon = new flag_icon_selected_png()
        // Highlight overlay — positioned behind the selected flag. Must be a child of
        // gridContainer (not _root): chooseEnvironment() computes its left/top from the
        // flag containers' own left/top, which are relative to gridContainer. Appending
        // it to _root instead put it in the wrong coordinate space entirely (it would
        // position relative to the nearest positioned ancestor, which is nowhere near
        // the flag grid), and the image also needs object-fit: contain — the global
        // `img { object-fit: none }` reset (_index.scss) otherwise renders this 226x225
        // source at native size instead of scaled to the 80x80 box.
        // No explicit z-index: it must paint *behind* the flag icons, and since this is
        // appended to gridContainer before the flag containers loop below, plain DOM
        // order already puts it behind them — z-index:10 here previously forced it in
        // front of every flag regardless of DOM order.
        this._SafeStr_4558 = document.createElement('div');
        Object.assign(this._SafeStr_4558.style, {
            position: 'absolute',
            pointerEvents: 'none',
            display: 'none',
        } as Partial<CSSStyleDeclaration>);

        const chosenIcon = document.createElement('img');

        chosenIcon.src = flagSelectedUrl;
        chosenIcon.draggable = false;
        // AS3: scaleX = scaleY = 0.5
        Object.assign(chosenIcon.style, {
            width: (THUMB_SIZE * THUMB_SCALE) + 'px',
            height: (THUMB_SIZE * THUMB_SCALE) + 'px',
            objectFit: 'contain',
            pointerEvents: 'none',
        } as Partial<CSSStyleDeclaration>);
        this._SafeStr_4558.appendChild(chosenIcon);
        gridContainer.appendChild(this._SafeStr_4558);

        // AS3: while loop creating flag containers at scale 0.5
        // _local_3 = 80 (thumb_size * scale), _local_2 = 5 (spacing/2)
        const thumbDisplaySize = THUMB_SIZE * THUMB_SCALE; // 80px
        const gap = 5;

        for(let i = 0; i < this._SafeStr_4557.length; i++) 
        {
            const envId = this._SafeStr_4557[i];
            const container = document.createElement('div');

            // AS3: _local_6 = _local_7 % 9; _local_9 = int(_local_7 / 9)
            const col = i % ITEMS_PER_ROW;
            const row = Math.floor(i / ITEMS_PER_ROW);
            const xPos = (col * thumbDisplaySize) + (col * gap);
            const yPos = (row * thumbDisplaySize) + (row * gap);

            Object.assign(container.style, {
                position: 'absolute',
                left: xPos + 'px',
                top: yPos + 'px',
                width: thumbDisplaySize + 'px',
                height: thumbDisplaySize + 'px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            } as Partial<CSSStyleDeclaration>);

            const img = document.createElement('img');

            img.src = FLAG_IMAGES[envId] ?? '';
            img.alt = envId;
            img.draggable = false;
            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
            } as Partial<CSSStyleDeclaration>);
            container.appendChild(img);

            container.dataset.index = String(i);
            container.addEventListener('click', this._onEnvironmentClick);
            gridContainer.appendChild(container);
            this._environmentImageContainers.push(container);
        }

        // Calculate grid dimensions
        const cols = Math.min(this._SafeStr_4557.length, ITEMS_PER_ROW);
        const rows = Math.ceil(this._SafeStr_4557.length / ITEMS_PER_ROW);

        gridContainer.style.width = ((cols * thumbDisplaySize) + ((cols - 1) * gap)) + 'px';
        gridContainer.style.height = ((rows * thumbDisplaySize) + ((rows - 1) * gap)) + 'px';
        this._root.appendChild(gridContainer);

        // AS3: _environmentName = LoaderUI.createTextField("Title", 20, 0xFFFFFF, false, true, false, false)
        this._environmentName = document.createElement('div');
        Object.assign(this._environmentName.style, {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.35)',
            textAlign: 'center',
            marginBottom: '10px',
        } as Partial<CSSStyleDeclaration>);
        this._root.appendChild(this._environmentName);

        // AS3: Buttons container
        const buttons = document.createElement('div');

        buttons.className = 'habbo-btn-row';
        buttons.style.marginTop = '10px';

        // AS3: _loginButton = new ColouredButton("gfreen", "${connection.login.login}", ...)
        this._loginButton.className = 'habbo-btn habbo-btn--green habbo-btn--arrow';
        this._loginButton.textContent = 'Login';
        this._loginButton.addEventListener('click', this._onButtonSelect);
        buttons.appendChild(this._loginButton);

        this._root.appendChild(buttons);

        // AS3: chooseEnvironment()
        this.chooseEnvironment();
    }

    /**
     * AS3: dispose()
     */
    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;

        for(const item of this._environmentImageContainers) 
        {
            item.removeEventListener('click', this._onEnvironmentClick);
        }

        this._loginButton.removeEventListener('click', this._onButtonSelect);
        this._environmentImageContainers.length = 0;
        this._root.remove();
    }

    /**
     * AS3: initEnvironmentImages()
     * Reads the environment list from config property "live.environment.list".
     */
    private initEnvironmentImages(): void 
    {
        const envListStr = this._context.getProperty('live.environment.list');

        if(envListStr) 
        {
            this._SafeStr_4557 = envListStr.split('/');
        }
        else 
        {
            // Default environment list matching AS3 order
            this._SafeStr_4557 = ['en', 'pt', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'tr', 'dev'];
        }
    }

    /**
     * AS3: addTitleField()
     * Creates title: "${connection.login.environment.choose}" — white 40px bold
     */
    private addTitleField(): void 
    {
        if(!this._SafeStr_4547) 
        {
            this._SafeStr_4547 = document.createElement('div');
            this._SafeStr_4547.className = 'habbo-title';
            // AS3: "${connection.login.environment.choose}"
            this._SafeStr_4547.textContent = 'Choose your hotel';
            this._root.appendChild(this._SafeStr_4547);

            const subtitle = document.createElement('div');

            subtitle.className = 'habbo-subtitle-line';
            subtitle.textContent = 'Pick the hotel you want to visit.';
            this._root.appendChild(subtitle);
        }
    }

    /**
     * AS3: onEnvironmentClick(_arg_1:Event)
     * Selects the clicked environment.
     */
    private _onEnvironmentClick = (e: Event): void => 
    {
        const target = e.currentTarget as HTMLDivElement;
        const index = parseInt(target.dataset.index ?? '0', 10);

        this._SafeStr_4556 = index;
        this.chooseEnvironment();

        if(this._SafeStr_4557) 
        {
            this._context.updateEnvironment(this._SafeStr_4557[this._SafeStr_4556], true);
        }
    };

    /**
     * AS3: chooseEnvironment()
     * Positions the highlight sprite over the selected flag and updates description.
     */
    private chooseEnvironment(): void 
    {
        const container = this._environmentImageContainers[this._SafeStr_4556];

        if(!container) return;

        // AS3: Position _SafeStr_4558 centered over the selected container
        if(this._SafeStr_4558) 
        {
            const containerX = parseInt(container.style.left, 10) || 0;
            const containerY = parseInt(container.style.top, 10) || 0;
            const containerW = container.offsetWidth || (THUMB_SIZE * THUMB_SCALE);
            const containerH = container.offsetHeight || (THUMB_SIZE * THUMB_SCALE);
            const highlightW = THUMB_SIZE * THUMB_SCALE;
            const highlightH = THUMB_SIZE * THUMB_SCALE;

            // AS3: _SafeStr_4558.x = (_local_1.x - ((_SafeStr_4558.width - _local_1.width) / 2)) - 1
            this._SafeStr_4558.style.left = (containerX - ((highlightW - containerW) / 2) - 1) + 'px';
            this._SafeStr_4558.style.top = (containerY - ((highlightH - containerH) / 2) - 1) + 'px';
            this._SafeStr_4558.style.display = '';
        }

        // AS3: _loginButton.active = true
        this._loginButton.disabled = false;

        this.updateDescription();
    }

    /**
     * AS3: onButtonSelect(_arg_1:DisplayObject)
     * Commits environment selection and goes to Login screen.
     */
    private _onButtonSelect = (): void => 
    {
        if(this._SafeStr_4557) 
        {
            this._context.updateEnvironment(this._SafeStr_4557[this._SafeStr_4556], false);
        }

        this._context.showScreen(2);
    };

    /**
     * AS3: updateDescription()
     * Updates the environment name label.
     */
    private updateDescription(): void 
    {
        if(!this._SafeStr_4557 || !this._environmentName) return;

        const envId = this._SafeStr_4557[this._SafeStr_4556];

        // AS3: _environmentName.text = _context.getProperty("connection.info.name." + _local_1)
        this._environmentName.textContent = this._context.getProperty('connection.info.name.' + envId) ?? envId;
    }
}
