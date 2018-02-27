/*
 Copyright 2017 VMware, Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import { browser, by, element } from 'protractor';

import { PROTRACTOR_JASMINE_TIMEOUT } from '../../src/app/testing/jasmine.constants';
import { VicWebappPage } from '../app.po';
import {
  defaultTimeout,
  sectionSummary,
  sectionOpsUser,
  sectionRegistry,
  sectionSecurity,
  sectionNetworks,
  sectionStorage,
  sectionCompute,
  modalWizard,
  dataGridCell,
  iframeTabs,
  namePrefix
} from './common';

describe('VCH Create Wizard - Basic', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = PROTRACTOR_JASMINE_TIMEOUT;
  let page: VicWebappPage;
  let specRunId: number;

  beforeAll(() => {
    specRunId = Math.floor(Math.random() * 1000) + 100;
  });

  beforeEach(() => {
    page = new VicWebappPage();
  });

  afterAll(() => {
    page.logOut();
  });

  it('should redirect to login', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).toContain('SSO');
  });

  it('should login', () => {
    page.login();
    page.waitUntilStable();
    expect(browser.getCurrentUrl()).toContain('/ui');
  });

  it('should navigate to vsphere home', () => {
    page.navigateToHome();
    expect(browser.getCurrentUrl()).toContain('vsphere');
  });

  it('should navigate to vic plugin', () => {
    page.navigateToVicPlugin();
    expect(browser.getCurrentUrl()).toContain('vic');
  });

  it('should navigate to summary tab', () => {
    page.navigateToSummaryTab();
  });

  it('should navigate to vch tab', () => {
    page.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should open create vch wizard', () => {
    page.openVchWizard();
    page.waitForElementToBePresent(modalWizard);
    expect(element(by.css(modalWizard)).isPresent()).toBe(true);
  });

  it('should input vch name', () => {
    page.clear('#nameInput');
    page.sendKeys('#nameInput', namePrefix + specRunId);
  });

  it('should complete general step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to compute capacity section
    page.waitForElementToBePresent(sectionCompute);
    expect(element(by.css(sectionCompute)).isPresent()).toBe(true);
  });

  it('should select a compute resource', () => {
    page.selectComputeResource();
  });

  it('should complete compute capacity step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to storage capacity section
    page.waitForElementToBePresent(sectionStorage);
    expect(element(by.css(sectionStorage)).isPresent()).toBe(true);
  });

  it('should select a datastore', () => {
    page.selectDatastore();
  });

  it('should complete storage capacity step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to networks section
    page.waitForElementToBePresent(sectionNetworks);
    expect(element(by.css(sectionNetworks)).isPresent()).toBe(true);
  });

  it('should select a bridge network', () => {
    page.selectBridgeNetwork();
  });

  it('should select a public network', () => {
    page.selectPublicNetwork();
  });

  it('should complete networks step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to security section
    page.waitForElementToBePresent(sectionSecurity);
    expect(element(by.css(sectionSecurity)).isPresent()).toBe(true);
  });

  it('should complete security step', () => {
    page.disableSecureAccess();
    page.clickByText('Button', 'Next');
    // check if we made it to registry access section
    page.waitForElementToBePresent(sectionRegistry);
    expect(element(by.css(sectionRegistry)).isPresent()).toBe(true);
  });

  it('should complete registry access step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to ops user section
    page.waitForElementToBePresent(sectionOpsUser);
    expect(element(by.css(sectionOpsUser)).isPresent()).toBe(true);
  });

  it('should enter ops user creds', () => {
    page.enterOpsUserCreds();
  });

  it('should complete ops user step', () => {
    page.clickByText('Button', 'Next');
    // check if we made it to summary section
    page.waitForElementToBePresent(sectionSummary);
    expect(element(by.css(sectionSummary)).isPresent()).toBe(true);
  });

  it('should create a vch', () => {
    page.createVch();
  });

  it('should find the new vch in datagrid', () => {
    let vchFound = false;
    page.waitForElementToBePresent(dataGridCell);
    page.clickByCSS('.pagination-next');
    page.waitForElementToBePresent(dataGridCell);
    browser.sleep(defaultTimeout);
    const newVch = new RegExp(namePrefix + specRunId);
    element.all(by.css(dataGridCell)).each(function(el, index) {
      el.isPresent().then(present => {
        if (present) {
          el.getText().then(function(text) {
            if (newVch.test(text)) {
              vchFound = true;
            }
          });
        }
      })
    }).then(function() {
      expect(vchFound).toBeTruthy();
    });
  });

  it('should verify the new vch has properly started', () => {
    browser.switchTo().defaultContent();
    page.waitForTaskDone(namePrefix + specRunId, 'Reconfigure virtual machine').then((status) => {
      expect(status).toBeTruthy();
    });
  });

  it('should redirect to VCH VM and display Create Wizard menu items', () => {
    page.navigateToVchVm(namePrefix + specRunId);
    // wait for VM summary page to be ready
    browser.wait(function () {
      return browser.isElementPresent(by.cssContainingText('.summary-name-label', namePrefix + specRunId));
    }, defaultTimeout * 6);
    page.clickByCSS('.summary-action-link');
    // wait for menu items to be calculated
    browser.sleep(defaultTimeout);
    page.clickByText('#applicationMenuContainer .k-item .k-link', 'All VIC Actions');
    browser.sleep(defaultTimeout);
    expect(browser.isElementPresent(by.cssContainingText('.vui-menuitem-label-text', 'New Virtual Container Host...'))).toBeTruthy();
    expect(browser.isElementPresent(by.cssContainingText('.vui-menuitem-label-text', 'Delete Virtual Container Host'))).toBeTruthy();
  });

  it('should navigate to vch list', () => {
    page.navigateToHome();
    page.navigateToVicPlugin();
    page.navigateToSummaryTab();
    page.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should delete created vch', () => {
    page.deleteVch(namePrefix + specRunId);
  });


  it('should verify the created vch has been deleted', () => {
    let vchFound = false;
    page.switchFrame(iframeTabs);
    page.waitForElementToBePresent(dataGridCell);
    const vchClrDgActionXpath = `//clr-dg-action-overflow[contains(@class, '${namePrefix + specRunId}')]`;
    element(by.xpath(vchClrDgActionXpath)).isPresent().then(present => {
      vchFound = present;
    });

    browser.sleep(defaultTimeout);
    browser.switchTo().defaultContent();
    page.waitForTaskDone(namePrefix + specRunId, 'Delete resource pool');
    expect(vchFound).toBeFalsy();
  });

});