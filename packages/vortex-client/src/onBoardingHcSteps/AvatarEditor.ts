/**
 * AvatarEditor
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHcSteps/AvatarEditor.as
 *
 * The look editor of the new-user flow: a grid of five parts per category on the left, that
 * category's palette in the middle, and the live figure on the right, plus the gender radios and a
 * dice button.
 *
 * The state that matters is two nested maps, both keyed by GENDER first: `_selections` holds the
 * chosen part-set id per category, `_selectedColorIds` the colour ids. Switching gender therefore
 * keeps each gender's own look, which is what AS3 does by lazily creating the second level.
 *
 * `updateGrids(true)` passes `this` as the avatar-image listener, so parts that are still
 * downloading come back through `avatarImageReady()`; `updateGrids(false)` is the redraw that
 * follows and must NOT re-register, or the two would feed each other forever.
 */
import {Texture} from 'pixi.js';
import {Logger} from '@core/utils/Logger';
import {AvatarFigurePartType} from '@habbo/avatar/enum/AvatarFigurePartType';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IPartColor} from '@habbo/avatar/structure/figure/IPartColor';
import {UpdateFigureDataMessageComposer} from '@habbo/communication/messages/outgoing/avatar/UpdateFigureDataMessageComposer';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {BitmapData} from '../onBoardingHcUi/display/BitmapData';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import type {Button} from '../onBoardingHcUi/Button';
import {ColorButton} from '../onBoardingHcUi/ColorButton';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import {RadioButton} from '../onBoardingHcUi/RadioButton';
import {RadioButtonGroup} from '../onBoardingHcUi/RadioButtonGroup';
import {RandomizeButton} from '../onBoardingHcUi/RandomizeButton';
import {RoundButton} from '../onBoardingHcUi/RoundButton';
import type {OnBoardingHcFlow} from '../onBoardingHc/OnBoardingHcFlow';
import {RandomAvatarCloudsAnimation} from './RandomAvatarCloudsAnimation';

const log = Logger.getLogger('client.onBoardingHcSteps.AvatarEditor');

// AS3: GENDER_MALE / GENDER_FEMALE / GENDER_UNISEX
const GENDER_MALE = 'M';
const GENDER_FEMALE = 'F';
const GENDER_UNISEX = 'U';

// AS3: NORMAL_ITEMS_TO_SHOW
const NORMAL_ITEMS_TO_SHOW = 5;

// AS3: COLORS_PER_ROW
const COLORS_PER_ROW = 4;

// AS3: CATEGORIES
const CATEGORIES = ['hr', 'hd', 'ch', 'lg', 'sh'];

// AS3: EXTRA_CATEGORIES — empty in the 701 build; the loops over it are dead but ported.
const EXTRA_CATEGORIES: string[] = [];

// AS3: RANDOM_MALE_FIGURES
const RANDOM_MALE_FIGURES = [
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

// AS3: RANDOM_FEMALE_FIGURES
const RANDOM_FEMALE_FIGURES = [
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

export class AvatarEditor extends Sprite implements IAvatarImageListener
{
    // AS3: _colorGrid
    private _colorGrid: Sprite | null = null;

    // AS3: _currentButton
    private _currentButton: Button | null = null;

    // AS3: _gender
    private _gender: string = GENDER_MALE;

    // AS3: _thumbs
    private _thumbs: Map<string, string[]> = new Map();

    // AS3: _colors
    private _colors: Map<string, ColorButton[]> = new Map();

    // AS3: _selections — gender -> category -> part-set id
    private _selections: Map<string, Map<string, string>> = new Map();

    // AS3: _selectedColorIds — gender -> category -> colour ids
    private _selectedColorIds: Map<string, Map<string, string[]>> = new Map();

    // AS3: _activeCategory
    private _activeCategory: string = 'hr';

    // AS3: _partGrid
    private _partGrid: Sprite | null = null;

    // AS3: _extraGrid
    private _extraGrid: Sprite | null = null;

    // AS3: _figureContainer
    private _figureContainer: Bitmap | null = null;

    // AS3: _randomizeButton
    private _randomizeButton: RandomizeButton | null = null;

    // AS3: _context
    private _context: OnBoardingHcFlow;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _readyButton
    private _readyButton: ColouredButton | null = null;

    // AS3: _maleButton
    private _maleButton: RadioButton | null = null;

    // AS3: _femaleButton
    private _femaleButton: RadioButton | null = null;

    // AS3: _genderButtonGroup
    private _genderButtonGroup: RadioButtonGroup | null = null;

    // AS3: _hcMembership
    private _hcMembership: boolean = false;

    // AS3: _hcTeaserBox
    private _hcTeaserBox: Sprite | null = null;

    // AS3: _hcOverlay
    private _hcOverlay: Sprite | null = null;

    // AS3: _showHcItems
    private _showHcItems: boolean = false;

    // AS3: _gridButtons
    private _gridButtons: RoundButton[] = [];

    // AS3: _hairButtons
    private _hairButtons: RoundButton[] = [];

    // AS3: _selectedColors
    private _selectedColors: Map<string, ColorButton> = new Map();

    // AS3: _cloudsAnimation
    private _cloudsAnimation: RandomAvatarCloudsAnimation | null = null;

    // AS3: _multiColorParts — part-set id -> its colour list, for parts that take two colours
    private _multiColorParts: Map<string, string[]> = new Map();

    /**
     * TS-only: rendered thumbnail per figure string.
     *
     * `updateGrids()` composites 25 avatars, and `avatarImageReady()` calls it again for every part
     * whose assets finish downloading — so a cold cache used to mean 25 rebuilds of 25 avatars, each
     * one compositing body parts into a fresh OffscreenCanvas and uploading a Texture that nothing
     * ever destroyed. The work is quadratic in the number of thumbnails and none of it changes
     * between passes: a figure string renders to the same icon every time.
     */
    private _thumbIcons: Map<string, BitmapData> = new Map();

    /** TS-only: pending coalesced grid rebuild — see `avatarImageReady()`. */
    private _gridRebuildHandle: number = 0;

    // AS3: AvatarEditor(_arg_1:OnBoardingHcFlow)
    constructor(context: OnBoardingHcFlow)
    {
        super();

        this._context = context;
        this._gender = GENDER_MALE;
        this.addEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('removedFromStage', this._onRemovedFromStage);
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: get gender():String
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: showHcItems(_arg_1:Boolean)
    public showHcItems(show: boolean): void
    {
        this._showHcItems = show;
    }

    /**
     * AS3: getFigure():String
     *
     * Builds `type-setId-colour[-colour]` per selected category. The `"25"` second colour is AS3's
     * marker for a two-colour part.
     */
    public getFigure(): string
    {
        const parts: string[] = [];
        const selections = this._selections.get(this._gender);
        const colors = this._selectedColorIds.get(this._gender);

        if(selections)
        {
            for(const [category, setId] of selections)
            {
                const colorIds = colors?.get(category);

                if(colorIds && colorIds.length > 1)
                {
                    colorIds[1] = '25';
                }

                parts.push([category, setId].concat(colorIds ?? []).join('-'));
            }
        }

        return parts.join('.');
    }

    /**
     * AS3: setRandomFigure()
     *
     * Rolls one of the per-gender preset figures, applies every part and colour it names, then
     * fires the cloud puff. If the roll landed on what was already worn (all but one part equal),
     * AS3 rolls again.
     */
    public setRandomFigure(): void
    {
        const figure = this.getRandomFigureData();
        const parts = figure.split('.');
        const selections = this.selectionsForGender();
        const colorIds = this.colorIdsForGender();
        let sameCount = 0;
        let hairName: string | null = null;

        for(const part of parts)
        {
            const segments = String(part).split('-');
            const partColors: string[] = [];

            if(segments.length >= 3)
            {
                const category = segments[0];

                if(selections.get(category) === segments[1])
                {
                    sameCount++;
                }

                selections.set(category, segments[1]);
                partColors.push(segments[2]);

                const categoryColors = this._colors.get(category);

                if(categoryColors)
                {
                    for(const colorButton of categoryColors)
                    {
                        if(colorButton.name === `${category}_${segments[2]}`)
                        {
                            this._colorSelected(colorButton);
                        }
                    }
                }

                if(segments.length > 3)
                {
                    partColors.push(segments[3]);
                }

                colorIds.set(category, partColors);

                if(category === 'hr')
                {
                    hairName = `${category}_${segments[1]}`;
                }
            }
        }

        this._activeCategory = 'hr';

        for(const button of this._hairButtons)
        {
            if(button.name === hairName)
            {
                // AS3 clicks it twice: the first click selects, the second re-selects and leaves
                // the grid on the hair category.
                this._gridClick(button);
                this._gridClick(button);
            }
        }

        if(this._cloudsAnimation)
        {
            this._cloudsAnimation.visible = true;
            this._cloudsAnimation.startAnimation();
        }

        if(sameCount >= parts.length - 1)
        {
            this.setRandomFigure();
        }
    }

    /**
     * AS3: avatarImageReady(_arg_1:String)
     *
     * The render manager calls back once a figure's assets have downloaded. A callback for the
     * figure currently worn repaints the preview; anything else means a grid thumbnail arrived, so
     * the grids are rebuilt WITHOUT re-registering as a listener.
     */
    public avatarImageReady(figure: string): void
    {
        const manager = this._context.avatarRenderManager;

        if(!manager) return;

        if(figure === this.getFigure() || figure.replace('-25', '') === this.getFigure())
        {
            // No gender here either — AS3 calls `createAvatarImage(param1, "h")` and stops there.
            // The figure is already the full worn one, so validation would add nothing, but it is
            // the same call and it stays the same call.
            const image = manager.createAvatarImage(figure, 'h', null, null, null);

            if(!image) return;

            image.setDirection('full', 4);

            const bitmap = image.getImage('full', false);

            if(bitmap && this._figureContainer)
            {
                this._figureContainer.bitmapData = AvatarEditor.toBitmapData(bitmap);
            }

            return;
        }

        // TS-only: AS3 rebuilds the grids on every callback. The assets arrive in a burst — one
        // callback per part library — and each rebuild is 25 avatar composites, so the passes pile
        // up on the main thread while the browser is still delivering the rest of the burst. The
        // rebuild is coalesced into the next frame instead: the burst produces one rebuild, and the
        // result is identical because a rebuild reads the current state, not the callback's.
        if(this._gridRebuildHandle !== 0) return;

        this._gridRebuildHandle = window.requestAnimationFrame(() =>
        {
            this._gridRebuildHandle = 0;

            if(this._disposed) return;

            this.updateGrids(false);
        });
    }

    // AS3: nameChangeCompleted(_arg_1:Boolean=false)
    public nameChangeCompleted(_claimed: boolean = false): void
    {
        this._context.editorFinished();
    }

    // AS3: showHideGrid(_arg_1:Boolean=false)
    public showHideGrid(visible: boolean = false): void
    {
        if(this._partGrid) this._partGrid.visible = visible;

        if(this._colorGrid) this._colorGrid.visible = visible;

        if(this._maleButton) this._maleButton.visible = visible;

        if(this._femaleButton) this._femaleButton.visible = visible;

        if(this._readyButton) this._readyButton.visible = visible;
    }

    // AS3: showHideButtons(_arg_1:Boolean)
    public showHideButtons(visible: boolean): void
    {
        if(this._readyButton)
        {
            this._readyButton.visible = visible;
        }
    }

    // AS3: onRandomize(_arg_1:Button)
    public onRandomize = (_button: Button): void =>
    {
        this.setRandomFigure();
    };

    /**
     * AS3: checkForHcMembership(_arg_1:String)
     *
     * The web side answers "OK" once a club membership has been bought mid-flow.
     */
    public checkForHcMembership(result: string): void
    {
        if(result !== 'OK') return;

        this._hcMembership = true;
        this.populateColors();

        if(this._hcOverlay)
        {
            this._hcOverlay.visible = false;
        }
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this.addFigureImage();
        this.addHeaders();
        this.addGenderButtons();
        this._partGrid = new Sprite();
        this._partGrid.x = 40;
        this._partGrid.y = 50;
        this.addChild(this._partGrid);
        this._extraGrid = new Sprite();
        this._extraGrid.x = 40;
        this._extraGrid.y = 365;
        this.addChild(this._extraGrid);
        this._colorGrid = new Sprite();
        this._colorGrid.x = 375;
        this._colorGrid.y = 50;
        this.addChild(this._colorGrid);
        this.populateColors();
        this.renderColors();

        if(this._maleButton)
        {
            this._maleButton.selected = true;
        }

        this.selectionsForGender();
        this.colorIdsForGender();
        this.setRandomFigure();
    };

    // AS3: onRemovedFromStage(_arg_1:Event) — empty in AS3
    private _onRemovedFromStage = (): void =>
    {
        // AS3 leaves this empty.
    };

    // AS3: addFigureImage()
    private addFigureImage(): void
    {
        const nameAreaX = this._context.getNameAreaX();
        const nameAreaWidth = this._context.getNameAreaWidth();

        this._figureContainer = new Bitmap();
        this._figureContainer.x = nameAreaX + nameAreaWidth / 2 + 15;
        this._figureContainer.y = 90;
        this._figureContainer.scaleX = 2;
        this._figureContainer.scaleY = 2;

        const halo = new Bitmap(LoginAssets.get('avatar_halo'));

        halo.x = this._figureContainer.x + 35;
        halo.y = 290;
        halo.blendMode = 'overlay';

        const glow = new Bitmap(LoginAssets.get('avatar_glow'));

        glow.x = this._figureContainer.x - 55;
        glow.y = 90;

        // AS3 blendMode "add" — Canvas2D spells additive blending "lighter".
        glow.blendMode = 'lighter';
        this.addChild(halo);
        this.addChild(glow);
        this.addChild(this._figureContainer);
        this._cloudsAnimation = new RandomAvatarCloudsAnimation();
        this._cloudsAnimation.x = this._figureContainer.x;
        this._cloudsAnimation.y = this._figureContainer.y;
        this.addChild(this._cloudsAnimation);
        this._cloudsAnimation.visible = false;
    }

    // AS3: addHeaders()
    private addHeaders(): void
    {
        const looks = LoaderUI.createTextField('headerText', 24, 8309486, false, true, false, false);

        looks.width = 300;
        looks.thickness = 50;
        this.addChild(looks);
        looks.htmlText = this._context.getLocalization('onboarding.your.looks', 'Choose looks');
        looks.x = 35;
        looks.y = 5;

        const colour = LoaderUI.createTextField('headerText', 24, 8309486, false, true, false, false);

        colour.width = 300;
        colour.thickness = 50;
        this.addChild(colour);
        colour.htmlText = this._context.getLocalization('onboarding.your.colour', 'Choose colour');
        colour.x = 370;
        colour.y = 5;

        const preview = LoaderUI.createTextField('headerText', 24, 8309486, false, true, false, false);

        preview.width = 300;
        preview.thickness = 50;
        this.addChild(preview);
        preview.htmlText = this._context.getLocalization('onboarding.this.is.your.habbo', 'This is your Habbo');
        preview.x = 650;
        preview.y = 5;
    }

    // AS3: addGenderButtons()
    private addGenderButtons(): void
    {
        const nameAreaX = this._context.getNameAreaX();
        const nameAreaWidth = this._context.getNameAreaWidth();

        this._genderButtonGroup = new RadioButtonGroup(this._onChooseGender);

        const boyActive = LoginAssets.get('button_boy_active');
        const boy = LoginAssets.get('button_boy');
        const girlActive = LoginAssets.get('button_girl_active');
        const girl = LoginAssets.get('button_girl');
        const holder = new Sprite();

        holder.y = 105;
        this._maleButton = new RadioButton(
            this._context.getLocalization('gender.male', 'Male'),
            this._genderButtonGroup,
            2,
            boyActive,
            boy,
            8231575
        );
        this._maleButton.name = GENDER_MALE;
        this._femaleButton = new RadioButton(
            this._context.getLocalization('gender.female', 'Female'),
            this._genderButtonGroup,
            2,
            girlActive,
            girl,
            8231575
        );
        this._femaleButton.name = GENDER_FEMALE;
        holder.addChild(this._maleButton);
        holder.addChild(this._femaleButton);
        holder.x = nameAreaX + 120;
        this.addChild(holder);

        this._readyButton = new ColouredButton(
            'gfreen',
            this._context.getLocalization('onboarding.button.ready', "I'm ready"),
            new Rectangle(685, 435, 0, 40),
            true,
            this._saveOutfit,
            14211288
        );
        this._readyButton.x = nameAreaX + (nameAreaWidth - this._readyButton.width) / 2 + 20;
        this.addChild(this._readyButton);
        this._randomizeButton = new RandomizeButton(0, -10, this.onRandomize, 14211288);
        holder.addChild(this._randomizeButton);
        LoaderUI.lineUpHorizontally(this._maleButton, 60, this._femaleButton, 30, this._randomizeButton);

        const hint = LoaderUI.createTextField('bottomText', 12, 16777215, true, true, false, false);

        hint.htmlText = this._context.getLocalization(
            'onboarding.cant.decide',
            "Can't decide? Don't worry, you can change your clothes later!"
        );
        hint.width = 300;
        hint.x = 715;
        hint.y = 380;
        this.addChild(hint);
    }

    /**
     * AS3: addHcTeaserBox()
     *
     * Never called by the 701 flow (`setHcVisibility(false)` and no call site), but part of the
     * class — ported so the club teaser is not silently missing if it is turned back on.
     */
    private addHcTeaserBox(): void
    {
        const teaser = new Bitmap(LoginAssets.get('onb_habbos'));

        this._hcTeaserBox = new Sprite();
        this.addChild(this._hcTeaserBox);

        const balloon = LoaderUI.createBalloon(650, 160, 0, false, 861246, 'none');

        this._hcTeaserBox.addChild(balloon);
        this._hcTeaserBox.addChild(teaser);
        teaser.x = 20;
        teaser.y = 24;
        this._hcTeaserBox.x = 41;
        this._hcTeaserBox.y = 385;
        this._hcTeaserBox.visible = true;

        const header = LoaderUI.createTextField(
            this._context.getLocalization('onboard.what.is.hc.header', 'Much more inside... '),
            24,
            8309486,
            true,
            true,
            false,
            false
        );
        const description = LoaderUI.createTextField(
            this._context.getLocalization('onboard.what.is.hc.description', 'onboard.what.is.hc.description'),
            12,
            16777215,
            true,
            true,
            false,
            false
        );

        description.multiline = true;
        description.width = 300;
        header.width = 300;
        header.x = 320;
        header.y = 15;
        description.x = 320;
        description.y = 45;
        this._hcTeaserBox.addChild(header);
        this._hcTeaserBox.addChild(description);

        const hcHeader = new Bitmap(LoginAssets.get('header_hc'));

        hcHeader.x = 320;
        hcHeader.y = -45;
        this._hcTeaserBox.addChild(hcHeader);
    }

    // AS3: onChooseGender()
    private _onChooseGender = (): void =>
    {
        const selected = this._genderButtonGroup?.selected;

        if(selected == null) return;

        this._gender = selected.name;
        this._context.setIsFemale(this._gender === GENDER_FEMALE);
        this.selectionsForGender();
        this.colorIdsForGender();
        this.setRandomFigure();
    };

    // AS3: clearGrids()
    private clearGrids(): void
    {
        while(this._partGrid && this._partGrid.numChildren > 0)
        {
            this._partGrid.removeChildAt(0);
        }

        while(this._extraGrid && this._extraGrid.numChildren > 0)
        {
            this._extraGrid.removeChildAt(0);
        }

        this._thumbs = new Map();
    }

    /**
     * AS3: updateGrids(_arg_1:Boolean)
     *
     * `_arg_1` decides whether this pass registers as an avatar-image listener — see the class
     * header for why the redraw pass must not.
     */
    private updateGrids(withListener: boolean): void
    {
        const manager = this._context.avatarRenderManager;

        if(!manager || !this._partGrid || !this._extraGrid) return;

        this.clearGrids();
        this.populateThumbs();

        for(let categoryIndex = 0; categoryIndex < CATEGORIES.length; categoryIndex++)
        {
            const category = CATEGORIES[categoryIndex];
            const thumbs = this._thumbs.get(category) ?? [];
            const categoryColors = this.colorIdsForGender().get(category);

            if(category === 'hr')
            {
                this._hairButtons = [];
            }

            const count = Math.min(thumbs.length, NORMAL_ITEMS_TO_SHOW);

            for(let i = 0; i < count; i++)
            {
                const segments = thumbs[i].split('-');
                const partType = segments[0];
                const setId = segments[1];

                if(categoryColors && categoryColors.length > 1)
                {
                    this._multiColorParts.set(setId, categoryColors);
                }

                const button = new RoundButton(i * 50 + i * 10, categoryIndex * 53 + categoryIndex * 10, this._gridClick);

                this._partGrid.addChild(button);
                this._gridButtons.push(button);

                if(partType === 'hr')
                {
                    this._hairButtons.push(button);
                }

                const figure = segments.concat(categoryColors ?? []).join('-');
                const icon = this.thumbIcon(manager, figure, partType, withListener);

                if(icon)
                {
                    button.addIcon(icon);
                }

                button.name = `${partType}_${setId}`;

                if(this._currentButton != null && button.name === this._currentButton.name)
                {
                    button.select();
                    this._currentButton = button;
                    this._currentButton.currentlyEditing();
                }
            }
        }

        // EXTRA_CATEGORIES is empty in this build; the loop is kept because the source has it.
        let extraX = 0;

        for(const category of EXTRA_CATEGORIES)
        {
            const thumbs = this._thumbs.get(category) ?? [];
            const categoryColors = this.colorIdsForGender().get(category);

            for(const thumb of thumbs)
            {
                const segments = thumb.split('-');
                const partType = segments[0];
                const setId = segments[1];

                extraX += 60;

                const button = new RoundButton(extraX, 0, this._gridClick);

                this._extraGrid.addChild(button);
                this._gridButtons.push(button);

                const figure = categoryColors != null ? segments.concat(categoryColors).join('-') : thumb;
                const icon = this.thumbIcon(manager, figure, partType, withListener);

                if(icon)
                {
                    button.addIcon(icon);
                }

                button.name = `${partType}_${setId}`;

                if(this._currentButton != null && button.name === this._currentButton.name)
                {
                    button.select();
                    this._currentButton = button;
                }
            }
        }

        this.updateSelections();
    }

    // AS3: updateFigure()
    private updateFigure(): void
    {
        const manager = this._context.avatarRenderManager;

        if(!manager) return;

        const image = manager.createAvatarImage(this.getFigure(), 'h', this._gender, this, null);

        if(image)
        {
            image.setDirection('full', 4);

            const bitmap = image.getImage('full', false);

            if(bitmap && this._figureContainer)
            {
                this._figureContainer.bitmapData = AvatarEditor.toBitmapData(bitmap);
            }
        }

        this.updateSelections();
    }

    // AS3: getRandomFigureData():String
    private getRandomFigureData(): string
    {
        const figures = this._gender === GENDER_MALE ? RANDOM_MALE_FIGURES : RANDOM_FEMALE_FIGURES;
        const index = Math.trunc(Math.random() * (figures.length - 1));

        return figures[index];
    }

    // AS3: populateThumbs()
    private populateThumbs(): void
    {
        this._thumbs = new Map();

        for(const category of CATEGORIES)
        {
            this._thumbs.set(category, this.populateCategory(category));
        }

        this._thumbs.set('ea', this.populateCategory('ea'));
        this._thumbs.set('fa', this.populateCategory('fa'));
        this._thumbs.set('ha', this.populateCategory('ha'));
    }

    /**
     * AS3: populateCategory(_arg_1:String):Array
     *
     * Five pre-selectable sets for this gender (or unisex). Club sets are skipped unless HC items
     * are on.
     */
    private populateCategory(category: string): string[]
    {
        const manager = this._context.avatarRenderManager;

        if(!manager) return [];

        const figureData = manager.getFigureData();
        const setType = figureData.getSetType(category);

        if(!setType) return [];

        const palette = figureData.getPalette(setType.paletteID);

        if(!palette) return [];

        const result: string[] = [];
        let taken = 0;

        for(const partSet of setType.partSets.values())
        {
            let allowed = true;

            if(partSet.clubLevel > 0)
            {
                allowed = this._showHcItems;
            }

            if(allowed && partSet.isPreSelectable && (partSet.gender === this._gender || partSet.gender === GENDER_UNISEX))
            {
                // AS3 measures the part's colour-layer count and picks a random selectable colour
                // here, then discards both — the pushed entry carries no colour. Kept as-is.
                result.push([category, partSet.id].join('-'));

                taken++;

                if(taken === NORMAL_ITEMS_TO_SHOW) break;
            }
        }

        return result;
    }

    // AS3: populateColors()
    private populateColors(): void
    {
        const manager = this._context.avatarRenderManager;

        if(!manager) return;

        const figureData = manager.getFigureData();

        this._colors = new Map();

        for(const setName of AvatarFigurePartType.FIGURE_SETS)
        {
            const setType = figureData.getSetType(setName);

            if(setType == null) continue;

            const palette = figureData.getPalette(setType.paletteID);

            if(palette == null) continue;

            const selectable: ColorButton[] = [];

            for(const color of palette.colors.values())
            {
                if(color.isSelectable && selectable.length < 16)
                {
                    selectable.push(this.createColorButton(color, setName));
                }
            }

            selectable.sort(AvatarEditor.orderPaletteByIndex);
            this._colors.set(setName, selectable);
        }
    }

    // AS3: createColorButton(_arg_1:IPartColor, _arg_2:String):ColorButton
    private createColorButton(color: IPartColor, category: string): ColorButton
    {
        const button = new ColorButton(0, 0, this._colorSelected, 16777215, color.rgb);

        button.name = `${category}_${color.id}`;
        button.setColor(color.rgb);
        button.index = color.index;
        button.club = color.clubLevel > 0;

        return button;
    }

    // AS3: orderPaletteByIndex(_arg_1:ColorButton, _arg_2:ColorButton):Number
    private static orderPaletteByIndex(first: ColorButton, second: ColorButton): number
    {
        if(first.index < second.index) return -1;

        if(first.index > second.index) return 1;

        return 0;
    }

    /**
     * AS3: colorSelected(_arg_1:ColorButton)
     */
    private _colorSelected = (button: Button): void =>
    {
        const colorButton = button as ColorButton;
        const segments = colorButton.name.split('_');
        const category = segments[0];
        const colorId = segments[1];
        const colorIds: string[] = [colorId];
        const selections = this.selectionsForGender();

        for(const [selectedCategory, setId] of selections)
        {
            if(category !== selectedCategory) continue;

            const multi = this._multiColorParts.get(setId);

            if(multi && multi.length > 1)
            {
                colorIds.push('25');
            }
        }

        this.colorIdsForGender().set(category, colorIds);

        const previous = this._selectedColors.get(category);

        if(previous)
        {
            previous.unselect();
        }

        this._selectedColors.set(category, colorButton);
        colorButton.select();
        this.updateGrids(true);
        this.updateFigure();
    };

    // AS3: renderColors()
    private renderColors(): void
    {
        if(!this._colorGrid) return;

        while(this._colorGrid.numChildren > 0)
        {
            this._colorGrid.removeChildAt(0);
        }

        const colors = this._colors.get(this._activeCategory);

        if(colors == null) return;

        let index = 0;

        for(const button of colors)
        {
            this._colorGrid.addChild(button);

            const column = index % COLORS_PER_ROW;
            const row = Math.trunc(index / COLORS_PER_ROW);

            button.x = column * 50 + column * 2;
            button.y = row * 53 + row * 10;
            index++;
        }
    }

    // AS3: getCurrentlySelectedItems():Array
    private getCurrentlySelectedItems(): string[]
    {
        const selections = this.selectionsForGender();
        const result: string[] = [];

        for(const category of CATEGORIES)
        {
            result.push(`${selections.get(category)}`);
        }

        for(const category of EXTRA_CATEGORIES)
        {
            result.push(`${selections.get(category)}`);
        }

        return result;
    }

    // AS3: updateSelections()
    private updateSelections(): void
    {
        const selected = this.getCurrentlySelectedItems();

        for(const button of this._gridButtons)
        {
            const setId = button.name.split('_')[1];

            if(selected.indexOf(setId) > -1)
            {
                button.select();
            }
            else
            {
                button.unselect();
            }
        }
    }

    /**
     * AS3: gridClick(_arg_1:Button)
     *
     * Clicking the worn part removes it — except for head, legs, and (for a female avatar) chest,
     * which AS3 refuses to take off.
     */
    private _gridClick = (button: Button): void =>
    {
        const segments = button.name.split('_');
        const category = segments[0];
        const setId = segments[1];
        const selected = this.getCurrentlySelectedItems();

        if(this._currentButton)
        {
            this._currentButton.unselect();
        }

        let remove = selected.indexOf(setId) > -1;

        this._currentButton = button;

        if(category === 'hd' || category === 'lg' || (this._gender === GENDER_FEMALE && category === 'ch'))
        {
            remove = false;
        }

        this._activeCategory = category;

        if(remove)
        {
            this.selectionsForGender().delete(this._activeCategory);
            this._currentButton = null;
        }
        else
        {
            this.selectionsForGender().set(this._activeCategory, setId);
            this._currentButton.select();
            this._currentButton.currentlyEditing();
        }

        this.updateFigure();
        this.renderColors();
    };

    /**
     * AS3: saveOutfit(_arg_1:Button)
     *
     * Sends the figure, then hands over to the name step — `submitName()` is what advances the flow.
     */
    private _saveOutfit = (_button: Button): void =>
    {
        const connection = this._context.communicationManager?.connection;

        if(!connection)
        {
            log.warn('No connection to save the outfit on');
        }
        else
        {
            connection.send(new UpdateFigureDataMessageComposer(this.getFigure(), this._gender.toLowerCase()));
        }

        this._context.submitName();
    };

    /**
     * TS-only: the grid icon for a figure, composited once and kept.
     *
     * A miss registers as an avatar-image listener when asked to, exactly as the inline call it
     * replaces did — that is how a part still downloading comes back through `avatarImageReady()`.
     * A hit does not: an icon that rendered is proof its assets are already there.
     *
     * The cropped Texture is destroyed once its pixels are in the BitmapData. `getCroppedImage()`
     * builds a fresh one on every call and caches nothing, so each thumbnail was leaking a GPU
     * texture per rebuild — the one thing here that a long session would have kept paying for.
     */
    private thumbIcon(
        manager: IAvatarRenderManager,
        figure: string,
        partType: string,
        withListener: boolean
    ): BitmapData | null
    {
        const cached = this._thumbIcons.get(figure);

        if(cached) return cached;

        // The gender is null, as in AS3 (`createAvatarImage(..., "h", null, this)`), and that is the
        // whole point of the call: a gender makes the manager run `validateAvatarFigure()`, which
        // fills the figure in with every mandatory part. These figures are ONE garment — "hr-891" —
        // so passing the gender rendered a whole dressed avatar in every thumbnail and cropped to
        // its body, instead of the hair on its own. It also means the icon depends on the figure
        // string alone, which is why the cache is keyed on nothing else.
        const image = manager.createAvatarImage(figure, 'h', null, withListener ? this : null, null);
        const cropped = image?.getCroppedImage(partType === 'hd' ? 'head' : 'full');

        if(!cropped) return null;

        const icon = AvatarEditor.toBitmapData(cropped);

        cropped.destroy(true);
        this._thumbIcons.set(figure, icon);

        return icon;
    }

    // TS-only: the per-gender selection map, created on first use as AS3 does.
    private selectionsForGender(): Map<string, string>
    {
        let selections = this._selections.get(this._gender);

        if(!selections)
        {
            selections = new Map();
            this._selections.set(this._gender, selections);
        }

        return selections;
    }

    // TS-only: the per-gender colour map, created on first use as AS3 does.
    private colorIdsForGender(): Map<string, string[]>
    {
        let colors = this._selectedColorIds.get(this._gender);

        if(!colors)
        {
            colors = new Map();
            this._selectedColorIds.set(this._gender, colors);
        }

        return colors;
    }

    /**
     * TS-only: the render manager hands back whatever its renderer produces; the display list needs
     * a `BitmapData`, so an ImageBitmap/canvas is wrapped and anything already wrapped passes through.
     *
     * `AvatarImage.getImage()`/`getCroppedImage()` return a PixiJS `Texture` over the OffscreenCanvas
     * they composited into, which is the case that actually occurs here — the earlier list did not
     * cover it, so every thumbnail and every preview repaint fell through to the warning.
     */
    private static toBitmapData(source: unknown): BitmapData
    {
        if(source instanceof BitmapData) return source;

        if(source instanceof Texture)
        {
            const resource = source.source?.resource as CanvasImageSource | null;

            if(resource)
            {
                // The texture's `frame` is its slice of the backing surface; for these avatar
                // renders it is the whole canvas, but honouring it costs nothing and is correct
                // if the engine ever hands back an atlas sub-texture.
                const frame = source.frame;
                const data = new BitmapData(frame.width, frame.height, true, 0);

                data.source.getContext('2d')?.drawImage(
                    resource,
                    frame.x, frame.y, frame.width, frame.height,
                    0, 0, frame.width, frame.height
                );

                return data;
            }
        }

        if(typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) return BitmapData.fromImage(source);

        if(
            (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement)
            || (typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas)
        )
        {
            const data = new BitmapData(source.width, source.height, true, 0);

            data.source.getContext('2d')?.drawImage(source, 0, 0);

            return data;
        }

        log.warn('Avatar image came back in an unrecognised form; drawing nothing');

        return new BitmapData(1, 1, true, 0);
    }

    // AS3: dispose()
    public dispose(): void
    {
        this._disposed = true;

        if(this._gridRebuildHandle !== 0)
        {
            window.cancelAnimationFrame(this._gridRebuildHandle);
            this._gridRebuildHandle = 0;
        }

        this._thumbIcons.clear();

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }
    }
}
