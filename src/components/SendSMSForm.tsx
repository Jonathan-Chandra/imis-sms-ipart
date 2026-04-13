/**
 * @fileoverview Primary SMS composition form for the iMIS SMS iPart.
 *
 * Allows staff to target a member group (Member, Committee, or Dynamic),
 * optionally refine recipients with a query builder, compose a message with
 * emoji support, and submit the payload for processing.
 *
 * Form state is managed by react-hook-form. The `IQA` field is automatically
 * populated based on the selected `GroupClassId` using environment-variable
 * query names.
 *
 * @module components/SendSMSForm
 */

import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type Control, type Resolver, } from 'react-hook-form';
import { SegmentedMessage } from 'sms-segments-calculator';
import { QueryBuilder, type RuleGroupType } from 'react-querybuilder';
import { getFieldsForGroupType, CustomValueEditor } from './QueryBuilderComponent';
import api from '../api/Client';

type SelectOption = { value: string; label: string };

/**
 * Fetches the list of available dynamic groups from the iMIS Query API.
 *
 * Labels returned by the API are in PascalCase and are automatically formatted
 * by inserting a space before each capital letter after the first
 * (e.g. `MemberGroup` → `Member Group`).
 *
 * The query name is read from `VITE_IMIS_DYNAMIC_GROUP_LOOKUP_QUERY`.
 *
 * @returns A promise resolving to the formatted dynamic group options.
 */
async function loadDynamicGroups(): Promise<SelectOption[]> {
    // TODO: replace with actual endpoint
    const res = await api.get('/Query', { params: { QueryName: import.meta.env.VITE_IMIS_DYNAMIC_GROUP_LOOKUP_QUERY, Limit: 500 } });
    return res.data.Items.$values.map((item: SelectOption) => ({
        value: item.value,
        label: item.label.replace(/([A-Z])/g, (m: string, _: string, offset: number) => offset === 0 ? m : ` ${m}`),
    }));
}

/**
 * Payload sent to the iMIS Query API to retrieve recipients.
 *
 * `QueryName` is always required. `Group` is only included for Dynamic group
 * types and identifies the specific dynamic group to target.
 */
type IQA = {
    /** The iMIS IQA query name used to retrieve the recipient list. */
    QueryName: string,
    /** The dynamic group identifier, populated only when `GroupClassId` is `"Dynamic"`. */
    Group?: string,
}

/**
 * Shape of the SMS form submission payload.
 *
 * Fields marked optional may not be set until the user interacts with the
 * relevant form section (e.g. `IQA` is set when a group type is selected,
 * `Query` is set when rules are added to the query builder).
 */
type FormValues = {
    Id: string,
    DagId?: string | null,
    DagRunId?: string | null,
    GroupClassId: "Member" | "Committee" | "Dynamic",
    GroupClassSubType: string,
    IQA?: IQA | null,
    GroupId?: string | null,
    Query?: RuleGroupType | null,
    Message: string,
    Ordinal: number,
    QueuedAt?: Date,
    RecipientId?: string,
    TriggeredBy?: string,
    TriggeringUsername?: string
}

const maxMessageLength = 160;

/**
 * Displays the number of characters remaining in the SMS message field.
 *
 * Detects the encoding (GSM-7 or UCS-2) using `sms-segments-calculator` and
 * adjusts the limit accordingly: 160 chars for GSM-7, 70 chars for UCS-2.
 *
 * @param props.control - The react-hook-form control object from the parent form.
 * @returns A `<span>` showing how many characters the user can still type.
 */
function MessageSegmentCounter({ control }: { control: Control<FormValues> }) {
    const message = useWatch({ control, name: 'Message' }) ?? '';

    const segmented = message ? new SegmentedMessage(message) : null;
    const encoding = segmented?.encodingName ?? 'GSM-7';
    const totalChars = segmented?.numberOfCharacters ?? 0;
    const limit = encoding === 'GSM-7' ? 160 : 70;
    const remaining = limit - totalChars;

    return <span>{remaining} characters remaining.</span>;
}

/**
 * Custom react-hook-form resolver that validates the form submission.
 *
 * Rules:
 * - `GroupClassId` must be selected
 * - `GroupId` must be selected when `GroupClassId` is `"Dynamic"`
 * - `Message` must not be empty
 */
const resolver: Resolver<FormValues> = async (values) => {
    const errors: Record<string, { type: string; message: string }> = {};

    if (!values.GroupClassId) {
        errors.GroupClassId = { type: 'required', message: 'Group type is required.' };
    }

    if (values.GroupClassId === 'Dynamic' && !values.GroupId) {
        errors.GroupId = { type: 'required', message: 'A dynamic group must be selected.' };
    }

    if (!values.Message?.trim()) {
        errors.Message = { type: 'required', message: 'Message is required.' };
    }

    return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
    };
}
/**
 * Root form component for composing and submitting an SMS to a member group.
 *
 * Behaviour summary:
 * - Selecting a **Group Type** populates `IQA.QueryName` automatically and
 *   reveals the query builder for further recipient filtering.
 * - Selecting **Dynamic** additionally shows a pre-fetched dropdown of dynamic
 *   groups and sets `IQA.Group` when one is chosen.
 * - The **Message** field enforces a 160-character limit (70 for UCS-2) and
 *   includes an emoji picker that inserts at the cursor position.
 *
 * On submit the full `FormValues` payload is logged to the console.
 *
 * @returns The rendered SMS composition form.
 */
export default function SendSMSForm() {
    const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormValues>({ resolver, defaultValues: { Message: '' } });

    useEffect(() => {
const id = new URLSearchParams(window.location.search).get('Id') ?? '';
        console.log('Resolved ID:', id);
        setValue('Id', id);
    }, []);
    const submitForm = async (_data: FormValues) => {
        // add submit logic here
    };
    const onSubmit = handleSubmit(submitForm);
    const [pickerOpen, setPickerOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [groupClassId, setGroupClassId] = useState('');
    const queryBuilderVisible = !!groupClassId;
    const [dynamicGroups, setDynamicGroups] = useState<SelectOption[]>([]);

    useEffect(() => {
        loadDynamicGroups().then(setDynamicGroups).catch(() => {});
    }, []);

    return (
        <form onSubmit={onSubmit}>
            <input type="hidden" {...register('Id')} />
            <div className="node">
                <h5>Send SMS To</h5>
            </div>
            <div className="node">
                <div className="PanelField Left">
                    <label>Group Type:</label>
                    <div className="PanelFieldValue">
                        <select {...register("GroupClassId", {
                            onChange: (e) => {
                const val = e.target.value;
                setGroupClassId(val);
                const queryNameMap: Record<string, string> = {
                    Member: import.meta.env.VITE_IMIS_SMS_MEMBER_GROUP_QUERY,
                    Committee: import.meta.env.VITE_IMIS_SMS_COMMITTEE_GROUP_QUERY,
                    Dynamic: import.meta.env.VITE_IMIS_SMS_DYNAMIC_GROUP_QUERY,
                };
                const iqa: IQA | null = val ? { QueryName: queryNameMap[val] } : null;
                setValue('IQA', iqa);
                console.log('GroupClassId changed:', val, '| IQA set to:', iqa);
            }
                        })}>
                            <option value="">Select Group Type</option>
                            <option value="Member">Member</option>
                            <option value="Committee">Committee</option>
                            <option value="Dynamic">Dynamic</option>
                        </select>
                        {errors.GroupClassId && <span style={{ color: 'red' }}>{errors.GroupClassId.message}</span>}
                    </div>
                </div>
            </div>
            {groupClassId === 'Dynamic' && (
                <div className="node">
                    <div className="PanelField Left">
                        <label>Dynamic Group:</label>
                        <div className="PanelFieldValue">
                            <select {...register("GroupId", {
                                onChange: (e) => {
                                    const group = e.target.value;
                                    const iqa: IQA = { QueryName: import.meta.env.VITE_IMIS_SMS_DYNAMIC_GROUP_QUERY, Group: group };
                                    setValue('IQA', iqa);
                                    console.log('Dynamic Group changed:', group, '| IQA set to:', iqa);
                                }
                            })}>
                                <option value="">Select a group</option>
                                {dynamicGroups.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                            {errors.GroupId && <span style={{ color: 'red' }}>{errors.GroupId.message}</span>}
                        </div>
                    </div>
                </div>
            )}
            {queryBuilderVisible && (
                <div className="node">
                    <div className="PanelField Left">
                        <Controller
                            name="Query"
                            control={control}
                            render={({ field }) => (
                                <QueryBuilder
                                    fields={getFieldsForGroupType(groupClassId)}
                                    controlElements={{ valueEditor: CustomValueEditor }}
                                    query={field.value ?? { combinator: 'and', rules: [] }}
                                    onQueryChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            )}
            <div className="node">
                <div className="PanelField Left">
                    <label>Message:</label>
                    <div className="PanelFieldValue" style={{ position: 'relative' }}>
                        <Controller
                            name="Message"
                            control={control}
                            rules={{ required: true, maxLength: maxMessageLength }}
                            render={({ field }) => (
                                <>
                                    <textarea
                                        maxLength={maxMessageLength}
                                        value={field.value ?? ''}
                                        onChange={(e) => { field.onChange(e); console.log('Form values:', getValues()); }}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={(el) => {
                                            field.ref(el);
                                            textareaRef.current = el;
                                        }}
                                    />
                                    <MessageSegmentCounter control={control} />
                                    {errors.Message && <span style={{ color: 'red' }}>{errors.Message.message}</span>}
                                    <button
                                        className="Button TextButton"
                                        type="button"
                                        onClick={() => setPickerOpen((o) => !o)}
                                        aria-label="Insert emoji"
                                    >
                                        😀
                                    </button>
                                    {pickerOpen && (
                                        <div style={{ position: 'absolute', zIndex: 10 }}>
                                            <EmojiPicker
                                                onEmojiClick={(emoji: EmojiClickData) => {
                                                    const current = field.value ?? '';
                                                    // Don't let emoji insertion blow past the cap
                                                    if (current.length + emoji.emoji.length > maxMessageLength) {
                                                        return;
                                                    }
                                                    const el = textareaRef.current;
                                                    if (!el) {
                                                        field.onChange(current + emoji.emoji);
                                                        return;
                                                    }
                                                    const start = el.selectionStart ?? current.length;
                                                    const end = el.selectionEnd ?? current.length;
                                                    const next =
                                                        current.slice(0, start) +
                                                        emoji.emoji +
                                                        current.slice(end);
                                                    field.onChange(next);
                                                    requestAnimationFrame(() => {
                                                        el.focus();
                                                        const pos = start + emoji.emoji.length;
                                                        el.setSelectionRange(pos, pos);
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="node">
                <button type="submit">Send SMS</button>
            </div>
        </form>
    );
}