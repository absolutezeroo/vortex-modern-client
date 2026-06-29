import type {NavigatorLiftedRoomData} from '../../communication/messages/incoming/newnavigator';

/**
 * Container for promoted/lifted room data
 * Based on AS3 com.sulake.habbo.navigator.lift.LiftDataContainer
 */
export class LiftDataContainer
{
	private static readonly DEFAULT_IMAGE = '${image.library.url}officialrooms_hq/nav_teaser_wl.png';
	private _imageLibraryBaseUrl: string = '';

	constructor()
	{
	}

	private _liftedRooms: NavigatorLiftedRoomData[] = [];

	get liftedRooms(): NavigatorLiftedRoomData[]
	{
		return this._liftedRooms;
	}

	setImageLibraryBaseUrl(url: string): void
	{
		this._imageLibraryBaseUrl = url;
	}

	setLiftedRooms(rooms: NavigatorLiftedRoomData[]): void
	{
		this._liftedRooms = rooms;
	}

	getUrlForLiftImageAtIndex(index: number): string
	{
		if (index < 0 || index > this._liftedRooms.length - 1)
		{
			return '';
		}

		const room = this._liftedRooms[index];
		if (!room.image || room.image === '')
		{
			return LiftDataContainer.DEFAULT_IMAGE;
		}

		return this._imageLibraryBaseUrl + room.image;
	}
}
