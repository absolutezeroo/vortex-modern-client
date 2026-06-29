/**
 * ColorConverter
 *
 * Based on AS3: com.sulake.room.utils.ColorConverter
 *
 * Utility class for color space conversions (RGB, HSL, XYZ, CIE Lab).
 */
import type {IVector3d} from './IVector3d';
import {Vector3d} from './Vector3d';

export class ColorConverter
{
	static rgbToHSL(rgb: number): number
	{
		const r = ((rgb >> 16) & 0xFF) / 255;
		const g = ((rgb >> 8) & 0xFF) / 255;
		const b = (rgb & 0xFF) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let h = 0;
		let s = 0;
		let l = 0;

		if (delta === 0)
		{
			h = 0;
		}
		else if (max === r)
		{
			if (g > b)
			{
				h = 60 * (g - b) / delta;
			}
			else
			{
				h = 60 * (g - b) / delta + 360;
			}
		}
		else if (max === g)
		{
			h = 60 * (b - r) / delta + 120;
		}
		else if (max === b)
		{
			h = 60 * (r - g) / delta + 240;
		}

		l = 0.5 * (max + min);

		if (delta === 0)
		{
			s = 0;
		}
		else if (l <= 0.5)
		{
			s = delta / l * 0.5;
		}
		else
		{
			s = delta / (1 - l) * 0.5;
		}

		const hInt = Math.round(h / 360 * 255);
		const sInt = Math.round(s * 255);
		const lInt = Math.round(l * 255);

		return (hInt << 16) + (sInt << 8) + lInt;
	}

	static hslToRGB(hsl: number): number
	{
		const h = ((hsl >> 16) & 0xFF) / 255;
		const s = ((hsl >> 8) & 0xFF) / 255;
		const l = (hsl & 0xFF) / 255;

		let r = 0;
		let g = 0;
		let b = 0;

		if (s > 0)
		{
			let q = 0;
			let p = 0;

			if (l < 0.5)
			{
				q = l * (1 + s);
			}
			else
			{
				q = l + s - l * s;
			}

			p = 2 * l - q;

			let tr = h + 1 / 3;
			let tg = h;
			let tb = h - 1 / 3;

			if (tr < 0)
			{
				tr += 1;
			}
			else if (tr > 1)
			{
				tr -= 1;
			}

			if (tg < 0)
			{
				tg += 1;
			}
			else if (tg > 1)
			{
				tg -= 1;
			}

			if (tb < 0)
			{
				tb += 1;
			}
			else if (tb > 1)
			{
				tb -= 1;
			}

			if (tr * 6 < 1)
			{
				r = p + (q - p) * 6 * tr;
			}
			else if (tr * 2 < 1)
			{
				r = q;
			}
			else if (tr * 3 < 2)
			{
				r = p + (q - p) * 6 * (2 / 3 - tr);
			}
			else
			{
				r = p;
			}

			if (tg * 6 < 1)
			{
				g = p + (q - p) * 6 * tg;
			}
			else if (tg * 2 < 1)
			{
				g = q;
			}
			else if (tg * 3 < 2)
			{
				g = p + (q - p) * 6 * (2 / 3 - tg);
			}
			else
			{
				g = p;
			}

			if (tb * 6 < 1)
			{
				b = p + (q - p) * 6 * tb;
			}
			else if (tb * 2 < 1)
			{
				b = q;
			}
			else if (tb * 3 < 2)
			{
				b = p + (q - p) * 6 * (2 / 3 - tb);
			}
			else
			{
				b = p;
			}
		}
		else
		{
			r = l;
			g = l;
			b = l;
		}

		const rInt = Math.round(r * 255);
		const gInt = Math.round(g * 255);
		const bInt = Math.round(b * 255);

		return (rInt << 16) + (gInt << 8) + bInt;
	}

	static rgb2xyz(rgb: number): IVector3d
	{
		let r = ((rgb >> 16) & 0xFF) / 255;
		let g = ((rgb >> 8) & 0xFF) / 255;
		let b = ((rgb >> 0) & 0xFF) / 255;

		if (r > 0.04045)
		{
			r = Math.pow((r + 0.055) / 1.055, 2.4);
		}
		else
		{
			r /= 12.92;
		}

		if (g > 0.04045)
		{
			g = Math.pow((g + 0.055) / 1.055, 2.4);
		}
		else
		{
			g /= 12.92;
		}

		if (b > 0.04045)
		{
			b = Math.pow((b + 0.055) / 1.055, 2.4);
		}
		else
		{
			b /= 12.92;
		}

		r *= 100;
		g *= 100;
		b *= 100;

		return new Vector3d(
			r * 0.4124 + g * 0.3576 + b * 0.1805,
			r * 0.2126 + g * 0.7152 + b * 0.0722,
			r * 0.0193 + g * 0.1192 + b * 0.9505
		);
	}

	static xyz2CieLab(xyz: IVector3d): IVector3d
	{
		let x = xyz.x / 95.047;
		let y = xyz.y / 100;
		let z = xyz.z / 108.883;

		if (x > 0.008856)
		{
			x = Math.pow(x, 1 / 3);
		}
		else
		{
			x = 7.787 * x + 16 / 116;
		}

		if (y > 0.008856)
		{
			y = Math.pow(y, 1 / 3);
		}
		else
		{
			y = 7.787 * y + 16 / 116;
		}

		if (z > 0.008856)
		{
			z = Math.pow(z, 1 / 3);
		}
		else
		{
			z = 7.787 * z + 16 / 116;
		}

		return new Vector3d(
			116 * y - 16,
			500 * (x - y),
			200 * (y - z)
		);
	}

	static rgb2CieLab(rgb: number): IVector3d
	{
		return ColorConverter.xyz2CieLab(ColorConverter.rgb2xyz(rgb));
	}

	static hexToUint(hex: string): number
	{
		hex = hex.replace(/^#/, '');

		return parseInt(hex, 16);
	}
}
