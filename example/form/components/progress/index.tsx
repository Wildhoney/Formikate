import { useContext } from '../../../../src/context/index.js';

export default function Progress() {
    const form = useContext();

    return <pre>{JSON.stringify(form.progress, null, 2)}</pre>;
}
