/**
 * A frame rectangle inside one of the habbicon spritesheets.
 *
 * AS3 carries these as untyped `Object` literals with exactly these four keys; typing them is the
 * only liberty taken.
 */
// TS-only: AS3 uses an anonymous object literal here, which TypeScript cannot express as a type.
export interface IHabbiconFrameRect
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    x: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    y: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    width: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    height: number;
}

// TS-only: as above — the frame definitions AS3 builds in buildRuntimeFrameDefinitions().
export interface IHabbiconFrameDefinition extends IHabbiconFrameRect
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    id: number;
}

// TS-only: as above — one step of the animation timeline.
export interface IHabbiconAnimationStep
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    sourceFrame: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    durationMs: number;
}

// TS-only: as above — one decoded frame, ready to draw.
export interface IHabbiconRuntimeFrame
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    bitmap: ImageBitmap;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    smallBitmap: ImageBitmap;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    width: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    height: number;
}

/**
 * What `getRuntimeAsset()` hands back: everything needed to play a habbicon, or a single-frame
 * stand-in built from the preview when it is not animated (or its sheet has not arrived).
 */
// TS-only: as above — AS3's runtime-asset object literal.
export interface IHabbiconRuntimeAsset
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    animated: boolean;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    loop: boolean;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    direction: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    baseWidth: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    baseHeight: number;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    frames: IHabbiconRuntimeFrame[];
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    steps: IHabbiconAnimationStep[];
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    playbackDurationMs: number;
}

/**
 * One habbicon's metadata, as `habbicons.json` describes it.
 *
 * `animated` is not read from the file — `buildDefinition()` computes it, and requires all three of
 * a frame count above 1, at least one frame rect, and at least one animation step. A habbicon
 * missing any of them plays as a still.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/habbicons/assets/HabbiconDefinition.as
 */
export class HabbiconDefinition
{
    // AS3: HabbiconDefinition.as::previewWidth
    previewWidth: number;

    // AS3: HabbiconDefinition.as::previewHeight
    previewHeight: number;

    // AS3: HabbiconDefinition.as::direction
    direction: number;

    // AS3: HabbiconDefinition.as::animated
    animated: boolean;

    // AS3: HabbiconDefinition.as::loop
    loop: boolean;

    // AS3: HabbiconDefinition.as::frames
    frames: IHabbiconFrameDefinition[];

    // AS3: HabbiconDefinition.as::steps
    steps: IHabbiconAnimationStep[];

    // AS3: HabbiconDefinition.as::HabbiconDefinition()
    constructor(
        previewWidth: number,
        previewHeight: number,
        direction: number,
        animated: boolean,
        loop: boolean,
        frames: IHabbiconFrameDefinition[],
        steps: IHabbiconAnimationStep[]
    )
    {
        this.previewWidth = previewWidth;
        this.previewHeight = previewHeight;
        this.direction = direction;
        this.animated = animated;
        this.loop = loop;
        this.frames = frames;
        this.steps = steps;
    }
}
