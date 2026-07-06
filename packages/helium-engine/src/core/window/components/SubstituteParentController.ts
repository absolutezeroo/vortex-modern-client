import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {WindowController} from '../WindowController';

/**
 * Controller for substitute parent windows.
 *
 * Redirects child management to a different parent, acting as a
 * transparent proxy for window hierarchy operations. Used by the
 * context to hold orphaned windows temporarily.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/components/SubstituteParentController.as
 */
export class SubstituteParentController extends WindowController
{
    constructor(
        context: IWindowContext
    )
    {
        super(
            '_CONTEXT_SUBSTITUTE_PARENT',
            0,
            0,
            16,
            context,
            {x: 0, y: 0, width: 2000, height: 2000},
            null,
            null,
            null,
            null,
            0
        );
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/SubstituteParentController.as::SubstituteParentController()
    protected override finalize(): void
    {
        super.finalize();

        this._children = [];
        this._hasVisualContent = false;
    }

    public override addChild(child: IWindow): IWindow
    {
        this._children!.push(child);
        return child;
    }

    public override addChildAt(child: IWindow, index: number): IWindow
    {
        const controller = child as unknown as WindowController;

        if(controller.parent !== null)
        {
            (controller.parent as unknown as WindowController).removeChild(controller as unknown as IWindow);
        }

        this._children!.splice(index, 0, child);
        (controller as unknown as { parent: IWindow | null }).parent = this;

        return child;
    }

    public override getChildAt(index: number): IWindow | null
    {
        if(!this._children) return null;

        return index < this._children.length ? this._children[index] : null;
    }

    public override getChildByID(id: number): IWindow | null
    {
        if(this._children)
        {
            for(const child of this._children)
            {
                if(child.id === id)
                {
                    return child;
                }
            }
        }

        return null;
    }

    public override getChildByName(name: string): IWindow | null
    {
        if(this._children)
        {
            for(const child of this._children)
            {
                if(child.name === name)
                {
                    return child;
                }
            }
        }

        return null;
    }

    public override findChildByName(name: string): IWindow | null
    {
        if(this._children)
        {
            for(const child of this._children)
            {
                if(child.name === name)
                {
                    return child;
                }
            }

            for(const child of this._children)
            {
                const found = (child as unknown as WindowController).findChildByName?.(name) ?? null;

                if(found)
                {
                    return found;
                }
            }
        }

        return null;
    }

    public override removeChild(child: IWindow): IWindow | null
    {
        if(!this._children) return null;

        const index = this._children.indexOf(child);

        if(index > -1)
        {
            this._children.splice(index, 1);
            (child as unknown as { parent: IWindow | null }).parent = null;
            return child;
        }

        return null;
    }

    public override setChildIndex(child: IWindow, index: number): void
    {
        if(!this._children) return;

        const currentIndex = this._children.indexOf(child);

        if(currentIndex > -1 && index !== currentIndex)
        {
            this._children.splice(currentIndex, 1);
            this._children.splice(index, 0, child);
        }
    }

    public override swapChildren(a: IWindow, b: IWindow): void
    {
        if(!this._children || !a || !b || a === b) return;

        let indexA = this._children.indexOf(a);
        let indexB = this._children.indexOf(b);

        if(indexA < 0 || indexB < 0) return;

        if(indexB < indexA)
        {
            const temp = indexA;
            indexA = indexB;
            indexB = temp;
        }

        const windowA = this._children[indexA];
        const windowB = this._children[indexB];

        this._children.splice(indexB, 1);
        this._children.splice(indexA, 1);
        this._children.splice(indexA, 0, windowB);
        this._children.splice(indexB, 0, windowA);
    }

    public override swapChildrenAt(indexA: number, indexB: number): void
    {
        if(!this._children) return;

        this.swapChildren(this._children[indexA], this._children[indexB]);
    }
}
