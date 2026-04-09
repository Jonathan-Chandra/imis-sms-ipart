declare module 'sms-segments-calculator' {
    export type SmsEncoding = 'GSM-7' | 'UCS-2';
    export type SmsEncodingOption = SmsEncoding | 'auto';

    export interface EncodedChar {
        raw: string;
        code: number;
        isGSM7: boolean;
    }

    export interface MessageSegment {
        sizeInBits: number;
        hasUserDataHeader: boolean;
        hasTwilioReservedBits: boolean;
        charCount: number;
    }

    export class SegmentedMessage {
        constructor(
            message: string,
            encoding?: SmsEncodingOption,
            smartEncoding?: boolean
        );

        /** The original message body */
        readonly message: string;

        /** Encoding actually used: "GSM-7" or "UCS-2" */
        readonly encodingName: SmsEncoding;

        /** Number of segments the message will be split into */
        readonly segmentsCount: number;

        /** Number of characters in the message */
        readonly numberOfCharacters: number;

        /** Number of Unicode scalars in the message */
        readonly numberOfUnicodeScalars: number;

        /** Total size of the message in bits, including User Data Header */
        readonly totalSize: number;

        /** Size of the message in bits, excluding User Data Header */
        readonly messageSize: number;

        /** Array of segments, each describing its size and metadata */
        readonly segments: MessageSegment[];

        /** Encoded representation of each character in the message */
        readonly encodedChars: EncodedChar[];

        /**
         * Returns an array of non-GSM-7 characters found in the body.
         * Useful for suggesting replacements to reduce segment count.
         */
        getNonGsmCharacters(): string[];
    }

    export type RcsRegion = 'us' | 'international';
    export type RcsMessageType = 'Single' | 'Basic' | 'Rich';

    export interface RcsSegmentInfo {
        index: number;
        capacity: number;
        used: number;
    }

    export class RcsSegmentedMessage {
        constructor(message: string, region?: RcsRegion);

        readonly message: string;
        readonly region: RcsRegion;
        readonly messageType: RcsMessageType;
        readonly segmentsCount: number;
        readonly segments: RcsSegmentInfo[];
    }
}