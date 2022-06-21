import { createReducer, on } from '@ngrx/store';
import { onConnect } from '../actions/address.actions';

export const initialState = {};

export const AddressReducer = createReducer(
  initialState,
  on(onConnect, (state, { content }) => ({
    ...state,
    content,
  }))
);
