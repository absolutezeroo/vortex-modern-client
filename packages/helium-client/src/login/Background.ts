/**
 * Background
 *
 * @see sources/win63_2021_version/login/Background.as
 *
 * Full-screen background for the login flow.
 * AS3: Gradient fill (two-tone) with a tiled bitmap overlay (_SafeStr_4553).
 *
 * AS3 gradient: beginGradientFill("linear", [color1, color2], [1,1], [127,255], rotatedMatrix)
 * AS3 tile: beginBitmapFill(background_tiles_png) on _SafeStr_4553
 */
export class Background
{
	private _root: HTMLDivElement;
	private _tileOverlay: HTMLDivElement | null = null;
	private _disposed: boolean = false;

	/**
	 * AS3: Background()
	 * Registers addedToStage/removedFromStage listeners.
	 * DOM equivalent: we create the element but defer tile setup to mount().
	 */
	constructor()
	{
		this._root = document.createElement('div');
		Object.assign(this._root.style, {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			// AS3: beginGradientFill("linear", [color1, color2], [1,1], [127,255], rotated PI/2)
			// Vertical gradient from warm beige to deep red
			background: 'linear-gradient(180deg, #C4A48D 0%, #C23E1E 100%)',
			zIndex: '0',
		} as Partial<CSSStyleDeclaration>);
	}

	/**
	 * Get the root DOM element.
	 */
	get element(): HTMLDivElement
	{
		return this._root;
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * AS3: onAddedToStage(_arg_1:Event)
	 * Creates the tile overlay sprite and calls resize().
	 * Called when element is mounted to the DOM.
	 */
	public mount(): void
	{
		if(!this._tileOverlay)
		{
			// AS3: _SafeStr_4553 = new Sprite(); _SafeStr_4553.graphics.beginBitmapFill(_backgroundImage)
			// Tile overlay — background_tiles_png asset is tiled across the full area.
			// If the asset is not yet available, the overlay is transparent.
			this._tileOverlay = document.createElement('div');
			Object.assign(this._tileOverlay.style, {
				position: 'absolute',
				top: '0',
				left: '0',
				width: '100%',
				height: '100%',
				backgroundRepeat: 'repeat',
				opacity: '0.15',
				pointerEvents: 'none',
			} as Partial<CSSStyleDeclaration>);
			this._root.appendChild(this._tileOverlay);
		}

		this.resize();
	}

	/**
	 * Sets the tile background image URL.
	 * AS3: _backgroundImage = _local_2.bitmapData (from background_tiles_png embed)
	 */
	public setTileImage(url: string): void
	{
		if(this._tileOverlay)
		{
			this._tileOverlay.style.backgroundImage = `url(${url})`;
		}
	}

	/**
	 * AS3: resize()
	 * Redraws the gradient and tile overlay to match stage size.
	 * CSS handles full-screen via 100%/100%.
	 */
	public resize(): void
	{
		// CSS handles sizing via 100%/100%, nothing else needed
	}

	/**
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;
		this._root.remove();
	}
}
