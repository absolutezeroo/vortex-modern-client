/**
 * Interface for an avatar action definition.
 *
 * @see sources/win63_version/habbo/avatar/actions/class_3576.as (IActionDefinition)
 */
export interface IActionDefinition
{
    readonly id: string;
    readonly state: string;
    readonly precedence: number;
    readonly activePartSet: string;
    readonly isMain: boolean;
    readonly isDefault: boolean;
    readonly assetPartDefinition: string;
    readonly lay: string;
    readonly geometryType: string;
    readonly isAnimation: boolean;
    readonly startFromFrameZero: boolean;

    isAnimated(part: string): boolean;

    getPrevents(id?: string): string[];

    getPreventHeadTurn(id?: string): boolean;

    setOffsets(setType: string, direction: number, offsets: number[]): void;

    getOffsets(setType: string, direction: number): number[] | null;
}
