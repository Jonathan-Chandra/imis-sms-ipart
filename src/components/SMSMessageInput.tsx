import { useCallback, useRef, useState } from "react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

type Props = {
    onChange: (value: any) => void;
}

const SMS_MESSAGE_LENGTH = 160;
const SMS_MESSAGE_LENGTH_WITH_EMOJIS = 70;

export default function SMSMessageInput({ onChange }: Props) {
    const [message, setMessage] = useState<string>('');
    const [messageLength, setMessageLength] = useState<number>(SMS_MESSAGE_LENGTH);
    const [showEmojiWarning, setShowEmojiWarning] = useState<boolean>(false);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const cursorRef = useRef(0);

    const savePosition = () => { cursorRef.current = messageRef.current?.selectionStart ?? 0 };
    const trackPosition = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement>) => { cursorRef.current = (e.target as HTMLInputElement).selectionStart ?? 0 }
    const handleMessageChange = (value: string) => {
        if(!hasEmoji(value))
        {
            setMessageLength(SMS_MESSAGE_LENGTH - value.length);
        }
        else {
            setMessageLength(SMS_MESSAGE_LENGTH_WITH_EMOJIS - [...value].length);
            setShowEmojiWarning(true);
        }
        setMessage(value);
        onChange(message);
    }
    const hasEmoji = (message: string) => {
        return /\p{Emoji}/u.test(message);
    } 
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

                        {showPicker && (<Picker
                            data={data}
                            onEmojiSelect={(emoji: any) => insertEmoji(emoji.native)}
                            set="native"
                            emojiVersion={14}   // only show emojis from Unicode 14 and below (widely supported)
                        />)}
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