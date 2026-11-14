export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type Context = {
  companyId: string;
  companyName: string;
  grantId: string;
  grantVersion: number;
  customerId: string;
  customerCode: string;
  customerName: string;
};

export type Branch = {
  id: string;
  code: string;
  name: string;
};

export type Identity = {
  contexts: Context[];
  dataAsOf: string;
};

export type Branches = {
  customerId: string;
  grantId: string;
  items: Branch[];
};
