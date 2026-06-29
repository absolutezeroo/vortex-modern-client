import type {IAvatarImage} from '../IAvatarImage';
import {GeometryItem} from './GeometryItem';
import type {Matrix4x4} from './Matrix4x4';
import {Node3D} from './Node3D';
import type {Vector3D} from './Vector3D';

/**
 * A geometry body part containing multiple geometry items, used for depth sorting.
 *
 * @see sources/win63_version/habbo/avatar/geometry/GeometryBodyPart.as
 */
export class GeometryBodyPart extends Node3D
{
	private _items: Map<string, GeometryItem>;
	private _dynamicItems: Map<IAvatarImage, Map<string, GeometryItem>>;

	constructor(data: any)
	{
		super(
			parseFloat(data.x) || 0,
			parseFloat(data.y) || 0,
			parseFloat(data.z) || 0
		);

		this._radius = parseFloat(data.radius) || 0;
		this._id = String(data.id);
		this._items = new Map();
		this._dynamicItems = new Map();

		if (data.items)
		{
			for (const itemData of data.items)
			{
				const item = new GeometryItem(itemData);

				this._items.set(String(itemData.id), item);
			}
		}
	}

	private _id: string;

	public get id(): string
	{
		return this._id;
	}

	private _radius: number;

	public get radius(): number
	{
		return this._radius;
	}

	public getDynamicParts(avatar: IAvatarImage): GeometryItem[]
	{
		const result: GeometryItem[] = [];
		const dynamicMap = this._dynamicItems.get(avatar);

		if (dynamicMap)
		{
			for (const item of dynamicMap.values())
			{
				if (item) result.push(item);
			}
		}

		return result;
	}

	public getPartIds(avatar: IAvatarImage | null): string[]
	{
		const ids: string[] = [];

		for (const item of this._items.values())
		{
			if (item) ids.push(item.id);
		}

		if (avatar)
		{
			const dynamicMap = this._dynamicItems.get(avatar);

			if (dynamicMap)
			{
				for (const item of dynamicMap.values())
				{
					if (item) ids.push(item.id);
				}
			}
		}

		return ids;
	}

	public removeDynamicParts(avatar: IAvatarImage): boolean
	{
		this._dynamicItems.delete(avatar);

		return true;
	}

	public addPart(data: any, avatar: IAvatarImage): boolean
	{
		const id = String(data.id);

		if (this.hasPart(id, avatar)) return false;

		if (!this._dynamicItems.has(avatar))
		{
			this._dynamicItems.set(avatar, new Map());
		}

		this._dynamicItems.get(avatar)!.set(id, new GeometryItem(data, true));

		return true;
	}

	public hasPart(id: string, avatar: IAvatarImage): boolean
	{
		let item: GeometryItem | null = this._items.get(id) ?? null;

		if (!item)
		{
			const dynamicMap = this._dynamicItems.get(avatar);

			if (dynamicMap) item = dynamicMap.get(id) ?? null;
		}

		return item !== null;
	}

	public getParts(matrix: Matrix4x4, camera: Vector3D, _param: any[], avatar: IAvatarImage): string[]
	{
		const distances: [number, GeometryItem][] = [];

		for (const item of this._items.values())
		{
			if (item)
			{
				item.applyTransform(matrix);

				const dist = item.getDistance(camera);

				distances.push([dist, item]);
			}
		}

		const dynamicMap = this._dynamicItems.get(avatar);

		if (dynamicMap)
		{
			for (const item of dynamicMap.values())
			{
				if (item)
				{
					item.applyTransform(matrix);

					const dist = item.getDistance(camera);

					distances.push([dist, item]);
				}
			}
		}

		distances.sort((a, b) => a[0] - b[0]);

		return distances.map(entry => entry[1].id);
	}

	public getDistance(camera: Vector3D): number
	{
		const near = Math.abs(camera.z - this.transformedLocation.z - this._radius);
		const far = Math.abs(camera.z - this.transformedLocation.z + this._radius);

		return Math.min(near, far);
	}
}
