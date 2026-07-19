/**
 * Interface for the help component
 *
 * Public API for reporting users/rooms/threads/messages, name change,
 * welcome screen, Habbo Way, and safety booklet.
 *
 * @see source_as_win63/habbo/help/IHabboHelp.as
 */
export interface IHabboHelp
{
    reportBully(userId: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::startPhotoReportingInNewCfhFlow()
    startPhotoReportingInNewCfhFlow(userId: number, userName: string, extraDataId: string, roomObjectId: number): void;

    reportUser(userId: number, roomId: number, userName: string): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::reportUserName()
    reportUserName(userId: number, userName: string): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::reportUserFromIM()
    reportUserFromIM(userId: number): void;

    reportRoom(roomId: number, roomName: string, roomDescription: string): void;

    reportThread(groupId: number, threadId: number): void;

    reportMessage(groupId: number, threadId: number, messageId: number): void;

    reportSelfie(extraDataId: string, description: string, userId: number, roomObjectId: number, roomId: number): boolean;

    reportPhoto(extraDataId: string, topicId: number, userId: number, roomObjectId: number, roomId: number): boolean;

    requestGuide(): void;

    startNameChange(): void;

    showWelcomeScreen(title: string, body: string, position: number, imageName?: string | null): void;

    showHabboWay(): void;

    showSafetyBooklet(): void;

    showTourPopup(): void;

    set outsideRoom(value: boolean);
}
