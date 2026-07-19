/**
 * UsersMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.UsersMessageEventParser
 *
 * Parser for room users (avatars, pets, bots).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomUserData} from '@habbo/communication/messages/incoming/room/engine/RoomUserData';

export class UsersMessageParser implements IMessageParser
{
    private _users: RoomUserData[] = [];

    get userCount(): number
    {
        return this._users.length;
    }

    getUser(index: number): RoomUserData | null
    {
        if(index < 0 || index >= this._users.length)
        {
            return null;
        }

        const data = this._users[index];

        if(data !== null)
        {
            data.setReadOnly();
        }

        return data;
    }

    flush(): boolean
    {
        this._users = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();

        this._users = Array.from({length: count}, () =>
        {
            const webId = wrapper.readInt();
            const name = wrapper.readString();
            const custom = wrapper.readString();
            const figure = wrapper.readString();
            const roomIndex = wrapper.readInt();
            const x = wrapper.readInt();
            const y = wrapper.readInt();
            const z = wrapper.readString();
            const dir = wrapper.readInt();
            const userType = wrapper.readInt();

            const userData = new RoomUserData(roomIndex);
            userData.dir = dir;
            userData.name = name;
            userData.custom = custom;
            userData.x = x;
            userData.y = y;
            userData.z = parseFloat(z);

            switch(userType)
            {
                case 1: // Regular user
                {
                    userData.webID = webId;
                    userData.userType = RoomUserData.USER_TYPE_USER;
                    userData.sex = this.resolveSex(wrapper.readString());
                    userData.groupID = String(wrapper.readInt());
                    userData.groupStatus = wrapper.readInt();
                    userData.groupName = wrapper.readString();

                    const swimFigure = wrapper.readString();
                    userData.figure = swimFigure ? this.convertSwimFigure(swimFigure, figure, userData.sex) : figure;

                    userData.achievementScore = wrapper.readInt();
                    userData.isModerator = wrapper.readBoolean();
                    break;
                }

                case 2: // Pet
                    userData.userType = RoomUserData.USER_TYPE_PET;
                    userData.figure = figure;
                    userData.webID = webId;
                    userData.subType = wrapper.readInt().toString();
                    userData.ownerId = wrapper.readInt();
                    userData.ownerName = wrapper.readString();
                    userData.rarityLevel = wrapper.readInt();
                    userData.hasSaddle = wrapper.readBoolean();
                    userData.isRiding = wrapper.readBoolean();
                    userData.canBreed = wrapper.readBoolean();
                    userData.canHarvest = wrapper.readBoolean();
                    userData.canRevive = wrapper.readBoolean();
                    userData.hasBreedingPermission = wrapper.readBoolean();
                    userData.petLevel = wrapper.readInt();
                    userData.petPosture = wrapper.readString();
                    break;

                case 3: // Old bot
                    userData.userType = RoomUserData.USER_TYPE_OLD_BOT;
                    userData.webID = -roomIndex;
                    userData.figure = figure.includes('/') ? 'hr-100-.hd-180-1.ch-876-66.lg-270-94.sh-300-64' : figure;
                    userData.sex = 'M';
                    break;

                case 4: // Rentable bot
                {
                    userData.userType = RoomUserData.USER_TYPE_BOT;
                    userData.webID = webId;
                    userData.sex = this.resolveSex(wrapper.readString());
                    userData.figure = figure;
                    userData.ownerId = wrapper.readInt();
                    userData.ownerName = wrapper.readString();

                    const skillCount = wrapper.readInt();
                    if(skillCount > 0)
                    {
                        userData.botSkills = Array.from({length: skillCount}, () => wrapper.readShort());
                    }
                    break;
                }
            }

            return userData;
        });

        return true;
    }

    private resolveSex(value: string): string
    {
        return value[0]?.toLowerCase() === 'f' ? 'F' : 'M';
    }

    private convertSwimFigure(swimFigure: string, baseFigure: string, sex: string): string
    {
        // Find skin color from 'hd' part (e.g., "hd-180-1" → skinColor = 1)
        const hdPart = baseFigure.split('.').find(part => part.startsWith('hd-'));
        const skinColor = hdPart?.split('-')[2] ?? '1';

        const swimType = sex === 'F' ? 10010 : 10011;

        return `${baseFigure}.bds-10001-${skinColor}.ss-${swimType}-10001`;
    }
}
