import {BitmapSkinRenderer} from './BitmapSkinRenderer';
import {SkinLayout} from './SkinLayout';
import {SkinLayoutEntity} from './SkinLayoutEntity';
import {SkinTemplate} from './SkinTemplate';
import {SkinTemplateEntity} from './SkinTemplateEntity';

/**
 * JSON data interfaces for skin descriptions.
 *
 * These match the pre-converted JSON files in the client assets
 * (originally AS3 XML BitmapSkinParser worked with XML nodes).
 */
export interface ISkinRegionData
{
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ISkinTemplateEntityData
{
    id: number;
    name: string;
    type: string;
    region: ISkinRegionData;
}

export interface ISkinTemplateData
{
    name: string;
    asset: string;
    entities: ISkinTemplateEntityData[];
}

export interface ISkinLayoutEntityData
{
    id: number;
    name: string;
    colorize: boolean;
    color: number;
    blend: number;
    scaleH: number;
    scaleV: number;
    region: ISkinRegionData;
}

export interface ISkinLayoutData
{
    name: string;
    transparent: boolean;
    blendMode: string;
    entities: ISkinLayoutEntityData[];
}

export interface ISkinStateData
{
    name: string;
    layout: string;
    template: string;
}

export interface ISkinData
{
    id: string;
    name: string;
    source: string;
    variables: Record<string, string>;
    templates: ISkinTemplateData[];
    layouts: ISkinLayoutData[];
    states: ISkinStateData[];
}

/**
 * Parses skin JSON descriptions into BitmapSkinRenderer instances.
 *
 * Port of AS3 BitmapSkinParser.parseSkinDescription(). The AS3 version
 * works with XML nodes and an IAssetLibrary; our version works with
 * pre-converted JSON data and an atlas map (asset name → ImageBitmap).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/BitmapSkinParser.as
 */
export class BitmapSkinParser
{
    /** State name → state flag mapping (AS3 BitmapSkinParser.parseState switch). */
    private static readonly STATE_FLAGS: Record<string, number> =
        {
            'default': 0,
            'active': 1,
            'focused': 2,
            'hovering': 4,
            'selected': 8,
            'pressed': 16,
            'disabled': 32,
            'locked': 64
        };

    /**
	 * Parses a skin JSON into a fully configured BitmapSkinRenderer.
	 *
	 * Algorithm (port of AS3 BitmapSkinParser.parseSkinDescription):
	 * 1. Parse variables (for variable substitution)
	 * 2. Parse templates → SkinTemplate + SkinTemplateEntity
	 * 3. Parse layouts → SkinLayout + SkinLayoutEntity (filtered by layoutFilter)
	 * 4. Parse states → map state name → flag, register layout/template per state (filtered by layoutFilter)
	 *
	 * When layoutFilter is provided (non-empty), only the matching layout and
	 * states referencing that layout are parsed. This matches the AS3 pattern
	 * where each element descriptor gets its own renderer filtered to its
	 * specific layout. Without filtering, skins with multiple component types
	 * (e.g. scrollbar) would overwrite each other's state→layout mappings.
	 *
	 * @param skinData - The skin JSON data
	 * @param atlases - Map of asset name → ImageBitmap
	 * @param layoutFilter - Optional layout name to filter by (from element descriptor)
	 * @returns The configured BitmapSkinRenderer
	 */
    public static parse(skinData: ISkinData, atlases: Map<string, ImageBitmap>, layoutFilter?: string): BitmapSkinRenderer
    {
        const renderer = new BitmapSkinRenderer(skinData.name);
        const variables = skinData.variables ?? {};
        const filter = layoutFilter && layoutFilter.length > 0 ? layoutFilter : null;

        // Parse templates (always parse all — templates are referenced by name)
        if(skinData.templates)
        {
            BitmapSkinParser.parseTemplateList(renderer, skinData.templates, variables, atlases);
        }

        // Parse layouts (filtered when layoutFilter is provided)
        if(skinData.layouts)
        {
            if(filter)
            {
                // AS3: only parse the single layout matching the filter
                for(const layoutData of skinData.layouts)
                {
                    const name = BitmapSkinParser.resolveVariable(layoutData.name, variables);

                    if(name === filter)
                    {
                        const transparent = layoutData.transparent ?? false;
                        const blendMode = layoutData.blendMode ?? '';
                        const layout = new SkinLayout(name, transparent, blendMode);

                        if(layoutData.entities)
                        {
                            for(const entityData of layoutData.entities)
                            {
                                const entity = BitmapSkinParser.parseLayoutEntity(entityData, variables);

                                layout.addEntity(entity);
                            }
                        }

                        renderer.addLayout(layout);

                        break;
                    }
                }
            }
            else
            {
                BitmapSkinParser.parseLayoutList(renderer, skinData.layouts, variables);
            }
        }

        // Parse states (filtered when layoutFilter is provided)
        if(skinData.states)
        {
            if(filter)
            {
                // AS3: only parse states whose layout attribute matches the filter
                for(const stateData of skinData.states)
                {
                    const stateLayout = BitmapSkinParser.resolveVariable(stateData.layout, variables);

                    if(stateLayout === filter)
                    {
                        BitmapSkinParser.parseState(renderer, stateData, variables);
                    }
                }
            }
            else
            {
                BitmapSkinParser.parseStateList(renderer, skinData.states, variables);
            }
        }

        return renderer;
    }

    /**
	 * Parses the template list from skin data.
	 *
	 * @param renderer - The target renderer
	 * @param templates - The template data array
	 * @param variables - Variable substitution map
	 * @param atlases - Map of asset name → ImageBitmap
	 */
    private static parseTemplateList(
        renderer: BitmapSkinRenderer,
        templates: ISkinTemplateData[],
        variables: Record<string, string>,
        atlases: Map<string, ImageBitmap>
    ): void
    {
        for(const templateData of templates)
        {
            const name = BitmapSkinParser.resolveVariable(templateData.name, variables);
            const assetName = BitmapSkinParser.resolveVariable(templateData.asset, variables);
            const atlas = atlases.get(assetName) ?? null;

            const template = new SkinTemplate(name, atlas);

            if(templateData.entities)
            {
                for(const entityData of templateData.entities)
                {
                    const entity = BitmapSkinParser.parseTemplateEntity(entityData, variables);

                    template.addEntity(entity);
                }
            }

            renderer.addTemplate(template);
        }
    }

    /**
	 * Parses a single template entity.
	 *
	 * @param data - The entity data
	 * @param variables - Variable substitution map
	 * @returns The parsed SkinTemplateEntity
	 */
    private static parseTemplateEntity(data: ISkinTemplateEntityData, variables: Record<string, string>): SkinTemplateEntity
    {
        const name = BitmapSkinParser.resolveVariable(data.name, variables);
        const type = BitmapSkinParser.resolveVariable(data.type, variables);
        const id = BitmapSkinParser.resolveNumberVariable(data.id, variables);

        return new SkinTemplateEntity(id, name, type, {
            x: BitmapSkinParser.resolveNumberVariable(data.region.x, variables),
            y: BitmapSkinParser.resolveNumberVariable(data.region.y, variables),
            width: BitmapSkinParser.resolveNumberVariable(data.region.width, variables),
            height: BitmapSkinParser.resolveNumberVariable(data.region.height, variables)
        });
    }

    /**
	 * Parses the layout list from skin data.
	 *
	 * @param renderer - The target renderer
	 * @param layouts - The layout data array
	 * @param variables - Variable substitution map
	 */
    private static parseLayoutList(
        renderer: BitmapSkinRenderer,
        layouts: ISkinLayoutData[],
        variables: Record<string, string>
    ): void
    {
        for(const layoutData of layouts)
        {
            const name = BitmapSkinParser.resolveVariable(layoutData.name, variables);
            const transparent = layoutData.transparent ?? false;
            const blendMode = layoutData.blendMode ?? '';

            const layout = new SkinLayout(name, transparent, blendMode);

            if(layoutData.entities)
            {
                for(const entityData of layoutData.entities)
                {
                    const entity = BitmapSkinParser.parseLayoutEntity(entityData, variables);

                    layout.addEntity(entity);
                }
            }

            renderer.addLayout(layout);
        }
    }

    /**
	 * Parses a single layout entity.
	 *
	 * Handles variable substitution for all fields, matching AS3's
	 * "$variableName" → variables["variableName"] pattern.
	 *
	 * @param data - The entity data
	 * @param variables - Variable substitution map
	 * @returns The parsed SkinLayoutEntity
	 */
    private static parseLayoutEntity(data: ISkinLayoutEntityData, variables: Record<string, string>): SkinLayoutEntity
    {
        const id = BitmapSkinParser.resolveNumberVariable(data.id, variables);
        const name = BitmapSkinParser.resolveVariable(data.name, variables);
        const colorize = data.colorize ?? true;
        const color = BitmapSkinParser.resolveNumberVariable(data.color ?? 0, variables);
        const blend = BitmapSkinParser.resolveNumberVariable(data.blend ?? 0xFFFFFFFF, variables);
        const scaleH = BitmapSkinParser.resolveNumberVariable(data.scaleH ?? 0, variables);
        const scaleV = BitmapSkinParser.resolveNumberVariable(data.scaleV ?? 0, variables);

        return new SkinLayoutEntity(id, name, colorize, color, blend, scaleH, scaleV, {
            x: BitmapSkinParser.resolveNumberVariable(data.region.x, variables),
            y: BitmapSkinParser.resolveNumberVariable(data.region.y, variables),
            width: BitmapSkinParser.resolveNumberVariable(data.region.width, variables),
            height: BitmapSkinParser.resolveNumberVariable(data.region.height, variables)
        });
    }

    /**
	 * Parses the state list, mapping state names to flags and registering
	 * layout/template associations per state on the renderer.
	 *
	 * @param renderer - The target renderer
	 * @param states - The state data array
	 * @param variables - Variable substitution map
	 */
    private static parseStateList(
        renderer: BitmapSkinRenderer,
        states: ISkinStateData[],
        variables: Record<string, string>
    ): void
    {
        for(const stateData of states)
        {
            BitmapSkinParser.parseState(renderer, stateData, variables);
        }
    }

    /**
	 * Parses a single state, resolving the state name to a flag
	 * and registering layout + template for that state on the renderer.
	 *
	 * Port of AS3 BitmapSkinParser.parseState() switch statement.
	 *
	 * @param renderer - The target renderer
	 * @param data - The state data
	 * @param variables - Variable substitution map
	 */
    private static parseState(
        renderer: BitmapSkinRenderer,
        data: ISkinStateData,
        variables: Record<string, string>
    ): void
    {
        const stateName = BitmapSkinParser.resolveVariable(data.name, variables);
        const layoutName = BitmapSkinParser.resolveVariable(data.layout, variables);
        const templateName = BitmapSkinParser.resolveVariable(data.template, variables);

        const stateFlag = BitmapSkinParser.STATE_FLAGS[stateName];

        if(stateFlag === undefined)
        {
            console.warn(`[BitmapSkinParser] Unknown window state: "${stateName}"`);

            return;
        }

        renderer.setLayoutForState(stateFlag, layoutName);
        renderer.setTemplateForState(stateFlag, templateName);
    }

    /**
	 * Resolves a string value through the variable map.
	 *
	 * In AS3, values starting with "$" are looked up in the variables map
	 * with the "$" prefix stripped. Our JSON data is pre-resolved so this
	 * handles both formats.
	 *
	 * @param value - The string value (possibly a "$variable" reference)
	 * @param variables - Variable substitution map
	 * @returns The resolved string
	 */
    private static resolveVariable(value: string | undefined | null, variables: Record<string, string>): string
    {
        if(value == null) return '';

        const str = String(value);

        if(str.charAt(0) === '$')
        {
            const key = str.slice(1);

            return variables[key] ?? str;
        }

        return str;
    }

    /**
	 * Resolves a numeric value through the variable map.
	 *
	 * @param value - The numeric value (possibly a "$variable" reference)
	 * @param variables - Variable substitution map
	 * @returns The resolved number
	 */
    private static resolveNumberVariable(value: number | string | undefined | null, variables: Record<string, string>): number
    {
        if(value == null) return 0;

        if(typeof value === 'string')
        {
            if(value.charAt(0) === '$')
            {
                const key = value.slice(1);
                const resolved = variables[key];

                return resolved != null ? Number(resolved) : 0;
            }

            return Number(value) || 0;
        }

        return value;
    }
}
