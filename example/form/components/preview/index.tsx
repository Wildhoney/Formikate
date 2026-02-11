/** @jsxImportSource @emotion/react */
import type { Step } from '../../../../src';
import * as styles from './styles.js';

type Props = {
    step: Step;
};

export default function Preview({ step }: Props) {
    const stepTitles: Record<string, string> = {
        name: 'Personal Information',
        address: 'Contact Details',
        review: 'Review Your Information',
    };

    return (
        <h1 css={styles.title}>
            {stepTitles[step as string] || 'Registration Form'}
        </h1>
    );
}
