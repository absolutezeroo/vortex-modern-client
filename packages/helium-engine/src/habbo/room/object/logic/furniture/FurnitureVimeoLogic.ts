/**
 * FurnitureVimeoLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureVimeoLogic.as
 *
 * Logic for Vimeo video furniture (widget = VIMEO).
 */
import {FurnitureLogic} from './FurnitureLogic';

export class FurnitureVimeoLogic extends FurnitureLogic
{
    override get widget(): string | null
    {
        return 'VIMEO';
    }
}
