/**
 * @fileoverview Reusable multi-select dropdown for react-querybuilder fields with static options.
 *
 * Accepts options in either react-querybuilder format (`{ name, label }`) or
 * react-select format (`{ value, label }`) and normalizes them automatically.
 *
 * @module components/SearchableSelectorComponent
 */

import Select from 'react-select';
import type { ValueEditorProps } from 'react-querybuilder';

/** Normalized option shape used internally by react-select. */
type SelectOption = { value: string; label: string };

/**
 * Normalizes a react-querybuilder `OptionList` into react-select `SelectOption[]`.
 *
 * Handles both `{ name, label }` (react-querybuilder native) and `{ value, label }`
 * (react-select native) option shapes.
 *
 * @param values - The raw option list from the field definition.
 * @returns Normalized options ready for react-select.
 */
function normalizeOptions(values: ValueEditorProps['values']): SelectOption[] {
    return (values ?? []).map((o) => {
        const raw = o as Record<string, string>;
        return { value: raw.value ?? raw.name, label: raw.label };
    });
}

/**
 * A searchable, multi-select value editor for use with react-querybuilder.
 *
 * Replaces the default value editor for fields that have a predefined list of
 * options. Supports typing to filter options, selecting multiple values, and
 * clearing the selection.
 *
 * The selected values are stored in react-querybuilder as a `string[]`.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns A react-select multi-select dropdown.
 *
 * @example
 * ```tsx
 * // In a QueryBuilder field definition:
 * { name: 'MemberTypeCode', label: 'Member Type', values: memberTypeOptions }
 *
 * // In CustomValueEditor:
 * if (multiSelectFields.has(props.field)) return <MultiSearchSelect {...props} />;
 * ```
 */
export default function MultiSearchSelect(props: ValueEditorProps) {
    const { value, handleOnChange, values } = props;
    const options = normalizeOptions(values);
    const selectedValues: string[] = Array.isArray(value) ? value : value ? [value] : [];
    const selected = options.filter((o) => selectedValues.includes(o.value));

    return (
        <Select
            isMulti
            options={options}
            value={selected}
            onChange={(opts) => handleOnChange(opts.map((o) => o.value))}
            isClearable
            isSearchable
            placeholder="Type to search or click to browse..."
            styles={{
                container: (base) => ({ ...base, minWidth: 240, display: 'inline-block' }),
            }}
        />
    );
}
