import EventEmitter from 'eventemitter3';
import type {IStructureData} from './IStructureData';

/**
 * Downloads and applies additional avatar structure data (figure part lists).
 *
 * In AS3, this extends EventDispatcherWrapper and uses AssetLoaderStruct to load XML data.
 * The loaded data is parsed and appended to the IStructureData receiver via appendXML/appendJSON.
 * Dispatches STRUCTURE_DONE when the download and parse is complete.
 *
 * @see sources/win63_version/habbo/avatar/structure/AvatarStructureDownload.as
 * @see sources/flash_version/com/sulake/habbo/avatar/structure/AvatarStructureDownload.as
 */
export class AvatarStructureDownload extends EventEmitter
{
	public static readonly STRUCTURE_DONE: string = 'AVATAR_STRUCTURE_DONE';

	private _structureData: IStructureData;

	constructor(url: string, structureData: IStructureData)
	{
		super();

		this._structureData = structureData;

		this.download(url);
	}

	/**
	 * Fetches structure data from the given URL and appends it to the structure data receiver.
	 *
	 * In AS3, the data is loaded as text/plain, parsed to XML, then passed to
	 * IStructureData.appendXML(). In our port, we fetch JSON and call appendJSON().
	 */
	private async download(url: string): Promise<void>
	{
		try
		{
			const response = await fetch(url);
			const data = await response.json();

			if (data)
			{
				this._structureData.appendJSON(data);
			}

			this.emit(AvatarStructureDownload.STRUCTURE_DONE);
		}
		catch (error)
		{
			console.error('[AvatarStructureDownload] Failed to download structure data', error);
			this.emit(AvatarStructureDownload.STRUCTURE_DONE);
		}
	}
}
