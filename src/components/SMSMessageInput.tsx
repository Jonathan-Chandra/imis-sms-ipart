/**
 * @fileoverview SMSMessageInput component for composing the SMS message body.
 *
 * Renders a textarea with an emoji picker and a live remaining-character counter.
 * Automatically switches the character limit from 160 (GSM-7) to 70 (UCS-2)
 * when the message contains any emoji characters. Notifies the parent of
 * message changes via the {@link Props.onChange} callback.
 *
 * @module components/SMSMessageInput
 */

import { useCallback, useRef, useState } from "react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

/**
 * Props for the {@link SMSMessageInput} component.
 *
 * @property onChange - Callback fired whenever the message text changes.
 *   Receives the full current message string.
 */
type Props = {
    onChange: (value: any) => void;
}

/** Maximum character count for a single SMS segment without emojis (GSM-7 encoding). */
const SMS_MESSAGE_LENGTH = 160;

/** Maximum character count for a single SMS segment when the message contains emojis (UCS-2 encoding). */
const SMS_MESSAGE_LENGTH_WITH_EMOJIS = 70;

/**
 * SMSMessageInput component.
 *
 * Tracks cursor position so emojis are inserted at the caret rather than
 * appended. Character counting uses `Array.from` spread to correctly count
 * multi-byte Unicode characters (including emojis) as single characters.
 *
 * @param props - Component props.
 * @returns The rendered message composition UI.
 */
export default function SMSMessageInput({ onChange }: Props) {
    const [message, setMessage] = useState<string>('');
    const [messageLength, setMessageLength] = useState<number>(SMS_MESSAGE_LENGTH);
    const [showEmojiWarning, setShowEmojiWarning] = useState<boolean>(false);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const cursorRef = useRef(0);

    /** Saves the current textarea cursor position to `cursorRef` on blur. */
    const savePosition = () => { cursorRef.current = messageRef.current?.selectionStart ?? 0 };

    /** Tracks the textarea cursor position on key/mouse events for accurate emoji insertion. */
    const trackPosition = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement>) => { cursorRef.current = (e.target as HTMLInputElement).selectionStart ?? 0 }

    /**
     * Handles changes to the message textarea.
     *
     * Updates the remaining character count, shows a UCS-2 encoding warning
     * if the message contains emojis, and fires {@link Props.onChange}.
     *
     * @param value - The full updated message string.
     */
    const handleMessageChange = (value: string) => {
        if(!hasEmoji(value))
        {
            setMessageLength(SMS_MESSAGE_LENGTH - value.length);
            setShowEmojiWarning(false);
        }
        else {
            setMessageLength(SMS_MESSAGE_LENGTH_WITH_EMOJIS - [...value].length);
            setShowEmojiWarning(true);
        }
        setMessage(value);
        onChange(value);
    }
    /**
     * Returns `true` if the message contains at least one emoji character.
     *
     * Uses the Unicode `\p{Emoji}` property class to detect emoji codepoints.
     *
     * @param message - The message string to test.
     */
    const hasEmoji = (message: string) => {
        return /\p{Emoji}/u.test(message);
    }

    /**
     * Inserts an emoji string at the current cursor position.
     *
     * Splices the emoji into the message at `cursorRef`, advances the cursor
     * past the inserted characters, and restores focus to the textarea.
     *
     * @param emoji - The native emoji string to insert (e.g. `"😊"`).
     */
    const insertEmoji = useCallback((emoji: string) => {
        const pos = cursorRef.current;
        const newValue = message.slice(0, pos) + emoji + message.slice(pos);
        handleMessageChange(newValue);

        const newPos = pos + emoji.length;
        cursorRef.current = newPos;

        requestAnimationFrame(() => {
            messageRef.current?.setSelectionRange(newPos, newPos);
            messageRef.current?.focus();
        });
        setShowPicker(false);
    }, [message]);

    return (
        <div>
            <div className='node'>
                <div className='PanelField Left'>
                    <label htmlFor="smsMessage">Message</label>
                    <div className='PanelFieldValue'>
                        <textarea id="smsMessage" ref={messageRef} value={message} onChange={e => handleMessageChange(e.target.value)} onBlur={savePosition} onKeyUp={trackPosition} onMouseUp={trackPosition} style={{ width: '100%' }}/>
                        <button type='button' onClick={() => setShowPicker(p => !p)}>😊</button>

                        {showPicker && (
                            <EmojiPicker
                                onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
                                emojiStyle={EmojiStyle.NATIVE}
                                emojiVersion="14.0"
                            />
                        )}
                    </div>
                </div>
            </div>
            { showEmojiWarning &&
                (<div className='node'>
                <div className='AsiWarning'>Using emojis will reduce the max length of your SMS message from 160 to 70 characters.</div>
                </div>)}
            <div>Remaining Characters: {messageLength}</div>
        </div>)
}