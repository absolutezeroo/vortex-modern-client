import type {SkinLayoutEntity} from './SkinLayoutEntity';

/**
 * Collection of layout entities defining the skin layout.
 *
 * Calculates the base width and height from its entities, which are used
 * by the renderer to compute the delta between target size and layout size.
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/graphics/renderer/SkinLayout.as
 */
export class SkinLayout 
{
    constructor(name: string, transparent: boolean, blendMode: string) 
    {
        this._name = name;
        this._transparent = transparent;
        this._blendMode = blendMode;
    }

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::_name
    private _name: string;

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::get name()
    public get name(): string 
    {
        return this._name;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::_transparent
    private _transparent: boolean;

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::get transparent()
    public get transparent(): boolean 
    {
        return this._transparent;
    }

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::_blendMode
    private _blendMode: string;

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::get blendMode()
    public get blendMode(): string 
    {
        return this._blendMode;
    }

    private _entities: SkinLayoutEntity[] = [];

    public get entities(): readonly SkinLayoutEntity[] 
    {
        return this._entities;
    }

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::_width
    private _width: number = 0;

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::get width()
    public get width(): number 
    {
        return this._width;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::_height
    private _height: number = 0;

    // AS3: .../src/com/sulake/core/window/graphics/renderer/SkinLayout.as::get height()
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

    /**
     * Whether no entity stretches horizontally, so the layout cannot be
     * widened.
     *
     * An empty layout is *not* fixed — AS3 returns false before the loop, and
     * the distinction matters: an empty layout is unconstrained, not rigid.
     *
     * @returns `true` when every entity has `scaleH === 0`
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::isFixedWidth()
    public isFixedWidth(): boolean
    {
        if(this._entities.length === 0)
        {
            return false;
        }

        for(const entity of this._entities)
        {
            if(entity.scaleH !== 0)
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Whether no entity stretches vertically, so the layout cannot be
     * heightened.
     *
     * @returns `true` when every entity has `scaleV === 0`
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::isFixedHeight()
    public isFixedHeight(): boolean
    {
        if(this._entities.length === 0)
        {
            return false;
        }

        for(const entity of this._entities)
        {
            if(entity.scaleV !== 0)
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Recomputes the layout width as the rightmost entity edge.
     *
     * @returns The widest right edge across every entity
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::calculateWidth()
    public calculateWidth(): number
    {
        let width = 0;

        for(const entity of this._entities)
        {
            const right = entity.region.x + entity.region.width;

            if(right > width) width = right;
        }

        return width;
    }

    /**
     * Recomputes the layout height as the lowest entity edge.
     *
     * @returns The lowest bottom edge across every entity
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::calculateHeight()
    public calculateHeight(): number
    {
        let height = 0;

        for(const entity of this._entities)
        {
            const bottom = entity.region.y + entity.region.height;

            if(bottom > height) height = bottom;
        }

        return height;
    }

    /**
     * Copies a named entity's region into `out`.
     *
     * @param name - The entity name
     * @param out - Rectangle to fill with the entity's region
     * @throws When no entity carries that name — as AS3 does, rather than
     *   leaving the caller with an unwritten rectangle it would read as (0,0).
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/renderer/SkinLayout.as::getDefaultRegion()
    public getDefaultRegion(name: string, out: { x: number; y: number; width: number; height: number }): void
    {
        const entity = this.getEntityByName(name);

        if(entity === null)
        {
            throw new Error(`Entity not found: ${name}!`);
        }

        out.x = entity.region.x;
        out.y = entity.region.y;
        out.width = entity.region.width;
        out.height = entity.region.height;
    }
}
