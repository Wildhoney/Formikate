/** @jsxImportSource @emotion/react */
import { useContext } from '../../../../src/context/index.js';
import * as styles from './styles.js';

export default function Progress() {
    const form = useContext();

    return (
        <div css={styles.container}>
            {form.progress.map((item) => (
                <div key={item.step} css={styles.item(item.current)}>
                    {item.step}
                </div>
            ))}
        </div>
    );
}
