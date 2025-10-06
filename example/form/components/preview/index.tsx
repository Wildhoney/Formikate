import { useContext } from '../../../../src/context/index.js';

export default function Preview() {
    const form = useContext();

    return <pre>{JSON.stringify(form.values, null, 2)}</pre>;
}
