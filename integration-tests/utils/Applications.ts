import { pageTitles } from '../support/constants/PageTitle';
import { applicationDetailPagePO } from '../support/pageObjects/createApplication-po';
import { actions, breadcrumb } from '../support/pageObjects/global-po';
import {
  actionsDropdown,
  componentsTabPO,
  pipelinerunsTabPO,
  integrationTestsTabPO,
  overviewTabPO,
  activityTabPO,
  latestCommitsTabPO,
  applicationsPagePO,
} from '../support/pageObjects/pages-po';
import { AddComponentPage } from '../support/pages/AddComponentPage';
import { ComponentPage } from '../support/pages/ComponentsPage';
import { CreateApplicationPage } from '../support/pages/CreateApplicationPage';
import { ComponentsTabPage } from '../support/pages/tabs/ComponentsTabPage';
import { OverviewTabPage } from '../support/pages/tabs/OverviewTabPage';
import { Common } from './Common';
import { FULL_APPLICATION_TITLE } from '../support/constants/PageTitle';

export class Applications {
  static deleteApplication(applicationName: string) {
    cy.getCookie('cs_jwt')
      .should('exist')
      .then((cookie) => {
        const token = cookie.value;
        const namespace = `${Cypress.env('USERNAME').toLowerCase()}-tenant`;
        const request = {
          method: 'DELETE',
          url: `${Common.getOrigin()}/api/k8s/apis/appstudio.redhat.com/v1alpha1/namespaces/${namespace}/applications/${applicationName}`,
          headers: {
            authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
          failOnStatusCode: false,
        };

        cy.request(request);
      });
  }

  static openKebabMenu(applicationName: string) {
    cy.get(`[data-id="${applicationName}"]`).find(actions.kebabButton).click();
  }

  static createApplication() {
    cy.title().should('eq', `Applications | ${FULL_APPLICATION_TITLE}`);
    const createApplicationPage = new CreateApplicationPage();
    createApplicationPage.clickCreateApplication();
    cy.title().should('eq', `Import - Add components | ${FULL_APPLICATION_TITLE}`);
    cy.testA11y(`${pageTitles.createApp} page`);
  }

  static createComponent(
    publicGitRepo: string,
    componentName: string,
    applicationName?: string,
    runtime?: string,
    useCustomBuildPipeline: boolean = false,
    envVar?: { varName: string; value: string },
  ) {
    this.importCodeStep(publicGitRepo);
    this.configureComponentsStep(
      componentName,
      useCustomBuildPipeline,
      applicationName,
      runtime,
      envVar,
    );
  }

  static checkComponentInListView(
    componentName: string,
    applicationName: string,
    componentStatus: string,
    componentLabel: string,
  ) {
    this.createdComponentExists(componentName, applicationName);
    this.checkComponentStatus(componentName, componentStatus);
    this.checkComponentLabel(componentName, componentLabel);
  }

  static createdComponentExists(componentName: string, applicationName: string) {
    this.goToComponentsTab();

    Common.verifyPageTitle(applicationName);
    Common.waitForLoad();
    this.getComponentListItem(componentName).should('exist');
  }

  static checkComponentStatus(componentName: string, componentStatus: string) {
    cy.get(componentsTabPO.componentListItem(componentName)).contains(componentStatus, {
      timeout: 30000,
    });
  }

  static checkComponentLabel(componentName: string, componentLabel: string) {
    cy.get(componentsTabPO.componentListItem(componentName)).contains(componentLabel, {
      timeout: 15000,
    });
  }
  static verifyAppstatusIsSucceeded() {
    cy.contains(applicationsPagePO.appStatus, 'Succeeded', { timeout: 100000 }).should(
      'be.visible',
    );
  }

  static getComponentListItem(application: string) {
    return cy.contains(applicationDetailPagePO.item, application, { timeout: 60000 });
  }

  static clickActionsDropdown(dropdownItem: string) {
    cy.get(actionsDropdown.dropdown).click();
    cy.contains(dropdownItem).click();
  }

  static clickBreadcrumbLink(link: string) {
    cy.get(breadcrumb.breadcrumbLink).contains(link).click();
    Common.waitForLoad();
  }

  static goToOverviewTab() {
    cy.get(overviewTabPO.clickTab).click();
    Common.waitForLoad();
    return new OverviewTabPage();
  }

  static goToComponentsTab() {
    cy.get(componentsTabPO.clickTab).click();
    return new ComponentsTabPage();
  }

  static goToActivityTab() {
    cy.get(activityTabPO.clickTab, { timeout: 30000 }).click();
    Common.waitForLoad();
  }

  static goToLatestCommitsTab() {
    this.goToActivityTab();
    cy.get(latestCommitsTabPO.clickTab, { timeout: 30000 }).click();
  }

  static goToPipelinerunsTab() {
    this.goToActivityTab();
    cy.get(pipelinerunsTabPO.clickTab, { timeout: 30000 }).click();
    Common.waitForLoad();
  }

  static goToIntegrationTestsTab() {
    cy.get(integrationTestsTabPO.clickTab).click();
  }

  static importCodeStep(publicGitRepo: string) {
    const addComponent = new AddComponentPage();
    cy.title().should('eq', `Import - Add components | ${FULL_APPLICATION_TITLE}`);

    // Enter git repo URL
    addComponent.setSource(publicGitRepo);
    // Check if the source is validated
    addComponent.waitRepoValidated();

    addComponent.submit();
    cy.title().should('eq', `Import - Configure components | ${FULL_APPLICATION_TITLE}`);
  }

  static configureComponentsStep(
    componentName: string,
    useCustomBuildPipeline: boolean,
    applicationName?: string,
    runtime?: string,
    envVar?: { varName: string; value: string },
  ) {
    const componentPage = new ComponentPage();
    componentPage.editComponentName(componentName);

    if (applicationName) {
      componentPage.setApplicationName(applicationName);
    }
    if (runtime) {
      componentPage.selectRuntime(runtime);
    }
    if (envVar) {
      componentPage.addEnvVar(envVar.varName, envVar.value);
    }
    if (useCustomBuildPipeline) {
      componentPage.selectCustomBuildPipeline();
    }
    componentPage.clickCreateApplication();
  }
}
