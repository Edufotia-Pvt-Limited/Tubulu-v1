import {createAction} from "typesafe-actions";

const setUserOnboarded = createAction('SET_USER_ONBOARDED')<boolean>();

export {setUserOnboarded};
