/**
 * Stands in for the engine's `Vortex` singleton.
 *
 * Three files on the room-rendering path import it — `RoomObjectSpriteVisualization`,
 * `FurnitureExternalImageVisualization` and `RoomEngine` — and every one of them reaches for
 * the same thing: `Vortex.instance.application.renderer.extract`, the synchronous PixiJS
 * texture-to-canvas readback. There is no renderer in Node, and the imager never takes those
 * paths: it reads `visualization.getSprite(i)` and composites the frames itself
 * (`render/composeSprites.ts`).
 *
 * The stub exists so the bundle does not pull `Vortex.ts` in, because that module imports
 * `VortexMain`, and `VortexMain` imports the entire client bootstrap — window manager,
 * communication manager, toolbar, catalog. `tools/build.mjs` aliases the module to this file
 * instead.
 *
 * `extract` throws rather than returning null. Every caller of it is a code path this service
 * is not supposed to reach, and a null would come back as a blank image with nothing logged —
 * the failure mode this project keeps paying for. A thrown error names the method.
 */
const unavailable = (method: string): never =>
{
    throw new Error(
        `${method} needs a live PixiJS renderer, which vortex-imager does not have.`
        + ' Composite through render/composeSprites.ts instead.'
    );
};

export const Vortex = {
    get instance()
    {
        return {
            application: {
                renderer: {
                    extract: {
                        canvas: (): never => unavailable('renderer.extract.canvas()'),
                        pixels: (): never => unavailable('renderer.extract.pixels()')
                    }
                },
                // Read by visualizations that schedule their own animation. Nothing does on the
                // one-frame-per-request path, but an undefined here would be a property access
                // away from a crash.
                ticker: {add: (): void => {}, remove: (): void => {}}
            }
        };
    }
};
