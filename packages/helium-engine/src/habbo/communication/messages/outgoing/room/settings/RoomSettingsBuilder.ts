export class RoomSettingsBuilder
{
    roomId: number = 0;
    name: string = '';
    description: string = '';
    doorMode: number = 0;
    password: string = '';
    maximumVisitors: number = 0;
    categoryId: number = 0;
    tags: string[] = [];
    tradeMode: number = 0;
    allowPets: boolean = false;
    allowFoodConsume: boolean = false;
    allowWalkThrough: boolean = false;
    hideWalls: boolean = false;
    wallThickness: number = 0;
    floorThickness: number = 0;
    whoCanMute: number = 0;
    whoCanKick: number = 0;
    whoCanBan: number = 0;
    chatMode: number = 0;
    chatBubbleSize: number = 1;
    chatScrollUpFrequency: number = 1;
    chatFullHearRange: number = 14;
    chatFloodSensitivity: number = 1;
    allowNavigatorDynCats: boolean = false;
}
