import { ReactElement } from "react";
import { Schematik, useSchematik } from "../../src";
import { fields } from "./utils";
import { Screens } from "./types";

export default function App(): ReactElement {
  const schematik = useSchematik({
    fields,
    screens: [Screens.Name, Screens.Address, Screens.Review],
    initialScreen: Screens.Name,
  });

  return (
    <Schematik
      initialValues={{ name: "", age: "", telephone: "" }}
      schematikConfig={schematik}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={console.log}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <button
            type="button"
            disabled={!schematik.hasPrevious()}
            onClick={schematik.handlePrevious}
          >
            Back
          </button>
          <button
            type="button"
            disabled={!schematik.hasNext()}
            onClick={schematik.handleNext}
          >
            Next
          </button>
          <button type="submit">Submit</button>
        </form>
      )}
    </Schematik>
  );
}
