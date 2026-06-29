/**
 * Small XML helpers for AS3 avatar data ports.
 * These keep TS parsers close to AS3 XML access patterns: @attributes, direct children, and text().
 */
export function isXmlDocument(data: unknown): data is Document
{
	return typeof Document !== 'undefined' && data instanceof Document;
}

export function isXmlElement(data: unknown): data is Element
{
	return typeof Element !== 'undefined' && data instanceof Element;
}

export function getXmlRoot(data: unknown): Element | null
{
	if (isXmlDocument(data))
	{
		return data.documentElement;
	}

	if (isXmlElement(data))
	{
		return data;
	}

	return null;
}

export function getXmlAttribute(element: Element, name: string, fallback: string = ''): string
{
	return element.getAttribute(name) ?? fallback;
}

export function getXmlText(element: Element): string
{
	return element.textContent?.trim() ?? '';
}

export function getXmlTagName(element: Element): string
{
	return element.localName || element.tagName;
}

export function getXmlChildElements(element: Element, tagName: string): Element[]
{
	return Array.from(element.children).filter((child) => getXmlTagName(child) === tagName);
}

export function getXmlFirstChildElement(element: Element, tagName: string): Element | null
{
	return getXmlChildElements(element, tagName)[0] ?? null;
}

export function getXmlDescendants(element: Element, tagName: string): Element[]
{
	return Array.from(element.getElementsByTagName(tagName));
}

export function parseXmlDocument(text: string): Document | null
{
	if (typeof DOMParser === 'undefined')
	{
		return null;
	}

	const document = new DOMParser().parseFromString(text, 'text/xml');

	if (document.getElementsByTagName('parsererror').length > 0)
	{
		return null;
	}

	return document;
}