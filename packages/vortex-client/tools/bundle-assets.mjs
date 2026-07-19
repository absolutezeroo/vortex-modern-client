#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '../public');
const DEFAULT_IMAGES_BUNDLE = 'assets-images.bundle';
const DEFAULT_XML_BUNDLE = 'assets-xml.bundle';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif', '.svg']);

function parseArgs()
{
	const args = process.argv.slice(2);
	const parsed =
		{
			input: DEFAULT_ASSETS_DIR,
			output: DEFAULT_OUTPUT_DIR,
			imagesBundle: DEFAULT_IMAGES_BUNDLE,
			xmlBundle: DEFAULT_XML_BUNDLE,
			imagesBundleSet: false,
			xmlBundleSet: false
		};

	for (let i = 0; i < args.length; i += 1)
	{
		const arg = args[i];

		if (arg === '--input')
		{
			parsed.input = path.resolve(args[i + 1] ?? parsed.input);
			i += 1;
			continue;
		}

		if (arg === '--output')
		{
			parsed.output = path.resolve(args[i + 1] ?? parsed.output);
			i += 1;
			continue;
		}

		if (arg === '--images')
		{
			parsed.imagesBundle = path.resolve(args[i + 1] ?? parsed.imagesBundle);
			parsed.imagesBundleSet = true;
			i += 1;
			continue;
		}

		if (arg === '--xml')
		{
			parsed.xmlBundle = path.resolve(args[i + 1] ?? parsed.xmlBundle);
			parsed.xmlBundleSet = true;
			i += 1;
			continue;
		}
	}

	if (!parsed.imagesBundleSet)
	{
		parsed.imagesBundle = path.resolve(parsed.output, DEFAULT_IMAGES_BUNDLE);
	}

	if (!parsed.xmlBundleSet)
	{
		parsed.xmlBundle = path.resolve(parsed.output, DEFAULT_XML_BUNDLE);
	}

	return parsed;
}

async function collectFiles(basePath)
{
	const result = [];
	const stack = [basePath];

	while (stack.length > 0)
	{
		const current = stack.pop();
		const entries = await fs.readdir(current, {withFileTypes: true});

		for (const entry of entries)
		{
			const fullPath = path.join(current, entry.name);
			const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

			if (entry.isDirectory())
			{
				stack.push(fullPath);
				continue;
			}

			if (entry.isFile())
			{
				result.push({
					key: relativePath,
					absolute: fullPath,
					ext: path.extname(entry.name).toLowerCase()
				});
			}
		}
	}

	return result;
}

async function writeBundle(outputPath, files)
{
	const headerSize = 8;
	const recordHeaders = [];
	const dataBuffers = [];
	const header = new Uint8Array(headerSize);
	const headerView = new DataView(header.buffer, header.byteOffset, header.byteLength);
	headerView.setUint32(0, 1, false);
	headerView.setUint32(4, files.length, false);

	let dataOffset = 0;

	for (const file of files)
	{
		const content = await fs.readFile(file.absolute);
		const keyBytes = Buffer.from(file.key, 'utf8');

		if (keyBytes.length > 0xffff)
		{
			throw new Error(`Bundle key is too long: ${file.key}`);
		}

		const record = Buffer.alloc(2 + keyBytes.length + 8);

		record.writeUInt16BE(keyBytes.length, 0);
		keyBytes.copy(record, 2);

		const recordView = new DataView(
			record.buffer,
			record.byteOffset + 2 + keyBytes.length,
			8
		);
		recordView.setUint32(0, dataOffset, false);
		recordView.setUint32(4, content.length, false);

		recordHeaders.push(record);
		dataBuffers.push(content);
		dataOffset += content.length;
	}

	const payloadParts = [
		Buffer.from(header),
		...recordHeaders,
		...dataBuffers
	];

	await fs.writeFile(outputPath, Buffer.concat(payloadParts));
}

async function build()
{
	const options = parseArgs();

	const allFiles = await collectFiles(options.input);
	const imageFiles = allFiles
		.filter((file) => IMAGE_EXTENSIONS.has(file.ext))
		.sort((a, b) => a.key.localeCompare(b.key));
	const xmlFiles = allFiles
		.filter((file) => !IMAGE_EXTENSIONS.has(file.ext))
		.sort((a, b) => a.key.localeCompare(b.key));

	const outputDir = options.output;
	await fs.mkdir(outputDir, {recursive: true});

	console.log(`[bundle-assets] Collecting files from: ${options.input}`);
	console.log(`[bundle-assets] Images: ${imageFiles.length} files`);
	console.log(`[bundle-assets] Other text/binary: ${xmlFiles.length} files`);

	await writeBundle(options.imagesBundle, imageFiles);
	await writeBundle(options.xmlBundle, xmlFiles);

	console.log(`[bundle-assets] Created ${path.relative(process.cwd(), options.imagesBundle)}`);
	console.log(`[bundle-assets] Created ${path.relative(process.cwd(), options.xmlBundle)}`);
}

build().catch((error) =>
{
	console.error('[bundle-assets] Failed:', error);
	process.exitCode = 1;
});
