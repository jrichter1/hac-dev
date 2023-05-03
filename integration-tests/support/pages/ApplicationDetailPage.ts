import { Common } from '../../utils/Common';
import { pageTitles } from '../constants/PageTitle';
import { CPUUnit, MemoryUnit } from '../constants/Units';
import {
  addComponentPagePO,
  buildLogModalContentPO,
  applicationDetailPagePO,
} from '../pageObjects/createApplication-po';
import { actions } from '../pageObjects/global-po';

export class ApplicationDetailPage {
  checkReplica(replicaCount: number) {
    cy.contains('div', applicationDetailPagePO.replicaLabel).should('contain.text', replicaCount);
  }

  checkCpuAndMemory(cpuValue: number, cpuUnit: CPUUnit, ramValue: number, ramUnit: MemoryUnit) {
    const shortCpuUnit = cpuUnit === CPUUnit.core ? '' : 'm';
    cy.contains('div', applicationDetailPagePO.cpuRamLabel).should(
      'contain.text',
      `${cpuValue}${shortCpuUnit}, ${ramValue}${ramUnit}`,
    );
  }

  expandDetails(componentName: string) {
    cy.get(`[aria-label="${componentName}"]`, { timeout: 60000 })
      .find(applicationDetailPagePO.detailsArrow)
      .click();
  }

  openComponentSettings(componentName: string) {
    this.openActionList(componentName);
    cy.get(applicationDetailPagePO.componentSettings).click();
    Common.verifyPageTitle(pageTitles.componentSettings);
    Common.waitForLoad();
    cy.testA11y(`${pageTitles.componentSettings} page`);
  }

  checkBuildLog(tasklistItem: string, textToVerify: string, taskTimeout: number = 20000) {
    cy.get('span[class="pipeline-run-logs__namespan"]')
      .contains(tasklistItem, { timeout: taskTimeout })
      .click();
    cy.get(buildLogModalContentPO.logText).should('contain.text', textToVerify);
  }

  checkPodLog(podName: string, textToVerify: string) {
    cy.get(buildLogModalContentPO.podLogNavList).contains('a', podName).click();
    cy.get(buildLogModalContentPO.logText).should('contain.text', textToVerify);
  }

  openBuildLog(componentName: string) {
    cy.get(applicationDetailPagePO.componentBuildLog(componentName), { timeout: 60000 }).click();
    cy.get(buildLogModalContentPO.modal).should('exist');
  }

  openPodLogs(componentName: string) {
    cy.get(applicationDetailPagePO.componentPodLog(componentName), { timeout: 60000 })
      .should('have.have.text', 'View pod logs')
      .click();
    cy.get(buildLogModalContentPO.modal).should('exist');
  }

  verifyBuildLogTaskslist(tasklistItems: string[]) {
    tasklistItems.forEach((item) => {
      cy.contains(buildLogModalContentPO.logsTasklist, item).should('be.visible');
    });
  }

  verifyFailedLogTasksNotExists() {
    cy.get(buildLogModalContentPO.failedPipelineRunLogs).should('not.exist');
  }

  closeBuildLog() {
    cy.get(buildLogModalContentPO.closeButton).click();
    cy.get(buildLogModalContentPO.modal).should('not.exist');
  }

  createdComponentExists(component: string, application: string) {
    Common.verifyPageTitle(application);
    Common.waitForLoad();
    cy.testA11y('Application details page');
    this.getComponentListItem(component).should('exist');
  }

  createdComponentNotExists(application: string) {
    this.getComponentListItem(application).should('not.exist');
  }

  getComponentListItem(application: string) {
    return cy.contains(applicationDetailPagePO.item, application, { timeout: 60000 });
  }

  openAddComponentPage() {
    cy.get(addComponentPagePO.addComponent).click({ force: true });
    Common.verifyPageTitle(pageTitles.createApp);
    Common.waitForLoad();
    cy.testA11y(`${pageTitles.createApp} page`);
  }

  deleteComponent(componentName: string) {
    this.openActionList(componentName);
    cy.get(actions.deleteComponent).click();
    cy.get(actions.deleteModalInput).clear().type(componentName);
    cy.get(actions.deleteModalButton).click();
  }

  private openActionList(componentName: string) {
    cy.get(`[aria-label="${componentName}"]`).find(actions.kebabButton).click();
  }
}
