import type {IInteractiveWindow} from './IInteractiveWindow';

/**
 * Interface for drop menu windows.
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/components/IDropMenuWindow.as
 */
export interface IDropMenuWindow extends IInteractiveWindow
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/components/IDropMenuWindow.as::get selection()
    selection: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/components/IDropMenuWindow.as::get numMenuItems()
    readonly numMenuItems: number;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/components/IDropMenuWindow.as::populate()
    populate(items: unknown[]): void;

    populateWithStrings(items: string[]): void;

    enumerateSelection(): string[];

    // AS3: the interface (_SafeCls_2308) declares openMenu(); ExpandableDropdown drives it through
    // this type. DropMenuController already implements it (openExpandedMenuView delegate).
    openMenu(): void;
}
