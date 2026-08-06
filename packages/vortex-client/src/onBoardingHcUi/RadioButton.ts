/**
 * RadioButton
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/RadioButton.as
 *
 * A mark plus a caption. Selecting one clears the rest of its group and re-colours their captions;
 * the onboarding avatar editor uses these for the gender choice.
 */
import {Bitmap} from './display/Bitmap';
import type {BitmapData} from './display/BitmapData';
import type {DisplayEvent} from './display/DisplayObject';
import {Sprite} from './display/DisplayObjectContainer';
import {LoaderUI} from './LoaderUI';
import type {LocalizedTextField} from './LocalizedTextField';
import {LoginAssets} from './LoginAssets';
import type {RadioButtonGroup} from './RadioButtonGroup';

export class RadioButton extends Sprite
{
    // AS3: _caption
    private _caption: string;

    // AS3: _group
    private _group: RadioButtonGroup | null;

    // AS3: _radioMark
    private _radioMark: Bitmap;

    // AS3: _captionElement
    private _captionElement: LocalizedTextField;

    // AS3: _selected
    private _selected: boolean = false;

    // AS3: _skinOn
    private _skinOn: BitmapData;

    // AS3: _skinOff
    private _skinOff: BitmapData;

    // AS3: _unselectedFontColor
    private _unselectedFontColor: number;

    // AS3: _style
    private _style: number;

    // AS3: RadioButton(_arg_1:String, _arg_2:RadioButtonGroup, _arg_3:int=1, _arg_4:BitmapData=null, _arg_5:BitmapData=null, _arg_6:uint=0)
    constructor(
        caption: string,
        group: RadioButtonGroup | null,
        style: number = 1,
        skinOn: BitmapData | null = null,
        skinOff: BitmapData | null = null,
        unselectedFontColor: number = 0
    )
    {
        super();

        this._caption = caption;
        this._group = group;
        this._style = style;
        this.mouseChildren = false;
        this.buttonMode = true;
        this._unselectedFontColor = unselectedFontColor;

        const italic = style === 2;

        this._captionElement = LoaderUI.createTextField(
            this._caption,
            20,
            style === 2 ? 15201722 : 0,
            true,
            false,
            false,
            italic
        );
        this._captionElement.alpha = style === 2 ? 0.7 : 1;

        if(style === 1)
        {
            LoaderUI.addEtching(this._captionElement);
        }

        if(style === 1)
        {
            this._skinOn = skinOn ?? LoginAssets.get('radio_button_on');
            this._skinOff = skinOff ?? LoginAssets.get('radio_button_off');
        }
        else
        {
            this._skinOn = skinOn ?? LoginAssets.get('radio_button_on_hitch');
            this._skinOff = skinOff ?? LoginAssets.get('radio_button_off_hitch');
        }

        this._radioMark = new Bitmap(this._skinOff);
        this.addChild(this._radioMark);
        this._radioMark.y = Math.trunc((this._captionElement.height - this._radioMark.height) / 2);
        this._radioMark.alpha = style === 2 ? 0.8 : 1;
        this.addChild(this._captionElement);
        this._captionElement.x = this._radioMark.width + 6;

        if(this._group != null && this._group.buttons.indexOf(this) < 0)
        {
            this._group.buttons.push(this);
        }

        this.addEventListener('mouseDown', this._onMouseDown);
    }

    // AS3: get group():RadioButtonGroup / set group(_arg_1:RadioButtonGroup)
    public get group(): RadioButtonGroup | null
    {
        return this._group;
    }

    // AS3: .../src/onBoardingHcUi/RadioButton.as::set group()
    public set group(value: RadioButtonGroup | null)
    {
        if(this._group === value) return;

        if(this._group != null && this._group.buttons.indexOf(this) >= 0)
        {
            this._group.buttons.splice(this._group.buttons.indexOf(this), 1);
        }

        this._group = value;
        this.selected = false;
    }

    // AS3: setUnselectedFontColor(_arg_1:uint)
    public setUnselectedFontColor(color: number): void
    {
        this._unselectedFontColor = color;
    }

    // AS3: get selected():Boolean / set selected(_arg_1:Boolean)
    public get selected(): boolean
    {
        return this._selected;
    }

    // AS3: .../src/onBoardingHcUi/RadioButton.as::set selected()
    public set selected(value: boolean)
    {
        if(this._selected === value) return;

        this._selected = value;

        if(this._selected && this._group != null)
        {
            for(const button of this._group.buttons)
            {
                if(button !== this)
                {
                    button.selected = false;

                    if(this._unselectedFontColor)
                    {
                        button._captionElement.textColor = this._unselectedFontColor;
                        button._captionElement.alpha = 0.6;
                    }
                }
                else
                {
                    button._captionElement.textColor = this._style === 2 ? 15201722 : 0;
                    button._captionElement.alpha = 0.7;
                }
            }

            this._group.performSelectedAction();
        }

        this._radioMark.bitmapData = this._selected ? this._skinOn : this._skinOff;
    }

    // AS3: onMouseDown(_arg_1:MouseEvent)
    private _onMouseDown = (): void =>
    {
        this.addEventListener('mouseUp', this._onMouseUp);
    };

    // AS3: onMouseUp(_arg_1:MouseEvent)
    private _onMouseUp = (event: DisplayEvent): void =>
    {
        event.stopImmediatePropagation();
        this.removeEventListener('mouseUp', this._onMouseUp);
        this.selected = true;
    };
}
