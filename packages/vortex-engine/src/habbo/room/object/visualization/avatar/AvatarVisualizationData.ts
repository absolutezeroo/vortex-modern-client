/**
 * AvatarVisualizationData
 *
 * Stores shared visualization data for avatar rendering, including
 * a reference to the avatar render manager. Implements
 * IRoomObjectVisualizationData for integration with the room object system.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/AvatarVisualizationData.as
 */
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarEffectListener} from '@habbo/avatar/IAvatarEffectListener';
import {AvatarScaleType} from '@habbo/avatar/enum/AvatarScaleType';

export class AvatarVisualizationData implements IRoomObjectVisualizationData 
{
    private _avatarRenderer: IAvatarRenderManager | null = null;
    private _disposed: boolean = false;

    public get disposed(): boolean 
    {
        return this._disposed;
    }

    get avatarRenderManager(): IAvatarRenderManager | null 
    {
        return this._avatarRenderer;
    }

    set avatarRenderManager(value: IAvatarRenderManager | null) 
    {
        this._avatarRenderer = value;
    }

    /**
     * Initializes the visualization data. For avatar visualization,
     * no XML data processing is needed.
     *
     * @param data - The initialization data (unused for avatars)
     * @returns Always true
     */
    initialize(_data: unknown): boolean
    {
        return true;
    }

    /**
     * Creates an avatar image at the appropriate scale for rendering.
     *
     * @param figure - The avatar figure string
     * @param scale - The rendering scale
     * @param gender - The avatar gender
     * @param listener - Optional image load listener
     * @param effectListener - Optional effect load listener
     * @returns The created avatar image, or null if the renderer is unavailable
     */
    createAvatarImage(
        figure: string,
        scale: number,
        gender: string | null = null,
        listener: IAvatarImageListener | null = null,
        effectListener: IAvatarEffectListener | null = null
    ): IAvatarImage | null 
    {
        if(this._avatarRenderer != null) 
        {
            let avatarImage: IAvatarImage | null;

            if(scale > 48) 
            {
                avatarImage = this._avatarRenderer.createAvatarImage(
                    figure, AvatarScaleType.LARGE, gender ?? '', listener, effectListener
                );
            }
            else 
            {
                avatarImage = this._avatarRenderer.createAvatarImage(
                    figure, AvatarScaleType.SMALL, gender ?? '', listener, effectListener
                );
            }

            return avatarImage;
        }

        return null;
    }

    /**
     * Gets the layer count for the given scale. Always returns 0 for avatars
     * since layers are managed by the avatar image.
     *
     * @param scale - The scale identifier
     * @returns Always 0
     */
    getLayerCount(_scale: string): number
    {
        return 0;
    }

    /**
     * Disposes of this visualization data and releases references.
     */
    dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;
        this._avatarRenderer = null;
    }
}
