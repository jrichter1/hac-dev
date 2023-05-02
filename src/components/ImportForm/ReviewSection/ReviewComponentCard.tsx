import * as React from 'react';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  TextInputTypes,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import {
  EnvironmentField,
  InputField,
  NumberSpinnerField,
  ResourceLimitField,
  SwitchField,
} from '../../../shared';
import ExternalLink from '../../../shared/components/links/ExternalLink';
import GitRepoLink from '../../GitLink/GitRepoLink';
import HelpPopover from '../../HelpPopover';
import { CPUUnits, DetectedFormComponent, MemoryUnits } from '../utils/types';
import { RuntimeSelector } from './RuntimeSelector';

import './ReviewComponentCard.scss';

type ReviewComponentCardProps = {
  detectedComponent: DetectedFormComponent;
  detectedComponentIndex: number;
  editMode?: boolean;
  isExpanded?: boolean;
  showRuntimeSelector?: boolean;
};

export const ReviewComponentCard: React.FC<ReviewComponentCardProps> = ({
  detectedComponent,
  detectedComponentIndex,
  editMode = false,
  isExpanded = false,
  showRuntimeSelector,
}) => {
  const component = detectedComponent.componentStub;
  const name = component.componentName;
  const fieldPrefix = `components[${detectedComponentIndex}].componentStub`;
  const [expandedComponent, setExpandedComponent] = React.useState(isExpanded);

  return (
    <Card isFlat isCompact isSelected={expandedComponent} isExpanded={expandedComponent}>
      <CardHeader
        onExpand={() => setExpandedComponent((v) => !v)}
        toggleButtonProps={{
          id: `toggle-${name}`,
          'aria-label': name,
          'aria-labelledby': `review-${name} toggle-${name}`,
          'aria-expanded': expandedComponent,
          'data-test': `${name}-toggle-button`,
        }}
      >
        <CardTitle style={{ flex: 1 }}>
          <Flex>
            <FlexItem flex={{ default: 'flex_4' }}>
              <InputField
                name={`${fieldPrefix}.componentName`}
                label="Component name"
                type={TextInputTypes.text}
                isDisabled={editMode}
              />
              <br />
              {component.source?.git?.url ? (
                <GitRepoLink
                  url={component.source.git.url}
                  revision={component.source.git.revision}
                  context={component.source.git.context}
                />
              ) : (
                <ExternalLink
                  href={
                    component.containerImage?.includes('http')
                      ? component.containerImage
                      : `https://${component.containerImage}`
                  }
                  text={component.containerImage}
                />
              )}
            </FlexItem>
            {showRuntimeSelector && (
              <FlexItem flex={{ default: 'flex_2' }}>
                <RuntimeSelector detectedComponentIndex={detectedComponentIndex} />
                <HelperText style={{ fontWeight: 100 }}>
                  <HelperTextItem variant="indeterminate">
                    Use the recommended runtime for optimal build and deployment.
                  </HelperTextItem>
                </HelperText>
              </FlexItem>
            )}
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody className="review-component-card__card-body">
          <FormSection>
            <br />
            <Title size={TitleSizes.md} headingLevel="h4">
              Build & deploy configuration
              <HelperText style={{ fontWeight: 100 }}>
                <HelperTextItem variant="indeterminate">
                  This component will determine the strategy and process inputs and will be deployed
                  to your development environment automatically.
                </HelperTextItem>
              </HelperText>
            </Title>

            <Grid hasGutter>
              <GridItem sm={12} lg={4}>
                <InputField
                  name={`${fieldPrefix}.targetPort`}
                  label="Target port"
                  helpText="Target port for traffic."
                  type={TextInputTypes.number}
                  min={1}
                  max={65535}
                />
              </GridItem>
              <GridItem sm={12} lg={4}>
                <InputField
                  name={`${fieldPrefix}.source.git.dockerfileUrl`}
                  label="Dockerfile"
                  type={TextInputTypes.text}
                  placeholder="Dockerfile"
                  labelIcon={
                    <HelpPopover bodyContent="You can modify this path to point to your Dockerfile." />
                  }
                />
              </GridItem>
              {!editMode && (
                <GridItem sm={12} lg={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <SwitchField
                    name={`components[${detectedComponentIndex}].defaultBuildPipeline`}
                    label="Default build pipeline"
                    labelOff="Custom build pipeline"
                  />
                  &nbsp;
                  <HelpPopover bodyContent="Keep in mind that a default build pipeline skips several advanced tasks to get your application up and running sooner." />
                </GridItem>
              )}
            </Grid>
            <Grid hasGutter>
              <GridItem sm={12} lg={4}>
                <ResourceLimitField
                  name={`${fieldPrefix}.resources.cpu`}
                  unitName={`${fieldPrefix}.resources.cpuUnit`}
                  label="CPU"
                  minValue={0}
                  unitOptions={CPUUnits}
                  helpText="The amount of CPU the container is guaranteed"
                />
              </GridItem>
              <GridItem sm={12} lg={4}>
                <ResourceLimitField
                  name={`${fieldPrefix}.resources.memory`}
                  unitName={`${fieldPrefix}.resources.memoryUnit`}
                  label="Memory"
                  minValue={0}
                  unitOptions={MemoryUnits}
                  helpText="The amount of memory the container is guaranteed"
                />
              </GridItem>
              <GridItem sm={12} lg={4}>
                <NumberSpinnerField
                  name={`${fieldPrefix}.replicas`}
                  label="Instances"
                  min={0}
                  helpText="Number of instances of your image"
                />
              </GridItem>
            </Grid>
            <EnvironmentField
              name={`${fieldPrefix}.env`}
              envs={component.env}
              label="Environment variables"
              labelIcon={
                <HelpPopover bodyContent="We use these default values to deploy this component. You can customize the values for each of your environments later by editing the component settings." />
              }
            />
          </FormSection>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};
