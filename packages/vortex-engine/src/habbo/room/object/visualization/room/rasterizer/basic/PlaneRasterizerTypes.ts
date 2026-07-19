/**
 * Type definitions for plane rasterizer data.
 *
 * Based on Nitro asset interfaces from source_nitro_renderer/api/asset/room-visualization/
 * These define the JSON structure from .nitro bundle roomVisualization data.
 */

export interface IAssetRoomVisualizationData
{
    floorData?: IAssetPlaneVisualizationData;
    wallData?: IAssetPlaneVisualizationData;
    landscapeData?: IAssetPlaneVisualizationData;
    maskData?: unknown;
}

export interface IAssetPlaneVisualizationData
{
    planes?: IAssetPlane[];
    materials?: IAssetPlaneMaterial[];
    textures?: IAssetPlaneTexture[];
}

export interface IAssetPlane
{
    id?: string;
    visualizations?: IAssetPlaneVisualization[];
}

export interface IAssetPlaneVisualization
{
    size?: number;
    horizontalAngle?: number;
    verticalAngle?: number;
    allLayers?: IAssetPlaneVisualizationLayer[];
}

export interface IAssetPlaneVisualizationLayer
{
    materialId?: string;
    color?: number;
    offset?: number;
    align?: string;

    /** Layer type: 'visualization' (default) or 'animation' (for landscape animation layers) */
    type?: string;

    /** Animation items for animation layers */
    items?: IAssetPlaneAnimationItem[];
}

export interface IAssetPlaneAnimationItem
{
    id?: number;
    assetId?: string;
    x?: string;
    y?: string;
    speedX?: number;
    speedY?: number;
    randomX?: string;
    randomY?: string;
}

export interface IAssetPlaneMaterial
{
    id?: string;
    matrices?: IAssetPlaneMaterialCellMatrix[];
}

export interface IAssetPlaneMaterialCellMatrix
{
    repeatMode?: string;
    align?: string;
    normalMinX?: number;
    normalMaxX?: number;
    normalMinY?: number;
    normalMaxY?: number;
    columns?: IAssetPlaneMaterialCellColumn[];
}

export interface IAssetPlaneMaterialCellColumn
{
    repeatMode?: string;
    width?: number;
    cells?: IAssetPlaneMaterialCell[];
}

export interface IAssetPlaneMaterialCell
{
    textureId?: string;
    extraData?: IAssetPlaneMaterialCellExtraItemData;
}

export interface IAssetPlaneMaterialCellExtraItemData
{
    limitMax?: number;
    extraItemTypes?: string[];
    offsets?: [number, number][];
}

export interface IAssetPlaneTexture
{
    id?: string;
    bitmaps?: IAssetPlaneTextureBitmap[];
}

export interface IAssetPlaneTextureBitmap
{
    assetName?: string;
    normalMinX?: number;
    normalMaxX?: number;
    normalMinY?: number;
    normalMaxY?: number;
}
