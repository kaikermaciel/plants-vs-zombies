export interface IMajorInput {
  name: string;
  code: string;
  description: string;
}

export interface ISignupInput {
  fullname: string;
  email: string;
  password?: string;
  majorId: string;
}

import 'express-session';
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userFullname: string;
  }
}