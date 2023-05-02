import * as React from 'react';
import { FormSection } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { InputField } from '../../../shared';
import { ImportFormValues } from '../utils/types';

const ApplicationSection: React.FunctionComponent = () => {
  const {
    values: { inAppContext },
  } = useFormikContext<ImportFormValues>();

  return (
    <FormSection>
      <InputField
        name="application"
        label="Name"
        placeholder="Enter name"
        isDisabled={inAppContext}
        required
      />
    </FormSection>
  );
};

export default ApplicationSection;
