import {IIntegration} from "../../models/IIntegration";

export interface IIntegrationState {
    loading: boolean;
    failure?: string;
    integrations: IIntegration[];
    integrationPage: number;
    integrationMasterLoading: boolean;
    integrationMaster: IIntegration[];
    integrationMasterFailure?: string;
}

export const defaultIntegrationState: IIntegrationState = {
    loading: false,
    failure: undefined,
    integrations: [],
    integrationPage: 0,
    integrationMasterLoading: false,
    integrationMaster: [],
    integrationMasterFailure: undefined
}
