import { QueryBuilder, ValueEditor, type Field, type ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import MultiSearchSelect from './SearchableSelectorComponent';

const multiSelectFields = new Set(['MemberTypeCode', 'LicType']);

function CustomValueEditor(props: ValueEditorProps) {
    if (multiSelectFields.has(props.field)) {
        return <MultiSearchSelect {...props} />;
    }
    return <ValueEditor {...props} />;
}

const memberTypeOptions : Option[] = [
    { value: 'R', label: 'Realtor®' },
    { value: 'DR', label: 'Designated Realtor®' },
    { value: 'RA', label: 'Realtor® Associate' },
    { value: 'AFF', label: 'Affiliate' },
    { value: 'S', label: 'Staff' },
    { value: 'I', label: 'Institute Affiliate Member' },
    { value: 'L', label: 'LFRO' },
    { value: 'CCO', label: 'Corporate Contact Only' }
]

const licenseTypeOptions: Option[] = [
    { value: 'Salesperson', label: 'Salesperson' },
    { value: 'Broker', label: 'Broker' },
    { value: 'Company', label: 'Company' },
    { value: 'Officer', label: 'Officer'}
]

const fields: Field[] = [
 {
    name: 'FirstName', label: 'First Name', inputType:'text'
 },
 {
    name: 'Email', label: 'Email', inputType:'email'
 },
 {
    name: 'Gender', label: 'Gender'
 },
 {
    name: 'Nickname', label: 'Nickname', inputType: 'text'
 },
 {
    name: 'LastName', label: 'Last Name', inputType: 'text'
 },
 {
    name: 'LicExpirationdate', label: 'License Expiration Date', inputType: 'date'
 },
 {
    name: 'LicNumber', label: 'License Number', inputType: 'number'
 },
 {
    name: 'LicType', label: 'License Type', values: licenseTypeOptions
 },
 {
    name: 'LocalAssnImisId', label: 'Local Association iMIS ID'
 },
 {
    name: 'LocalAssnNRDS', label: 'Local Association ID'
 },
 {
    name: 'MajorKey', label: 'Member ID'
 },
 {
    name: 'Office Name', label: 'Office Name'
 },
 {
    name: 'OfficeImisID', label: 'Office iMIS ID'
 },
 {
    name: 'LocalAssociation', label: 'Local Association '
 },
 {
    name: 'MemberSubclass', label: 'Member Subclass'
 },
 {
    name: 'MemberTypeCode', label: 'Member Type', values: memberTypeOptions
 },
 {
    name: 'PrimaryReLicenseState', label: 'Primary License State'
 },
 {
    name: 'StateAssembly', label: 'State Assembly District'
 },
 {
    name: 'StateSenate', label: 'State Senate District'
 },
 {
    name: 'MiddleName', label: 'Middle Name'
 },
 {
    name: 'MobilePhone', label: 'Mobile Phone'
 },
 {
    name: 'OfficeNRDS', label: 'Office NRDS ID'
 },
 {
    name: 'OccupationName', label: 'Occupation'
 },
 {
    name: 'SecondaryOutOfState', label: 'Secondary Out of State'
 },
 {
    name: 'PreferredPronoun', label: 'Preferred Pronoun'
 }
 
];

const committeeFields: Field[] = [];

export default function SendSMSForm() {

    return (
        <div>
            <QueryBuilder fields={fields} controlElements={{ valueEditor: CustomValueEditor }} />
        </div>
    );
}