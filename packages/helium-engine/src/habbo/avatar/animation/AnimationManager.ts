import type {ActionDefinitionResolver} from './Animation';
import {Animation} from './Animation';
import type {AnimationLayerData} from './AnimationLayerData';
import type {IAnimation} from './IAnimation';

/**
 * Manages all registered avatar animations.
 *
 * @see sources/win63_version/habbo/avatar/animation/AnimationManager.as
 */
export class AnimationManager
{
	constructor()
	{
		this._animations = new Map();
	}

	private _animations: Map<string, Animation>;

	public get animations(): Map<string, Animation>
	{
		return this._animations;
	}

	public registerAnimation(actionResolver: ActionDefinitionResolver, data: any): boolean
	{
		const name = String(data.name || '');

		this._animations.set(name, new Animation(actionResolver, data));

		return true;
	}

	public getAnimation(name: string): IAnimation | null
	{
		return this._animations.get(name) || null;
	}

	public getLayerData(animationName: string, frameIndex: number, partId: string): AnimationLayerData | null
	{
		const animation = this._animations.get(animationName);

		if (animation)
		{
			return animation.getLayerData(frameIndex, partId);
		}

		return null;
	}
}
