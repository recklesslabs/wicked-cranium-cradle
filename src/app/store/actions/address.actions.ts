import { createAction, props } from '@ngrx/store';

export const onConnect = createAction(
  '[onConnect Component] onConnect',
  props<{ content: any }>()
);
