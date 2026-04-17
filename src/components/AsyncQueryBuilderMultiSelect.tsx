/**
 * @fileoverview AsyncQueryBuilderMultiSelect component.
 *
 * A reusable async multi-select input built on `react-select/async`, designed
 * to be used as a custom `valueEditor` inside `react-querybuilder`. Loads
 * options asynchronously on mount (`defaultOptions`) and on every keystroke.
 * Styles are inline-overridden to match the default react-querybuilder
 * control appearance.
 *
 * @module components/AsyncQueryBuilderMultiSelect
 */

import AsyncSelect from 'react-select/async';

/**
 * Props for the {@link AsyncQueryBuilderMultiSelect} component.
 *
 * @property loadOptions - Async function that accepts a search string and
 *   returns a promise resolving to an array of `{ label, value }` option objects.
 *   Passed directly to the `react-select` `AsyncSelect` `loadOptions` prop.
 * @property onChange - Callback fired when the selection changes. Receives a
 *   flat array of the selected option value strings (not the full option objects).
 */
type Props = {
    loadOptions: (inputValue: string) => Promise<{ label: string, value: string }[]>;
    onChange: (values: string[]) => void;
};

/**
 * AsyncQueryBuilderMultiSelect component.
 *
 * Renders an `AsyncSelect` with `isMulti` enabled. On mount, `defaultOptions={true}`
 * triggers an initial load with an empty query so options are visible without
 * requiring the user to type first. When the selection changes, the raw
 * react-select option objects are mapped to plain value strings before firing
 * `onChange`, keeping the query builder's internal state free of react-select
 * object references.
 *
 * @param props - Component props.
 * @returns The rendered async multi-select input.
 */
export default function AsyncQueryBuilderMultiSelect({ loadOptions, onChange }: Props) {
    return (

        <AsyncSelect
            isMulti
            loadOptions={loadOptions}
            onChange={(selected) => onChange(selected.map(s => s.value))}
            className='rule-value' classNamePrefix='rule-value'
            styles={{
                container: (base) => ({ ...base, width: '100%' }),
                control: (base) => ({
                    ...base,
                    width: '100%',
                    minHeight: 'unset',
                    height: 'auto',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                }),
                menu: (base) => ({ ...base, width: '100%', fontSize: 'inherit', fontFamily: 'inherit' }),
                multiValue: (base) => ({ ...base, fontSize: 'inherit' }),
            }}
            defaultOptions={true}
        />
    );
}