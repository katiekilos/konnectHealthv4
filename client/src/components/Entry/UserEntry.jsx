import FormPropsTextFieldsGP from "./gp-form";
import FormPropsTextFieldsHosp from "./hosp-form";
import FormPropsTextFieldsTrial from "./trial-form";
import FormPropsTextFieldsPatient from "./patient-form";
import ResSelect from "./res-form";
import React, {useState} from 'react';
import BasicAlerts from "../things/alerts";



function Setup() {

  const [name,setName] = useState('');

  const handleClick = (name) => {
    setName(name);
  }
  
  return (
    <>
      <h2>Select User Type</h2>

      <details>
        <summary>Patient</summary>
        <FormPropsTextFieldsPatient handleClick={handleClick}/>
      </details>

      <details>
        <summary>GP</summary>
        <FormPropsTextFieldsGP handleClick={handleClick}/>
      </details>

      <details>
        <summary>Hospital</summary>
        <FormPropsTextFieldsHosp handleClick={handleClick}/>
      </details>

      <details>
        <summary>Clinical Trial</summary>
        <FormPropsTextFieldsTrial handleClick={handleClick}/>
      </details>

      <details>
        <summary>Researcher</summary>
        <ResSelect handleClick={handleClick}/>
      </details>
    </>
  );
}

export default Setup;
