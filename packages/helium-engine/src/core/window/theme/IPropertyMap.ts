import type {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Property map interface for theme defaults.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/theme/IPropertyMap.as
 */
export interface IPropertyMap
{
    getValue(key: string): unknown;

    get(key: string): PropertyStruct | null;

    setValue(key: string, value: unknown): void;

    hasValue(key: string): boolean;

    getKeys(): string[];
}
