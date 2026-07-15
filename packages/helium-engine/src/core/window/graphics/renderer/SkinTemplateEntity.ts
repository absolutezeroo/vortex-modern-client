/**
 * Template entity for skin rendering.
 *
 * Defines the source region within the spritesheet atlas for a single
 * bitmap piece. The type is typically "bitmap" for image regions.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/core/window/graphics/renderer/SkinTemplateEntity.as
 */
export class SkinTemplateEntity 
{
    public readonly id: number;
    public readonly name: string;
    public readonly type: string;
    public readonly region: { x: number; y: number; width: number; height: number };

    constructor(
        id: number,
        name: string,
        type: string,
        region: { x: number; y: number; width: number; height: number }
    ) 
    {
        this.id = id;
        this.name = name;
        this.type = type;
        this.region = {...region};
    }
}
