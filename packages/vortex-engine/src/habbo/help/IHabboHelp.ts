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
    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportBully()
    reportBully(userId: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::startPhotoReportingInNewCfhFlow()
    startPhotoReportingInNewCfhFlow(userId: number, userName: string, extraDataId: string, roomObjectId: number): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportUser()
    reportUser(userId: number, roomId: number, userName: string): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::reportUserName()
    reportUserName(userId: number, userName: string): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/IHabboHelp.as::reportUserFromIM()
    reportUserFromIM(userId: number): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportRoom()
    reportRoom(roomId: number, roomName: string, roomDescription: string): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportThread()
    reportThread(groupId: number, threadId: number): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportMessage()
    reportMessage(groupId: number, threadId: number, messageId: number): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportSelfie()
    reportSelfie(extraDataId: string, description: string, userId: number, roomObjectId: number, roomId: number): boolean;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::reportPhoto()
    reportPhoto(extraDataId: string, topicId: number, userId: number, roomObjectId: number, roomId: number): boolean;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::requestGuide()
    requestGuide(): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::startNameChange()
    startNameChange(): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::showWelcomeScreen()
    showWelcomeScreen(title: string, body: string, position: number, imageName?: string | null): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::showHabboWay()
    showHabboWay(): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::showSafetyBooklet()
    showSafetyBooklet(): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::showTourPopup()
    showTourPopup(): void;

    // AS3: .../src/com/sulake/habbo/help/IHabboHelp.as::set outsideRoom()
    set outsideRoom(value: boolean);
}
