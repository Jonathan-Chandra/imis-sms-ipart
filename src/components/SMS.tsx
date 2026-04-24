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
import { useEffect, useState } from 'react';
import { GroupTypes, SMSQueryBuilderCommitteeFields, SMSQueryBuilderFields } from './utils/FormHelpers';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, defaultRuleProcessorSQL } from 'react-querybuilder';
import api from '../api/Client';
import axios from 'axios';

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
    const params = new URLSearchParams(window.location.search);
    const requestedGroupType = params.get('groupType');
    const urlGroupType = requestedGroupType === 'dynamic' ? '' : GroupTypes.find(g => g.value === requestedGroupType)?.value ?? '';

    const [showForm, setShowForm] = useState<boolean>(urlGroupType !== '');
    const [group, setGroup] = useState<{ groupType: string; groupName?: string | null }>({ groupType: urlGroupType, groupName: null });
    const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });
    const [message, setMessage] = useState<string>('');
    const [id, setId] = useState<string>('');
    const [queryFieldValues, setQueryFieldValues] = useState<Field[]>(urlGroupType === 'committee' ? SMSQueryBuilderCommitteeFields : SMSQueryBuilderFields);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState<boolean>(false);
    const [submissionMessage, setSubmissionMessage] = useState<string>('');
    const [isTest, setIsTest] = useState<boolean>(false);

    useEffect(() => {
        const fetchLoggedInUser = async () => {
            const response = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_GET_LOGGED_IN_USER } });
            if (response.status !== 200) {
                throw new Error('Failed to fetch logged in user');
            }
            setId(response.data.Items.$values[0].ID);
        };
        fetchLoggedInUser();
    }, []);

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
        setGroup(values);
        setQueryFieldValues(values.groupType === 'committee' ? SMSQueryBuilderCommitteeFields : SMSQueryBuilderFields);
    }

    const submitForm = async () => {
        if (isSubmitting || hasSubmittedSuccessfully) {
            return;
        }
        setIsSubmitting(true);
        setSubmissionMessage('');
        //add submit logic here
        const iqaQueryNames: Record<string, string> = {
            member: import.meta.env.VITE_IMIS_SMS_MEMBER_GROUP_QUERY,
            committee: import.meta.env.VITE_IMIS_SMS_COMMITTEE_GROUP_QUERY,
        };
        const payload = {
            Id: id,
            Group: {
                GroupType: group.groupType,
                GroupName: group.groupName,
            },
            Query: formatQuery(query, {
                format: 'sql',
                ruleProcessor: (rule, options) => defaultRuleProcessorSQL({ ...rule, field: `mp."${rule.field}"` }, { ...options, quoteFieldNamesWith: ['', ''] }),
            }),
            Message: message,
            Test: isTest,
            Iqa: {
                QueryName: iqaQueryNames[group.groupType] ?? null,
                Params: null,
            },
        };
        console.log(JSON.stringify(payload, null, 2));
        try {
            const token = await axios.post(`${import.meta.env.VITE_AIRFLOW_BASE_URL}/auth/token`, {
                username: import.meta.env.VITE_AIRFLOW_USERNAME,
                password: import.meta.env.VITE_AIRFLOW_PASSWORD,
            });
            console.log(token.data);
            const bearer_token = `Bearer ${token.data.access_token}`;
            const response = await axios.post(`${import.meta.env.VITE_AIRFLOW_BASE_URL}/api/v2/dags/imis_twilio_sms/dagRuns`,
                {
                    logical_date: new Date().toISOString(),
                    conf: payload
                }, {
                headers: {
                    Authorization: bearer_token,
                },
            });
            console.log(response.data);
            setHasSubmittedSuccessfully(true);
            setSubmissionMessage('SMS job submitted successfully.');
        } catch (error) {
            setSubmissionMessage('Failed to submit SMS job. Please try again.');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1>Send SMS</h1>
            <div className='sms-form'>
                <GroupTypeInput initialGroupType={urlGroupType} onChange={(values) => setGroupValues(values)} />
            </div>

            <div className={`form-section ${showForm ? 'visible' : 'hidden'}`}>
                <SMSQueryBuilder fields={queryFieldValues} onChange={values => setQuery(values)} />
                <SMSMessageInput onChange={values => setMessage(values)} />
                <div className='node'>
                    <div className='PanelField Left'>
                        <label htmlFor='isTest'>Test Mode</label>
                        <div className='PanelFieldValue sms-test-mode-switch-host'>
                            <label className='switch'>
                                <input id='isTest' type='checkbox' checked={isTest} onChange={e => setIsTest(e.target.checked)} />
                                <span className='slider round'></span>
                            </label>
                        </div>
                    </div>
                </div>
                <button type='button' className="Button TextButton" onClick={submitForm} disabled={isSubmitting || hasSubmittedSuccessfully}>
                    {hasSubmittedSuccessfully ? 'Submitted' : isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                {submissionMessage !== '' && <p>{submissionMessage}</p>}
                {hasSubmittedSuccessfully && (
                    <button type="button" className="Button TextButton" onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                )}
            </div>

        </div>
    );
}