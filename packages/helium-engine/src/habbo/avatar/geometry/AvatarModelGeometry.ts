import {AvatarCanvas} from '../structure/AvatarCanvas';
import type {IAvatarImage} from '../IAvatarImage';
import {AvatarSet} from './AvatarSet';
import {GeometryBodyPart} from './GeometryBodyPart';
import {Matrix4x4} from './Matrix4x4';
import {Vector3D} from './Vector3D';
import {Logger} from '@core/utils/Logger';
import {
    getXmlAttribute,
    getXmlChildElements,
    getXmlFirstChildElement,
    getXmlRoot,
    getXmlText
} from '../structure/AvatarXmlUtils';

const log = Logger.getLogger('AvatarModelGeometry');

/**
 * Avatar model geometry that manages body parts, transforms and depth sorting.
 *
 * @see sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as
 */
export class AvatarModelGeometry
{
    private _avatarSet: AvatarSet;
    private _bodyParts: Map<string, Map<string, GeometryBodyPart>>;
    private _itemToBodyPart: Map<string, Map<string, GeometryBodyPart>>;
    private _transform: Matrix4x4;
    private _camera: Vector3D;
    private _canvases: Map<string, Map<string, AvatarCanvas>>;

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::AvatarModelGeometry()
    constructor(data: any)
    {
        this._camera = new Vector3D(0, 0, 10);
        this._transform = new Matrix4x4();
        this._bodyParts = new Map();
        this._itemToBodyPart = new Map();
        this._canvases = new Map();

        const root = getXmlRoot(data);

        if(root)
        {
            this.parseXml(root);
        }
        else
        {
            this.parseObject(data);
        }

        log.info(`Geometry loaded: ${this._canvases.size} scales, ${this._bodyParts.size} types`);
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::removeDynamicItems()
    public removeDynamicItems(avatar: IAvatarImage): void
    {
        for(const typeMap of this._bodyParts.values())
        {
            for(const bodyPart of typeMap.values())
            {
                bodyPart.removeDynamicParts(avatar);
            }
        }
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPartIdsInAvatarSet()
    public getBodyPartIdsInAvatarSet(setId: string): string[]
    {
        const avatarSet = this._avatarSet.findAvatarSet(setId);

        if(avatarSet) return avatarSet.getBodyParts();

        return [];
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::isMainAvatarSet()
    public isMainAvatarSet(setId: string): boolean
    {
        const avatarSet = this._avatarSet.findAvatarSet(setId);

        if(avatarSet) return avatarSet.isMain;

        return false;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getCanvas()
    public getCanvas(scale: string, geometryId: string): AvatarCanvas | null
    {
        const canvasMap = this._canvases.get(scale);

        if(canvasMap) return canvasMap.get(geometryId) || null;

        return null;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPart()
    public getBodyPart(type: string, partId: string): GeometryBodyPart | null
    {
        const typeMap = this.getBodyPartsOfType(type);

        return typeMap.get(partId) || null;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPartOfItem()
    public getBodyPartOfItem(type: string, itemId: string, avatar: IAvatarImage): GeometryBodyPart | null
    {
        const itemMap = this._itemToBodyPart.get(type);

        if(itemMap)
        {
            const bodyPart = itemMap.get(itemId);

            if(bodyPart) return bodyPart;

            const typeMap = this.getBodyPartsOfType(type);

            for(const bp of typeMap.values())
            {
                if(bp.hasPart(itemId, avatar)) return bp;
            }
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPartsAtAngle()
    public getBodyPartsAtAngle(setId: string, angle: number, geometryId: string): string[]
    {
        if(!geometryId) return [];

        const typeMap = this.getBodyPartsOfType(geometryId);
        const bodyParts = this.getBodyPartsInAvatarSet(typeMap, setId);
        const distances: [number, GeometryBodyPart][] = [];

        this._transform = Matrix4x4.getYRotationMatrix(angle);

        for(const bp of bodyParts)
        {
            bp.applyTransform(this._transform);

            const dist = bp.getDistance(this._camera);

            distances.push([dist, bp]);
        }

        distances.sort((a, b) => a[0] - b[0]);

        return distances.map(entry => entry[1].id);
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getParts()
    public getParts(geometryType: string, bodyPartId: string, angle: number, param: any[], avatar: IAvatarImage): string[]
    {
        if(this.hasBodyPart(geometryType, bodyPartId))
        {
            const bodyPart = this.getBodyPartsOfType(geometryType).get(bodyPartId)!;

            this._transform = Matrix4x4.getYRotationMatrix(angle);

            return bodyPart.getParts(this._transform, this._camera, param, avatar);
        }

        return [];
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::typeExists()
    private typeExists(type: string): boolean
    {
        return this._bodyParts.has(type);
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::hasBodyPart()
    private hasBodyPart(type: string, partId: string): boolean
    {
        if(this.typeExists(type))
        {
            const typeMap = this._bodyParts.get(type)!;

            return typeMap.has(partId);
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPartsOfType()
    private getBodyPartsOfType(type: string): Map<string, GeometryBodyPart>
    {
        if(this.typeExists(type))
        {
            return this._bodyParts.get(type)!;
        }

        return new Map();
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::getBodyPartsInAvatarSet()
    private getBodyPartsInAvatarSet(typeMap: Map<string, GeometryBodyPart>, setId: string): GeometryBodyPart[]
    {
        const result: GeometryBodyPart[] = [];
        const ids = this.getBodyPartIdsInAvatarSet(setId);

        for(const id of ids)
        {
            const bp = typeMap.get(id);

            if(bp) result.push(bp);
        }

        return result;
    }

    // AS3: sources/win63_version/habbo/avatar/geometry/AvatarModelGeometry.as::AvatarModelGeometry()
    private parseXml(root: Element): void
    {
        const avatarSetElement = getXmlFirstChildElement(root, 'avatarset');
        this._avatarSet = new AvatarSet(avatarSetElement ?? {});

        const cameraElement = getXmlFirstChildElement(root, 'camera');

        if(cameraElement !== null)
        {
            const x = getXmlFirstChildElement(cameraElement, 'x');
            const y = getXmlFirstChildElement(cameraElement, 'y');
            const z = getXmlFirstChildElement(cameraElement, 'z');

            this._camera.x = parseFloat(x ? getXmlText(x) : '') || 0;
            this._camera.y = parseFloat(y ? getXmlText(y) : '') || 0;
            this._camera.z = parseFloat(z ? getXmlText(z) : '') || 10;
        }

        for(const canvasElement of getXmlChildElements(root, 'canvas'))
        {
            const scale = getXmlAttribute(canvasElement, 'scale');
            const canvasMap = new Map<string, AvatarCanvas>();

            for(const geometryElement of getXmlChildElements(canvasElement, 'geometry'))
            {
                const avatarCanvas = new AvatarCanvas(geometryElement, scale);

                canvasMap.set(avatarCanvas.id, avatarCanvas);
            }

            this._canvases.set(scale, canvasMap);
        }

        for(const typeElement of getXmlChildElements(root, 'type'))
        {
            const bodyPartMap = new Map<string, GeometryBodyPart>();
            const itemMap = new Map<string, GeometryBodyPart>();

            for(const bodyPartElement of getXmlChildElements(typeElement, 'bodypart'))
            {
                const bodyPart = new GeometryBodyPart(bodyPartElement);
                const bodyPartId = getXmlAttribute(bodyPartElement, 'id');

                bodyPartMap.set(bodyPartId, bodyPart);

                for(const partId of bodyPart.getPartIds(null))
                {
                    itemMap.set(partId, bodyPart);
                }
            }

            const typeId = getXmlAttribute(typeElement, 'id');
            this._bodyParts.set(typeId, bodyPartMap);
            this._itemToBodyPart.set(typeId, itemMap);
        }
    }

    private parseObject(data: any): void
    {
        const avatarSetData = data.avatarSets?.[0] ?? data.avatarset ?? {};
        this._avatarSet = new AvatarSet(avatarSetData);

        if(data.camera)
        {
            this._camera.x = parseFloat(data.camera.x) || 0;
            this._camera.y = parseFloat(data.camera.y) || 0;
            this._camera.z = parseFloat(data.camera.z) || 10;
        }

        if(data.canvases)
        {
            for(const canvasGroup of data.canvases)
            {
                const scale = String(canvasGroup.scale);
                const canvasMap = new Map<string, AvatarCanvas>();

                if(canvasGroup.geometries)
                {
                    for(const geom of canvasGroup.geometries)
                    {
                        const avatarCanvas = new AvatarCanvas(geom, scale);

                        canvasMap.set(avatarCanvas.id, avatarCanvas);
                    }
                }

                this._canvases.set(scale, canvasMap);
            }
        }

        if(data.types)
        {
            for(const typeData of data.types)
            {
                const bodyPartMap = new Map<string, GeometryBodyPart>();
                const itemMap = new Map<string, GeometryBodyPart>();
                const bodyParts = typeData.bodyParts || typeData.bodyparts;

                if(bodyParts)
                {
                    for(const bpData of bodyParts)
                    {
                        const bodyPart = new GeometryBodyPart(bpData);

                        bodyPartMap.set(String(bpData.id), bodyPart);

                        for(const partId of bodyPart.getPartIds(null))
                        {
                            itemMap.set(partId, bodyPart);
                        }
                    }
                }

                this._bodyParts.set(String(typeData.id), bodyPartMap);
                this._itemToBodyPart.set(String(typeData.id), itemMap);
            }
        }
    }
}