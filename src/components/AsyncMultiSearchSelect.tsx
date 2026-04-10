/**
 * @fileoverview Async multi-select value editor for react-querybuilder fields
 * that load their options from a remote API.
 *
 * Supports an optional minimum character threshold before the first API call
 * is made, reducing unnecessary network requests for large datasets.
 *
 * @module components/AsyncMultiSearchSelect
 */

import AsyncSelect from 'react-select/async';
import { useState } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';

/** Normalized option shape used by react-select. */
type SelectOption = { value: string; label: string };

/**
 * Props for {@link AsyncMultiSearchSelect}.
 *
 * Extends the standard react-querybuilder `ValueEditorProps` with an async
 * option loader and an optional minimum-character guard.
 */
type Props = ValueEditorProps & {
    /**
     * Async function that receives the current search string and resolves to
     * a list of matching options. Called by react-select on every input change
     * (subject to `minChars`).
     *
     * @param inputValue - The current text typed by the user.
     * @returns A promise resolving to the matching option list.
     */
    loadOptions: (inputValue: string) => Promise<SelectOption[]>;

    /**
     * Minimum number of characters the user must type before `loadOptions` is
     * called. Defaults to `0` (loads on mount with `defaultOptions`).
     */
    minChars?: number;
};

/**
 * A searchable, async, multi-select value editor for use with react-querybuilder.
 *
 * Options are fetched on demand via `loadOptions`. When `minChars` is set,
 * the dropdown shows a prompt until the threshold is met, preventing
 * unnecessary API calls for large datasets (e.g. office search).
 *
 * Selected values are stored in react-querybuilder as a `string[]`.
 *
 * @param props - Value editor props merged with async loader configuration.
 * @returns An async react-select multi-select dropdown.
 *
 * @example
 * ```tsx
 * <AsyncMultiSearchSelect
 *   {...props}
 *   loadOptions={loadOffices}
 *   minChars={4}
 * />
 * ```
 */
export default function AsyncMultiSearchSelect({ value, handleOnChange, loadOptions, minChars = 0 }: Props) {
    const initialValues: string[] = Array.isArray(value) ? value : value ? [value] : [];
    const [selected, setSelected] = useState<SelectOption[]>(
        initialValues.map((v) => ({ value: v, label: v }))
    );

    const handleChange = (opts: readonly SelectOption[]) => {
        const arr = Array.from(opts);
        setSelected(arr);
        handleOnChange(arr.map((o) => o.value));
    };

    /**
     * Wraps the caller-supplied `loadOptions` with a `minChars` guard and
     * swallows errors so a failed request degrades gracefully to an empty list.
     *
     * @param inputValue - The current search string from react-select.
     * @returns Matching options, or an empty array on error / below threshold.
     */
    const safeLoadOptions = async (inputValue: string): Promise<SelectOption[]> => {
        if (inputValue.length < minChars) return [];
        try {
            return await loadOptions(inputValue);
        } catch {
            return [];
        }
    };

    return (
        <AsyncSelect
            isMulti
            loadOptions={safeLoadOptions}
            defaultOptions={minChars === 0}
            value={selected}
            onChange={handleChange}
            isClearable
            isSearchable
            placeholder={minChars > 0 ? `Type at least ${minChars} characters...` : 'Type to search...'}
            noOptionsMessage={({ inputValue }) =>
                inputValue.length < minChars
                    ? `Type at least ${minChars} characters to search`
                    : 'No results found'
            }
            styles={{
                container: (base) => ({ ...base, minWidth: 240, display: 'inline-block' }),
            }}
        />
    );
}
