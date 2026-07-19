import type {IConnection} from '@core/communication/connection/IConnection';
import type {RoomModerationSettings} from '../communication/messages/incoming/navigator';
import type {IUserDataManager} from "@habbo/session/IUserDataManager";

/**
 * Room session state constants
 */
export const RoomSessionState = {
    CREATED: 'RSE_CREATED',
    STARTED: 'RSE_STARTED',
    ENDED: 'RSE_ENDED',
} as const;

export type RoomSessionStateType = typeof RoomSessionState[keyof typeof RoomSessionState];

/**
 * Room session interface
 *
 * Based on AS3: com.sulake.habbo.session.IRoomSession
 *
 * Represents an active session in a room. Handles communication
 * with the server for room-specific actions.
 *
 * @see source_as_win63/habbo/session/IRoomSession.as
 */
export interface IRoomSession
{
    // Core properties
    readonly roomId: number;
    readonly state: RoomSessionStateType;
    readonly userDataManager: IUserDataManager;

    // Connection
    connection: IConnection | null;
    roomPassword: string;
    roomResources: string;
    skipOpc: boolean;

    // Session state
    ownUserRoomId: number;
    isRoomOwner: boolean;
    roomControllerLevel: number;
    isGuildRoom: boolean;
    readonly isPrivateRoom: boolean;
    readonly isNoobRoom: boolean;
    tradeMode: number;
    doorMode: number;
    isSpectatorMode: boolean;
    arePetsAllowed: boolean;
    readonly areBotsAllowed: boolean;
    roomModerationSettings: RoomModerationSettings | null;
    isUserDecorating: boolean;
    isGameSession: boolean;
    playTestMode: boolean;
    isNuxNotComplete: boolean;

    /**
	 * Start the room session
	 * Sends OpenFlatConnectionMessageComposer to enter the room
	 */
    start(): boolean;

    /**
	 * Quit the room session
	 */
    quit(): void;

    /**
	 * Dispose the session
	 */
    dispose(): void;

    // Chat methods
    sendChatMessage(message: string, styleId?: number): void;

    sendChangeMottoMessage(motto: string): void;

    sendShoutMessage(message: string, styleId?: number): void;

    sendWhisperMessage(recipientName: string, message: string, styleId?: number): void;

    sendChatTypingMessage(isTyping: boolean): void;

    // Avatar methods
    sendAvatarExpressionMessage(expressionId: number): void;

    sendSignMessage(signId: number): void;

    sendDanceMessage(danceId: number): void;

    sendChangePostureMessage(posture: number): void;

    // Furniture methods
    sendCreditFurniRedeemMessage(objectId: number): void;

    sendPresentOpenMessage(objectId: number): void;

    sendOpenPetPackageMessage(objectId: number, name: string): void;

    sendRoomDimmerGetPresetsMessage(itemId: number): void;

    sendRoomDimmerSavePresetMessage(itemId: number, presetId: number, type: number, color: number, light: boolean, brightness: number): void;

    sendRoomDimmerChangeStateMessage(itemId: number): void;

    sendUpdateClothingChangeFurniture(objectId: number, gender: string, figure: string): void;

    // Poll methods
    sendPollStartMessage(pollId: number): void;

    sendPollRejectMessage(pollId: number): void;

    sendPollAnswerMessage(pollId: number, questionId: number, answers: string[]): void;

    // Tracking methods
    sendConversionPoint(type: string, value: string, extra: string, category?: string | null, action?: number): void;

    sendPeerUsersClassificationMessage(data: string): void;

    sendRoomUsersClassificationMessage(data: string): void;

    // Navigation methods
    sendVisitFlatMessage(roomId: number): void;

    sendVisitUserMessage(userName: string): void;

    // Moderation methods
    ambassadorAlert(userId: number): void;

    kickUser(userId: number): void;

    banUserWithDuration(userId: number, duration: string): void;

    muteUser(userId: number, minutes: number): void;

    unmuteUser(userId: number): void;

    // Rights methods
    assignRights(userId: number): void;

    removeRights(userId: number): void;

    letUserIn(userName: string, allow: boolean): void;

    // Pet methods
    pickUpPet(petId: number): void;

    mountPet(petId: number): void;

    togglePetRidingPermission(petId: number): void;

    dismountPet(petId: number): void;

    removeSaddleFromPet(petId: number): void;

    requestPetCommands(petId: number): void;

    useProductForPet(petId: number, productId: number): void;

    plantSeed(itemId: number): void;

    harvestPet(petId: number): void;

    togglePetBreedingPermission(petId: number): void;

    compostPlant(petId: number): void;

    // Queue methods
    changeQueue(targetQueue: number): void;

    // Chat tracking
    receivedChatWithTrackingId(trackingId: number): void;

    // NUX
    sendScriptProceed(): void;

    // Event logging
    trackEventLogOncePerSession(category: string, type: string, action: string): void;
}
