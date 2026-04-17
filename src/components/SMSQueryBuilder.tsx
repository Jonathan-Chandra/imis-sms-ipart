/**
 * @fileoverview SMSQueryBuilder component — query builder for filtering SMS recipients.
 *
 * Wraps `react-querybuilder` with a custom value editor that routes
 * `multiselect` fields through {@link AsyncQueryBuilderMultiSelect} using the
 * {@link LoadOptionsMap} lookup. All other fields fall back to the default
 * react-querybuilder `ValueEditor`.
 *
 * @module components/SMSQueryBuilder
 */

import { QueryBuilder, ValueEditor, type Field, type ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { LoadOptionsMap } from './utils/FormHelpers';
import AsyncQueryBuilderMultiSelect from './AsyncQueryBuilderMultiSelect';

/**
 * Props for the {@link SMSQueryBuilder} component.
 *
 * @property onChange - Callback fired whenever the query rule group changes.
 *   Receives the full react-querybuilder `RuleGroupType` output.
 * @property fields - The field definitions to expose in the query builder.
 *   Pass {@link SMSQueryBuilderFields} or {@link SMSQueryBuilderCommitteeFields}
 *   from `FormHelpers` depending on the selected group type.
 */
type Props = {
    onChange: (value: any) => void;
    fields: Field[]
};

/**
 * Custom `valueEditor` for react-querybuilder.
 *
 * If the field's `valueEditorType` is `"multiselect"` and a corresponding
 * loader exists in {@link LoadOptionsMap}, renders an
 * {@link AsyncQueryBuilderMultiSelect}. The `key={props.field}` prop forces
 * a full remount whenever the selected field changes, clearing stale options.
 * All other fields render the default react-querybuilder `ValueEditor`.
 *
 * @param props - The value editor props supplied by react-querybuilder.
 * @returns The appropriate value editor element for the given field.
 */
function SetAsyncQueryBuilderMultiSelect(props: ValueEditorProps) {
    const loader = LoadOptionsMap[props.field];
    if(props.fieldData.valueEditorType === 'multiselect' && loader) {
        return (<AsyncQueryBuilderMultiSelect key={props.field} loadOptions={loader} onChange={props.handleOnChange} />);
    }
        return <ValueEditor {...props} />;
}

/**
 * SMSQueryBuilder component.
 *
 * Renders a `react-querybuilder` instance configured with the provided field
 * definitions and the custom async multi-select value editor. The add-group
 * button label is relabelled to `+ Filter` for clarity.
 *
 * @param props - Component props.
 * @returns The rendered query builder UI.
 */
export default function SMSQueryBuilder({ onChange, fields }: Props) {
    return (
        <div>
            <QueryBuilder fields = {fields} controlElements={{ valueEditor: SetAsyncQueryBuilderMultiSelect }} translations={{ addGroup: { label: '+ Filter' } }} onQueryChange={(value: any) => onChange(value)} />
        </div>
    );
}