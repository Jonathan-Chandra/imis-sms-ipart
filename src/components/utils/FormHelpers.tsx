/**
 * @fileoverview Shared form helper constants and utility functions.
 *
 * Provides lookup functions, static option lists, and query builder field
 * definitions used across SMS form components.
 *
 * @module components/utils/FormHelpers
 */

import api from "../../api/Client";
import { type Field, type OptionList } from 'react-querybuilder';

/**
 * Fetches a list of selectable options from the iMIS Query API.
 *
 * @param queryPath - The iMIS query name path to execute.
 * @param params - Additional query parameters to include in the request.
 * @returns A promise resolving to an {@link OptionList} of `{ label, name }` pairs.
 * @throws {Error} If the request fails or the response contains no items.
 */
export const SelectorValue = async (queryPath: string, params: object): Promise<OptionList> => {
    const response = await api.get(`/Query?QueryName=${queryPath}`, params);
    if (response.status !== 200) {
        throw new Error(`Failed to fetch selector values for ${queryPath}`);
    }
    const selectionList = response.data.Items.$values;
    if (!selectionList) {
        throw new Error(`No selection list found for ${queryPath}`);
    }
    return selectionList.map((c: any) => ({ label: c.label, name: c.value })) as OptionList;
}

/**
 * Fetches the list of available associations from the iMIS Query API.
 *
 * @returns A promise resolving to an {@link OptionList} of association options.
 */
export const AssociationList = async (): Promise<OptionList> => {
    return await SelectorValue(import.meta.env.VITE_IMIS_ASSOCIATION_LOOKUP_QUERY, {});
}

/**
 * Fetches the list of available committees from the iMIS Query API.
 *
 * @returns A promise resolving to an {@link OptionList} of committee options.
 */
export const CommitteeList = async (): Promise<OptionList> => {
    return await SelectorValue(import.meta.env.VITE_IMIS_COMMITTEE_LOOKUP_QUERY, {});
}

export const StateList = async (): Promise<OptionList> => {
    return await SelectorValue(import.meta.env.VITE_IMIS_STATE_LOOKUP_QUERY, {});
}

/**
 * Fetches the list of available committee positions from the iMIS Query API.
 *
 * @returns A promise resolving to an {@link OptionList} of committee position options.
 */
export const CommitteePositionList = async (): Promise<OptionList> => {
    return await SelectorValue(import.meta.env.VITE_IMIS_COMMITTEE_POSITION_LOOKUP_QUERY, {});
}

/** Static list of iMIS member type options with display labels and code values. */
export const MemberTypes = [
    { label: 'Affiliate (AFF)', name: 'AFF' },
    { label: 'Corporate Contact Only (CCO)', name: 'CCO' },
    { label: 'Institute Affiliate Member (I)', name: 'I' },
    { label: 'LFRO (L)', name: 'L' },
    { label: 'Mortgage Loan Originator (MLO)', name: 'MLO' },
    { label: 'Non-Member (N)', name: 'N' },
    { label: 'REALTOR® (R)', name: 'R' },
    { label: 'Designated REALTOR® (DR)', name: 'DR' },
    { label: 'REALTOR® Associate (RA)', name: 'RA' },
    { label: 'Staff (S)', name: 'S' },
]

/** Static list of iMIS member status options with display labels and code values. */
export const MemberStatus = [{ label: 'Active (A)', name: 'A' },
{ label: 'Inactive (I)', name: 'I' },
{ label: 'Provisional (P)', name: 'P' },
{ label: 'Terminated (T)', name: 'T' },
{ label: 'Deceased (X)', name: 'X' }]

/** Static list of gender options. */
export const Gender = [
    { label: 'Male (M)', name: 'M' },
    { label: 'Female (F)', name: 'F' }
]

/**
 * Field definitions for the SMS query builder.
 *
 * Each entry maps an iMIS database column name to a human-readable label
 * for use in the react-querybuilder UI.
 */
export const SMSQueryBuilderFields: Field[] = [
    { name: 'FIRST_NAME', label: 'First Name' },
    { name: 'LAST_NAME', label: 'Last Name' },
    { name: 'GENDER', label: 'Gender', valueEditorType: 'multiselect' },
    { name: 'INFORMAL', label: 'Nickname' },
    { name: 'MAJOR_KEY', label: 'NRDS ID', valueEditorType: 'multiselect' },
    { name: 'LICENSE_NUMBER', label: 'License Number' },
    { name: 'PRIMARY_OFFICE', label: 'Office', valueEditorType: 'multiselect' },
    { name: 'LOCAL_ASSOCIATION', label: 'Local Association', valueEditorType: 'multiselect' },
    { name: 'MEMBER_TYPE_CODE', label: 'Member Type', valueEditorType: 'multiselect' },
    { name: 'SECONDARY_OUT_OF_STATE', label: 'Secondary Out of State', valueEditorType: 'multiselect' },
    { name: 'LICENSE_STATE', label: 'License State', valueEditorType: 'multiselect' },
    { name: 'JOIN_DATE', label: 'Join Date' },

];

/**
 * Field definitions for the SMS query builder when the Committee group type is selected.
 *
 * Extends {@link SMSQueryBuilderFields} with committee-specific fields for
 * filtering by committee name and position.
 */
export const SMSQueryBuilderCommitteeFileds: Field[] = [...SMSQueryBuilderFields,
{ name: 'COMMITTEE_NAME', label: 'Committee Name', valueEditorType: 'multiselect' },
{ name: 'COMMITTEE_POSITION', label: 'Committee Position', valueEditorType: 'multiselect' },
]

/** Static list of available SMS recipient group types. */
export const GroupTypes = [
    {
        label: 'Member',
        value: 'member'
    },
    {
        label: 'Committee',
        value: 'committee'
    },
    {
        label: 'Dynamic',
        value: 'dynamic'
    }
]

/**
 * Warning message displayed when the Member group type is selected.
 *
 * Informs the user that member-based queries are resource-intensive
 * and may result in significantly delayed SMS delivery.
 */
export const MemberSelectionWarningMessage: string = "Selecting the Members group type will result in longer processing times and delayed SMS delivery. It is recommended you use a different group type if possible."


/**
 * Async load function for office options, intended for use with `AsyncSelect`.
 *
 * If the input matches the pattern `X` followed by two digits (e.g. `X12`),
 * searches by `MajorKey`; otherwise searches by `FullName`.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` office options.
 * @throws {Error} If the request fails.
 */
export const LoadOfficeOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = {};
    if (/^X\d{2}/.test(inputValue)) {
        params = { MajorKey: inputValue };
    }
    else {
        params = { FullName: inputValue };
    }
    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_OFFICE_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch office options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}

/**
 * Async load function for member options, intended for use with `AsyncSelect`.
 *
 * If the input is fully numeric, searches by `MajorKey` (NRDS ID);
 * otherwise searches by `FullName`.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` member options.
 * @throws {Error} If the request fails.
 */
export const LoadMemberOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = {};
    if (/^\d+$/.test(inputValue)) {
        params = { MajorKey: inputValue };
    }
    else {
        params = { FullName: inputValue };
    }

    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_MEMBER_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch member options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}


/**
 * Async load function for association options, intended for use with `AsyncSelect`.
 *
 * If the input is fully numeric, searches by `MajorKey`;
 * otherwise searches by `FullName`.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` association options.
 * @throws {Error} If the request fails.
 */
export const LoadAssociationOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = {};
    if (/^\d+$/.test(inputValue)) {
        params = { MajorKey: inputValue };
    }
    else {
        params = { FullName: inputValue };
    }
    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_ASSOCIATION_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch association options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}

/**
 * Async load function for committee options, intended for use with `AsyncSelect`.
 *
 * Searches simultaneously by `Title` and `Code` using the input value.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` committee options.
 * @throws {Error} If the request fails.
 */
export const LoadCommitteeOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = { Title: inputValue, Code: inputValue };
    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_COMMITTEE_NAME_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch committee options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}

/**
 * Async load function for committee position options, intended for use with `AsyncSelect`.
 *
 * Searches simultaneously by `Title` and `PositionCode` using the input value.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` committee position options.
 * @throws {Error} If the request fails.
 */
export const LoadCommitteePositionOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = { Title: inputValue, PositionCode: inputValue };
    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_COMMITTEE_POSITION_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch committee position options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}

/**
 * Async load function for US state options, intended for use with `AsyncSelect`.
 *
 * Searches by `Title` and `PositionCode` using the input value.
 *
 * @param inputValue - The search string entered by the user.
 * @returns A promise resolving to an array of `{ label, value }` state options.
 * @throws {Error} If the request fails.
 */
export const LoadStateOptions = async (inputValue: string): Promise<{ label: string, value: string }[]> => {
    let params = { Title: inputValue, PositionCode: inputValue };
    const response = await api.get(`/Query?QueryName=${import.meta.env.VITE_IMIS_STATE_LOOKUP_QUERY}`, { params: params });
    if (response.status !== 200) {
        throw new Error('Failed to fetch state options');
    }
    return response.data.Items.$values.map((c: any) => ({ label: c.label, value: c.value }));
}

/**
 * Maps query builder field names to their corresponding async load functions
 * for use with {@link AsyncQueryBuilderMultiSelect}.
 *
 * Fields with static options (e.g. `GENDER`, `MEMBER_TYPE_CODE`) return their
 * values immediately without a network request. Fields backed by iMIS queries
 * fetch results dynamically based on the user's input.
 */
export const LoadOptionsMap: Record<string, (inputValue: string) => Promise<{ label: string, value: string }[]>> = {
    'PRIMARY_OFFICE': LoadOfficeOptions,
    'LOCAL_ASSOCIATION': LoadAssociationOptions,
    'PRIMARY_STATE_ASSOCIATION_ID': LoadAssociationOptions,
    'MAJOR_KEY': LoadMemberOptions,
    'COMMITTEE_NAME': LoadCommitteeOptions,
    'COMMITTEE_POSITION': LoadCommitteePositionOptions,
    'GENDER': async () => Gender.map(g => ({ label: g.label, value: g.name })),
    'MEMBER_TYPE_CODE': async () => MemberTypes.map(m => ({ label: m.label, value: m.name })),
    'SECONDARY_OUT_OF_STATE': async () => [{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }],
    'LICENSE_STATE': LoadStateOptions
}