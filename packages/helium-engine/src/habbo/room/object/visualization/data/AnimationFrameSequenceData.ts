/**
 * AnimationFrameSequenceData
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationFrameSequenceData
 *
 * Sequence of animation frames with loop count and random support.
 * Consolidates identical consecutive frames.
 */
import {AnimationFrameData} from './AnimationFrameData';
import {AnimationFrameDirectionalData} from './AnimationFrameDirectionalData';
import type {DirectionalOffsetData} from './DirectionalOffsetData';

export class AnimationFrameSequenceData
{
    private _frames: AnimationFrameData[] = [];
    private _frameIndexes: number[] = [];
    private _frameRepeats: number[] = [];
    private _loopCount: number = 1;

    constructor(loopCount: number, isRandom: boolean)
    {
        if(loopCount < 1)
        {
            loopCount = 1;
        }

        this._loopCount = loopCount;
        this._isRandom = isRandom;
    }

    private _isRandom: boolean = false;

    get isRandom(): boolean
    {
        return this._isRandom;
    }

    get frameCount(): number
    {
        return this._frameIndexes.length * this._loopCount;
    }

    dispose(): void
    {
        this._frames = [];
    }

    /**
	 * Pre-calculate frame repeat counts by looking at consecutive identical frame indexes.
	 */
    initialize(): void
    {
        let count = 1;
        let lastIndex = -1;

        for(let i = this._frameIndexes.length - 1; i >= 0; i--)
        {
            if(this._frameIndexes[i] === lastIndex)
            {
                count++;
            }
            else
            {
                lastIndex = this._frameIndexes[i];
                count = 1;
            }

            this._frameRepeats[i] = count;
        }
    }

    addFrame(id: number, x: number, y: number, randomX: number, randomY: number, directionalOffsets: DirectionalOffsetData | null): void
    {
        let repeats = 1;

        // Consolidate identical consecutive frames
        if(this._frames.length > 0)
        {
            const lastFrame = this._frames[this._frames.length - 1];

            if(
                lastFrame.id === id &&
				!lastFrame.hasDirectionalOffsets() &&
				lastFrame.x === x &&
				lastFrame.y === y &&
				lastFrame.randomX === randomX && randomX === 0 &&
				lastFrame.randomY === randomY && randomY === 0
            )
            {
                repeats += lastFrame.repeats;
                this._frames.pop();
            }
        }

        let frame: AnimationFrameData;

        if(directionalOffsets === null)
        {
            frame = new AnimationFrameData(id, x, y, randomX, randomY, repeats);
        }
        else
        {
            frame = new AnimationFrameDirectionalData(id, x, y, randomX, randomY, directionalOffsets, repeats);
        }

        this._frames.push(frame);
        this._frameIndexes.push(this._frames.length - 1);
        this._frameRepeats.push(1);
    }

    getFrame(index: number): AnimationFrameData | null
    {
        if(this._frames.length === 0 || index < 0 || index >= this.frameCount)
        {
            return null;
        }

        const frameIndex = this._frameIndexes[index % this._frameIndexes.length];

        return this._frames[frameIndex] || null;
    }

    getFrameIndex(index: number): number
    {
        if(index < 0 || index >= this.frameCount)
        {
            return -1;
        }

        if(this._isRandom)
        {
            index = Math.floor(Math.random() * this._frameIndexes.length);

            if(index === this._frameIndexes.length)
            {
                index--;
            }
        }

        return index;
    }

    getRepeats(index: number): number
    {
        if(index < 0 || index >= this.frameCount)
        {
            return 0;
        }

        return this._frameRepeats[index % this._frameRepeats.length];
    }
}
