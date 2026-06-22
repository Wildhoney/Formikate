/** @jsxImportSource @emotion/react */
import type { Status } from '../../../../src';
import * as styles from './styles.js';

type Props = {
    fields: Status;
};

export default function Progress({ fields }: Props) {
    return (
        <div css={styles.container}>
            {fields.progress.steps().map((step) => (
                <div
                    key={step.id}
                    css={styles.item(fields.step[step.id].active())}
                >
                    {step.id}
                </div>
            ))}
        </div>
    );
}
