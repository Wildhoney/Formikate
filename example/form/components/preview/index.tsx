/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import * as styles from './styles.js';

export default function Preview() {
    const form = useContext();

    const stepTitles: Record<string, string> = {
        name: 'Personal Information',
        address: 'Contact Details',
        review: 'Review Your Information',
    };

    return (
        <h1 css={styles.title}>
            {stepTitles[form.step as string] || 'Registration Form'}
        </h1>
    );
}
