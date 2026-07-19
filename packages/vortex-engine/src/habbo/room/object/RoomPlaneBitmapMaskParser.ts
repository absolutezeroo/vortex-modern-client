/**
 * RoomPlaneBitmapMaskParser
 *
 * @see source_as_win63/habbo/room/object/RoomPlaneBitmapMaskParser.as
 *
 * Parses and manages bitmap masks for room planes (doors, windows, holes).
 * Stores masks in a map keyed by mask ID. Can serialize to/from XML strings.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomPlaneBitmapMaskData} from './RoomPlaneBitmapMaskData';

export class RoomPlaneBitmapMaskParser
{
    private _masks: Map<string, RoomPlaneBitmapMaskData> = new Map();
    private _maskKeys: string[] = [];

    get maskCount(): number
    {
        return this._maskKeys.length;
    }

    /**
	 * Initialize from an XML string (planeMasks element).
	 * Based on AS3 RoomPlaneBitmapMaskParser.initialize()
	 */
    initialize(xmlString: string): boolean
    {
        if(!xmlString) return false;

        this.reset();

        try
        {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, 'text/xml');
            const masks = doc.querySelectorAll('planeMask');

            for(const maskEl of masks)
            {
                const id = maskEl.getAttribute('id');
                const type = maskEl.getAttribute('type');
                const category = maskEl.getAttribute('category');

                if(!id || !type || !category) return false;

                const locationEl = maskEl.querySelector('location');

                if(!locationEl) return false;

                const x = parseFloat(locationEl.getAttribute('x') ?? '0');
                const y = parseFloat(locationEl.getAttribute('y') ?? '0');
                const z = parseFloat(locationEl.getAttribute('z') ?? '0');

                const loc = new Vector3d(x, y, z);
                const maskData = new RoomPlaneBitmapMaskData(type, loc, category);

                this._masks.set(id, maskData);
                this._maskKeys.push(id);
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    /**
	 * Reset all masks.
	 */
    reset(): void
    {
        for(const data of this._masks.values())
        {
            data.dispose();
        }

        this._masks.clear();
        this._maskKeys = [];
    }

    /**
	 * Add or replace a mask.
	 * Based on AS3 RoomPlaneBitmapMaskParser.addMask()
	 */
    addMask(id: string, type: string, location: IVector3d, category: string): void
    {
        const existing = this._masks.get(id);

        if(existing)
        {
            existing.dispose();
        }
        else
        {
            this._maskKeys.push(id);
        }

        this._masks.set(id, new RoomPlaneBitmapMaskData(type, location, category));
    }

    /**
	 * Remove a mask by ID.
	 * Based on AS3 RoomPlaneBitmapMaskParser.removeMask()
	 */
    removeMask(id: string): boolean
    {
        const data = this._masks.get(id);

        if(data)
        {
            data.dispose();
            this._masks.delete(id);
            this._maskKeys = this._maskKeys.filter(k => k !== id);
            return true;
        }

        return false;
    }

    /**
	 * Serialize current masks to XML string.
	 * Based on AS3 RoomPlaneBitmapMaskParser.getXML()
	 */
    getXML(): string
    {
        let xml = '<planeMasks>';

        for(let i = 0; i < this._maskKeys.length; i++)
        {
            const key = this._maskKeys[i];
            const data = this._masks.get(key);

            if(data && data.loc)
            {
                xml += `<planeMask id="${key}" type="${data.type}" category="${data.category}">`;
                xml += `<location x="${data.loc.x}" y="${data.loc.y}" z="${data.loc.z}"/>`;
                xml += '</planeMask>';
            }
        }

        xml += '</planeMasks>';
        return xml;
    }

    getMaskLocation(index: number): IVector3d | null
    {
        if(index < 0 || index >= this._maskKeys.length) return null;

        const data = this._masks.get(this._maskKeys[index]);
        return data?.loc ?? null;
    }

    getMaskType(index: number): string | null
    {
        if(index < 0 || index >= this._maskKeys.length) return null;

        const data = this._masks.get(this._maskKeys[index]);
        return data?.type ?? null;
    }

    getMaskCategory(index: number): string | null
    {
        if(index < 0 || index >= this._maskKeys.length) return null;

        const data = this._masks.get(this._maskKeys[index]);
        return data?.category ?? null;
    }

    dispose(): void
    {
        this.reset();
    }
}
