import { createAction, createAsyncAction } from "typesafe-actions";
import { IIntegration } from "../../models/IIntegration";
import { Dispatch } from "redux";
import { getAllIntegrations, getRecentIntegrations } from "../../Utils/ApiActions";
import { Store } from "../Store";

interface IIntegrationReduxResponse {
    integrations: IIntegration[];
    append: boolean;
}

// const getIntegrationAction = (page: number, size: number, search: string = '', isStart: boolean = true, category:string='') => {
//     return async (dispatch: Dispatch) => {
//         dispatch(getIntegrationAsync.request());
//         try {
//             const integrationPage = Store.getState().integrationState.integrationPage;
//             dispatch(updateIntegrationPage(isStart ? 0 : integrationPage + 1));
//             const response = await getRecentIntegrations(isStart ? 0 : integrationPage + 1, size, search, category);
//             if (response.data) {
//                 console.log("getIntegrationAction on home page load recent",response.data);
//                 setTimeout(() => {
//                     dispatch(getIntegrationAsync.success({
//                         append: !isStart,
//                         integrations: response.data
//                     }));
//                 }, 1500);
//             } else {
//                 dispatch(getIntegrationAsync.failure('Unable to get the integrations at the moment'));
//             }
//         } catch (error: any) {
//             console.log('Unable to get the integrations at the moment');
//             console.log(error);
//             dispatch(getIntegrationAsync.failure(error.message ?? 'Unable to get the integrations at the moment'));
//         }
//     }
// }

const getIntegrationAction = (page:number, size:number, search:string = '', isStart: boolean = true, category:string = '') => {
  return async (dispatch:Dispatch, getState:any) => {
    if (isStart) {
      dispatch(getIntegrationAsync.request());
    }

    try {
      const integrationPage = getState().integrationState.integrationPage;
      dispatch(updateIntegrationPage(isStart ? 0 : integrationPage + 1));

      const response = await getRecentIntegrations(isStart ? 0 : integrationPage + 1, size, search, category);

      if (response.data) {
        dispatch(getIntegrationAsync.success({
          append: !isStart,
          integrations: response.data
        }));
      } else {
        dispatch(getIntegrationAsync.failure('Unable to get integrations'));
      }
    } catch (error: any) {
      dispatch(getIntegrationAsync.failure(error.message || 'Unable to get integrations'));
    }
  };
};


const getIntegrationAsync = createAsyncAction(
    'GET_INTEGRATIONS',
    'GET_INTEGRATIONS_SUCCESS',
    'GET_INTEGRATIONS_FAILURE',
)<void, IIntegrationReduxResponse, string>();

const updateIntegrationPage = createAction('UPDATE_INTEGRATION_PAGE')<number>();

const getAllIntegrationsAction = () => {
    return async (dispatch: Dispatch) => {
        dispatch(getAllIntegrationsAsync.request());
        try {
            const response = await getAllIntegrations();
            console.log("getAllIntegrationsAction",response);
            if (response?.data) {
                dispatch(getAllIntegrationsAsync.success(response?.data));
            } else {
                dispatch(getAllIntegrationsAsync.failure('Unable to fetch all the integrations at the moment'))
            }
        } catch (error: any) {
            console.log('Unable to fetch all the integrations at the moment')
            console.log(error);
            dispatch(getAllIntegrationsAsync.failure('Unable to fetch all integrations at the moment'));
        }
    }
}

const getAllIntegrationsAsync = createAsyncAction(
    'GET_ALL_INTEGRATIONS',
    'GET_ALL_INTEGRATIONS_SUCCESS',
    'GET_ALL_INTEGRATIONS_FAILURE',
)<void, any, string>();

export { 
    getIntegrationAction, 
    getIntegrationAsync, 
    updateIntegrationPage,
    getAllIntegrationsAction,
    getAllIntegrationsAsync,
 }
