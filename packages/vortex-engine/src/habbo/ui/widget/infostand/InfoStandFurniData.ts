/**
 * InfoStandFurniData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandFurniData.as
 */
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {RoomWidgetFurniInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent';

export class InfoStandFurniData
{
    public id: number = 0;
    public category: number = 0;
    public name: string = '';
    public description: string = '';
    public image: unknown = null;
    public classId: number = 0;
    public purchaseOfferId: number = -1;
    public bcOfferId: number = -1;
    public extraParam: string = '';
    public stuffData: IStuffData | null = null;
    public groupId: number = 0;
    public ownerId: number = 0;
    public ownerName: string = '';
    public rentOfferId: number = -1;
    public availableForBuildersClub: boolean = false;

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandFurniData.as::setData()
    public setData(event: RoomWidgetFurniInfoUpdateEvent): void
    {
        this.id = event.id;
        this.category = event.category;
        this.name = event.name;
        this.description = event.description;
        this.image = event.image;
        this.purchaseOfferId = event.purchaseOfferId;
        this.extraParam = event.extraParam;
        this.stuffData = event.stuffData;
        this.groupId = event.groupId;
        this.ownerName = event.ownerName;
        this.ownerId = event.ownerId;
        this.rentOfferId = event.rentOfferId;
        this.availableForBuildersClub = event.availableForBuildersClub;
        this.classId = event.classId;
        this.bcOfferId = event.bcOfferId;
    }
}
