/**
 * @fileoverview GroupType component for selecting the SMS recipient group type.
 *
 * Renders a group type selector and, conditionally, a dynamic group selector.
 * Notifies the parent of changes via the {@link Props.onChange} callback.
 *
 * @module components/GroupType
 */

import { useEffect, useState } from 'react';
import { GroupTypes, MemberSelectionWarningMessage } from './utils/FormHelpers';
import api from '../api/Client';

/**
 * The shape of values emitted by the {@link GroupType} component.
 *
 * @property groupType - The selected group type (e.g. `"member"`, `"committee"`, `"dynamic"`).
 * @property groupName - The selected dynamic group name, or `null` if not applicable.
 */
type GroupTypeValues = {
    groupType: string;
    groupName?: string | null;
}

/**
 * Props for the {@link GroupType} component.
 *
 * @property onChange - Callback fired whenever the group type or group name selection changes.
 */
type Props = {
    onChange: (value: GroupTypeValues) => void;
};

/**
 * GroupType component.
 *
 * Fetches available dynamic groups from the iMIS Query API on mount.
 * Displays a performance warning when the `"member"` group type is selected.
 * Reveals the dynamic group selector only when `"dynamic"` is selected.
 *
 * @param props - Component props.
 * @returns The rendered group type selection UI.
 */
export default function GroupTypeInput({ onChange }: Props) {
    const [dynamicGroupTypeOptions, setDynamicGroupTypeOptions] = useState<{ name: string; label: string }[]>([]);
    const [showDynamicGroups, setShowDynamicGroups] = useState<boolean>(false);
    const [memberWarningMessage, setMemberWarningMessage] = useState<string>('');
    const [group, setGroup] = useState<GroupTypeValues>({ groupType: 'member', groupName: null });
    useEffect(() => {
        const fetchOptions = async () => {
            const response = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_DYNAMIC_GROUP_LOOKUP_QUERY } });
            if (response.status !== 200) {
                throw new Error('Failed to fetch group type options');
            }
            setDynamicGroupTypeOptions(response.data.Items.$values.map((c: any) => ({ label: c.label, name: c.value })));
        };
        fetchOptions();
    }, []);

    /**
     * Handles changes to the group type dropdown.
     *
     * Updates the `showDynamicGroups` flag, the member warning message,
     * and fires {@link Props.onChange} with the updated group state.
     *
     * @param groupType - The newly selected group type value.
     */
    const handleGroupTypeChange = (groupType: string) => {
        if (groupType === 'dynamic') {
            setShowDynamicGroups(true);
        } else {
            setShowDynamicGroups(false);
        }
        if (groupType === 'member') {
            setMemberWarningMessage(MemberSelectionWarningMessage);
        } else {
            setMemberWarningMessage('');
        }
        const updated = { ...group, groupType: groupType }
        console.log(`Group Type Changed: ${groupType}`);
        setGroup(updated);
        onChange(updated);
    }

    /**
     * Handles changes to the dynamic group name dropdown.
     *
     * Sets `groupName` to the selected value when the group type is `"dynamic"`,
     * otherwise sets it to `null`. Fires {@link Props.onChange} with the updated state.
     *
     * @param groupName - The newly selected dynamic group name.
     */
    const handleGroupNameChange = (groupName: string) => {
        const updated = { ...group, groupName: group.groupType === 'dynamic' ? groupName : null }
        console.log(group);
        setGroup(updated);
        onChange(updated);
    };


    return (
        <div>
            { (memberWarningMessage !== '') &&
                <div className='node'>
                    <div className="AsiWarning">{memberWarningMessage}</div>
                </div>
            }
            <div className='node'>
                <div className='PanelField Left'>
                    <label htmlFor='groupType'>Group Type</label>
                    <div className='PanelFieldValue'>
                        <select id='groupType' data-required='true' aria-required='true' onChange={e => handleGroupTypeChange(e.target.value)}>
                            <option value=''>Select a Group Type</option>
                            {
                                GroupTypes.map((group) => (
                                    <option key={group.value} value={group.value}>{group.label}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>
            {showDynamicGroups &&
                <div className='node'>
                    <div className='PanelField Left'>
                        <label htmlFor='groupName'>Select a Group</label>
                        <div className='PanelFieldValue'>
                            <select id='groupName' data-required='true' aria-required='true' onChange={e => handleGroupNameChange(e.target.value)}>
                                <option value=''>Select a group</option>
                                {
                                    dynamicGroupTypeOptions.map((group) => (
                                        <option key={group.name} value={group.name}>{group.label}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}