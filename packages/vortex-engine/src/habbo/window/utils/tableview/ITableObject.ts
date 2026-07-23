import type {TableCell} from './TableCell';

/**
 * ITableObject — one row's data model in a TableView. Supplies a stable row identifier, a TableCell
 * per column id, and change-detection hooks the row model uses to decide whether a re-render is needed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/utils/tableview/ITableObject.as
 */
export interface ITableObject
{
    // AS3: ITableObject.as::get identifier()
    get identifier(): string;

    // AS3: ITableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell;

    // AS3: ITableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean;

    // AS3: ITableObject.as::isUpdated()
    isUpdated(other: object): boolean;
}
