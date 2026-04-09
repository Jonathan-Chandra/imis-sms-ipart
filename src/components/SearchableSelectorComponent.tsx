import Select from 'react-select';
import type { ValueEditorProps } from 'react-querybuilder';

type SelectOption = { value: string; label: string };

function normalizeOptions(values: ValueEditorProps['values']): SelectOption[] {
    return (values ?? []).map((o) => {
        const raw = o as Record<string, string>;
        return { value: raw.value ?? raw.name, label: raw.label };
    });
}

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