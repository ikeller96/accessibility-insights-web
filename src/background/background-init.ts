// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AppInsights } from 'applicationinsights-js';
import { Assessments } from 'assessments/assessments';

import { AxeInfo } from '../common/axe-info';
import { ChromeAdapter } from '../common/browser-adapters/chrome-adapter';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { EnvironmentInfoProvider } from '../common/environment-info-provider';
import { getIndexedDBStore } from '../common/indexedDB/get-indexeddb-store';
import { IndexedDBAPI, IndexedDBUtil } from '../common/indexedDB/indexedDB';
import { InsightsFeatureFlags } from '../common/insights-feature-flags';
import { createDefaultLogger } from '../common/logging/default-logger';
import { NavigatorUtils } from '../common/navigator-utils';
import { NotificationCreator } from '../common/notification-creator';
import { createDefaultPromiseFactory } from '../common/promises/promise-factory';
import { TelemetryDataFactory } from '../common/telemetry-data-factory';
import { UrlValidator } from '../common/url-validator';
import { WindowUtils } from '../common/window-utils';
import { title } from '../content/strings/application';
import { IssueFilingServiceProviderImpl } from '../issue-filing/issue-filing-service-provider-impl';
import { ChromeCommandHandler } from './chrome-command-handler';
import { DetailsViewController } from './details-view-controller';
import { DevToolsListener } from './dev-tools-listener';
import { getPersistedData, PersistedData } from './get-persisted-data';
import { GlobalContextFactory } from './global-context-factory';
import { IndexedDBDataKeys } from './IndexedDBDataKeys';
import { deprecatedStorageDataKeys, storageDataKeys } from './local-storage-data-keys';
import { MessageDistributor } from './message-distributor';
import { LocalStorageData } from './storage-data';
import { TabToContextMap } from './tab-context';
import { TabContextBroadcaster } from './tab-context-broadcaster';
import { TabContextFactory } from './tab-context-factory';
import { TabController } from './tab-controller';
import { TargetTabController } from './target-tab-controller';
import { getTelemetryClient } from './telemetry/telemetry-client-provider';
import { TelemetryEventHandler } from './telemetry/telemetry-event-handler';
import { TelemetryLogger } from './telemetry/telemetry-logger';
import { TelemetryStateListener } from './telemetry/telemetry-state-listener';
import { UserStoredDataCleaner } from './user-stored-data-cleaner';

declare var window: Window & InsightsFeatureFlags;

const browserAdapter = new ChromeAdapter();
const urlValidator = new UrlValidator(browserAdapter);
const backgroundInitCleaner = new UserStoredDataCleaner(browserAdapter);
const indexedDBInstance: IndexedDBAPI = new IndexedDBUtil(getIndexedDBStore());
const indexedDBDataKeysToFetch = [IndexedDBDataKeys.assessmentStore, IndexedDBDataKeys.userConfiguration];

backgroundInitCleaner.cleanUserData(deprecatedStorageDataKeys);

// tslint:disable-next-line:no-floating-promises - top-level entry points are intentionally floating promises
getPersistedData(indexedDBInstance, indexedDBDataKeysToFetch).then((persistedData: PersistedData) => {
    browserAdapter.getUserData(storageDataKeys, (userData: LocalStorageData) => {
        const assessmentsProvider = Assessments;
        const windowUtils = new WindowUtils();
        const telemetryDataFactory = new TelemetryDataFactory();
        const telemetryLogger = new TelemetryLogger();

        const telemetryClient = getTelemetryClient(
            title,
            userData.installationData,
            browserAdapter,
            telemetryLogger,
            AppInsights,
            browserAdapter,
        );

        const telemetryEventHandler = new TelemetryEventHandler(telemetryClient);

        const browserSpec = new NavigatorUtils(window.navigator).getBrowserSpec();
        const environmentInfoProvider = new EnvironmentInfoProvider(browserAdapter.getVersion(), browserSpec, AxeInfo.Default.version);

        const globalContext = GlobalContextFactory.createContext(
            browserAdapter,
            telemetryEventHandler,
            userData,
            assessmentsProvider,
            telemetryDataFactory,
            indexedDBInstance,
            persistedData,
            IssueFilingServiceProviderImpl,
            environmentInfoProvider.getEnvironmentInfo(),
            browserAdapter,
            browserAdapter,
        );
        telemetryLogger.initialize(globalContext.featureFlagsController);

        const telemetryStateListener = new TelemetryStateListener(globalContext.stores.userConfigurationStore, telemetryEventHandler);
        telemetryStateListener.initialize();

        const broadcaster = new TabContextBroadcaster(browserAdapter);
        const detailsViewController = new DetailsViewController(browserAdapter);

        const tabToContextMap: TabToContextMap = {};

        const visualizationConfigurationFactory = new VisualizationConfigurationFactory();
        const notificationCreator = new NotificationCreator(browserAdapter, visualizationConfigurationFactory);

        const chromeCommandHandler = new ChromeCommandHandler(
            tabToContextMap,
            browserAdapter,
            urlValidator,
            notificationCreator,
            visualizationConfigurationFactory,
            telemetryDataFactory,
            globalContext.stores.userConfigurationStore,
            browserAdapter,
        );
        chromeCommandHandler.initialize();

        const messageDistributor = new MessageDistributor(globalContext, tabToContextMap, browserAdapter);
        messageDistributor.initialize();

        const targetTabController = new TargetTabController(browserAdapter, visualizationConfigurationFactory);

        const promiseFactory = createDefaultPromiseFactory();

        const tabContextFactory = new TabContextFactory(
            visualizationConfigurationFactory,
            telemetryEventHandler,
            windowUtils,
            targetTabController,
            globalContext.stores.assessmentStore,
            assessmentsProvider,
            promiseFactory,
        );

        const clientHandler = new TabController(
            tabToContextMap,
            broadcaster,
            browserAdapter,
            detailsViewController,
            tabContextFactory,
            createDefaultLogger(),
        );

        clientHandler.initialize();

        const devToolsBackgroundListener = new DevToolsListener(tabToContextMap, browserAdapter);
        devToolsBackgroundListener.initialize();

        window.insightsFeatureFlags = globalContext.featureFlagsController;
    });
});
