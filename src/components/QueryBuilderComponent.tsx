/**
 * @fileoverview Query builder field definitions, custom value editors, and
 * supporting hooks for the iMIS SMS member-query interface.
 *
 * Exports `fields` (the full field list) and `CustomValueEditor` (the per-field
 * editor dispatcher) for use inside {@link SendSMSForm}.
 *
 * Field-specific editor behaviour:
 * - `LocalAssnImisId` – static multi-select, options pre-fetched on mount
 * - `OfficeImisID`    – async multi-select, requires ≥4 characters, smart routing
 *   between `MajorKey` and `FullName` query params
 * - `MemberTypeCode`, `LicType` – static multi-select with predefined options
 * - All other fields  – default react-querybuilder editor
 *
 * @module components/QueryBuilderComponent
 */

import { ValueEditor, type Field, type ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { useEffect, useState } from 'react';
import MultiSearchSelect from './SearchableSelectorComponent';
import AsyncMultiSearchSelect from './AsyncMultiSearchSelect';
import api from '../api/Client';

/** Normalized option shape shared across all selector components. */
type SelectOption = { value: string; label: string };

/**
 * React hook that fetches a static option list from an iMIS Query on mount.
 *
 * Results are cached in component state for the lifetime of the consuming
 * component. The fetch is re-triggered only if `queryName` changes.
 *
 * @param queryName - The iMIS IQA query name (e.g. `$/_CAR.../Lookup/Association`).
 * @returns The fetched options, or an empty array while loading or on error.
 */
function useLookupOptions(queryName: string) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    useEffect(() => {
        api.get('/Query', { params: { QueryName: queryName, Limit: 500 } })
            .then((res) => setOptions(res.data.Items.$values.map((item: SelectOption) => ({ value: item.value, label: item.label }))))
            .catch(() => {});
    }, [queryName]);
    return options;
}

/**
 * Value editor for the `LocalAssnImisId` field.
 *
 * Fetches all local associations on mount via `VITE_IMIS_ASSOCIATION_LOOKUP_QUERY`
 * and renders them as a searchable multi-select.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns A {@link MultiSearchSelect} pre-loaded with association options.
 */
function LocalAssociationSelect(props: ValueEditorProps) {
    const options = useLookupOptions(import.meta.env.VITE_IMIS_ASSOCIATION_LOOKUP_QUERY);
    return <MultiSearchSelect {...props} values={options} />;
}

/**
 * Fetches office options from the iMIS Query API for a given search string.
 *
 * Routes the search to the correct query parameter based on the input pattern:
 * - Starts with a letter followed by ≥3 digits → `MajorKey` (office ID lookup)
 * - Anything else → `FullName` (name search)
 *
 * Both parameters are always sent; the unused one is set to an empty string so
 * the query filters correctly on the server side.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to the matching office options.
 */
async function loadOffices(inputValue: string) {
    const isMajorKey = /^[a-zA-Z]\d{3}/.test(inputValue);
    const searchParam = isMajorKey
        ? { MajorKey: inputValue, FullName: '' }
        : { MajorKey: '', FullName: inputValue };
    const res = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_OFFICE_LOOKUP_QUERY, ...searchParam, Limit: 20 } });
    return res.data.Items.$values.map((item: { value: string; label: string }) => ({ value: item.value, label: item.label }));
}

/**
 * Fetches committee name options from the iMIS Query API for a given search string.
 *
 * Searches both the committee code and title by passing the input value to both
 * `Code` and `Title` query parameters.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to the matching committee name options.
 */
async function loadCommitteeNames(inputValue: string) {
    const res = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_COMMITTEE_NAME_LOOKUP_QUERY, Code: inputValue, Title: inputValue, Limit: 20 } });
    return res.data.Items.$values.map((item: { value: string; label: string }) => ({ value: item.value, label: item.label }));
}

/**
 * Fetches committee position options from the iMIS Query API for a given search string.
 *
 * Searches both the position code and title by passing the input value to both
 * `PositionCode` and `Title` query parameters.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to the matching committee position options.
 */
async function loadCommitteePositions(inputValue: string) {
    const res = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_COMMITTEE_POSITION_LOOKUP_QUERY, PositionCode: inputValue, Title: inputValue, Limit: 20 } });
    return res.data.Items.$values.map((item: { value: string; label: string }) => ({ value: item.value, label: item.label }));
}

/**
 * Value editor for the `OfficeImisID` field.
 *
 * Renders an async multi-select that only queries the API after the user has
 * typed at least 4 characters, keeping network traffic low for large datasets.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns An {@link AsyncMultiSearchSelect} wired to {@link loadOffices}.
 */
function OfficeSelect(props: ValueEditorProps) {
    return <AsyncMultiSearchSelect {...props} loadOptions={loadOffices} minChars={4} />;
}

/**
 * Value editor for the `CommitteeName` field.
 *
 * Renders an async multi-select that queries the API after the user has
 * typed at least 1 character.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns An {@link AsyncMultiSearchSelect} wired to {@link loadCommitteeNames}.
 */
function CommitteeNameSelect(props: ValueEditorProps) {
    return <AsyncMultiSearchSelect {...props} loadOptions={loadCommitteeNames} minChars={1} />;
}

/**
 * Value editor for the `CommitteePosition` field.
 *
 * Renders an async multi-select that queries the API after the user has
 * typed at least 1 character.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns An {@link AsyncMultiSearchSelect} wired to {@link loadCommitteePositions}.
 */
function CommitteePositionSelect(props: ValueEditorProps) {
    return <AsyncMultiSearchSelect {...props} loadOptions={loadCommitteePositions} minChars={1} />;
}

/**
 * Field names that use {@link MultiSearchSelect} with predefined static options.
 * Add a field name here to opt it into the multi-select editor automatically.
 */
const multiSelectFields = new Set(['MemberTypeCode', 'LicType']);

/**
 * Top-level value editor dispatcher for the query builder.
 *
 * Inspects `props.field` and delegates to the appropriate editor component.
 * Falls back to the default react-querybuilder `ValueEditor` for any field
 * not explicitly handled.
 *
 * @param props - Standard react-querybuilder value editor props.
 * @returns The appropriate editor component for the given field.
 */
function CustomValueEditor(props: ValueEditorProps) {
    if (props.field === 'LocalAssnImisId') {
        return <LocalAssociationSelect {...props} />;
    }
    if (props.field === 'OfficeImisID') {
        return <OfficeSelect {...props} />;
    }
    if (props.field === 'CommitteeName') {
        return <CommitteeNameSelect {...props} />;
    }
    if (props.field === 'CommitteePosition') {
        return <CommitteePositionSelect {...props} />;
    }
    if (multiSelectFields.has(props.field)) {
        return <MultiSearchSelect {...props} />;
    }
    return <ValueEditor {...props} />;
}

/** Predefined options for the Member Type (`MemberTypeCode`) field. */
const memberTypeOptions: SelectOption[] = [
    { value: 'R', label: 'Realtor®' },
    { value: 'DR', label: 'Designated Realtor®' },
    { value: 'RA', label: 'Realtor® Associate' },
    { value: 'AFF', label: 'Affiliate' },
    { value: 'S', label: 'Staff' },
    { value: 'I', label: 'Institute Affiliate Member' },
    { value: 'L', label: 'LFRO' },
    { value: 'CCO', label: 'Corporate Contact Only' },
];

/** Predefined options for the License Type (`LicType`) field. */
const licenseTypeOptions: SelectOption[] = [
    { value: 'Salesperson', label: 'Salesperson' },
    { value: 'Broker', label: 'Broker' },
    { value: 'Company', label: 'Company' },
    { value: 'Officer', label: 'Officer' },
];

/**
 * Base queryable member fields available in the query builder.
 *
 * Each entry maps to a column/property on the iMIS member record. Fields with
 * a `values` array use a select-style editor; fields with a custom `valueEditor`
 * set via {@link CustomValueEditor} use async or pre-fetched options.
 *
 * Multi-select fields (LocalAssnImisId, OfficeImisID, MemberTypeCode, LicType)
 * are restricted to only "in" and "not in" operators.
 */
const baseFields: Field[] = [
    { name: 'LicExpirationdate', label: 'License Expiration Date', inputType: 'date', operators: [{ name: '<=', label: '<=' }, { name: '>=', label: '>=' }, { name: 'between', label: 'between' }] },
    { name: 'LicNumber', label: 'License Number', inputType: 'number' },
    { name: 'LicType', label: 'License Type', values: licenseTypeOptions, operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'LocalAssnImisId', label: 'Local Association', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'MajorKey', label: 'Member ID' },
    { name: 'OfficeImisID', label: 'Office', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'MemberTypeCode', label: 'Member Type', values: memberTypeOptions, operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'PrimaryReLicenseState', label: 'Primary License State' },
    { name: 'StateAssembly', label: 'State Assembly District', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'StateSenate', label: 'State Senate District', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'SecondaryOutOfState', label: 'Secondary Out of State', valueEditorType: 'select', values: [{ name: 'true', label: 'True' }, { name: 'false', label: 'False' }], operators: [{ name: '=', label: '=' }] },
];

/**
 * Additional fields specific to Committee group type.
 */
const committeeFields: Field[] = [
    { name: 'CommitteeCode', label: 'Committee Name', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
    { name: 'PositionCode', label: 'Committee Position', operators: [{ name: 'in', label: 'in' }, { name: 'notIn', label: 'not in' }] },
];

/**
 * Returns the appropriate field list based on the selected group type.
 *
 * @param groupType - The selected group type ("Member", "Committee", or "Dynamic")
 * @returns Field array with committee-specific fields appended if groupType is "Committee"
 */
function getFieldsForGroupType(groupType: string): Field[] {
    if (groupType === 'Committee') {
        return [...baseFields, ...committeeFields];
    }
    return baseFields;
}

export { getFieldsForGroupType, CustomValueEditor };
