import SMSQueryBuilder from './SMSQueryBuilder';
import GroupType from './GroupType';

type Props = {

};



export default function SMS({}: Props) {
    return (
        <div>
            <h1>Send SMS</h1>
            <div className='sms-form'>
                <GroupType onChange={(values) => console.log(values)} />
            </div>
            <SMSQueryBuilder onChange={values => console.log(values)} />
        </div>
    );
}