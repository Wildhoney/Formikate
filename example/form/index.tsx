import { ReactElement } from "react";
import Schematik from "../../src";
import { validationSchema } from "./utils";

export default function App(): ReactElement {
  return (
    <Schematik
      initialValues={{}}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    />
  );
}
