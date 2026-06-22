import {getType, ActionType} from "typesafe-actions";
import * as LoginActions from './login.actions';
import {ILoginState, defaultLoginState} from "./login.state";

const {setUserOnboarded} = LoginActions;

type ILoginAction = ActionType<typeof LoginActions>;

export const loginReducer = (state: ILoginState = defaultLoginState, action: ILoginAction): ILoginState => {
    switch (action.type) {
        case getType(setUserOnboarded):
            return {
                ...state,
                userOnboarded: action.payload
            }
        default:
            return state;
    }
}
