import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * Static utility class for inventory window layout operations.
 *
 * @see sources/win63_version/habbo/inventory/Util.as
 */
export class Util
{
	// AS3: sources/win63_version/habbo/inventory/Util.as::disableButton()
	static disableButton(window: IWindow, disabled: boolean): void
	{
		if (disabled)
		{
			window.disable();
		}
		else
		{
			window.enable();
		}
	}

	// AS3: sources/win63_version/habbo/inventory/Util.as::disableSection()
	// AS3 excludes a specific button-like window type (class_1775, unresolved
	// in this port) from the recurse/blend branch entirely; this duck-types on
	// "is a container" instead, which is equivalent for every window kind this
	// project currently has.
	static disableSection(window: IWindow, disabled: boolean = true): void
	{
		if (window.tags.indexOf('DO_NOT_DISABLE') === -1)
		{
			const blend = disabled ? 0.5 : 1;
			const container = window as unknown as IWindowContainer;

			if (typeof container.numChildren === 'number' && typeof container.getChildAt === 'function')
			{
				for (let i = 0; i < container.numChildren; i++)
				{
					const child = container.getChildAt(i);

					if (child)
					{
						Util.disableSection(child, disabled);
					}
				}
			}
			else
			{
				window.blend = blend;
			}
		}

		if (disabled)
		{
			window.disable();
		}
		else
		{
			window.enable();
		}
	}

	// AS3: sources/win63_version/habbo/inventory/Util.as::moveAllChildrenToColumn()
	static moveAllChildrenToColumn(
		container: IWindowContainer,
		gap: number,
		useMaxStart: boolean = false,
		startY: number = 0
	): void
	{
		let y = startY;

		for (let i = 0; i < container.numChildren; i++)
		{
			const child = container.getChildAt(i);

			if (child !== null && child.visible && child.height > 0)
			{
				if (y < child.y && useMaxStart)
				{
					y = child.y;
				}
				else
				{
					child.y = y;
				}

				y += child.height + gap;
			}
		}
	}

	// AS3: sources/win63_version/habbo/inventory/Util.as::getLowestPoint()
	static getLowestPoint(container: IWindowContainer): number
	{
		let lowest = 0;

		for (let i = 0; i < container.numChildren; i++)
		{
			const child = container.getChildAt(i);

			if (child !== null && child.visible && child.height > 0)
			{
				lowest = Math.max(lowest, child.y + child.height);
			}
		}

		return lowest;
	}
}
