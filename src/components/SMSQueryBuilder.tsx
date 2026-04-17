import { QueryBuilder, ValueEditor, type Field, type ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { LoadOptionsMap } from './utils/FormHelpers';
import AsyncQueryBuilderMultiSelect from './AsyncQueryBuilderMultiSelect';

type Props = {
    onChange: (value: any) => void;
    fields: Field[]
};

function SetAsyncQueryBuilderMultiSelect(props: ValueEditorProps) {
    const loader = LoadOptionsMap[props.field];
    if(props.fieldData.valueEditorType === 'multiselect' && loader) {
        return (<AsyncQueryBuilderMultiSelect key={props.field} loadOptions={loader} onChange={props.handleOnChange} />);
    }
        return <ValueEditor {...props} />;
}


export default function SMSQueryBuilder({ onChange, fields }: Props) {
    return (
        <div>
            <QueryBuilder fields = {fields} controlElements={{ valueEditor: SetAsyncQueryBuilderMultiSelect }} translations={{ addGroup: { label: '+ Filter' } }} onQueryChange={(value: any) => onChange(value)} />
        </div>
    );
}