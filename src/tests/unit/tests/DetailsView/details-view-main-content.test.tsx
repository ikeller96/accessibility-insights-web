// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { IMock, Mock, MockBehavior } from 'typemoq';

import { FeatureFlagStore } from 'background/stores/global/feature-flag-store';
import { VisualizationConfiguration } from '../../../../common/configs/visualization-configuration';
import { VisualizationConfigurationFactory } from '../../../../common/configs/visualization-configuration-factory';
import { NamedFC, ReactFCWithDisplayName } from '../../../../common/react/named-fc';
import { ManualTestStatus } from '../../../../common/types/manual-test-status';
import {
    AssessmentData,
    AssessmentNavState,
    AssessmentStoreData,
    PersistedTabInfo,
} from '../../../../common/types/store-data/assessment-result-data';
import { TabStoreData } from '../../../../common/types/store-data/tab-store-data';
import { ScanData, TestsEnabledState } from '../../../../common/types/store-data/visualization-store-data';
import { VisualizationType } from '../../../../common/types/visualization-type';
import { DetailsViewActionMessageCreator } from '../../../../DetailsView/actions/details-view-action-message-creator';
import { DetailsRightPanelConfiguration } from '../../../../DetailsView/components/details-view-right-panel';
import { DetailsViewSwitcherNavConfiguration } from '../../../../DetailsView/components/details-view-switcher-nav';
import { DetailsViewLeftNav } from '../../../../DetailsView/components/left-nav/details-view-left-nav';
import { TabInfo } from '../../../../DetailsView/components/tab-info';
import { DetailsViewMainContent, DetailsViewMainContentProps } from '../../../../DetailsView/details-view-main-content';
import { DetailsViewToggleClickHandlerFactory } from '../../../../DetailsView/handlers/details-view-toggle-click-handler-factory';
import { TabStoreDataBuilder } from '../../common/tab-store-data-builder';
import { VisualizationScanResultStoreDataBuilder } from '../../common/visualization-scan-result-store-data-builder';
import { VisualizationStoreDataBuilder } from '../../common/visualization-store-data-builder';
import { exampleUnifiedStatusResults } from './components/cards/sample-view-model-data';

describe('DetailsViewMainContentTest', () => {
    let selectedTest: VisualizationType;
    let configFactoryMock: IMock<VisualizationConfigurationFactory>;
    let clickHandlerFactoryMock: IMock<DetailsViewToggleClickHandlerFactory>;
    let clickHandlerStub: (event: any) => void;
    let getStoreDataMock: IMock<(data: TestsEnabledState) => ScanData>;
    let configStub: VisualizationConfiguration;
    let scanDataStub: ScanData;
    let props: DetailsViewMainContentProps;
    let rightPanelConfig: DetailsRightPanelConfiguration;
    let switcherNavConfig: DetailsViewSwitcherNavConfiguration;

    describe('render', () => {
        beforeEach(() => {
            selectedTest = -1;
            const RightPanelStub: Readonly<ReactFCWithDisplayName<DetailsViewMainContentProps>> = NamedFC<DetailsViewMainContentProps>(
                'test',
                _ => null,
            );
            const CommandBarStub: Readonly<ReactFCWithDisplayName<DetailsViewMainContentProps>> = NamedFC<DetailsViewMainContentProps>(
                'test',
                _ => null,
            );
            const LeftNavStub: Readonly<ReactFCWithDisplayName<DetailsViewMainContentProps>> = NamedFC<DetailsViewMainContentProps>(
                'test',
                _ => null,
            );
            rightPanelConfig = {
                RightPanel: RightPanelStub,
            } as DetailsRightPanelConfiguration;
            switcherNavConfig = {
                CommandBar: CommandBarStub,
                LeftNav: LeftNavStub,
            } as DetailsViewSwitcherNavConfiguration;
            configFactoryMock = Mock.ofType(VisualizationConfigurationFactory, MockBehavior.Strict);
            clickHandlerFactoryMock = Mock.ofType(DetailsViewToggleClickHandlerFactory, MockBehavior.Strict);
            getStoreDataMock = Mock.ofInstance(() => null, MockBehavior.Strict);

            configStub = {
                getStoreData: getStoreDataMock.object,
                displayableData: {},
            } as VisualizationConfiguration;

            scanDataStub = {
                enabled: false,
            } as ScanData;

            clickHandlerStub = () => {};

            const assessmentStoreData = {
                assessmentNavState: {
                    selectedTestStep: 'sample test step',
                } as AssessmentNavState,
                assessments: {
                    assessment: {
                        testStepStatus: {
                            ['step-1']: {
                                stepFinalResult: ManualTestStatus.UNKNOWN,
                                isStepScanned: false,
                            },
                        },
                        generatedAssessmentInstancesMap: {},
                        manualTestStepResultMap: {},
                        fullAxeResultsMap: {},
                    } as AssessmentData,
                },
                persistedTabInfo: {} as PersistedTabInfo,
                resultDescription: '',
            } as AssessmentStoreData;

            props = {
                deps: {
                    detailsViewActionMessageCreator: Mock.ofType(DetailsViewActionMessageCreator).object,
                },
                tabStoreData: new TabStoreDataBuilder().build(),
                visualizationStoreData: new VisualizationStoreDataBuilder().build(),
                visualizationScanResultData: new VisualizationScanResultStoreDataBuilder().build(),
                featureFlagStoreData: new FeatureFlagStore(null, null, null).getDefaultState(),
                selectedTest: selectedTest,
                visualizationConfigurationFactory: configFactoryMock.object,
                clickHandlerFactory: clickHandlerFactoryMock.object,
                assessmentStoreData: assessmentStoreData,
                detailsViewStoreData: {
                    detailsViewRightContentPanel: 'Overview',
                },
                rightPanelConfiguration: rightPanelConfig,
                switcherNavConfiguration: switcherNavConfig,
                ruleResultsByStatus: exampleUnifiedStatusResults,
            } as DetailsViewMainContentProps;
        });

        test('tab is closed', () => {
            const tabStoreData: TabStoreData = {
                isClosed: true,
            } as TabStoreData;

            props.tabStoreData = tabStoreData;

            const expected = (
                <>
                    {buildCommandBar(props)}
                    <div className="table row-layout details-view-main-content">
                        {null}
                        <div className="details-content table column-layout">
                            {null}
                            <div className="view" role="main">
                                <rightPanelConfig.RightPanel {...props} />
                            </div>
                        </div>
                    </div>
                </>
            );

            const testSubject = new DetailsViewMainContent(props);
            expect(testSubject.render()).toEqual(expected);
        });

        test('a non-assessment or non-issues view', () => {
            setupClickHandlerFactoryMock(clickHandlerFactoryMock, selectedTest, !scanDataStub.enabled);
            setupConfigFactoryMock(configFactoryMock, getStoreDataMock, configStub, scanDataStub, props);

            const expected = (
                <>
                    {buildCommandBar(props)}
                    <div className="table row-layout details-view-main-content">
                        {buildLeftNav(props)}
                        <div className="details-content table column-layout">
                            {buildTabInfo(props)}
                            <div className="view" role="main">
                                <rightPanelConfig.RightPanel {...props} />
                            </div>
                        </div>
                    </div>
                </>
            );

            const testSubject = new DetailsViewMainContent(props);
            expect(testSubject.render()).toEqual(expected);
        });
    });

    function setupConfigFactoryMock(
        factoryMock: IMock<VisualizationConfigurationFactory>,
        givenGetStoreDataMock: IMock<(data: TestsEnabledState) => ScanData>,
        config: VisualizationConfiguration,
        scanData: ScanData,
        givenProps: DetailsViewMainContentProps,
    ): void {
        factoryMock.setup(cfm => cfm.getConfiguration(givenProps.selectedTest)).returns(() => config);

        givenGetStoreDataMock.setup(gsdm => gsdm(givenProps.visualizationStoreData.tests)).returns(() => scanData);
    }

    function setupClickHandlerFactoryMock(
        factoryMock: IMock<DetailsViewToggleClickHandlerFactory>,
        setupType: VisualizationType,
        setupNewValue: boolean,
    ): void {
        factoryMock.setup(chfm => chfm.createClickHandler(setupType, setupNewValue)).returns(() => clickHandlerStub);
    }

    function buildLeftNav(givenProps: DetailsViewMainContentProps): JSX.Element {
        return <DetailsViewLeftNav {...givenProps} />;
    }

    function buildTabInfo(givenProps: DetailsViewMainContentProps): JSX.Element {
        return (
            <TabInfo
                isTargetPageHidden={givenProps.tabStoreData.isPageHidden}
                url={givenProps.tabStoreData.url}
                title={givenProps.tabStoreData.title}
                actionCreator={givenProps.deps.detailsViewActionMessageCreator}
                selectedPivot={givenProps.visualizationStoreData.selectedDetailsViewPivot}
                dropdownClickHandler={givenProps.dropdownClickHandler}
            />
        );
    }

    function buildCommandBar(givenProps: DetailsViewMainContentProps): JSX.Element {
        return <switcherNavConfig.CommandBar actionMessageCreator={props.deps.detailsViewActionMessageCreator} {...props} />;
    }
});
