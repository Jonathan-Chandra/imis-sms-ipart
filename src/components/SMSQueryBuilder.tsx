import { QueryBuilder, ValueEditor, type ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { LoadOptionsMap, SMSQueryBuilderFields } from './utils/FormHelpers';
import AsyncQueryBuilderMultiSelect from './AsyncQueryBuilderMultiSelect';

type Props = {
    onChange: (value: any) => void;
};

function SetAsyncQueryBuilderMultiSelect(props: ValueEditorProps) {
    const loader = LoadOptionsMap[props.field];
    if(props.fieldData.valueEditorType === 'multiselect' && loader) {
        return (<AsyncQueryBuilderMultiSelect key={props.field} loadOptions={loader} onChange={props.handleOnChange} />);
    }
        return <ValueEditor {...props} />;
}


export default function SMSQueryBuilder({ onChange }: Props) {
    return (
        <div>
            <QueryBuilder fields = {SMSQueryBuilderFields} controlElements={{ valueEditor: SetAsyncQueryBuilderMultiSelect }}/>
        </div>
    );
}