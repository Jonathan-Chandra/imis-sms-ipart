import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch, type Control, type Resolver, } from 'react-hook-form';
import { SegmentedMessage } from 'sms-segments-calculator';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';

type FormValues = {
    Id: string,
    DagId?: string | null,
    DagRunId?: string | null,
    GroupClassId: "Association" | "Committee" | "Other",
    GroupClassSubType: string,
    QueryName?: string | null,
    GroupId?: string | null,
    Message: string,
    Ordinal: number,
    QueuedAt?: Date,
    RecipientId?: string,
    TriggeredBy?: string,
    TriggeringUsername?: string
}


const genericFields: Field[] = [
    
]

const maxMessageLength = 160;

function MessageSegmentCounter({ control }: { control: Control<FormValues> }) {
    const message = useWatch({ control, name: 'Message' }) ?? '';

    const segmented = message ? new SegmentedMessage(message) : null;
    const encoding = segmented?.encodingName ?? 'GSM-7';
    const totalChars = segmented?.numberOfCharacters ?? 0;
    const limit = encoding === 'GSM-7' ? 160 : 70;
    const remaining = limit - totalChars;

    return <span>{remaining} characters remaining.</span>;
}

const resolver: Resolver<FormValues> = async (values) => {
    return {
        values: values.GroupClassId ? values : {},
        errors: !values.GroupClassId ? {
            GroupClassId: {
                type: 'required',
                message: 'You must select a group type before proceeding.',
            } 
        } : {},
    };
}
export default function SendSMSForm() {
    const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });
    const { register, control, handleSubmit } = useForm<FormValues>({ resolver, defaultValues: {Message: ''} });
    const onSubmit = handleSubmit((data) => console.log(data)) ;
    const [pickerOpen, setPickerOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    return (
        <form onSubmit={onSubmit}>
            <div className="node">
                <h5>Send SMS To</h5>
            </div>
            <div className="node">
                <div className="PanelField Left">
                    <label>Group Type:</label>
                    <div className="PanelFieldValue">
                    <select {...register("GroupClassId")}>
                        <option value="">Select Group Type</option>
                        <option value="Association">Association</option>
                        <option value="Committee">Committee</option>
                        <option value="Other">Other</option>
                    </select>
                    </div>
                </div>
            </div>
            <div className="node">
                <div className="PanelField Left">
                    <label>Group Type:</label>
                    <div className="PanelFieldValue">
                    <select {...register("GroupClassId")}>
                        <option value="">Select Group Type</option>
                        <option value="Association">Association</option>
                        <option value="Committee">Committee</option>
                        <option value="Other">Other</option>
                    </select>
                    </div>
                </div>
            </div>
            <div className="node">
                <div className="PanelField Left">
                        <QueryBuilder fields={genericFields} query={query} onQueryChange={setQuery} />
                </div>
            </div>
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
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={(el) => {
                                            field.ref(el);
                                            textareaRef.current = el;
                                        }}
                                    />
                                    <MessageSegmentCounter control={control} />
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