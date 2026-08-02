/**
 * RoomPicker
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHcSteps/RoomPicker.as
 *
 * The last onboarding step: three starter-room renders pulled off images.habbo.com, one of which the
 * user picks. Selecting sends the room TYPE; the server answers with the id of the room it created,
 * which is then set as the home room.
 *
 * The view is not built until every thumbnail has loaded (`_loadedCount == _numOfRooms`), which is
 * why `fetchThumbnails()` runs as soon as the flow starts rather than when the step is shown.
 */
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {SelectInitialRoomMessageEvent} from '@habbo/communication/messages/incoming/nux/SelectInitialRoomMessageEvent';
import {SelectInitialRoomMessageComposer} from '@habbo/communication/messages/outgoing/nux/SelectInitialRoomMessageComposer';
import {UpdateHomeRoomMessageComposer} from '@habbo/communication/messages/outgoing/navigator/UpdateHomeRoomMessageComposer';
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {BitmapData} from '../onBoardingHcUi/display/BitmapData';
import type {DisplayMouseEvent} from '../onBoardingHcUi/display/DisplayObject';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import type {Button} from '../onBoardingHcUi/Button';
import {ColouredButton} from '../onBoardingHcUi/ColouredButton';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import type {LocalizedTextField} from '../onBoardingHcUi/LocalizedTextField';
import type {OnBoardingHcFlow} from '../onBoardingHc/OnBoardingHcFlow';

const log = Logger.getLogger('client.onBoardingHcSteps.RoomPicker');

export class RoomPicker
{
    // AS3: _roomImages
    private _roomImages: Bitmap[] = [];

    // AS3: _numOfRooms
    private _numOfRooms: number = 0;

    // AS3: _newUserFlow
    private _newUserFlow: OnBoardingHcFlow | null;

    // AS3: _container
    private _container: Sprite | null;

    // AS3: _infoPanel
    private _infoPanel: Sprite | null = null;

    // AS3: _selectedRoom — 1-based, as in AS3
    private _selectedRoom: number = 1;

    // AS3: _roomTypes
    private _roomTypes: string[] | null = null;

    // AS3: _roomDescription
    private _roomDescription: LocalizedTextField | null = null;

    // AS3: _roomName
    private _roomName: LocalizedTextField | null = null;

    // AS3: _selectButton
    private _selectButton: Button | null = null;

    // AS3: _roomImageContainers
    private _roomImageContainers: Sprite[] = [];

    // AS3: _selectedIcon
    private _selectedIcon: Bitmap | null = null;

    // AS3: _loadedCount
    private _loadedCount: number = 0;

    // AS3: _spaceBetweenImages
    private _spaceBetweenImages: number = 30;

    // AS3: _selectInitialRoomEvent
    private _selectInitialRoomEvent: IMessageEvent | null = null;

    // AS3: RoomPicker(_arg_1:OnBoardingHcFlow, _arg_2:Sprite)
    constructor(newUserFlow: OnBoardingHcFlow, container: Sprite)
    {
        this._newUserFlow = newUserFlow;
        this._container = container;
        this._selectInitialRoomEvent = newUserFlow.communicationManager?.addHabboConnectionMessageEvent(
            new SelectInitialRoomMessageEvent(this._onSelectInitialRoomResponse)
        ) ?? null;
    }

    // AS3: get galleryUrl():String
    private static get galleryUrl(): string
    {
        return 'https://images.habbo.com/c_images/nux/';
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._newUserFlow == null;
    }

    /**
     * AS3: fetchThumbnails()
     *
     * `new.user.flow.roomTypes` is a comma list of type ids; each maps to one `nux_room_<id>_round.png`.
     */
    public fetchThumbnails(): void
    {
        if(!this._newUserFlow) return;

        this._roomTypes = (this._newUserFlow.getProperty('new.user.flow.roomTypes', '10,11,12') ?? '10,11,12').split(',');
        this._numOfRooms = this._roomTypes.length;

        for(let i = 0; i < this._numOfRooms; i++)
        {
            const bitmap = new Bitmap();
            const image = new Image();

            image.crossOrigin = 'anonymous';
            image.addEventListener('load', () =>
            {
                void createImageBitmap(image).then((decoded) =>
                {
                    bitmap.bitmapData = BitmapData.fromImage(decoded);
                    this.roomImageLoadCompleteHandler();
                });
            });
            image.addEventListener('error', () =>
            {
                log.warn(`Failed to load starter-room render ${image.src}; that room will show blank`);

                // DELIBERATE DIVERGENCE: AS3 listens for "complete" on its `Loader` and nothing
                // else, so a render that 404s or is refused by CORS leaves `_loadedCount` one short
                // of `_numOfRooms` — and `initView()` is only ever called from that comparison, so
                // the step stays empty forever with no way out of the flow. Counting the failure
                // opens the picker on the rooms that did arrive. The failed one keeps a Bitmap with
                // no bitmapData: it measures 0×0, so it renders nothing and cannot be clicked.
                this.roomImageLoadCompleteHandler();
            });
            image.src = `${RoomPicker.galleryUrl}nux_room_${this._roomTypes[i]}_round.png`;
            this._roomImages.push(bitmap);
        }
    }

    // AS3: init()
    public init(): void
    {
        if(this._roomTypes == null)
        {
            this.fetchThumbnails();
        }
    }

    /**
     * AS3: initView()
     *
     * Built once every render has arrived. Room containers are named 1..N (1-based), which is what
     * `_selectedRoom` indexes.
     */
    public initView(): void
    {
        if(!this._newUserFlow || !this._container) return;

        const header = LoaderUI.createTextField('headerText', 24, 8309486, false, true, false, false);

        header.width = 500;
        header.thickness = 50;
        this._container.addChild(header);
        header.htmlText = this._newUserFlow.getLocalization(
            'onboarding.room.information',
            'Choose your first room. This room gets you started. You can create more free rooms later, if you like.'
        );
        header.multiline = true;
        header.x = 25;
        header.y = -70;

        let lastHolder: Sprite | null = null;

        for(let i = 0; i < this._numOfRooms; i++)
        {
            const holder = new Sprite();
            const image = this._roomImages[i];

            if(image != null)
            {
                holder.addChild(image);
            }

            this._container.addChild(holder);
            this._roomImageContainers.push(holder);
            holder.name = String(i + 1);
            holder.addEventListener('click', this._onRoomClick);
            holder.x = (i + 1) * this._spaceBetweenImages + i * 280;
            holder.y = 10;
            lastHolder = holder;
        }

        this._infoPanel = new Sprite();
        this._container.addChild(this._infoPanel);
        this._selectButton = new ColouredButton(
            'gfreen',
            this._newUserFlow.getLocalization('room.select', 'Select'),
            new Rectangle(0, 0, 0, 40),
            true,
            this._onButtonSelect
        );

        const balloon = LoaderUI.createBalloon(640, 100, 0, false, 995918, 'none');

        this._infoPanel.addChild(balloon);
        balloon.x = this._spaceBetweenImages;

        if(lastHolder)
        {
            LoaderUI.lineUpVertically(lastHolder, 20, balloon);
        }

        const buttonHolder = new Sprite();

        buttonHolder.addChild(this._selectButton);
        this._container.addChild(buttonHolder);
        buttonHolder.x = 725;
        buttonHolder.y = 360;

        if(!this._roomDescription)
        {
            this._roomDescription = LoaderUI.createTextField(
                this._newUserFlow.getLocalization('receptionist.start.title', 'Hiya!'),
                18,
                8309486,
                false
            );
            this._roomName = LoaderUI.createTextField(
                this._newUserFlow.getLocalization('onboarding.hint.hc', 'Room name'),
                20,
                16777215,
                false,
                true,
                false,
                false
            );
            this._roomName.width = 260;
            this._roomName.x = 50;
            this._roomDescription.x = 50;
            this._roomDescription.width = 260;

            if(lastHolder)
            {
                LoaderUI.lineUpVertically(lastHolder, 30, this._roomName);
                LoaderUI.lineUpVertically(lastHolder, 55, this._roomDescription);
            }

            this._infoPanel.addChild(this._roomDescription);
            this._infoPanel.addChild(this._roomName);
        }

        this._selectedRoom = 1;

        if(!this._selectedIcon)
        {
            this._selectedIcon = new Bitmap(LoginAssets.get('icon_yes'));

            // DELIBERATE DIVERGENCE: `_infoPanel` is added after the room holders, so this marker
            // sits ON TOP of the selected thumbnail's bottom-left corner — and it is exactly the
            // corner of the room you would click to change your mind. Flash has the same overlap
            // (a Bitmap blocks the pointer and hands the event to its parent Sprite, which has no
            // listener), so the corner was dead there too. Marking it non-interactive lets the
            // press fall through to the thumbnail underneath, which is what the user is aiming at.
            this._selectedIcon.mouseEnabled = false;
            this._infoPanel.addChild(this._selectedIcon);
        }

        this._infoPanel.visible = this._loadedCount === this._numOfRooms;
        this._selectButton.visible = this._loadedCount === this._numOfRooms;
        this.chooseRoom();
    }

    /**
     * AS3: onSelectInitialRoomResponse(_arg_1:SelectInitialRoomMessageEvent)
     *
     * A positive id becomes the home room; the flow ends either way.
     */
    private _onSelectInitialRoomResponse = (rawEvent: IMessageEvent): void =>
    {
        const event = rawEvent as SelectInitialRoomMessageEvent;

        if(event == null) return;

        const parser = event.selectInitialRoomParser;

        if(parser == null) return;

        if(parser.roomId > 0)
        {
            this._newUserFlow?.communicationManager?.connection?.send(new UpdateHomeRoomMessageComposer(parser.roomId));
        }

        this._newUserFlow?.roomPickingCompleted();
    };

    // AS3: getRoomDescription()
    private getRoomDescription(): void
    {
        if(!this._newUserFlow || !this._roomTypes || !this._roomName || !this._roomDescription) return;

        const type = this._roomTypes[this._selectedRoom - 1];

        this._roomName.text = this._newUserFlow.getLocalization(`room.name.${type}`, `Room ${type}`);
        this._roomDescription.text = this._newUserFlow.getLocalization(`room.description.${type}`, '\nTwo-line description');
    }

    // AS3: onButtonSelect(_arg_1:DisplayObject)
    private _onButtonSelect = (): void =>
    {
        if(!this._newUserFlow || !this._roomTypes) return;

        const type = this._roomTypes[this._selectedRoom - 1];

        this._newUserFlow.communicationManager?.connection?.send(new SelectInitialRoomMessageComposer(type));
    };

    // AS3: onRoomClick(_arg_1:Event)
    private _onRoomClick = (event: DisplayMouseEvent): void =>
    {
        this._selectedRoom = parseInt(String(event.currentTarget?.name ?? '1'), 10);
        this.chooseRoom();
    };

    // AS3: roomImageLoadCompleteHandler(_arg_1:Event)
    private roomImageLoadCompleteHandler(): void
    {
        this._loadedCount++;

        if(this._loadedCount === this._numOfRooms)
        {
            this.initView();
        }
    }

    // AS3: chooseRoom()
    private chooseRoom(): void
    {
        const holder = this._roomImageContainers[this._selectedRoom - 1];

        if(holder == null || !this._selectedIcon) return;

        this._selectedIcon.x = holder.x;
        this._selectedIcon.y = holder.y + holder.height - this._selectedIcon.height;
        this._selectedIcon.visible = true;

        if(this._selectButton)
        {
            this._selectButton.visible = this._loadedCount === this._numOfRooms;
        }

        this.getRoomDescription();
    }

    // AS3: dispose()
    public dispose(): void
    {
        if(this.disposed) return;

        if(this._selectInitialRoomEvent)
        {
            this._newUserFlow?.communicationManager?.removeHabboConnectionMessageEvent(this._selectInitialRoomEvent);
        }

        if(this._container)
        {
            while(this._container.numChildren > 0)
            {
                this._container.removeChildAt(0);
            }
        }

        this._container = null;
        this._roomImages = [];
        this._newUserFlow = null;
    }
}
