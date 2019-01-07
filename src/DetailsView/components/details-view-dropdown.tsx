// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind, getRTL, IPoint } from '@uifabric/utilities';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ContextualMenu, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';

export interface IDetailsViewDropDownProps {
    menuItems: IContextualMenuItem[];
}

export interface IDetailsViewDropDownState {
    isContextMenuVisible: boolean;
    target?: HTMLElement | string | MouseEvent | IPoint | null;
}

export class DetailsViewDropDown extends React.Component<IDetailsViewDropDownProps, IDetailsViewDropDownState> {
    constructor(props) {
        super(props);
        this.state = {
            isContextMenuVisible: false,
            target: null,
        };
    }

    public render(): JSX.Element {
        return (
            <div className="details-view-dropdown">
                <Link
                    className={'gear-button'}
                    onClick={this.openDropdown}>
                    <Icon
                        className="gear-options-icon"
                        iconName="Gear"
                        ariaLabel={"Manage Settings"}
                    />
                </Link>
                {this.renderContextMenu()}
            </div>
        );
    }

    private renderContextMenu(): JSX.Element {
        if (!this.state.isContextMenuVisible) {
            return null;
        }
        return (
            <ContextualMenu
                doNotLayer={false}
                gapSpace={12}
                shouldFocusOnMount={true}
                target={this.state.target}
                onDismiss={this.dismissDropdown}
                directionalHint={DirectionalHint.bottomRightEdge}
                directionalHintForRTL={DirectionalHint.bottomLeftEdge}
                items={this.props.menuItems}
                
            />
        );
    }

    @autobind
    protected openDropdown(target: React.MouseEvent<HTMLElement>): void {
        this.setState({ target: target.currentTarget, isContextMenuVisible: true });
    }

    @autobind
    protected dismissDropdown(): void {
        this.setState({ target: null, isContextMenuVisible: false });
    }
}