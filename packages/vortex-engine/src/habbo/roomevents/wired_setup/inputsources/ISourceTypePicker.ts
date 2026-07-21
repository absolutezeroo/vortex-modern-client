/**
 * ISourceTypePicker — the contract for a source-type picker widget (the old and new pickers): select
 * a source by id, (re)initialize the available ids with a current selection, and dispose.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/ISourceTypePicker.as
 */
export interface ISourceTypePicker
{
    // AS3: ISourceTypePicker.as::select()
    select(id: number): void;

    // AS3: ISourceTypePicker.as::initialize()
    initialize(ids: number[], currentSelection: number): void;

    // AS3: ISourceTypePicker.as::dispose()
    dispose(): void;
}
