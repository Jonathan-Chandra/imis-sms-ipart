/**
 * @fileoverview Root SMS form component.
 *
 * Orchestrates group type selection, query builder filtering, and message
 * composition. Conditionally shows the query builder and message input once
 * a group type has been selected.
 *
 * @module components/SMS
 */

import SMSQueryBuilder from './SMSQueryBuilder';
import GroupTypeInput from './GroupTypeInput';
import SMSMessageInput from './SMSMessageInput';
import { useState } from 'react';
import { SMSQueryBuilderCommitteeFields, SMSQueryBuilderFields } from './utils/FormHelpers';
import type { Field } from 'react-querybuilder';

type Props = {

};

/**
 * The shape of the full SMS payload assembled by this form.
 *
 * @property Group.GroupName - The selected dynamic group name (if applicable).
 * @property Group.GroupType - The selected group type (`"member"`, `"committee"`, or `"dynamic"`).
 * @property Query.QueryName - The iMIS query name used to fetch recipients.
 * @property Query.Params - Optional parameters passed to the recipient query.
 * @property QueryBuilder - The raw react-querybuilder rule group output.
 * @property Message - The composed SMS message text.
 * @property SenderId - The SMS sender ID / originating number.
 */
type SMS = {
    Group: {
        GroupName: string,
        GroupType: string
    },
    Query: {
        QueryName: string,
        Params?: object | null
    }
    QueryBuilder: any,
    Message: string
    SenderId: string
}

/**
 * SMS root component.
 *
 * Manages top-level form state: which group type is selected and which
 * query builder field set to display. The query builder and message input
 * are hidden until a valid group type is chosen.
 *
 * @returns The rendered SMS composition form.
 */
export default function SMS({ }: Props) {
    const [showForm, setShowForm] = useState<boolean>(false);
    // const [sms, setSMS] = useState<SMS>({
    //     Group: {
    //         GroupName: '',
    //         GroupType: '',
    //     },
    //     Query: {
    //         QueryName: '',
    //         Params: {}
    //     },
    //     QueryBuilder: null,
    //     Message: '',
    //     SenderId: ''
    // });
    const [queryFieldValues, setQueryFieldValues] = useState<Field[]>(SMSQueryBuilderFields)

    /**
     * Handles group type changes from {@link GroupTypeInput}.
     *
     * Shows or hides the lower form section and switches the query builder
     * field set between the standard member fields and the committee-extended
     * fields based on the selected group type.
     *
     * @param values - The updated group type and optional group name.
     */
    const setGroupValues = (values: { groupType: string; groupName?: string | null; }) => {

        if (values.groupType !== '' && values.groupType !== null) {
            setShowForm(true);
        }
        else {
            setShowForm(false);
        }
        console.log('setGroupValues called:', values, 'showForm will be:', values.groupType !== '');
        setQueryFieldValues(values.groupType === 'committee' ? SMSQueryBuilderCommitteeFields : SMSQueryBuilderFields);
    }

    return (
        <div>
            <h1>Send SMS</h1>
            <div className='sms-form'>
                <GroupTypeInput onChange={(values) => setGroupValues(values)} />
            </div>

            <div className={`form-section ${showForm ? 'visible' : 'hidden'}`}>
                <SMSQueryBuilder fields={queryFieldValues} onChange={values => console.log(values)} />
                <SMSMessageInput onChange={values => console.log(values)} />
                <button>Submit</button>
            </div>

        </div>
    );
}