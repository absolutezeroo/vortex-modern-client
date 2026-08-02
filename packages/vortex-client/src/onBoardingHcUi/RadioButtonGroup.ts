/**
 * RadioButtonGroup
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/RadioButtonGroup.as
 *
 * Holds a set of radio buttons and fires one action whenever the selection changes.
 */
import type {RadioButton} from './RadioButton';

export class RadioButtonGroup
{
    // AS3: buttons
    public buttons: RadioButton[] = [];

    // AS3: _selectedAction
    private _selectedAction: () => void;

    // AS3: RadioButtonGroup(_arg_1:Function)
    constructor(selectedAction: () => void)
    {
        this._selectedAction = selectedAction;
    }

    // AS3: get selected():RadioButton
    public get selected(): RadioButton | null
    {
        for(const button of this.buttons)
        {
            if(button.selected) return button;
        }

        return null;
    }

    // AS3: performSelectedAction()
    public performSelectedAction(): void
    {
        this._selectedAction();
    }
}
