// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { NamedFC } from '../../../common/react/named-fc';

export interface DeviceConnectFooterProps {
    cancelClick: () => void;
    canStartTesting: boolean;
}

export const DeviceConnectFooter = NamedFC<DeviceConnectFooterProps>('DeviceConnectFooter', (props: DeviceConnectFooterProps) => {
    const onCancelClick = () => props.cancelClick();
    return (
        <footer className="device-connect-footer">
            <DefaultButton className="footer-button-cancel" onClick={onCancelClick} text="Cancel"></DefaultButton>
            <PrimaryButton className="footer-button-start" disabled={!props.canStartTesting} text="Start testing"></PrimaryButton>
        </footer>
    );
});
