import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IRoomSession, RoomSessionStateType} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import type {RoomModerationSettings} from '../communication/messages/incoming/navigator';
import type {IHabboTracking} from '../tracking/IHabboTracking';
import {
    AmbassadorAlertMessageComposer,
    AssignRightsMessageComposer,
    AvatarExpressionMessageComposer,
    BanUserWithDurationMessageComposer,
    CancelTypingMessageComposer,
    ChangeMottoMessageComposer,
    ChangePostureMessageComposer,
    ChangeQueueMessageComposer,
    ChatMessageComposer,
    CompostPlantComposer,
    CreditFurniRedeemMessageComposer,
    DanceMessageComposer,
    Game2GameChatMessageComposer,
    GetPetCommandsComposer,
    HarvestPetComposer,
    KickUserMessageComposer,
    LetUserInMessageComposer,
    MountPetComposer,
    MuteUserMessageComposer,
    OpenFlatConnectionMessageComposer,
    OpenPetPackageMessageComposer,
    PickUpPetComposer,
    PresentOpenMessageComposer,
    QuitMessageComposer,
    RemoveRightsMessageComposer,
    RemoveSaddleFromPetComposer,
    RoomDimmerChangeStateComposer,
    RoomDimmerGetPresetsComposer,
    RoomDimmerSavePresetComposer,
    ShoutMessageComposer,
    SignMessageComposer,
    StartTypingMessageComposer,
    TogglePetBreedingPermissionComposer,
    TogglePetRidingPermissionComposer,
    UnmuteUserMessageComposer,
    UpdateClothingChangeFurnitureComposer,
    UseFurnitureMessageComposer,
    UseProductForPetComposer,
    WhisperMessageComposer,
} from '../communication/messages/outgoing/room';
import {PollAnswerComposer, PollRejectComposer, PollStartComposer,} from '../communication/messages/outgoing/poll';
import {VisitUserMessageComposer,} from '../communication/messages/outgoing/friendlist';
import {EventLogMessageComposer,} from '../communication/messages/outgoing';
import {NewUserExperienceScriptProceedComposer,} from '../communication/messages/outgoing/handshake';
import {
    PeerUsersClassificationMessageComposer,
    RoomUsersClassificationMessageComposer,
} from '../communication/messages/outgoing/moderation';
import type {IUserDataManager} from "@habbo/session/IUserDataManager";
import {UserDataManager} from "@habbo/session/UserDataManager";

const log = Logger.getLogger('RoomSession');

/**
 * Ban duration types
 */
export const BanDuration = {
    HOUR: 'RWUAM_BAN_USER_HOUR',
    DAY: 'RWUAM_BAN_USER_DAY',
    PERMANENT: 'RWUAM_BAN_USER_PERM',
} as const;

/**
 * Room session implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSession
 *
 * Represents an active session in a room. The key method is start()
 * which sends OpenFlatConnectionMessageComposer to enter the room.
 *
 * @see source_as_win63/habbo/session/RoomSession.as
 */
export class RoomSession implements IRoomSession
{
    private _chatTrackingId: number = 0;
    private _chatTrackingMap: Map<number, number> = new Map();
    private _eventLogTracked: Map<string, boolean> = new Map();
    private _habboTracking: IHabboTracking | null = null;

    get habboTracking(): IHabboTracking | null
    {
        return this._habboTracking;
    }

    set habboTracking(value: IHabboTracking | null)
    {
        this._habboTracking = value;
    }

    private _userDataManager: UserDataManager = new UserDataManager();

    get userDataManager(): IUserDataManager
    {
        return this._userDataManager;
    }

    private _openConnectionComposer: IMessageComposer<unknown[]> | null = null;

    get openConnectionComposer(): IMessageComposer<unknown[]> | null
    {
        return this._openConnectionComposer;
    }

    set openConnectionComposer(value: IMessageComposer<unknown[]> | null)
    {
        this._openConnectionComposer = value;
    }

    private _connection: IConnection | null = null;

    get connection(): IConnection | null
    {
        return this._connection;
    }

    // AS3: sources/win63_version/habbo/session/RoomSession.as::set connection()
    // AS3 forwards the connection on to its UserDataManager, which this port did not: RoomSession
    // builds its own UserDataManager (line ~98) and nothing ever gave it a connection, so every
    // method on it that sends a composer was silently inert — requestPetInfo() bailed on
    // `if(petData && this._connection)` and the pet infostand could never be requested. Note this
    // is a *different* instance from the one SessionDataManager builds, which does get a connection
    // wired; only that one worked.
    //
    // AS3's null-guard is kept: dispose() clears the field directly rather than through here, so
    // nothing depends on being able to null it via the setter.
    set connection(value: IConnection | null)
    {
        if(value === null) return;

        this._connection = value;

        if(this._userDataManager !== null) this._userDataManager.connection = value;
    }

    private _roomId: number = 0;

    get roomId(): number
    {
        return this._roomId;
    }

    set roomId(value: number)
    {
        this._roomId = value;
    }

    private _roomPassword: string = '';

    get roomPassword(): string
    {
        return this._roomPassword;
    }

    set roomPassword(value: string)
    {
        this._roomPassword = value;
    }

    private _roomResources: string = '';

    get roomResources(): string
    {
        return this._roomResources;
    }

    set roomResources(value: string)
    {
        this._roomResources = value;
    }

    private _skipOpc: boolean = false;

    get skipOpc(): boolean
    {
        return this._skipOpc;
    }

    set skipOpc(value: boolean)
    {
        this._skipOpc = value;
    }

    private _state: RoomSessionStateType = RoomSessionState.CREATED;

    get state(): RoomSessionStateType
    {
        return this._state;
    }

    // Session properties
    private _ownUserRoomId: number = -1;

    get ownUserRoomId(): number
    {
        return this._ownUserRoomId;
    }

    set ownUserRoomId(value: number)
    {
        this._ownUserRoomId = value;
    }

    private _isRoomOwner: boolean = false;

    get isRoomOwner(): boolean
    {
        return this._isRoomOwner;
    }

    set isRoomOwner(value: boolean)
    {
        this._isRoomOwner = value;
    }

    private _roomControllerLevel: number = 0;

    get roomControllerLevel(): number
    {
        if(this._playTestMode) return 0;

        return this._roomControllerLevel;
    }

    set roomControllerLevel(value: number)
    {
        if(value >= 0 && value <= 5)
        {
            this._roomControllerLevel = value;
        }
        else
        {
            log.warn(`Invalid roomControllerLevel ${value}, setting to ROOM_CONTROL_LEVEL_NONE instead`);
            this._roomControllerLevel = 0;
        }
    }

    private _isGuildRoom: boolean = false;

    get isGuildRoom(): boolean
    {
        return this._isGuildRoom;
    }

    set isGuildRoom(value: boolean)
    {
        this._isGuildRoom = value;
    }

    get isPrivateRoom(): boolean
    {
        return true;
    }

    private _tradeMode: number = 0;

    get tradeMode(): number
    {
        return this._tradeMode;
    }

    set tradeMode(value: number)
    {
        this._tradeMode = value;
    }

    private _doorMode: number = 0;

    get doorMode(): number
    {
        return this._doorMode;
    }

    set doorMode(value: number)
    {
        this._doorMode = value;
    }

    get isNoobRoom(): boolean
    {
        return this._doorMode === 4;
    }

    private _isSpectatorMode: boolean = false;

    get isSpectatorMode(): boolean
    {
        return this._isSpectatorMode;
    }

    set isSpectatorMode(value: boolean)
    {
        this._isSpectatorMode = value;
    }

    private _arePetsAllowed: boolean = false;

    get arePetsAllowed(): boolean
    {
        return this._arePetsAllowed;
    }

    set arePetsAllowed(value: boolean)
    {
        this._arePetsAllowed = value;
    }

    get areBotsAllowed(): boolean
    {
        return this._isRoomOwner;
    }

    private _roomModerationSettings: RoomModerationSettings | null = null;

    get roomModerationSettings(): RoomModerationSettings | null
    {
        return this._roomModerationSettings;
    }

    set roomModerationSettings(value: RoomModerationSettings | null)
    {
        this._roomModerationSettings = value;
    }

    private _isUserDecorating: boolean = false;

    get isUserDecorating(): boolean
    {
        return this._isUserDecorating;
    }

    set isUserDecorating(value: boolean)
    {
        this._isUserDecorating = value;
    }

    private _isGameSession: boolean = false;

    get isGameSession(): boolean
    {
        return this._isGameSession;
    }

    set isGameSession(value: boolean)
    {
        this._isGameSession = value;
    }

    private _playTestMode: boolean = false;

    get playTestMode(): boolean
    {
        return this._playTestMode;
    }

    set playTestMode(value: boolean)
    {
        this._playTestMode = value;
    }

    private _isNuxNotComplete: boolean = false;

    get isNuxNotComplete(): boolean
    {
        return this._isNuxNotComplete;
    }

    set isNuxNotComplete(value: boolean)
    {
        this._isNuxNotComplete = value;
    }

    /**
	 * Start the room session.
	 *
	 * Sends either a predefined openConnectionComposer or the default
	 * OpenFlatConnectionMessageComposer to enter the room.
	 *
	 * @see sources/win63_version/habbo/session/RoomSession.as start()
	 */
    start(): boolean
    {
        if(this._state !== RoomSessionState.CREATED || this._connection === null)
        {
            return false;
        }

        this._state = RoomSessionState.STARTED;

        if(!this._skipOpc)
        {
            if(this._openConnectionComposer !== null)
            {
                this._connection.send(this._openConnectionComposer);
            }
            else
            {
                this._connection.send(new OpenFlatConnectionMessageComposer(this._roomId, this._roomPassword));
            }
        }

        return true;
    }

    /**
	 * Reset the session with a new room ID
	 * Called when session is reinitialized (e.g., room forwarding)
	 */
    reset(newRoomId: number): void
    {
        if(newRoomId !== this._roomId)
        {
            this._roomId = newRoomId;
            this._isRoomOwner = false;
            this._roomControllerLevel = 0;
            this._tradeMode = 0;
            this._isSpectatorMode = false;
        }
    }

    /**
	 * Quit the current room session
	 */
    quit(): void
    {
        if(this._connection === null)
        {
            return;
        }

        this._connection.send(new QuitMessageComposer());
    }

    /**
	 * Dispose the session and clean up resources
	 */
    dispose(): void
    {
        this._connection = null;
        this._habboTracking = null;
        this._openConnectionComposer = null;
        this._state = RoomSessionState.ENDED;
        this._chatTrackingMap.clear();
        this._eventLogTracked.clear();
        this._userDataManager.dispose();
    }

    sendChatMessage(message: string, styleId: number = 0): void
    {
        if(this._connection === null) return;

        if(this._isGameSession)
        {
            this._connection.send(new Game2GameChatMessageComposer(message));

            return;
        }

        this._chatTrackingMap.set(this._chatTrackingId, Date.now());
        this._connection.send(new ChatMessageComposer(message, styleId, this._chatTrackingId));

        this._chatTrackingId++;
    }

    sendChangeMottoMessage(motto: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new ChangeMottoMessageComposer(motto));
    }

    sendShoutMessage(message: string, styleId: number = 0): void
    {
        if(this._connection === null) return;

        this._connection.send(new ShoutMessageComposer(message, styleId));
    }

    sendWhisperMessage(recipientName: string, message: string, styleId: number = 0): void
    {
        if(this._connection === null) return;

        this._connection.send(new WhisperMessageComposer(recipientName, message, styleId));
    }

    sendChatTypingMessage(isTyping: boolean): void
    {
        if(this._connection === null) return;

        if(isTyping)
        {
            this._connection.send(new StartTypingMessageComposer());
        }
        else
        {
            this._connection.send(new CancelTypingMessageComposer());
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/RoomSession.as::receivedChatWithTrackingId()
    receivedChatWithTrackingId(trackingId: number): void
    {
        // AS3 uses remove(), which drops the entry whether or not it reports lag.
        const sentTime = this._chatTrackingMap.get(trackingId);

        this._chatTrackingMap.delete(trackingId);

        if(sentTime !== undefined)
        {
            const now = Date.now();

            if(now - sentTime > 2500 && this._habboTracking !== null)
            {
                // AS3 hands the *current time* to chatLagDetected, not the elapsed lag:
                // LagWarningLogger.reportWarningsAsNeeded() compares it against the last report
                // time and stores it as the new one. Passing the delta would break that throttle.
                this._habboTracking.chatLagDetected(now);
            }
        }
    }

    sendAvatarExpressionMessage(expressionId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new AvatarExpressionMessageComposer(expressionId));
    }

    sendSignMessage(signId: number): void
    {
        if(this._connection === null) return;

        if(signId < 0 || signId > 17) return;

        this._connection.send(new SignMessageComposer(signId));
    }

    sendDanceMessage(danceId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new DanceMessageComposer(danceId));
    }

    sendChangePostureMessage(posture: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new ChangePostureMessageComposer(posture));
    }

    sendCreditFurniRedeemMessage(objectId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new CreditFurniRedeemMessageComposer(objectId));
    }

    sendPresentOpenMessage(objectId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new PresentOpenMessageComposer(objectId));
    }

    sendOpenPetPackageMessage(objectId: number, name: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new OpenPetPackageMessageComposer(objectId, name));
    }

    sendRoomDimmerGetPresetsMessage(itemId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new RoomDimmerGetPresetsComposer(itemId));
    }

    sendRoomDimmerSavePresetMessage(itemId: number, presetId: number, type: number, color: number, light: boolean, brightness: number): void
    {
        if(this._connection === null) return;

        const hexPadded = '000000' + color.toString(16).toUpperCase();
        const colorHex = '#' + hexPadded.substring(hexPadded.length - 6);

        this._connection.send(new RoomDimmerSavePresetComposer(presetId, type, colorHex, brightness, light, itemId));
    }

    sendRoomDimmerChangeStateMessage(itemId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new RoomDimmerChangeStateComposer(itemId));
    }

    sendUpdateClothingChangeFurniture(objectId: number, gender: string, figure: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new UpdateClothingChangeFurnitureComposer(objectId, gender, figure));
    }

    sendPollStartMessage(pollId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new PollStartComposer(pollId));
    }

    sendPollRejectMessage(pollId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new PollRejectComposer(pollId));
    }

    sendPollAnswerMessage(pollId: number, questionId: number, answers: string[]): void
    {
        if(this._connection === null) return;

        this._connection.send(new PollAnswerComposer(pollId, questionId, answers));
    }

    sendConversionPoint(type: string, value: string, extra: string, category: string | null = null, action: number = 0): void
    {
        if(this._connection === null) return;

        this._connection.send(new EventLogMessageComposer(type, value, extra, category ?? '', action));
    }

    sendPeerUsersClassificationMessage(data: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new PeerUsersClassificationMessageComposer(data));
    }

    sendRoomUsersClassificationMessage(data: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new RoomUsersClassificationMessageComposer(data));
    }

    sendVisitFlatMessage(roomId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new OpenFlatConnectionMessageComposer(roomId, ''));
    }

    sendVisitUserMessage(userName: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new VisitUserMessageComposer(userName));
    }

    ambassadorAlert(userId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new AmbassadorAlertMessageComposer(userId));
    }

    kickUser(userId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new KickUserMessageComposer(userId));
    }

    banUserWithDuration(userId: number, duration: string): void
    {
        if(this._connection === null) return;

        this._connection.send(new BanUserWithDurationMessageComposer(userId, duration, this._roomId));
    }

    muteUser(userId: number, minutes: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new MuteUserMessageComposer(userId, minutes, this._roomId));
    }

    unmuteUser(userId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new UnmuteUserMessageComposer(userId, this._roomId));
    }

    assignRights(userId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new AssignRightsMessageComposer(userId));
    }

    removeRights(userId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new RemoveRightsMessageComposer([userId]));
    }

    letUserIn(userName: string, allow: boolean): void
    {
        if(this._connection === null) return;

        this._connection.send(new LetUserInMessageComposer(userName, allow));
    }

    pickUpPet(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new PickUpPetComposer(petId));
    }

    mountPet(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new MountPetComposer(petId, true));
    }

    togglePetRidingPermission(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new TogglePetRidingPermissionComposer(petId));
    }

    dismountPet(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new MountPetComposer(petId, false));
    }

    removeSaddleFromPet(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new RemoveSaddleFromPetComposer(petId));
    }

    requestPetCommands(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new GetPetCommandsComposer(petId));
    }

    useProductForPet(petId: number, productId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new UseProductForPetComposer(petId, productId));
    }

    plantSeed(itemId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new UseFurnitureMessageComposer(itemId));
    }

    harvestPet(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new HarvestPetComposer(petId));
    }

    togglePetBreedingPermission(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new TogglePetBreedingPermissionComposer(petId));
    }

    compostPlant(petId: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new CompostPlantComposer(petId));
    }

    changeQueue(targetQueue: number): void
    {
        if(this._connection === null) return;

        this._connection.send(new ChangeQueueMessageComposer(targetQueue));
    }

    sendScriptProceed(): void
    {
        if(this._connection === null) return;

        this._connection.send(new NewUserExperienceScriptProceedComposer());
    }

    trackEventLogOncePerSession(category: string, type: string, action: string): void
    {
        const key = `${category}_${type}_${action}`;

        if(this._eventLogTracked.has(key))
        {
            return;
        }

        this._eventLogTracked.set(key, true);

        this.sendConversionPoint(category, type, action);
    }
}
