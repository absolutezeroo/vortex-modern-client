import EventEmitter from 'eventemitter3';
import type {IStructureData} from './IStructureData';
import {parseXmlDocument} from './AvatarXmlUtils';

/**
 * Downloads and applies additional avatar structure data (figure part lists).
 *
 * @see sources/win63_version/habbo/avatar/structure/AvatarStructureDownload.as
 * @see sources/flash_version/com/sulake/habbo/avatar/structure/AvatarStructureDownload.as
 */
export class AvatarStructureDownload extends EventEmitter
{
    public static readonly STRUCTURE_DONE: string = 'AVATAR_STRUCTURE_DONE';

    private _structureData: IStructureData;

    // AS3: sources/win63_version/habbo/avatar/structure/AvatarStructureDownload.as::AvatarStructureDownload()
    constructor(url: string, structureData: IStructureData)
    {
        super();

        this._structureData = structureData;
        this.download(url);
    }

    // AS3: sources/win63_version/habbo/avatar/structure/AvatarStructureDownload.as::onDataComplete()
    private async download(url: string): Promise<void>
    {
        try
        {
            const response = await fetch(url);

            if(!response.ok)
            {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            const document = parseXmlDocument(text);

            if(document === null)
            {
                throw new Error(`Invalid avatar structure XML from ${url}`);
            }

            this._structureData.appendXML(document);
            this.emit(AvatarStructureDownload.STRUCTURE_DONE);
        }
        catch (error)
        {
            console.error('[AvatarStructureDownload] Failed to download structure data', error);
        }
    }
}