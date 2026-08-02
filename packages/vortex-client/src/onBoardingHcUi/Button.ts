/**
 * Button
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/Button.as
 *
 * The login flow's button. Its four skins are built by protected getters that subclasses override
 * (`ColouredButton`, `RoundButton`, `ColorButton`, `randomizeButton`), and all four are stacked as
 * children with only one visible at a time — which is how AS3 switches state without rebuilding.
 *
 * One ordering difference is forced by the language: AS3 runs a subclass's field initialisers
 * BEFORE `super()`, so `ColouredButton` can pick its skins and then hand them to `Button`'s
 * constructor through the `icon` getter. TypeScript runs them after, so the icon is read in
 * `onAddedToStage()` — the first point where the subclass is fully constructed — instead of in the
 * constructor. Every use of it is in `onAddedToStage()` anyway.
 */
import type {Bitmap} from './display/Bitmap';
import type {DisplayObject} from './display/DisplayObject';
import type {DisplayEvent, DisplayMouseEvent} from './display/DisplayObject';
import {GlowFilter} from './display/Filters';
import {Rectangle} from './display/Geom';
import {LoaderUI} from './LoaderUI';
import {Sprite} from './display/DisplayObjectContainer';
import {LocalizedSprite} from './LocalizedSprite';
import type {LocalizedTextField} from './LocalizedTextField';
import {LoginAssets} from './LoginAssets';

/** TS-only: the four visual states AS3 encodes as bare 1..4 locals in `refresh()`. */
const STATE_DEFAULT = 1;
const STATE_PRESSED = 2;
const STATE_INACTIVE = 3;
const STATE_EDITING = 4;

/** AS3: the action callback signature — `_action(this)`. */
export type ButtonAction = (button: Button) => void;

export class Button extends LocalizedSprite
{
    // AS3: _caption
    private _caption: string;

    // AS3: _localizedText
    private _localizedText: string;

    // AS3: _rectangle
    protected _rectangle: Rectangle;

    // AS3: _fitWidthToText
    private _fitWidthToText: boolean;

    // AS3: _centred
    private _centred: boolean = false;

    // AS3: _action
    private _action: ButtonAction;

    // AS3: _glowColour
    private _glowColour: number;

    // AS3: _background
    private _background: Sprite | null = null;

    // AS3: _defaultBackground
    private _defaultBackground: DisplayObject | null = null;

    // AS3: _editingBackground
    private _editingBackground: DisplayObject | null = null;

    // AS3: _pressedBackground
    private _pressedBackground: DisplayObject | null = null;

    // AS3: _inactiveBackground
    private _inactiveBackground: DisplayObject | null = null;

    // AS3: _rolloverBackground
    private _rolloverBackground: DisplayObject | null = null;

    // AS3: _captionElement
    private _captionElement: LocalizedTextField | null = null;

    // AS3: _pressed
    private _pressed: boolean = false;

    // AS3: _hover
    private _hover: boolean = false;

    // AS3: _active
    private _active: boolean = false;

    // AS3: _selected
    private _selected: boolean = false;

    // AS3: _currentlyEditing
    private _currentlyEditing: boolean = false;

    // AS3: _alignRight
    private _alignRight: boolean = false;

    // AS3: _icon
    private _iconBitmap: Bitmap | null = null;

    // AS3: Button(_arg_1:String, _arg_2:Rectangle, _arg_3:Boolean, _arg_4:Function, _arg_5:uint=0xFFFFFF)
    constructor(caption: string, rectangle: Rectangle, fitWidthToText: boolean, action: ButtonAction, glowColour: number = 16777215)
    {
        super();

        this.removeOldLocalization(this._caption);
        this._caption = caption;
        this._localizedText = caption;
        this.checkLocalization(this._caption);
        this._rectangle = rectangle;
        this._fitWidthToText = fitWidthToText;
        this._action = action;
        this._glowColour = glowColour;
        this.active = true;
        this.mouseChildren = false;
        this.addEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('removedFromStage', this._onRemovedFromStage);
    }

    // AS3: get centred():Boolean / set centred(_arg_1:Boolean)
    public get centred(): boolean
    {
        return this._centred;
    }

    public set centred(value: boolean)
    {
        this._centred = value;
    }

    // AS3: override set x(_arg_1:Number) — the rectangle tracks the position
    public override get x(): number
    {
        return this._x;
    }

    public override set x(value: number)
    {
        this._x = value;
        this._rectangle.x = value;
    }

    // AS3: override set y(_arg_1:Number)
    public override get y(): number
    {
        return this._y;
    }

    public override set y(value: number)
    {
        this._y = value;
        this._rectangle.y = value;
    }

    // AS3: get active():Boolean / set active(_arg_1:Boolean)
    public get active(): boolean
    {
        return this._active;
    }

    public set active(value: boolean)
    {
        this._active = value;
        this.buttonMode = value;
        this.refresh();
    }

    // AS3: set alignRight(_arg_1:Boolean)
    public set alignRight(value: boolean)
    {
        this._alignRight = value;
    }

    // AS3: get label():String
    public get label(): string
    {
        return this._caption;
    }

    // AS3: get localizedText():String / set localizedText(_arg_1:String)
    public get localizedText(): string
    {
        return this._localizedText;
    }

    public set localizedText(value: string)
    {
        this._localizedText = value;

        if(this._captionElement)
        {
            this._captionElement.text = value;
            this.onAddedToStage();
        }
    }

    // AS3: unselect()
    public unselect(): void
    {
        this._currentlyEditing = false;
        this._selected = false;
        this.refresh();
    }

    // AS3: currentlyEditing()
    public currentlyEditing(): void
    {
        this._currentlyEditing = true;
        this.refresh();
    }

    // AS3: select()
    public select(): void
    {
        this._selected = true;
        this.refresh();
    }

    /**
     * AS3: onAddedToStage(_arg_1:Event=null)
     *
     * Builds the caption and the four (or five) skins, sizes them to the rectangle, and stacks
     * them. Called again by `set localizedText()` when the localisation resolves.
     */
    protected onAddedToStage(): void
    {
        this.x = this._rectangle.x;
        this.y = this._rectangle.y;

        // TS ordering, see the class header: AS3 captured the icon in the constructor.
        this._iconBitmap ??= this.icon;

        if(this._caption !== '')
        {
            this._captionElement = LoaderUI.createTextField(
                this._localizedText,
                18,
                this.textColour,
                true,
                false,
                false,
                this.italic,
                'left',
                false,
                this.underline
            );

            if(this.etching)
            {
                LoaderUI.addEtching(this._captionElement);
            }

            if(this._fitWidthToText)
            {
                this._rectangle.width = this._captionElement.textWidth + this.padding;
            }
        }

        this._defaultBackground = this.defaultBackground;
        this._defaultBackground.width = this._rectangle.width;
        this._defaultBackground.height = this._rectangle.height;
        this._editingBackground = this.currentlyActive;
        this._editingBackground.width = this._rectangle.width;
        this._editingBackground.height = this._rectangle.height;
        this._pressedBackground = this.pressedBackground;
        this._pressedBackground.width = this._rectangle.width;
        this._pressedBackground.height = this._rectangle.height;
        this._inactiveBackground = this.inactiveBackground;
        this._inactiveBackground.width = this._rectangle.width;
        this._inactiveBackground.height = this._rectangle.height;
        this._rolloverBackground = this.rolloverBackground;

        if(this._rolloverBackground != null)
        {
            this._rolloverBackground.width = this._rectangle.width;
            this._rolloverBackground.height = this._rectangle.height;
        }

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }

        this._background = new Sprite();
        this._background.addChild(this._defaultBackground);
        this._background.addChild(this._pressedBackground);
        this._background.addChild(this._inactiveBackground);
        this._background.addChild(this._editingBackground);

        if(this._rolloverBackground != null)
        {
            this._background.addChild(this._rolloverBackground);
        }

        this.addChild(this._background);

        if(this._caption !== '' && this._captionElement)
        {
            this.addChild(this._captionElement);
            this._captionElement.x = (this._rectangle.width - this._captionElement.textWidth) / 2 - 2;
            this._captionElement.y = (this._rectangle.height - this._captionElement.textHeight) / 2 - 2;
        }

        if(this._iconBitmap != null)
        {
            this._background.addChild(this._iconBitmap);
            this._iconBitmap.x = 10;
            this._iconBitmap.y = (this._background.height - this._iconBitmap.height) / 2;
        }

        this.refresh();
        this.width = this._rectangle.width;
        this.height = this._rectangle.height;

        if(this._centred && this.parent)
        {
            this.x = Math.trunc((this.parent.width - this.width) / 2);
        }

        if(this._alignRight && this.parent)
        {
            this.x = this.parent.width - this.width;
        }

        this.addEventListener('mouseDown', this._onMouseDown);
        this.addEventListener('mouseOver', this._onMouseOver);
        this.addEventListener('mouseOut', this._onMouseOut);
    }

    /**
     * AS3: refresh()
     *
     * Picks one of the four states and shows the matching skin. Without a rollover skin the hover
     * feedback is a glow filter instead.
     */
    private refresh(): void
    {
        if(this._background == null) return;

        let state = this._active
            ? ((this._pressed && this._hover) || this._selected ? STATE_PRESSED : STATE_DEFAULT)
            : STATE_INACTIVE;

        if(this._currentlyEditing)
        {
            state = STATE_EDITING;
        }

        if(this._defaultBackground)
        {
            this._defaultBackground.visible = state === STATE_DEFAULT && (this._rolloverBackground == null || !this._hover);
        }

        if(this._pressedBackground)
        {
            this._pressedBackground.visible = state === STATE_PRESSED;
        }

        if(this._inactiveBackground)
        {
            this._inactiveBackground.visible = state === STATE_INACTIVE;
        }

        if(this._editingBackground)
        {
            this._editingBackground.visible = state === STATE_EDITING;
        }

        if(this._rolloverBackground != null)
        {
            this._rolloverBackground.visible = state === STATE_DEFAULT && this._hover;
            this.filters = [];
        }
        else
        {
            this.filters = this._hover ? [new GlowFilter(this._glowColour, 0.7, 10, 10)] : [];
        }

        if(this._captionElement)
        {
            this._captionElement.textColor = this._active ? this.textColour : 10066329;
        }
    }

    // AS3: get defaultBackground():DisplayObject
    protected get defaultBackground(): DisplayObject
    {
        return LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button'), new Rectangle(5, 5, 1, 2));
    }

    // AS3: get pressedBackground():DisplayObject
    protected get pressedBackground(): DisplayObject
    {
        return LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_pressed'), new Rectangle(6, 10, 1, 3));
    }

    // AS3: get inactiveBackground():DisplayObject
    protected get inactiveBackground(): DisplayObject
    {
        return LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_inactive'), new Rectangle(5, 6, 1, 2));
    }

    // AS3: get currentlyActive():DisplayObject
    protected get currentlyActive(): DisplayObject
    {
        return LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button'), new Rectangle(5, 6, 1, 2));
    }

    // AS3: get rolloverBackground():DisplayObject
    protected get rolloverBackground(): DisplayObject | null
    {
        return null;
    }

    // AS3: get icon():Bitmap
    protected get icon(): Bitmap | null
    {
        return this._iconBitmap;
    }

    // AS3: get etching():Boolean
    protected get etching(): boolean
    {
        return true;
    }

    // AS3: get padding():int
    protected get padding(): number
    {
        return 24;
    }

    // AS3: get textColour():uint
    protected get textColour(): number
    {
        return 0;
    }

    // AS3: get italic():Boolean
    protected get italic(): boolean
    {
        return false;
    }

    // AS3: get underline():Boolean
    protected get underline(): boolean
    {
        return false;
    }

    private _onAddedToStage = (): void =>
    {
        this.onAddedToStage();
    };

    // AS3: onRemovedFromStage(_arg_1:Event)
    private _onRemovedFromStage = (): void =>
    {
        this.stage?.removeEventListener('mouseUp', this._onStageMouseUp);
        this.removeEventListener('mouseDown', this._onMouseDown);
        this.removeEventListener('mouseUp', this._onMouseUp);
        this.removeEventListener('mouseOver', this._onMouseOver);
        this.removeEventListener('mouseOut', this._onMouseOut);
    };

    // AS3: onMouseOut(_arg_1:MouseEvent)
    private _onMouseOut = (): void =>
    {
        this._hover = false;
        this.refresh();
    };

    // AS3: onMouseOver(_arg_1:MouseEvent)
    private _onMouseOver = (): void =>
    {
        if(!this._active) return;

        this._hover = true;
        this.refresh();
    };

    // AS3: onMouseDown(_arg_1:MouseEvent)
    private _onMouseDown = (): void =>
    {
        if(!this._active) return;

        this.stage?.addEventListener('mouseUp', this._onStageMouseUp);
        this.addEventListener('mouseUp', this._onMouseUp);
        this._pressed = true;
        this.refresh();
    };

    /**
     * AS3: onMouseUp(_arg_1:MouseEvent)
     *
     * `stopImmediatePropagation()` keeps the release from reaching whatever is behind the button.
     */
    private _onMouseUp = (event: DisplayMouseEvent | DisplayEvent): void =>
    {
        event.stopImmediatePropagation();
        this.stage?.removeEventListener('mouseUp', this._onStageMouseUp);
        this.removeEventListener('mouseUp', this._onMouseUp);
        this._pressed = false;
        this.refresh();
        this._action(this);
    };

    // AS3: onStageMouseUp(_arg_1:MouseEvent) — a press that ends off the button
    private _onStageMouseUp = (): void =>
    {
        this.stage?.removeEventListener('mouseUp', this._onStageMouseUp);
        this.removeEventListener('mouseUp', this._onMouseUp);
        this._pressed = false;
        this.refresh();
    };
}
