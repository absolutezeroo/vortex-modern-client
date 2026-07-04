/**
 * InfoStandRentableBotData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as
 */
export class InfoStandRentableBotData
{
	public userId: number = 0;
	public name: string = '';
	public carryItem: number = 0;
	public userRoomId: number = 0;
	public amIOwner: boolean = false;
	public amIAnyRoomController: boolean = false;
	public botSkills: unknown[] = [];

	private _badges: string[] = [];

	public get badges(): string[]
	{
		return this._badges.slice();
	}

	public set badges(value: string[])
	{
		this._badges = value;
	}

	// AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::setData()
	// TODO(AS3): param is RoomWidgetRentableBotInfoUpdateEvent (not yet ported —
	// out of scope for the furni-only infostand port, see InfoStandRentableBotView.ts).
	public setData(_event: unknown): void
	{
	}
}
