/**
 * IRoomContentLoader Interface
 *
 * Based on AS3: com.sulake.room.IRoomContentLoader
 *
 * Interface for loading room content (furniture, pets, room assets).
 *
 * @see sources/win63_version/room/IRoomContentLoader.as
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomObject} from './object/IRoomObject';
import type {IGraphicAssetCollection} from './object/visualization/utils/IGraphicAssetCollection';

export type RoomContentData = Record<string, unknown>;

export interface IRoomContentLoader extends IDisposable
{
	// AS3: sources/win63_version/room/IRoomContentLoader.as::getPlaceHolderType()
	getPlaceHolderType(type: string): string;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getPlaceHolderTypes()
	getPlaceHolderTypes(): string[];

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getContentType()
	getContentType(type: string): string;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::hasInternalContent()
	hasInternalContent(type: string): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::loadObjectContent()
	loadObjectContent(type: string, events: EventEmitter): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::insertObjectContent()
	insertObjectContent(typeId: number, category: number, assetLibrary: IAssetLibrary): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getVisualizationType()
	getVisualizationType(type: string): string | null;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getLogicType()
	getLogicType(type: string): string | null;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::hasVisualizationXML()
	hasVisualizationXML(type: string): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getVisualizationXML()
	getVisualizationXML(type: string): RoomContentData | null;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::hasAssetXML()
	hasAssetXML(type: string): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getAssetXML()
	getAssetXML(type: string): RoomContentData | null;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::hasLogicXML()
	hasLogicXML(type: string): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getLogicXML()
	getLogicXML(type: string): RoomContentData | null;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::getGraphicAssetCollection()
	getGraphicAssetCollection(type: string): IGraphicAssetCollection | null;

	// Helium-specific: not in AS3's IRoomContentLoader. AS3's RoomManager.createRoomObject()
	// treats getGraphicAssetCollection() != null as proof content is ready, because AS3 only
	// registers a collection once its data has actually been parsed. This port's content
	// loader registers a collection synchronously when loading *starts* (before the async
	// fetch/parse completes), so RoomManager needs this extra check to know whether the
	// collection it got back is actually populated yet.
	isLoaded(type: string): boolean;

	// AS3: sources/win63_version/room/IRoomContentLoader.as::roomObjectCreated()
	roomObjectCreated(object: IRoomObject, roomId: string): void;
}
