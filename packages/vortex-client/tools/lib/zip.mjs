// A minimal ZIP reader and writer, on node:zlib alone.
//
// This exists because there is no portable way to shell out for it. `tar` reads and writes zip
// on Windows and macOS, where it is bsdtar, and cannot on Linux, where it is GNU tar; `zip` and
// `unzip` are usually absent on Windows; PowerShell's Compress-Archive is Windows-only. Which of
// the three you get also depends on which shell Node happens to spawn, so the same command works
// from cmd.exe and fails from Git Bash on one machine. Adding a dependency for it would mean a
// package install standing between a clone and its assets, which is the thing install.mjs is
// there to remove.
//
// The container is a few fixed-layout records around deflate streams, which zlib already does.
// Deliberately not implemented: ZIP64 (needed past 4 GB or 65,535 entries - the client's whole
// asset tree is 16 MB and 4,400 files), encryption, and data descriptors. writeZip() throws
// rather than emit a silently truncated archive if those limits are ever crossed.
import {deflateRawSync, inflateRawSync} from 'node:zlib';
import {mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, sep} from 'node:path';

const LOCAL_HEADER_SIG = 0x04034b50;
const CENTRAL_HEADER_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;

const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;

const MAX_ENTRIES = 0xffff;
const MAX_SIZE = 0xffffffff;

const crcTable = buildCrcTable();

function buildCrcTable()
{
    const table = new Int32Array(256);

    for(let i = 0; i < 256; i += 1)
    {
        let c = i;

        for(let bit = 0; bit < 8; bit += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);

        table[i] = c;
    }

    return table;
}

function crc32(buffer)
{
    let c = -1;

    for(let i = 0; i < buffer.length; i += 1) c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);

    return (c ^ -1) >>> 0;
}

// MS-DOS packed date and time, the only timestamp the base format carries: two seconds of
// resolution, and no year before 1980.
function dosDateTime(date)
{
    const year = Math.max(date.getFullYear(), 1980);

    return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
        date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
}

/** Every file under `dir`, as paths relative to it with forward slashes. */
export function listFiles(dir, base = dir)
{
    const files = [];

    for(const entry of readdirSync(dir, {withFileTypes: true}))
    {
        const path = join(dir, entry.name);

        if(entry.isDirectory()) files.push(...listFiles(path, base));
        else if(entry.isFile()) files.push(relative(base, path).split(sep).join('/'));
    }

    return files;
}

/**
 * Writes `entries` ({name, path} or {name, data}) to a zip at `target`.
 *
 * Entries whose deflated form is no smaller are stored uncompressed - that is not a
 * micro-optimisation but a correctness one for already-compressed payloads like PNG, where
 * deflate reliably adds a few bytes per file.
 */
export function writeZip(target, entries)
{
    if(entries.length > MAX_ENTRIES) throw new Error(`zip.mjs writes at most ${MAX_ENTRIES} entries, got ${entries.length}`);

    const chunks = [];
    const central = [];
    let offset = 0;

    for(const entry of entries)
    {
        const name = Buffer.from(entry.name, 'utf8');
        const data = entry.data ?? readFileSync(entry.path);

        if(data.length > MAX_SIZE) throw new Error(`zip.mjs writes files under 4 GB, ${entry.name} is larger`);

        const deflated = deflateRawSync(data, {level: 9});
        const stored = deflated.length >= data.length;
        const payload = stored ? data : deflated;
        const method = stored ? METHOD_STORE : METHOD_DEFLATE;
        const crc = crc32(data);
        const {time, date} = dosDateTime(entry.path ? statSync(entry.path).mtime : new Date());

        const local = Buffer.alloc(30);

        local.writeUInt32LE(LOCAL_HEADER_SIG, 0);
        local.writeUInt16LE(20, 4);            // version needed
        local.writeUInt16LE(0, 6);             // flags
        local.writeUInt16LE(method, 8);
        local.writeUInt16LE(time, 10);
        local.writeUInt16LE(date, 12);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(payload.length, 18);
        local.writeUInt32LE(data.length, 22);
        local.writeUInt16LE(name.length, 26);
        local.writeUInt16LE(0, 28);            // extra field length

        chunks.push(local, name, payload);

        const header = Buffer.alloc(46);

        header.writeUInt32LE(CENTRAL_HEADER_SIG, 0);
        header.writeUInt16LE(20, 4);           // version made by
        header.writeUInt16LE(20, 6);           // version needed
        header.writeUInt16LE(0, 8);            // flags
        header.writeUInt16LE(method, 10);
        header.writeUInt16LE(time, 12);
        header.writeUInt16LE(date, 14);
        header.writeUInt32LE(crc, 16);
        header.writeUInt32LE(payload.length, 20);
        header.writeUInt32LE(data.length, 24);
        header.writeUInt16LE(name.length, 28);
        header.writeUInt16LE(0, 30);           // extra field length
        header.writeUInt16LE(0, 32);           // comment length
        header.writeUInt16LE(0, 34);           // disk number start
        header.writeUInt16LE(0, 36);           // internal attributes
        header.writeUInt32LE(0, 38);           // external attributes
        header.writeUInt32LE(offset, 42);

        central.push(header, name);
        offset += local.length + name.length + payload.length;

        if(offset > MAX_SIZE) throw new Error('zip.mjs writes archives under 4 GB');
    }

    const centralBuffer = Buffer.concat(central);
    const eocd = Buffer.alloc(22);

    eocd.writeUInt32LE(EOCD_SIG, 0);
    eocd.writeUInt16LE(0, 4);                  // this disk
    eocd.writeUInt16LE(0, 6);                  // disk with central directory
    eocd.writeUInt16LE(entries.length, 8);
    eocd.writeUInt16LE(entries.length, 10);
    eocd.writeUInt32LE(centralBuffer.length, 12);
    eocd.writeUInt32LE(offset, 16);
    eocd.writeUInt16LE(0, 20);                 // comment length

    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, Buffer.concat([...chunks, centralBuffer, eocd]));

    return {entries: entries.length, bytes: offset + centralBuffer.length + eocd.length};
}

/**
 * Extracts a zip into `targetDir`, returning the relative paths written.
 *
 * Entry names are resolved against `targetDir` and refused if they escape it: an archive is
 * untrusted input, and `../` in a stored name is the oldest way to write outside the extraction
 * directory.
 */
export function extractZip(archive, targetDir)
{
    const buffer = readFileSync(archive);
    const eocdOffset = findEocd(buffer);

    if(eocdOffset === -1) throw new Error(`${archive} is not a zip archive (no end-of-central-directory record)`);

    const count = buffer.readUInt16LE(eocdOffset + 10);
    let cursor = buffer.readUInt32LE(eocdOffset + 16);
    const written = [];

    for(let i = 0; i < count; i += 1)
    {
        if(buffer.readUInt32LE(cursor) !== CENTRAL_HEADER_SIG) throw new Error(`${archive}: corrupt central directory at entry ${i}`);

        const method = buffer.readUInt16LE(cursor + 10);
        const crc = buffer.readUInt32LE(cursor + 16);
        const compressedSize = buffer.readUInt32LE(cursor + 20);
        const nameLength = buffer.readUInt16LE(cursor + 28);
        const extraLength = buffer.readUInt16LE(cursor + 30);
        const commentLength = buffer.readUInt16LE(cursor + 32);
        const localOffset = buffer.readUInt32LE(cursor + 42);
        const name = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);

        cursor += 46 + nameLength + extraLength + commentLength;

        if(name.endsWith('/')) continue;

        // The local header repeats the name and extra field, and its extra field length is
        // routinely NOT the central one - reading the payload offset from the central record's
        // is the classic way to extract garbage.
        const localNameLength = buffer.readUInt16LE(localOffset + 26);
        const localExtraLength = buffer.readUInt16LE(localOffset + 28);
        const dataStart = localOffset + 30 + localNameLength + localExtraLength;
        const payload = buffer.subarray(dataStart, dataStart + compressedSize);
        const data = method === METHOD_DEFLATE ? inflateRawSync(payload) : Buffer.from(payload);

        if(crc32(data) !== crc) throw new Error(`${archive}: ${name} failed its CRC check`);

        const target = join(targetDir, name);

        if(relative(targetDir, target).startsWith('..')) throw new Error(`${archive}: entry "${name}" escapes the extraction directory`);

        mkdirSync(dirname(target), {recursive: true});
        writeFileSync(target, data);
        written.push(name);
    }

    return written;
}

// The record is at the end, but a trailing comment may follow it, so scan back over the largest
// comment the format allows.
function findEocd(buffer)
{
    const earliest = Math.max(0, buffer.length - 22 - MAX_ENTRIES);

    for(let i = buffer.length - 22; i >= earliest; i -= 1)
    {
        if(buffer.readUInt32LE(i) === EOCD_SIG) return i;
    }

    return -1;
}
