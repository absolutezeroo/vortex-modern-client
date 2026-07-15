import type {SkinLayoutEntity} from './SkinLayoutEntity';

/**
 * Collection of layout entities defining the skin layout.
 *
 * Calculates the base width and height from its entities, which are used
 * by the renderer to compute the delta between target size and layout size.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/core/window/graphics/renderer/SkinLayout.as
 */
export class SkinLayout 
{
    constructor(name: string, transparent: boolean, blendMode: string) 
    {
        this._name = name;
        this._transparent = transparent;
        this._blendMode = blendMode;
    }

    private _name: string;

    public get name(): string 
    {
        return this._name;
    }

    private _transparent: boolean;

    public get transparent(): boolean 
    {
        return this._transparent;
    }

    private _blendMode: string;

    public get blendMode(): string 
    {
        return this._blendMode;
    }

    private _entities: SkinLayoutEntity[] = [];

    public get entities(): readonly SkinLayoutEntity[] 
    {
        return this._entities;
    }

    private _width: number = 0;

    public get width(): number 
    {
        return this._width;
    }

    private _height: number = 0;

    public get height(): number 
    {
        return this._height;
    }

    public get numEntities(): number 
    {
        return this._entities.length;
    }

    /**
     * Adds a layout entity and recalculates dimensions.
     *
     * @param entity - The entity to add
     */
    public addEntity(entity: SkinLayoutEntity): void 
    {
        this._entities.push(entity);

        const right = entity.region.x + entity.region.width;
        const bottom = entity.region.y + entity.region.height;

        if(right > this._width) this._width = right;
        if(bottom > this._height) this._height = bottom;
    }

    /**
     * Returns the entity at the given index.
     *
     * @param index - The entity index
     * @returns The layout entity
     */
    public getEntityAt(index: number): SkinLayoutEntity 
    {
        return this._entities[index];
    }

    /**
     * Returns the entity with the given name.
     *
     * @param name - The entity name
     * @returns The layout entity, or null
     */
    public getEntityByName(name: string): SkinLayoutEntity | null 
    {
        for(const entity of this._entities) 
        {
            if(entity.name === name) return entity;
        }

        return null;
    }
}
