// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BrowserWindow } from 'electron';
import * as React from 'react';
import { BaseStore } from '../../../common/base-store';
import { TelemetryPermissionDialog, TelemetryPermissionDialogDeps } from '../../../common/components/telemetry-permission-dialog';
import { UserConfigurationStoreData } from '../../../common/types/store-data/user-configuration-store';
import { brand } from '../../../content/strings/application';
import { BrandBlue } from '../../../icons/brand/blue/brand-blue';
import { DeviceConnectBody } from './device-connect-body';
import { WindowTitle } from './window-title';

export type DeviceConnectViewContainerDeps = {
    currentWindow: BrowserWindow;
    userConfigurationStore: BaseStore<UserConfigurationStoreData>;
} & TelemetryPermissionDialogDeps;

export type DeviceConnectViewContainerProps = {
    deps: DeviceConnectViewContainerDeps;
};

export type DeviceConnectViewContainerState = {
    userConfigurationStoreData: UserConfigurationStoreData;
};

export class DeviceConnectViewContainer extends React.Component<DeviceConnectViewContainerProps, DeviceConnectViewContainerState> {
    constructor(props: DeviceConnectViewContainerProps) {
        super(props);
        this.state = {
            userConfigurationStoreData: props.deps.userConfigurationStore.getState(),
        };
    }

    public render(): JSX.Element {
        return (
            <>
                <WindowTitle title={brand}>
                    <BrandBlue />
                </WindowTitle>
                <DeviceConnectBody currentWindow={this.props.deps.currentWindow} />
                <TelemetryPermissionDialog deps={this.props.deps} isFirstTime={this.state.userConfigurationStoreData.isFirstTime} />
            </>
        );
    }

    public componentDidMount(): void {
        this.props.deps.userConfigurationStore.addChangedListener(() => {
            const newState = this.props.deps.userConfigurationStore.getState();
            this.setState({
                userConfigurationStoreData: newState,
            });
        });
    }
}
