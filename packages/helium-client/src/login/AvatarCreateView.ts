/**
 * AvatarCreateView
 *
 * @see vortex-client/src/onBoardingHc/steps/OnBoardingHcStepAvatarCreate.as
 *
 * Avatar creation / look editor screen (SCREEN_AVATAR_CREATE = 6).
 * Lets the user pick a gender, hair/head/chest/legs/shoes looks and colours
 * (or a randomized preset), choose a name (validated live via
 * context.checkName()), and submit via context.createAvatar().
 *
 * Unlike AS3 — which spins up its own onboarding-only AvatarRenderManager with
 * a hand-built embedded figuredata subset (see OnBoardingHc.createAvatarRenderManager()) —
 * our port reuses the engine's already-bootstrapped avatarRenderManager
 * (Helium.bootstrap() completes before the login flow is shown, see
 * HeliumApp.init()), so the full figuredata/palette set is available here.
 *
 * AS3 properties (OnBoardingHcStepAvatarCreate):
 * - _context: IOnBoardingHcContext
 * - _figureData: IFigureSetData
 * - _selectedSets / _selectedColors: Dictionary keyed by part type
 * - _activePartType: String
 * - _selectedGender: String ("M" | "F")
 * - _nameValid / _initialized / _disposed: Boolean
 */
import type {ILoginContext} from './ILoginContext';
import {AvatarFigurePartType} from '@habbo/avatar/enum/AvatarFigurePartType';
import {AvatarRenderEvent} from '@habbo/avatar/enum/AvatarRenderEvent';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IFigureData} from '@habbo/avatar/structure/IFigureData';
import type {ISetType} from '@habbo/avatar/structure/figure/ISetType';
import type {IFigurePartSet} from '@habbo/avatar/structure/figure/IFigurePartSet';
import type {IPartColor} from '@habbo/avatar/structure/figure/IPartColor';

const GENDER_MALE = 'M';
const GENDER_FEMALE = 'F';
const GENDER_UNISEX = 'U';

// AS3: MALE_PRESETS — OnBoardingHcStepAvatarCreate.as
const MALE_PRESETS: string[] = [
    'hr-891-34.hd-209-10.ch-255-71.lg-280-81',
    'hr-893-42.hd-209-19.ch-230-80.lg-3290-82.sh-906-64',
    'hr-889-34.hd-200-1.ch-3030-73.lg-3023-88.sh-300-64',
    'hr-145-42.hd-185-1.ch-230-66.lg-270-82.sh-290-81',
    'hr-110-38.hd-190-1.ch-3030-85.lg-275-84.sh-290-74',
    'hr-891-42.hd-190-14.ch-230-64.lg-3290-64.sh-906-64',
    'hr-110-35.hd-185-1.ch-3110-80-25.lg-270-84.sh-905-80',
    'hr-145-43.hd-209-1.ch-809-80.lg-275-82.sh-906-64',
    'hr-889-42.hd-207-1370.ch-230-80.lg-280-80.sh-906-64',
    'hr-891-48.hd-200-1370.ch-809-84.lg-3290-84.sh-300-84',
    'hd-190-30.ch-230-82.lg-275-72.sh-905-88',
    'hd-185-10.ch-3110-85-25.lg-275-82.sh-300-84',
    'hr-893-40.hd-200-14.ch-255-75.lg-280-75.sh-906-75',
    'hr-889-45.hd-190-1370.ch-255-68.lg-3023-88.sh-906-68',
    'hr-110-45.hd-200-1371.ch-255-85.lg-280-84.sh-3068-85-25',
    'hr-893-35.hd-185-10.ch-230-1408.lg-275-72',
    'hr-145-42.hd-200-10.ch-255-64.lg-3290-64.sh-906-64',
    'hr-889-42.hd-209-10.ch-809-81.lg-3290-64.sh-300-64',
    'hr-110-39.hd-190-1371.ch-3110-80-25.lg-275-81.sh-3068-83-25',
    'hr-891-48.hd-185-20.ch-3030-71.lg-3023-80.sh-300-81',
    'hr-145-37.hd-200-1.ch-3030-75.lg-270-80.sh-3068-83-25',
    'hr-891-44.hd-207-1.ch-809-76.lg-270-76.sh-3068-76-25',
    'hr-145-48.hd-185-20.ch-3110-76-25.lg-270-74.sh-290-75',
    'hr-110-44.hd-200-30.ch-809-83.lg-270-84.sh-300-64',
    'hr-891-34.hd-207-14.ch-230-81.lg-270-76.sh-290-80',
];

// AS3: FEMALE_PRESETS — OnBoardingHcStepAvatarCreate.as
const FEMALE_PRESETS: string[] = [
    'hr-891-40.hd-627-1371.ch-665-66.lg-700-82.sh-3068-68-25',
    'hr-515-48.hd-628-1.ch-635-73.lg-695-81.sh-735-83',
    'hr-891-35.hd-625-8.ch-685-73.lg-715-73.sh-907-73',
    'hr-837-45.hd-627-14.ch-670-76.lg-695-71.sh-907-73',
    'hr-892-48.hd-605-14.ch-685-64.lg-700-72.sh-906-64',
    'hr-893-32.hd-628-20.ch-823-76.lg-710-82.sh-735-76',
    'hr-892-32.hd-628-1.ch-665-81.lg-700-80.sh-3068-81-25',
    'hr-893-40.hd-610-12.ch-670-81.lg-716-81-25.sh-725-83',
    'hr-891-42.hd-625-10.ch-635-64.lg-695-64.sh-906-64',
    'hd-625-1370.ch-823-72.lg-710-74.sh-725-74',
    'hr-515-45.hd-628-1.ch-823-75.lg-710-73.sh-3068-84-25',
    'hr-893-34.hd-605-19.ch-685-84.lg-695-85.sh-906-85',
    'hr-837-39.hd-610-1.ch-685-91.lg-695-90.sh-906-80',
    'hr-891-34.hd-610-1369.ch-635-74.lg-695-82.sh-906-71',
    'hr-892-39.hd-628-1370.ch-670-64.lg-716-64-25.sh-907-64',
    'hr-837-46.hd-627-20.ch-665-76.lg-716-68-25',
    'hr-892-37.hd-605-10.ch-665-88.lg-700-88',
    'hr-892-48.hd-628-1371.ch-823-82.lg-700-71.sh-725-81',
    'hr-891-36.hd-625-8.ch-670-80.lg-715-80.sh-907-80',
    'hr-891-48.hd-628-12.ch-823-64.lg-715-64.sh-907-76',
    'hr-837-48.hd-627-14.ch-685-73.lg-695-76.sh-907-82',
    'hr-893-48.hd-605-1371.ch-665-74.lg-700-72.sh-725-74',
    'hr-515-35.hd-625-10.ch-665-72.lg-695-72.sh-906-64',
    'hr-837-35.hd-628-1.ch-635-81.lg-710-75.sh-735-81',
    'hr-893-44.hd-628-30.ch-670-76.lg-715-76.sh-907-76',
];

// AS3: PART_TYPES — OnBoardingHcStepAvatarCreate.as
const PART_TYPES: string[] = [
    AvatarFigurePartType.HAIR,
    AvatarFigurePartType.HEAD,
    AvatarFigurePartType.CHEST,
    'lg',
    AvatarFigurePartType.SHOES,
];

const PART_TYPE_LABELS: Record<string, string> = {
    [AvatarFigurePartType.HAIR]: 'Hair',
    [AvatarFigurePartType.HEAD]: 'Face',
    [AvatarFigurePartType.CHEST]: 'Shirt',
    lg: 'Trousers',
    [AvatarFigurePartType.SHOES]: 'Shoes',
};

const PART_BUTTON_LIMIT = 5;
const COLOR_BUTTON_LIMIT = 16;

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

export class AvatarCreateView implements IAvatarImageListener
{
    private _context: ILoginContext;
    private _root: HTMLDivElement;

    private _nameField: HTMLInputElement;
    private _statusField: HTMLDivElement;
    private _createButton: HTMLButtonElement;
    private _cancelButton: HTMLButtonElement;
    private _randomizeButton: HTMLButtonElement;
    private _maleButton: HTMLButtonElement;
    private _femaleButton: HTMLButtonElement;
    private _partGrid: HTMLDivElement;
    private _colorGrid: HTMLDivElement;
    private _previewCanvas: HTMLCanvasElement;

    /** AS3: _figureData */
    private _figureData: IFigureData | null = null;

    /** AS3: _selectedSets */
    private _selectedSets: Map<string, IFigurePartSet> = new Map();

    /** AS3: _selectedColors */
    private _selectedColors: Map<string, string[]> = new Map();

    /** AS3: _activePartType */
    private _activePartType: string = AvatarFigurePartType.HAIR;

    /** AS3: _selectedGender */
    private _selectedGender: string = GENDER_MALE;

    /** AS3: _initialized */
    private _initialized: boolean = false;

    /** AS3: _nameValid */
    private _nameValid: boolean = false;

    /**
	 * Avatar images still waiting on an async part download (isPlaceholder() was true
	 * when created), kept alive so their avatarImageReady() callback still fires.
	 * Not AS3 — the AS3 render manager races through this synchronously in one place;
	 * ours downloads over the network, so every render pass can leave several of
	 * these pending and they must be tracked and disposed on the *next* pass, or
	 * every render leaks the previous pass's pending images and their listener
	 * registrations, which then all fire together and re-render again — a cascade
	 * that gets worse every pass and eventually locks up the tab.
	 */
    private _pendingImages: any[] = [];

    /** Coalesces bursts of avatarImageReady() callbacks into a single re-render. */
    private _rerenderScheduled: boolean = false;

    /** Whether we're currently subscribed to AvatarRenderEvent.AVATAR_RENDER_READY. */
    private _waitingForRenderer: boolean = false;

    /** Diagnostic timeout so "Loading looks..." doesn't hang silently forever. */
    private _renderTimeoutId: number = 0;

    public disposed: boolean = false;

    /**
	 * AS3: OnBoardingHcStepAvatarCreate(context:IOnBoardingHcContext)
	 */
    constructor(context: ILoginContext)
    {
        this._context = context;
        this._root = document.createElement('div');
        Object.assign(this._root.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            // AS3-fidelity note: this used to be a hardcoded width:960px, wider than what
            // .habbo-split--full .habbo-split__content actually has left after its own
            // 40px/48px padding (960 - 96 = 864px content-box) — the extra ~96px is
            // exactly what forced the horizontal scrollbar. Just fill the parent instead.
            width: '100%',
            boxSizing: 'border-box',
        } as Partial<CSSStyleDeclaration>);

        this._nameField = document.createElement('input');
        this._statusField = document.createElement('div');
        this._createButton = document.createElement('button');
        this._cancelButton = document.createElement('button');
        this._randomizeButton = document.createElement('button');
        this._maleButton = document.createElement('button');
        this._femaleButton = document.createElement('button');
        this._partGrid = document.createElement('div');
        this._colorGrid = document.createElement('div');
        this._previewCanvas = document.createElement('canvas');
        this._previewCanvas.width = 190;
        this._previewCanvas.height = 190;
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
        if(this._initialized) return;

        this._initialized = true;
        this._selectedSets = new Map();
        this._selectedColors = new Map();

        this.buildLayout();
        this.loadFigureData();
    }

    /**
	 * getFigureData() reads embedded figuredata that AvatarRenderManager populates
	 * synchronously in onConfigurationReady() (called from initComponent(), i.e.
	 * during Helium.bootstrap() — well before the login flow even shows). isReady
	 * is a *different*, broader flag: it additionally waits on network-dependent
	 * asset/effect library downloads and the figurepartlist/figuremap fetches,
	 * none of which the clothing picker actually needs to list available looks.
	 *
	 * Gating this screen on isReady (an earlier version of this method did) meant
	 * a server that never finishes those downloads — e.g. because
	 * external.figurepartlist.txt or flash.dynamic.avatar.download.* isn't in its
	 * external_variables response — blocked the *entire* editor forever, even
	 * though the actual figuredata had been available the whole time. So: read
	 * getFigureData() directly, and only fall back to waiting on
	 * AvatarRenderEvent.AVATAR_RENDER_READY if it's genuinely still empty (a
	 * startup race condition), not as the primary gate.
	 */
    private loadFigureData(): void
    {
        const renderManager = this._context.avatarRenderManager;

        if(!renderManager)
        {
            this._statusField.textContent = 'Avatar editor unavailable — something went wrong.';
            this._createButton.disabled = true;

            return;
        }

        const figureData = renderManager.getFigureData();
        const hasAnySets = !!figureData
			&& PART_TYPES.some((partType) => (figureData.getSetType(partType)?.partSets.size ?? 0) > 0);

        if(!hasAnySets)
        {
            this._statusField.textContent = 'Loading looks...';

            if(!this._waitingForRenderer)
            {
                this._waitingForRenderer = true;
                renderManager.events.once(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRendererReady);

                // Diagnostic only at this point — if figuredata is still empty even after
                // this fires (or times out), something is genuinely missing server-side;
                // see AvatarRenderManager.checkReady()'s 8 required flags.
                window.clearTimeout(this._renderTimeoutId);
                this._renderTimeoutId = window.setTimeout(() =>
                {
                    if(this.disposed) return;

                    const stillEmpty = !this._figureData
						|| !PART_TYPES.some((pt) => (this._figureData!.getSetType(pt)?.partSets.size ?? 0) > 0);

                    if(stillEmpty)
                    {
                        this._statusField.textContent =
                            "Still loading avatar assets — this can mean the server didn't send "
							+ 'everything AvatarRenderManager needs (check the console for warnings '
							+ 'from AvatarRenderManager/AvatarAssetDownloadManager).';
                    }
                }, 8000);
            }

            return;
        }

        window.clearTimeout(this._renderTimeoutId);
        this._figureData = figureData;
        this._statusField.textContent = '';
        this.resetFigure();
        this.refreshEditor();
        this.updateCreateButtonState();
    }

    private _onAvatarRendererReady = (): void =>
    {
        this._waitingForRenderer = false;

        if(this.disposed) return;

        this.loadFigureData();
    };

    /**
	 * Disposes every avatar image left over from the previous render pass that was
	 * still waiting on a download (see _pendingImages), then re-renders the part
	 * grid, color grid and main preview. Every place that used to call
	 * renderPartGrid() + renderColorGrid() + updateFigurePreview() together now
	 * goes through here instead, so pending images never accumulate across passes.
	 */
    private refreshEditor(): void
    {
        this.disposePendingImages();
        this.renderPartGrid();
        this.renderColorGrid();
        this.updateFigurePreview();
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
	 * AS3: addHeaders() + addEditorPanels() + addNameField() + addButtons() (combined for the DOM layout)
	 */
    private buildLayout(): void
    {
        // AS3: addHeaders() has no single top-level title — only the three 24px column
        // headers below ("Choose looks" / "Choose colour" / "This is your Habbo").
        const columns = document.createElement('div');

        Object.assign(columns.style, {
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
        } as Partial<CSSStyleDeclaration>);
        this._root.appendChild(columns);

        // Left column — looks
        const looksCol = document.createElement('div');

        Object.assign(looksCol.style, { flex: '1 1 340px' } as Partial<CSSStyleDeclaration>);
        looksCol.appendChild(this.buildColumnHeader('Choose looks'));
        Object.assign(this._partGrid.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '13px',
        } as Partial<CSSStyleDeclaration>);
        looksCol.appendChild(this._partGrid);
        columns.appendChild(looksCol);

        // Middle column — colours
        const colorsCol = document.createElement('div');

        Object.assign(colorsCol.style, { flex: '1 1 240px' } as Partial<CSSStyleDeclaration>);
        colorsCol.appendChild(this.buildColumnHeader('Choose colour'));
        Object.assign(this._colorGrid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 50px)',
            gap: '2px 2px',
        } as Partial<CSSStyleDeclaration>);
        colorsCol.appendChild(this._colorGrid);
        columns.appendChild(colorsCol);

        // Right column — gender/randomize + preview
        const previewCol = document.createElement('div');

        Object.assign(previewCol.style, {
            flex: '1 1 260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
        } as Partial<CSSStyleDeclaration>);
        previewCol.appendChild(this.buildColumnHeader('This is your Habbo'));

        const genderRow = document.createElement('div');

        Object.assign(genderRow.style, { display: 'flex', gap: '8px' } as Partial<CSSStyleDeclaration>);
        this.styleToggleButton(this._maleButton, 'Male');
        this.styleToggleButton(this._femaleButton, 'Female');
        this._maleButton.addEventListener('click', () => this.changeGender(GENDER_MALE));
        this._femaleButton.addEventListener('click', () => this.changeGender(GENDER_FEMALE));
        genderRow.appendChild(this._maleButton);
        genderRow.appendChild(this._femaleButton);

        this._randomizeButton.className = 'habbo-btn habbo-btn--yellow';
        Object.assign(this._randomizeButton.style, { minWidth: '44px', padding: '0', fontSize: '16px' } as Partial<CSSStyleDeclaration>);
        this._randomizeButton.textContent = '🎲';
        this._randomizeButton.title = 'Randomize';
        this._randomizeButton.addEventListener('click', this._onRandomize);
        genderRow.appendChild(this._randomizeButton);

        previewCol.appendChild(genderRow);

        Object.assign(this._previewCanvas.style, {
            background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)',
            borderRadius: '8px',
            imageRendering: 'pixelated',
        } as Partial<CSSStyleDeclaration>);
        previewCol.appendChild(this._previewCanvas);

        const hint = document.createElement('div');

        Object.assign(hint.style, {
            fontSize: '12px',
            color: '#CDEAF4',
            fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
            textAlign: 'center',
            maxWidth: '260px',
            textShadow: '0 -1px 0 rgba(0, 0, 0, 0.7)',
        } as Partial<CSSStyleDeclaration>);
        hint.textContent = "Can't decide? Don't worry, you can change your clothes later!";
        previewCol.appendChild(hint);

        columns.appendChild(previewCol);

        this.updateGenderButtonState();

        // Name field + status + submit row
        const footer = document.createElement('div');

        Object.assign(footer.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '24px',
            marginTop: '8px',
        } as Partial<CSSStyleDeclaration>);

        const nameCol = document.createElement('div');

        Object.assign(nameCol.style, { flex: '1 1 auto' } as Partial<CSSStyleDeclaration>);

        const nameLabel = document.createElement('label');

        nameLabel.className = 'habbo-field__label';
        // AS3: "${login.create_avatar.choose_name.name}"
        nameLabel.textContent = 'Name';
        nameCol.appendChild(nameLabel);

        this._nameField.className = 'habbo-input';
        Object.assign(this._nameField.style, { maxWidth: '420px' } as Partial<CSSStyleDeclaration>);
        this._nameField.type = 'text';
        this._nameField.placeholder = 'Choose a name...';
        this._nameField.addEventListener('input', this._onNameChange);
        nameCol.appendChild(this._nameField);

        this._statusField.className = 'habbo-status';
        Object.assign(this._statusField.style, { marginTop: '6px' } as Partial<CSSStyleDeclaration>);
        nameCol.appendChild(this._statusField);

        footer.appendChild(nameCol);

        const buttonRow = document.createElement('div');

        Object.assign(buttonRow.style, { display: 'flex', gap: '12px' } as Partial<CSSStyleDeclaration>);

        this._cancelButton.className = 'habbo-btn habbo-btn--red';
        this._cancelButton.textContent = 'Cancel';
        this._cancelButton.addEventListener('click', this._onCancel);
        buttonRow.appendChild(this._cancelButton);

        this._createButton.className = 'habbo-btn habbo-btn--green';
        this._createButton.textContent = 'Submit';
        this._createButton.disabled = true;
        this._createButton.addEventListener('click', this._onCreate);
        buttonRow.appendChild(this._createButton);

        footer.appendChild(buttonRow);

        this._root.appendChild(footer);
    }

    private buildColumnHeader(text: string): HTMLDivElement
    {
        const header = document.createElement('div');

        header.className = 'habbo-subtitle';
        header.textContent = text;

        return header;
    }

    private styleToggleButton(button: HTMLButtonElement, label: string): void
    {
        button.className = 'habbo-btn habbo-btn--yellow';
        Object.assign(button.style, { minWidth: '80px' } as Partial<CSSStyleDeclaration>);
        button.textContent = label;
    }

    private updateGenderButtonState(): void
    {
        this._maleButton.style.outline = this._selectedGender === GENDER_MALE ? '3px solid #4CAF50' : 'none';
        this._femaleButton.style.outline = this._selectedGender === GENDER_FEMALE ? '3px solid #4CAF50' : 'none';
    }

    // ---- Figure selection state (AS3: resetFigure / applyRandomPreset / applyFigureString) ----

    /** AS3: resetFigure() */
    private resetFigure(): void
    {
        this._selectedSets = new Map();
        this._selectedColors = new Map();
        this._activePartType = AvatarFigurePartType.HAIR;

        if(this.applyRandomPreset(false)) return;

        for(const partType of PART_TYPES)
        {
            const sets = this.getSelectableSets(partType);

            if(sets.length > 0)
            {
                this._selectedSets.set(partType, sets[0]);
                this._selectedColors.set(partType, this.getDefaultColorIds(partType));
            }
        }
    }

    /** AS3: applyRandomPreset(playAnimation:Boolean):Boolean */
    private applyRandomPreset(playAnimation: boolean): boolean
    {
        const presets = this._selectedGender === GENDER_FEMALE ? FEMALE_PRESETS : MALE_PRESETS;
        let index = Math.floor(Math.random() * presets.length);

        for(let tries = 0; tries < presets.length; tries++)
        {
            if(this.applyFigureString(presets[index]))
            {
                if(playAnimation)
                {
                    this.playRandomizeFlourish();
                }

                return true;
            }

            index = (index + 1) % presets.length;
        }

        return false;
    }

    /** AS3: applyFigureString(figure:String):Boolean */
    private applyFigureString(figure: string): boolean
    {
        if(!this._figureData) return false;

        const newSets = new Map<string, IFigurePartSet>();
        const newColors = new Map<string, string[]>();

        for(const part of figure.split('.'))
        {
            const pieces = part.split('-');

            if(pieces.length < 3) continue;

            const partType = pieces[0];

            if(!PART_TYPES.includes(partType)) continue;

            const setId = parseInt(pieces[1], 10);
            const setType = this._figureData.getSetType(partType);

            if(!setType) return false;

            const partSet = setType.getPartSet(setId);

            if(!partSet || (partSet.gender !== this._selectedGender && partSet.gender !== GENDER_UNISEX))
            {
                return false;
            }

            newSets.set(partType, partSet);
            newColors.set(partType, pieces.slice(2));
        }

        for(const partType of PART_TYPES)
        {
            if(!newSets.has(partType)) return false;
        }

        this._selectedSets = newSets;
        this._selectedColors = newColors;
        this._activePartType = AvatarFigurePartType.HAIR;

        return true;
    }

    /**
	 * AS3: RandomAvatarCloudsAnimation puff effect on the preview when randomizing.
	 * Simplified to a CSS pulse (the original sprite-sheet cloud puffs are cosmetic
	 * and not required for the editor's functional behavior).
	 *
	 * TODO(AS3): vortex-client/src/onBoardingHc/steps/RandomAvatarCloudsAnimation.as —
	 * full cel animation not ported.
	 */
    private playRandomizeFlourish(): void
    {
        this._previewCanvas.animate(
            [
                { transform: 'scale(1)', filter: 'brightness(1)' },
                { transform: 'scale(1.06)', filter: 'brightness(1.4)' },
                { transform: 'scale(1)', filter: 'brightness(1)' },
            ],
            { duration: 350, easing: 'ease-out' }
        );
    }

    // ---- Figure data queries (AS3: getSelectableSets / getSelectableColors / getDefaultColorIds) ----

    /** AS3: getSelectableSets(partType:String):Array */
    private getSelectableSets(partType: string): IFigurePartSet[]
    {
        const setType = this._figureData ? this._figureData.getSetType(partType) : null;

        if(!setType) return [];

        const result: IFigurePartSet[] = [];

        for(const partSet of setType.partSets.values())
        {
            if(
                partSet.isSelectable
				&& partSet.isPreSelectable
				&& partSet.clubLevel === 0
				&& (partSet.gender === this._selectedGender || partSet.gender === GENDER_UNISEX)
            )
            {
                result.push(partSet);
            }
        }

        result.sort((a, b) => a.id - b.id);

        return result;
    }

    /** AS3: getSelectableColors(partType:String):Array */
    private getSelectableColors(partType: string): IPartColor[]
    {
        const setType = this._figureData ? this._figureData.getSetType(partType) : null;

        if(!setType || !this._figureData) return [];

        const palette = this._figureData.getPalette(setType.paletteID);

        if(!palette) return [];

        const result: IPartColor[] = [];

        for(const color of palette.colors.values())
        {
            if(color.isSelectable && color.clubLevel === 0)
            {
                result.push(color);
            }
        }

        result.sort((a, b) => a.index - b.index);

        return result;
    }

    /** AS3: getDefaultColorIds(partType:String):Array */
    private getDefaultColorIds(partType: string): string[]
    {
        const colors = this.getSelectableColors(partType);
        const preferredColorId = this.getPreferredColorId(partType);

        for(const color of colors)
        {
            if(color.id === preferredColorId)
            {
                return [String(color.id)];
            }
        }

        return colors.length > 0 ? [String(colors[0].id)] : [];
    }

    /** AS3: getPreferredColorId(partType:String):int */
    private getPreferredColorId(partType: string): number
    {
        switch(partType)
        {
            case AvatarFigurePartType.HEAD: return 1;
            case AvatarFigurePartType.HAIR: return 64;
            case AvatarFigurePartType.CHEST: return 72;
            case 'lg':
            case AvatarFigurePartType.SHOES: return 64;
            default: return 61;
        }
    }

    // ---- Rendering (AS3: renderPartGrid / renderColorGrid / createPartButton / createColorButton) ----

    /** AS3: renderPartGrid() */
    private renderPartGrid(): void
    {
        this._partGrid.innerHTML = '';

        for(const partType of PART_TYPES)
        {
            const row = document.createElement('div');

            // 72px buttons don't all fit in the column's width at PART_BUTTON_LIMIT — rather
            // than let the row overflow the whole page horizontally (which is what happened
            // with plain flex + no wrap), only the button strip scrolls, and only within
            // this row; the label stays fixed and never scrolls out of view.
            Object.assign(row.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '0',
            } as Partial<CSSStyleDeclaration>);

            const label = document.createElement('div');

            Object.assign(label.style, {
                width: '70px',
                flexShrink: '0',
                fontSize: '12px',
                color: this._activePartType === partType ? '#FFFFFF' : '#CDEAF4',
                fontWeight: this._activePartType === partType ? 'bold' : 'normal',
                fontFamily: "'Ubuntu', Arial, Helvetica, sans-serif",
            } as Partial<CSSStyleDeclaration>);
            label.textContent = PART_TYPE_LABELS[partType] ?? partType;
            row.appendChild(label);

            const strip = document.createElement('div');

            Object.assign(strip.style, {
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                overflowY: 'hidden',
                minWidth: '0',
                padding: '2px',
            } as Partial<CSSStyleDeclaration>);

            const sets = this.getSelectableSets(partType).slice(0, PART_BUTTON_LIMIT);

            for(const partSet of sets)
            {
                const button = this.createPartButton(partType, partSet);

                button.style.flexShrink = '0';
                strip.appendChild(button);
            }

            row.appendChild(strip);
            this._partGrid.appendChild(row);
        }
    }

    /** AS3: createPartButton(partType, partSet, x, y):_Str_662 */
    private createPartButton(partType: string, partSet: IFigurePartSet): HTMLButtonElement
    {
        const button = document.createElement('button');
        const selected = this.selectedPartSet(partType) === partSet.id;
        const active = partType === this._activePartType;

        Object.assign(button.style, {
            width: '72px',
            height: '72px',
            padding: '0',
            border: `2px solid ${selected ? '#4CAF50' : active ? 'rgba(255,255,255,0.5)' : 'transparent'}`,
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            overflow: 'hidden',
        } as Partial<CSSStyleDeclaration>);

        const canvas = document.createElement('canvas');

        canvas.width = 68;
        canvas.height = 68;
        canvas.style.imageRendering = 'pixelated';
        button.appendChild(canvas);
        this.renderPartPreview(partType, partSet, canvas);

        button.addEventListener('click', () => this.onPartClick(partType, partSet.id));

        return button;
    }

    /** AS3: renderColorGrid() */
    private renderColorGrid(): void
    {
        this._colorGrid.innerHTML = '';

        const colors = this.getSelectableColors(this._activePartType).slice(0, COLOR_BUTTON_LIMIT);

        for(const color of colors)
        {
            this._colorGrid.appendChild(this.createColorButton(this._activePartType, color));
        }
    }

    /** AS3: createColorButton(partType, color, x, y):ColorButton */
    private createColorButton(partType: string, color: IPartColor): HTMLButtonElement
    {
        const button = document.createElement('button');
        const selected = this.selectedColor(partType) === color.id;
        const hex = '#' + (color.rgb >>> 0).toString(16).padStart(6, '0');

        Object.assign(button.style, {
            width: '50px',
            height: '50px',
            padding: '0',
            border: `2px solid ${selected ? '#FFFFFF' : 'transparent'}`,
            borderRadius: '6px',
            background: hex,
            cursor: 'pointer',
        } as Partial<CSSStyleDeclaration>);

        button.addEventListener('click', () => this.onColorClick(partType, color.id));

        return button;
    }

    /** AS3: getPartPreview(partType, partSet):BitmapData */
    private renderPartPreview(partType: string, partSet: IFigurePartSet, canvas: HTMLCanvasElement): void
    {
        const renderManager = this._context.avatarRenderManager;

        if(!renderManager) return;

        const figure = this.getFigureString(partType, partSet.id);
        const image = renderManager.createAvatarImage(figure, 'h', this._selectedGender, this, null);

        if(!image) return;

        if(image.isPlaceholder())
        {
            // Not downloaded yet — keep it alive so avatarImageReady() fires once it is,
            // but track it so the *next* render pass disposes it instead of leaking it.
            this._pendingImages.push(image);

            return;
        }

        image.setDirection('full', 4);

        const setType = (partType === AvatarFigurePartType.HAIR || partType === AvatarFigurePartType.HEAD) ? 'head' : 'full';
        // AS3 used scale=0.5 here (matching a much bigger 96x96+ button in the Flash
        // layout); ours renders into a smaller button, so scale=1 keeps actual pixel
        // detail instead of just stretching an already-tiny bitmap.
        const texture = image.getImage(setType, true, 1);

        this.drawToCanvas(texture, canvas);
        image.dispose();
    }

    /** AS3: updateFigurePreview() */
    private updateFigurePreview(): void
    {
        const renderManager = this._context.avatarRenderManager;

        if(!renderManager) return;

        const image = renderManager.createAvatarImage(this.currentFigure, 'h', this._selectedGender, this, null);

        if(!image) return;

        if(image.isPlaceholder())
        {
            this._pendingImages.push(image);

            return;
        }

        image.setDirection('full', 4);

        const texture = image.getImage('full', true);

        this.drawToCanvas(texture, this._previewCanvas);
        image.dispose();
    }

    /** Draws an engine avatar image (Texture) onto a plain DOM canvas, scaled to fit. */
    private drawToCanvas(texture: unknown, canvas: HTMLCanvasElement, insetRatio: number = 0.08): void
    {
        const ctx = canvas.getContext('2d');

        if(!ctx) return;

        // Avatar sprites are pixel art at native resolution — the default smoothed
        // scaling blurs them badly whenever drawImage() scales up (which it does
        // here, since getImage() is called with scale=0.5 to keep composition cheap).
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const source = extractCanvasSource(texture);

        if(!source) return;

        const srcW = (source as {width: number}).width;
        const srcH = (source as {height: number}).height;

        if(srcW <= 0 || srcH <= 0) return;

        const maxW = canvas.width * (1 - insetRatio);
        const maxH = canvas.height * (1 - insetRatio);
        const scale = Math.min(maxW / srcW, maxH / srcH);
        const drawW = srcW * scale;
        const drawH = srcH * scale;

        ctx.drawImage(source, (canvas.width - drawW) / 2, canvas.height - drawH, drawW, drawH);
    }

    // ---- Figure string building (AS3: getFigureString / get currentFigure) ----

    /** AS3: getFigureString(replacePartType, replaceSetId):String */
    private getFigureString(replacePartType: string | null = null, replaceSetId: number = 0): string
    {
        const parts: string[] = [];

        for(const partType of PART_TYPES)
        {
            const partSet = this._selectedSets.get(partType);

            if(!partSet) continue;

            const setId = partType === replacePartType ? replaceSetId : partSet.id;
            let colors = this._selectedColors.get(partType) ?? [];

            if(colors.length === 0)
            {
                colors = this.getDefaultColorIds(partType);
            }

            parts.push([partType, setId, ...colors].join('-'));
        }

        return parts.join('.');
    }

    /** AS3: get currentFigure():String */
    private get currentFigure(): string
    {
        return this.getFigureString();
    }

    /** AS3: selectedPartSet(partType:String):int */
    private selectedPartSet(partType: string): number
    {
        return this._selectedSets.get(partType)?.id ?? 0;
    }

    /** AS3: selectedColor(partType:String):int */
    private selectedColor(partType: string): number
    {
        const colors = this._selectedColors.get(partType);

        return colors && colors.length > 0 ? parseInt(colors[0], 10) : 0;
    }

    // ---- Event handlers (AS3: onPartClick / onColorClick / onGenderSelected / onRandomize / onNameChange / onCreate / onCancel) ----

    /** AS3: onPartClick(button:_Str_951) */
    private onPartClick(partType: string, setId: number): void
    {
        const setType = this._figureData?.getSetType(partType);
        const partSet = setType?.getPartSet(setId);

        if(!partSet) return;

        this._activePartType = partType;
        this._selectedSets.set(partType, partSet);

        if(!this._selectedColors.get(partType))
        {
            this._selectedColors.set(partType, this.getDefaultColorIds(partType));
        }

        this.refreshEditor();
    }

    /** AS3: onColorClick(button:_Str_951) */
    private onColorClick(partType: string, colorId: number): void
    {
        const currentColors = this._selectedColors.get(partType);

        this._activePartType = partType;
        this._selectedColors.set(
            partType,
            currentColors && currentColors.length > 1 ? [String(colorId), currentColors[1]] : [String(colorId)]
        );

        this.refreshEditor();
    }

    /** AS3: changeGender(gender:String) */
    private changeGender(gender: string): void
    {
        if(this._selectedGender === gender) return;

        this._selectedGender = gender;
        this.updateGenderButtonState();
        this.resetFigure();
        this.refreshEditor();
    }

    /** AS3: onRandomize(button:_Str_951) */
    private _onRandomize = (): void =>
    {
        if(!this.applyRandomPreset(true))
        {
            this.resetFigure();
        }

        this.refreshEditor();
    };

    /** AS3: onNameChange(changeEvent:Event) */
    private _onNameChange = (): void =>
    {
        this._nameValid = false;
        this.updateCreateButtonState();

        const name = this._nameField.value.trim();

        if(name && name.length >= 3)
        {
            this._statusField.textContent = 'Checking availability...';
            this._context.checkName(name);
        }
        else
        {
            this._statusField.textContent = 'Name must be at least 3 characters.';
        }
    };

    /**
	 * AS3: onNameCheckResult(response:Object, isValid:Boolean)
	 * See ILoginViewer.nameCheckResponse for the "isValid" naming quirk this preserves.
	 */
    public onNameCheckResult(response: unknown, isValid: boolean): void
    {
        if(!isValid)
        {
            this._nameValid = false;
            this._statusField.textContent = 'That name is invalid.';
            this.updateCreateButtonState();

            return;
        }

        const responseObject = response as { valid?: boolean } | null;

        this._nameValid = responseObject?.valid === true;
        this._statusField.textContent = this._nameValid ? 'Name is available!' : 'That name is already in use.';
        this.updateCreateButtonState();
    }

    /** AS3: updateCreateButtonState() */
    private updateCreateButtonState(): void
    {
        this._createButton.disabled = !(this._nameValid && this._figureData != null);
    }

    /** AS3: onCreate(createButton:Button) */
    private _onCreate = (): void =>
    {
        if(!this._nameValid) return;

        const name = this._nameField.value.trim();

        if(!name || name.length < 3) return;

        this._context.createAvatar(name, this.currentFigure, this._selectedGender);
    };

    /** AS3: onCancel(cancelButton:Button) */
    private _onCancel = (): void =>
    {
        this._context.showScreen(3);
    };

    /**
	 * AS3: avatarImageReady(figure:String) — IAvatarImageListener
	 * Called when an async-downloaded figure part becomes available.
	 *
	 * Debounced via queueMicrotask: several pending images (see _pendingImages)
	 * routinely finish downloading within the same tick, and re-rendering once per
	 * callback instead of once per burst is what turns "a few parts finished
	 * loading" into an ever-growing cascade of re-renders (see _pendingImages doc).
	 */
    public avatarImageReady(_figureString: string): void
    {
        if(this.disposed || this._rerenderScheduled) return;

        this._rerenderScheduled = true;

        queueMicrotask(() =>
        {
            this._rerenderScheduled = false;

            if(this.disposed) return;

            this.disposePendingImages();
            this.renderPartGrid();
            this.updateFigurePreview();
        });
    }

    /**
	 * AS3: dispose()
	 */
    public dispose(): void
    {
        if(this.disposed) return;

        this.disposed = true;

        if(this._waitingForRenderer)
        {
            this._context.avatarRenderManager?.events.off(AvatarRenderEvent.AVATAR_RENDER_READY, this._onAvatarRendererReady);
            this._waitingForRenderer = false;
        }

        window.clearTimeout(this._renderTimeoutId);
        this.disposePendingImages();
        this._nameField.removeEventListener('input', this._onNameChange);
        this._randomizeButton.removeEventListener('click', this._onRandomize);
        this._createButton.removeEventListener('click', this._onCreate);
        this._cancelButton.removeEventListener('click', this._onCancel);
        this._root.remove();
    }
}
