import SMSQueryBuilder from './SMSQueryBuilder';
import GroupTypeInput from './GroupTypeInput';
import SMSMessageInput from './SMSMessageInput';
import { useState } from 'react';
import { SMSQueryBuilderCommitteeFields, SMSQueryBuilderFields } from './utils/FormHelpers';
import type { Field } from 'react-querybuilder';

type Props = {

};


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