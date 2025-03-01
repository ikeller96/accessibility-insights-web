// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseActionPayload } from 'background/actions/action-payloads';
import { TelemetryEventSource } from '../extension-telemetry-events';
import { Message } from '../message';
import { Messages } from '../messages';
import { TelemetryDataFactory } from '../telemetry-data-factory';
import { ActionMessageDispatcher } from './action-message-dispatcher';

export class DropdownActionMessageCreator {
    constructor(private readonly telemetryFactory: TelemetryDataFactory, private readonly dispatcher: ActionMessageDispatcher) {}

    public openPreviewFeaturesPanel(event: React.MouseEvent<HTMLElement>, source: TelemetryEventSource): void {
        const messageType = Messages.PreviewFeatures.OpenPanel;
        const telemetry = this.telemetryFactory.withTriggeredByAndSource(event, source);
        const payload: BaseActionPayload = {
            telemetry,
        };
        const message: Message = {
            messageType: messageType,
            payload,
        };
        this.dispatcher.dispatchMessage(message);
    }

    public openScopingPanel(event: React.MouseEvent<HTMLElement>, source: TelemetryEventSource): void {
        const messageType = Messages.Scoping.OpenPanel;
        const telemetry = this.telemetryFactory.withTriggeredByAndSource(event, source);
        const payload: BaseActionPayload = {
            telemetry,
        };
        const message = {
            messageType: messageType,
            payload,
        };
        this.dispatcher.dispatchMessage(message);
    }

    public openSettingsPanel(event: React.MouseEvent<HTMLElement>, source: TelemetryEventSource): void {
        const messageType = Messages.SettingsPanel.OpenPanel;
        const telemetry = this.telemetryFactory.forSettingsPanelOpen(event, source, 'menu');
        const payload: BaseActionPayload = {
            telemetry,
        };
        const message = {
            messageType: messageType,
            payload,
        };
        this.dispatcher.dispatchMessage(message);
    }
}
