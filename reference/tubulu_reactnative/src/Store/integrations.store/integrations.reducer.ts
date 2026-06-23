import { getType, ActionType } from "typesafe-actions";
import * as IntegrationActions from './integrations.actions';
import { IIntegrationState, defaultIntegrationState } from './integrations.state';

const { getIntegrationAsync, updateIntegrationPage, getAllIntegrationsAsync } = IntegrationActions;

type IIntegrationAction = ActionType<typeof IntegrationActions>;

export const integrationReducer = (state: IIntegrationState = defaultIntegrationState, action: IIntegrationAction): IIntegrationState => {
    switch (action.type) {
        case getType(updateIntegrationPage):
            return {
                ...state,
                integrationPage: action.payload,
            }
        case getType(getIntegrationAsync.request):
            return {
                ...state,
                loading: true,
                failure: undefined
            }
        case getType(getIntegrationAsync.failure):
            return {
                ...state,
                loading: false,
                failure: action.payload
            };
        case getType(getIntegrationAsync.success):
            const { integrations, append } = action.payload;
            return {
                ...state,
                loading: false,
                failure: undefined,
                integrations: append ? [...state.integrations, ...integrations] : integrations
            }
        case getType(getAllIntegrationsAsync.request):
            return {
                ...state,
                integrationMasterLoading: true,
            }
        case getType(getAllIntegrationsAsync.success):
            return {
                ...state,
                integrationMasterLoading: false,
                integrationMaster: action.payload
            }
        case getType(getAllIntegrationsAsync.failure):
            return {
                ...state,
                integrationMasterLoading: false,
                integrationMasterFailure: action.payload
            }
        default:
            return state;
    }
}
