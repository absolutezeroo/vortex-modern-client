# Helium

Modern Habbo client renderer - Lighter than Nitro

## Structure

```
src/
├── air/           # Adobe AIR specific (legacy)
├── bootstrap/     # Application bootstrap
├── core/          # Core engine (assets, communication, window)
├── habbo/         # Habbo business logic (avatar, catalog, room, ui, etc.)
├── iid/           # IoC Container (Inversify)
└── room/          # Core room engine
```

## Stack

- PixiJS v8
- Inversify
- TypeScript
- Vite

## Usage

```bash
npm install
npm run dev
```
