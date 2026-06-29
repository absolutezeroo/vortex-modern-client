# Copilot Instructions — Helium

Port TypeScript/PixiJS v8 du client Habbo Hotel Flash. Monorepo : `helium-engine` (moteur) + `helium-client` (UI SolidJS).

## Source de vérité

Le code source AS3 dans `sources/win63_version/` est la source de vérité pour toutes les implémentations. Toujours lire le fichier AS3 correspondant avant d'implémenter.

## Style de code

- Accolades **Allman** : accolade ouvrante `{` sur sa propre ligne, toujours
- Interfaces : préfixe `I` + PascalCase (`IRoomSession`, `IMessageParser`)
- Champs privés : préfixe `_` + camelCase (`_roomId`, `_sessions`)
- Constantes : UPPER_SNAKE_CASE (`MAX_ROOM_COUNT`)
- Named exports uniquement — jamais `export default`
- `import type` pour les imports de types uniquement
- Alias de chemins : `@core/`, `@habbo/`, `@room/`, `@iid/`, `@ui/`
- Pas d'espace avant les parenthèses : `if(condition)` et `foo()`

## Architecture

- L'engine (`packages/helium-engine/`) ne doit JAMAIS importer du client
- Tous les managers utilisent un DI Component-based avec des IIDs
- Chaque manager a une interface `I*` correspondante
- `dispose()` est toujours la dernière méthode, vérifie `_disposed`

## Patterns

### Composer

```typescript
export class ExampleComposer extends MessageComposer<[number, string]>
{
    private _data: [number, string];

    constructor(id: number, name: string)
    {
        super();
        this._data = [id, name];
    }

    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
```

### Parser

```typescript
export class ExampleParser implements IMessageParser
{
    private _value: string = '';

    flush(): boolean
    {
        this._value = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._value = wrapper.readString();
        return true;
    }

    get value(): string { return this._value; }
}
```

### Event

```typescript
export class ExampleEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, ExampleParser);
    }

    get parser(): ExampleParser
    {
        return this.getParser() as ExampleParser;
    }
}
```

## Pièges

- Ne jamais overrider `get events()` dans les sous-classes de Component
- Utiliser `createObjectInternal()` pas `createRoomObject()` depuis le container
- Les fichiers VIEW AS3 sont ignorés (SolidJS remplace l'UI Flash)
