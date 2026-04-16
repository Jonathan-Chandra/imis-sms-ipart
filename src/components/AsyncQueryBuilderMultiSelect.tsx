import { useState } from 'react';
import AsyncSelect from 'react-select/async';

type Props = {
    loadOptions: (inputValue: string) => Promise<{ label: string, value: string }[]>;
    onChange: (values: string[]) => void;
};



export default function AsyncQueryBuilderMultiSelect({ loadOptions, onChange }: Props) {
    return (

        <AsyncSelect
            isMulti
            loadOptions={loadOptions}
            onChange={(selected) => onChange(selected.map(s => s.value))}
            className='rule-value' classNamePrefix='rule-value'
            styles={{
                control: (base) => ({
                    ...base,
                    minHeight: 'unset',
                    height: 'auto',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                }),
                menu: (base) => ({ ...base, fontSize: 'inherit', fontFamily: 'inherit' }),
                multiValue: (base) => ({ ...base, fontSize: 'inherit' }),
            }}
            defaultOptions={true}
        />
    );
}