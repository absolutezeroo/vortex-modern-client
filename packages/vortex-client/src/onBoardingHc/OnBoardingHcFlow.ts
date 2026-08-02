/**
 * OnBoardingHcFlow
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHc/OnBoardingHcFlow.as
 *
 * The new-user flow, shown AFTER login when the server's `suggestedLoginActions` ask for it: pick a
 * look and a name, then (optionally) a starter room.
 *
 * The action list is what decides the shape of the run — `0` (AVATAR_NAME_CHANGE) starts on the
 * editor plus the name dialog, `1` (NEW_ROOM_SELECT) adds the room picker at the end. An empty list
 * finishes immediately.
 *
 * Unlike `LoginFlow`, this one is handed live managers: it runs on top of a booted client, which is
 * why it takes the avatar renderer, the localisation manager and the connection rather than
 * standing up its own.
 */
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {GlowFilter} from '../onBoardingHcUi/display/Filters';
import type {TextField} from '../onBoardingHcUi/display/TextField';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import {AvatarEditor} from '../onBoardingHcSteps/AvatarEditor';
import {Background} from '../onBoardingHcSteps/Background';
import {RoomPicker} from '../onBoardingHcSteps/RoomPicker';
import {HitchNameChangeDialog} from './HitchNameChangeDialog';
import type {IOnBoardingHcContext} from './IOnBoardingHcContext';
import type {NameChangeDialog} from './NameChangeDialog';

const log = Logger.getLogger('client.onBoardingHc.OnBoardingHcFlow');

export class OnBoardingHcFlow extends Sprite implements IOnBoardingHcContext
{
    // AS3: NEW_USER_FLOW_FINISHED_EVENT
    public static readonly NEW_USER_FLOW_FINISHED_EVENT: string = 'NewUserFlowFinished';

    // AS3: AVATAR_NAME_CHANGE
    public static readonly AVATAR_NAME_CHANGE: number = 0;

    // AS3: NEW_ROOM_SELECT
    public static readonly NEW_ROOM_SELECT: number = 1;

    // AS3: LOGO_AREA_HEIGHT
    private static readonly LOGO_AREA_HEIGHT: number = 95;

    // AS3: MAIN_AREA_MARGIN
    private static readonly MAIN_AREA_MARGIN: number = 0;

    // AS3: _background
    private _background: Background | null = null;

    // AS3: _avatarEditor
    private _avatarEditor: AvatarEditor | null = null;

    // AS3: _nameArea
    private _nameArea: Sprite | null = null;

    // AS3: _nameChangeDialog
    private _nameChangeDialog: NameChangeDialog | null = null;

    // AS3: _roomArea
    private _roomArea: Sprite | null = null;

    // AS3: _roomPicker
    private _roomPicker: RoomPicker | null = null;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _avatarRenderManager
    private _avatarRenderManager: IAvatarRenderManager | null;

    // AS3: _localizationManager
    private _localizationManager: IHabboLocalizationManager | null;

    // AS3: _communicationManager
    private _communicationManager: IHabboCommunicationManager | null;

    // AS3: _errorBalloon
    private _errorBalloon: Sprite | null = null;

    // AS3: _hcMembership
    private _hcMembership: boolean = false;

    // AS3: _nameClaimed
    private _nameClaimed: boolean = false;

    // AS3: _mainSprite
    private _mainSprite: Sprite | null = null;

    // AS3: _logoArea
    private _logoArea: Sprite | null = null;

    // AS3: _selectedName
    private _selectedName: string = '';

    // AS3: _isFemale
    private _isFemale: boolean = false;

    // AS3: _headerField
    private _headerField: LocalizedTextField | null = null;

    // AS3: _showHcItems
    private _showHcItems: boolean = false;

    // AS3: _nameAreaX
    private _nameAreaX: number = 535;

    // AS3: _nameAreaWidth
    private _nameAreaWidth: number = 400;

    // AS3: _loginActions
    private _loginActions: number[] = [];

    /** TS-only: AS3 dispatches NEW_USER_FLOW_FINISHED_EVENT on itself; the host listens here. */
    private readonly _flowEvents: EventEmitter = new EventEmitter();

    // AS3: OnBoardingHcFlow(_arg_1:IAvatarRenderManager, _arg_2:IHabboLocalizationManager, _arg_3:IHabboCommunicationManager)
    constructor(
        avatarRenderManager: IAvatarRenderManager | null,
        localizationManager: IHabboLocalizationManager | null,
        communicationManager: IHabboCommunicationManager | null
    )
    {
        super();

        this._avatarRenderManager = avatarRenderManager;
        this._localizationManager = localizationManager;
        this._communicationManager = communicationManager;
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: get avatarRenderManager():IAvatarRenderManager
    public get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    // AS3: get communicationManager():IHabboCommunicationManager
    public get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // AS3: get selectedName():String
    public get selectedName(): string
    {
        return this._selectedName;
    }

    // AS3: get isFemale():Boolean
    public get isFemale(): boolean
    {
        return this._isFemale;
    }

    // AS3: get debugText():TextField — null in the 701 source.
    public get debugText(): TextField | null
    {
        return null;
    }

    // TS-only: the emitter carrying NEW_USER_FLOW_FINISHED_EVENT to the host.
    public get flowEvents(): EventEmitter
    {
        return this._flowEvents;
    }

    /**
     * AS3: init(_arg_1:Array)
     *
     * The room picker's thumbnails start downloading here, before the step is shown — its view is
     * not built until they have all arrived.
     */
    public init(loginActions: number[]): void
    {
        this._loginActions = loginActions;
        this.stage?.addEventListener('resize', this._onStageResize);
        this._background = new Background();
        this.addChild(this._background);
        this._logoArea = new Sprite();
        this.addChild(this._logoArea);

        const logo = new Bitmap(LoginAssets.get('logo_new'));

        logo.x = 40;
        logo.y = 40;
        this._logoArea.addChild(logo);
        this._mainSprite = new Sprite();
        this.addChild(this._mainSprite);
        this._mainSprite.y = OnBoardingHcFlow.LOGO_AREA_HEIGHT;
        this._mainSprite.x = OnBoardingHcFlow.MAIN_AREA_MARGIN;
        this._avatarEditor = new AvatarEditor(this);
        this._avatarEditor.showHcItems(this._showHcItems);
        this._mainSprite.addChild(this._avatarEditor);
        this._nameArea = new Sprite();
        this._nameArea.x = this._nameAreaX;
        this._nameArea.y = 95;
        this._nameArea.visible = true;
        this._mainSprite.addChild(this._nameArea);
        this._roomArea = new Sprite();
        this._roomArea.x = 0;
        this._roomArea.y = 95;
        this._roomArea.visible = false;
        this._mainSprite.addChild(this._roomArea);

        if(this.isRoomPickingNeeded)
        {
            this._roomPicker = new RoomPicker(this, this._roomArea);
            this._roomPicker.fetchThumbnails();
        }

        if(!this._loginActions)
        {
            this._flowEvents.emit(OnBoardingHcFlow.NEW_USER_FLOW_FINISHED_EVENT);

            return;
        }

        if(this._loginActions.indexOf(OnBoardingHcFlow.AVATAR_NAME_CHANGE) >= 0)
        {
            this.startNameChange();
        }
        else
        {
            this.startRoomPicking();
        }
    }

    // AS3: setHcVisibility(_arg_1:Boolean)
    public setHcVisibility(visible: boolean): void
    {
        this._showHcItems = visible;
    }

    // AS3: setHcMembership(_arg_1:Boolean)
    public setHcMembership(member: boolean): void
    {
        this._hcMembership = member;
    }

    // AS3: getLocalization(_arg_1:String, _arg_2:String=null):String
    public getLocalization(key: string, defaultValue: string | null = null): string
    {
        if(!this._localizationManager) return defaultValue ?? '';

        return this._localizationManager.getLocalization(key, defaultValue ?? '');
    }

    /**
     * AS3: getProperty(_arg_1:String, _arg_2:String=null):String
     *
     * AS3 reads configuration properties off the LOCALIZATION manager, not a configuration one.
     */
    public getProperty(key: string, defaultValue: string | null = null): string
    {
        if(!this._localizationManager) return defaultValue ?? '';

        const value = (this._localizationManager as unknown as {getProperty?: (k: string) => string}).getProperty?.(key);

        return value ? value : (defaultValue ?? '');
    }

    // AS3: getNameAreaX():int
    public getNameAreaX(): number
    {
        return this._nameAreaX;
    }

    // AS3: getNameAreaWidth():int
    public getNameAreaWidth(): number
    {
        return this._nameAreaWidth;
    }

    // AS3: setNameGender(_arg_1:String, _arg_2:Boolean)
    public setNameGender(name: string, isFemale: boolean): void
    {
        this._selectedName = name;
        this._isFemale = isFemale;
    }

    // AS3: setIsFemale(_arg_1:Boolean)
    public setIsFemale(isFemale: boolean): void
    {
        this._isFemale = isFemale;
    }

    /**
     * AS3: submitName()
     *
     * With the name dialog up, the editor's "I'm ready" claims the typed name; without it, the flow
     * just moves on.
     */
    public submitName(): void
    {
        if(this._nameChangeDialog != null && this._nameArea?.visible)
        {
            this._nameChangeDialog.submitName();

            return;
        }

        this.nameChangeCompleted();
        this.editorFinished();
    }

    // AS3: nameChangeCompleted(_arg_1:Boolean=true)
    public nameChangeCompleted(claimed: boolean = true): void
    {
        this._nameClaimed = claimed;
        this._avatarEditor?.nameChangeCompleted(claimed);
    }

    // AS3: showHideButtons(_arg_1:Boolean)
    public showHideButtons(visible: boolean): void
    {
        this._avatarEditor?.showHideButtons(visible);
    }

    // AS3: editorFinished()
    public editorFinished(): void
    {
        if(this.isRoomPickingNeeded)
        {
            this.startRoomPicking();

            return;
        }

        this._flowEvents.emit(OnBoardingHcFlow.NEW_USER_FLOW_FINISHED_EVENT);
    }

    // AS3: roomPickingCompleted()
    public roomPickingCompleted(): void
    {
        this._flowEvents.emit(OnBoardingHcFlow.NEW_USER_FLOW_FINISHED_EVENT);
    }

    // AS3: showPickRoomHeader()
    public showPickRoomHeader(): void
    {
        if(this._headerField)
        {
            this._headerField.width = 650;
            this._headerField.htmlText = this.getLocalization('onboarding.choose.your.room', 'Choose your room');
        }
    }

    // AS3: showChooseStyleHeader()
    public showChooseStyleHeader(): void
    {
        if(this._headerField)
        {
            this._headerField.width = 650;
            this._headerField.htmlText = this.getLocalization('onboarding.choose.your.style', 'My looks');
        }
    }

    /**
     * AS3: showErrorMessage(_arg_1:String)
     */
    public showErrorMessage(message: string): void
    {
        if(!this._mainSprite) return;

        const messageField = LoaderUI.createTextField(message, 9, 16777215, true);

        LoaderUI.addEtching(messageField, true);

        const balloon = LoaderUI.createBalloon(messageField.width + 30, messageField.height + 17, -1, true, 11411485);

        if(this._errorBalloon)
        {
            // DELIBERATE DIVERGENCE: AS3 calls `removeChild()` on the flow itself here, but adds
            // the balloon to `_mainSprite` two lines down — so in Flash the second error message
            // throws ArgumentError #2025 (removeChild of a non-child). This runtime's removeChild
            // no-ops instead, which turns the AS3 crash into balloons stacking on top of each
            // other, one per error. Removing it from the parent it was actually added to is what
            // the code plainly means.
            this._mainSprite.removeChild(this._errorBalloon);
        }

        this._errorBalloon = new Sprite();
        this._errorBalloon.addChild(balloon);
        this._errorBalloon.addChild(messageField);
        messageField.x = 15;
        messageField.y = 14;
        this._mainSprite.addChild(this._errorBalloon);
        this._errorBalloon.x = 766;
        this._errorBalloon.y = 577;
        this._errorBalloon.filters = [new GlowFilter(0, 0.24, 6, 6)];
    }

    // AS3: get isRoomPickingNeeded():Boolean
    private get isRoomPickingNeeded(): boolean
    {
        return this._loginActions.indexOf(OnBoardingHcFlow.NEW_ROOM_SELECT) >= 0;
    }

    /**
     * AS3: startNameChange()
     *
     * The dialog is the Hitch variant, and it is told which gender the editor is on so its layout
     * matches.
     */
    private startNameChange(): void
    {
        if(!this._nameArea || !this._avatarEditor) return;

        if(!this._nameChangeDialog)
        {
            this._nameChangeDialog = new HitchNameChangeDialog(this, this._nameArea, this.getNameAreaWidth());
        }

        if(this._roomArea)
        {
            this._roomArea.visible = false;
        }

        this._nameArea.visible = true;
        this._nameArea.x = this._nameAreaX;
        this._nameChangeDialog.preSelectedGender = this._avatarEditor.gender;
        this.layoutMainElements();
        this.showChooseStyleHeader();
    }

    // AS3: startRoomPicking()
    private startRoomPicking(): void
    {
        if(this._roomPicker == null) return;

        if(this._avatarEditor)
        {
            this._avatarEditor.visible = false;
            this._avatarEditor.showHideGrid(false);
        }

        if(this._nameArea) this._nameArea.visible = false;

        if(this._roomArea) this._roomArea.visible = true;

        this._roomPicker.init();
        this.layoutMainElements();
        this.showPickRoomHeader();
    }

    /**
     * AS3: layoutMainElements()
     *
     * Also creates the header field on first pass, and recomputes the name column's x from the
     * editor's own width.
     */
    private layoutMainElements(): void
    {
        const stage = this.stage;

        if(!stage || !this._mainSprite) return;

        this._background?.resize();

        if(this._roomArea)
        {
            this._roomArea.x = 0;
        }

        if(!this._headerField && this._logoArea)
        {
            this._headerField = LoaderUI.createTextField('intro', 40, 16777215, false, true, false, false, 'left');
            this._headerField.x = 185;
            this._headerField.y = 45;
            this._headerField.width = 500;
            this._headerField.multiline = false;
            this._headerField.thickness = 50;
            this._logoArea.addChild(this._headerField);
        }

        const contentWidth = this._mainSprite.width + 20;

        if(stage.stageWidth > contentWidth)
        {
            let offset = Math.trunc((stage.stageWidth - contentWidth) / 2);

            if(offset < 0)
            {
                offset = 0;
            }

            this._mainSprite.x = offset;
        }
        else
        {
            this._mainSprite.x = 0;
        }

        if(this._avatarEditor)
        {
            this._avatarEditor.x = 0;
            this._nameAreaX = this._avatarEditor.x + this._avatarEditor.width - 125;
        }

        if(this._nameArea)
        {
            this._nameArea.x = this._nameAreaX;
        }

        this._mainSprite.y = OnBoardingHcFlow.LOGO_AREA_HEIGHT;
    }

    // AS3: onStageResize(_arg_1:Event)
    private _onStageResize = (): void =>
    {
        if(this.disposed) return;

        this.layoutMainElements();
    };

    // AS3: dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._background)
        {
            this.removeChild(this._background);
            this._background.dispose();
            this._background = null;
        }

        if(this._avatarEditor)
        {
            this._avatarEditor.dispose();
            this._avatarEditor = null;
        }

        if(this._nameChangeDialog)
        {
            this._nameChangeDialog.dispose();
            this._nameChangeDialog = null;
        }

        this._roomPicker?.dispose();
        this._roomPicker = null;
        this._nameArea = null;
        this._roomArea = null;

        if(this._mainSprite != null)
        {
            this.removeChild(this._mainSprite);
            this._mainSprite = null;
        }

        this._avatarRenderManager = null;
        this._localizationManager = null;
        this._communicationManager = null;
        this.stage?.removeEventListener('resize', this._onStageResize);
        this.stage?.removeChild(this);
        this._disposed = true;
        log.debug('Onboarding flow disposed');
    }
}
