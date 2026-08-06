/**
 * EnvironmentView
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/EnvironmentView.as
 *
 * The hotel picker (SCREEN_ENVIRONMENT = 1): ten flags at half scale in rows of nine, a selection
 * marker behind the chosen one, the hotel's name underneath, and one button through to the ticket
 * screen.
 *
 * The flag list is fixed and positional — AS3 pushes the ten bitmaps in a hard-coded order and
 * indexes them against `live.environment.list`, so the Nth flag IS the Nth environment id. Sorting
 * or filtering either side would silently pair the wrong flag with the wrong hotel.
 *
 * This view takes `LoginFlow`, not `ILoginContext`: it calls `getProperty()` and
 * `updateEnvironment()`, neither of which is on the interface.
 */
import {Logger} from '@core/utils/Logger';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import type {DisplayMouseEvent} from '../onBoardingHcUi/display/DisplayObject';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {Timer} from '../onBoardingHcUi/display/Timer';
import type {Button} from '../onBoardingHcUi/Button';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import type {LoginFlow} from './LoginFlow';

const log = Logger.getLogger('client.login.EnvironmentView');

// AS3: ITEMS_PER_ROW
const ITEMS_PER_ROW = 9;

export class EnvironmentView extends Sprite
{
    // AS3: _environmentImages
    private _environmentImages: Bitmap[] = [];

    // AS3: _context
    private _context: LoginFlow | null;

    // AS3: _titleField
    private _titleField: LocalizedTextField | null = null;

    // AS3: _balloon
    private _balloon: Bitmap | null = null;

    // AS3: _environmentName
    private _environmentName: LocalizedTextField | null = null;

    // AS3: _selectedIndex
    private _selectedIndex: number = 0;

    // AS3: _loginButton — declared but never constructed in the 701 source; see initView().
    private _loginButton: Button | null = null;

    // AS3: _environmentImageContainers
    private _environmentImageContainers: Sprite[] = [];

    // AS3: _chosenIcon
    private _chosenIcon: Bitmap | null = null;

    // AS3: _spaceBetweenImages
    private _spaceBetweenImages: number = 10;

    // AS3: _environmentTypes
    private _environmentTypes: string[] | null = null;

    // AS3: _initialized
    private _initialized: boolean = false;

    // AS3: _ticketButton
    private _ticketButton: ColouredButton | null = null;

    // AS3: _selectionMarker
    private _selectionMarker: Sprite | null = null;

    // AS3: EnvironmentView(_arg_1:LoginFlow)
    constructor(context: LoginFlow)
    {
        super();

        this._context = context;
        this.addEventListener('addedToStage', this._onAddedToStage);
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._context == null;
    }

    // AS3: get environmentId():String
    public get environmentId(): string
    {
        return this._environmentTypes ? this._environmentTypes[this._selectedIndex] : '';
    }

    // AS3: get environmentAvailable():Boolean
    public get environmentAvailable(): boolean
    {
        if(!this._context || !this._environmentTypes) return false;

        const current = this._context.getProperty('environment.id');

        return this._environmentTypes.indexOf(current ?? '') > -1;
    }

    // AS3: init()
    public init(): void
    {
        if(this._initialized) return;

        this._initialized = true;
        this._environmentImages = [];

        if(this._environmentTypes == null)
        {
            this.initEnvironmentImages();
        }

        this.updateEnvironment();
        this.initView();
    }

    /**
     * AS3: updateEnvironment()
     *
     * An environment that is not in the list is not an error — AS3 logs it and falls back to the
     * first entry, which is how a fresh install lands on a hotel at all.
     */
    // AS3: .../src/login/EnvironmentView.as::updateEnvironment()
    public updateEnvironment(): void
    {
        if(!this._context || !this._environmentTypes) return;

        const current = this._context.getProperty('environment.id') ?? '';
        const index = this._environmentTypes.indexOf(current);

        if(index === -1)
        {
            log.warn(`Missing environment, require hotel selection! ${current}`);
            this._selectedIndex = 0;
        }
        else
        {
            this._selectedIndex = index;
        }

        this.chooseEnvironment();
    }

    /**
     * AS3: initView()
     *
     * AS3 never constructs `_loginButton` here, which makes the `if(_loginButton)` branches in
     * `onAlignElements()` and `chooseEnvironment()` dead in the dump. The button is restored below
     * — see the comment there — so those branches now run.
     */
    // AS3: .../src/login/EnvironmentView.as::initView()
    public initView(): void
    {
        this.addTitleField();
        this._balloon = LoaderUI.createBalloon(640, 100, 0, false, 995918, 'none');
        this._balloon.visible = false;
        this.addChild(this._balloon);
        this._selectionMarker = new Sprite();
        this.addChild(this._selectionMarker);
        this._chosenIcon = new Bitmap(LoginAssets.get('flags_icon_selected'));
        this._selectionMarker.addChild(this._chosenIcon);
        this._selectionMarker.scaleX = 0.5;
        this._selectionMarker.scaleY = 0.5;

        for(let i = 0; i < this._environmentImages.length; i++)
        {
            const holder = new Sprite();
            const flag = this._environmentImages[i];

            if(flag != null)
            {
                holder.addChild(flag);
            }

            this.addChild(holder);
            this._environmentImageContainers.push(holder);
            holder.name = String(i);
            holder.addEventListener('click', this._onEnvironmentClick);
            holder.scaleX = 0.5;
            holder.scaleY = 0.5;

            const size = 80;
            const spacing = 5;
            const column = i % ITEMS_PER_ROW;
            const row = Math.trunc(i / ITEMS_PER_ROW);

            holder.x = column * size + column * spacing;
            holder.y = 100 + (row * size + row * spacing);
        }

        this._environmentName = LoaderUI.createTextField('Title', 20, 16777215, false, true, false, false);
        this._environmentName.width = 260;
        this._environmentName.y = 300;
        this.addChild(this._environmentName);

        // DELIBERATE DIVERGENCE: the 701 source declares `_loginButton`, tests it in
        // onAlignElements()/chooseEnvironment(), disposes it — and never constructs it. With only
        // the ticket button built, SCREEN_LOGIN is unreachable by any click: the sole other way in
        // is the provider's captcha path. Everything for the button is in the source (the field,
        // `onButtonSelect()` which commits the environment and goes to SCREEN_LOGIN, the anchor
        // branches) and its caption is still in the embedded texts, used nowhere else
        // ("connection.login.environment.start"). So this restores what the dump lost rather than
        // inventing a screen. Drop this block to get the dump's exact behaviour back.
        //
        // The field is declared `Button`, which says nothing about the skin — `_ticketButton` is
        // declared the same way and is built as a ColouredButton. A bare `Button` wears the
        // STYLE_ILLUMINA skin (`button`/`button_pressed`/`button_inactive` plus the yellow etching),
        // which no other login screen uses; the login flow's own buttons are all hitch pills, so
        // this one is green like every other confirm button here.
        //
        // It therefore matches the ticket button beside it, and that is on purpose: the two are both
        // ways forward, and the only other hitch skins are the pink one (which is Cancel everywhere
        // else in this flow) and the yellow one (which bakes in the `hc_small` badge). Repainting
        // the ticket button to separate them would mean overriding a colour the AS3 does specify, to
        // help a button the AS3 does not have.
        this._loginButton = new ColouredButton(
            ColouredButton.BUTTON_GREEN,
            '${connection.login.environment.start}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onButtonSelect
        );
        this.addChild(this._loginButton);
        this._ticketButton = new ColouredButton(
            'gfreen',
            '${connection.login.useTicket}',
            new Rectangle(0, 300, 0, 40),
            true,
            this._onButtonSelectToken
        );
        this.addChild(this._ticketButton);
        this.chooseEnvironment();
    }

    /**
     * AS3: initEnvironmentImages()
     *
     * The order here is the contract with `live.environment.list` — see the class header.
     */
    // AS3: .../src/login/EnvironmentView.as::initEnvironmentImages()
    private initEnvironmentImages(): void
    {
        if(!this._context) return;

        this._environmentTypes = (this._context.getProperty('live.environment.list') ?? '').split('/');
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_en')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_pt')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_de')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_es')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_fi')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_fr')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_it')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_nl')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_tr')));
        this._environmentImages.push(new Bitmap(LoginAssets.get('flag_icons_dev')));
    }

    // AS3: addTitleField()
    private addTitleField(): void
    {
        if(this._titleField) return;

        this._titleField = LoaderUI.createTextField(
            '${connection.login.environment.choose}',
            40,
            16777215,
            false,
            true,
            false,
            false,
            'left'
        );
        this._titleField.x = 0;
        this._titleField.y = 0;
        this._titleField.width = 500;
        this._titleField.multiline = false;
        this._titleField.thickness = 50;
        this.addChild(this._titleField);
    }

    // AS3: chooseEnvironment()
    private chooseEnvironment(): void
    {
        const holder = this._environmentImageContainers[this._selectedIndex];

        if(holder == null || !this._selectionMarker) return;

        this._selectionMarker.x = holder.x - (this._selectionMarker.width - holder.width) / 2 - 1;
        this._selectionMarker.y = holder.y - (this._selectionMarker.height - holder.height) / 2 - 1;
        this._selectionMarker.visible = true;

        if(this._loginButton)
        {
            this._loginButton.active = true;
        }

        this.updateDescription();
    }

    // AS3: updateDescription()
    private updateDescription(): void
    {
        if(!this._context || !this._environmentTypes || !this._environmentName) return;

        const environment = this._environmentTypes[this._selectedIndex];

        this._environmentName.text = this._context.getProperty(`connection.info.name.${environment}`) ?? '';
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        const timer = new Timer(20, 1);

        timer.addEventListener('timerComplete', this._onAlignElements);
        timer.start();
    };

    // AS3: onAlignElements(_arg_1:TimerEvent=null)
    private _onAlignElements = (): void =>
    {
        if(!this._balloon || !this._ticketButton) return;

        LoaderUI.alignAnchors(this, 0, 'c', this._balloon);

        if(this._loginButton)
        {
            LoaderUI.alignAnchors(this._balloon, 0, 'r', this._loginButton);
            LoaderUI.lineUpHorizontallyRevers(this._loginButton, 20, this._ticketButton);

            return;
        }

        LoaderUI.alignAnchors(this._balloon, 0, 'r', this._ticketButton);
    };

    /**
     * AS3: onEnvironmentClick(_arg_1:Event)
     *
     * `true` is the preview flag — clicking a flag only reloads that hotel's texts; the choice is
     * committed by the button.
     */
    private _onEnvironmentClick = (event: DisplayMouseEvent): void =>
    {
        if(!this._context || !this._environmentTypes) return;

        this._selectedIndex = parseInt(String(event.currentTarget?.name ?? '0'), 10);
        this.chooseEnvironment();
        this._context.updateEnvironment(this._environmentTypes[this._selectedIndex], true);
        this._onAlignElements();
    };

    // AS3: onButtonSelect(_arg_1:DisplayObject) — the "Let's get started!" button's action.
    private _onButtonSelect = (): void =>
    {
        if(!this._context || !this._environmentTypes) return;

        this._context.updateEnvironment(this._environmentTypes[this._selectedIndex], false);
        this._context.showScreen(2);
    };

    // AS3: onButtonSelectToken(_arg_1:DisplayObject)
    private _onButtonSelectToken = (): void =>
    {
        if(!this._context || !this._environmentTypes) return;

        this._context.updateEnvironment(this._environmentTypes[this._selectedIndex], false);
        this._context.showScreen(4);
    };

    // AS3: dispose()
    public dispose(): void
    {
        if(this.disposed) return;

        this._loginButton?.dispose();
        this._ticketButton?.dispose();
        this._environmentImages = [];
        this._context = null;
    }
}
