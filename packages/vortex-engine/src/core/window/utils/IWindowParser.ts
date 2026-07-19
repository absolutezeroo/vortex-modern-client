import type {IWindow} from '../IWindow';
import type {IDisposable} from "../../runtime/IDisposable";

/**
 * Interface for parsing XML window layout definitions and constructing window trees.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IWindowParser.as
 */
export interface IWindowParser extends IDisposable
{
    parseAndConstruct(layout: string | Document | Element, parent: IWindow | null, namedWindows: Map<string, IWindow> | null): IWindow | null;

    windowToXMLString(window: IWindow): string;
}
