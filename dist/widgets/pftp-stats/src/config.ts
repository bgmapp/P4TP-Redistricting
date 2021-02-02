import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  editDistricts: string;
}

export type IMConfig = ImmutableObject<Config>;
