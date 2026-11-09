type EnvironmentKey = 'API_PORT'|'HOST'|'HTT_DATA_DIR'|'PUBLIC_ORIGIN'|'COOKIE_SECURE'|'HTT_OCR_HELPER'|'RESEND_API_KEY'|'WEB_ONLY'|'HTT_ACCEPTANCE_PROFILE'|'HTT_G17_CASE'|'HTT_ROUTE_EVIDENCE'|'HTT_RELEASE_TAG'|'CSC_LINK'|'CSC_KEY_PASSWORD'|'CSC_NAME'|'APPLE_ID'|'APPLE_APP_SPECIFIC_PASSWORD'|'APPLE_TEAM_ID'|'CSC_IDENTITY_AUTO_DISCOVERY'|'npm_execpath'|'VITE_DEV_SERVER_URL';
declare const environment: Readonly<Partial<Record<EnvironmentKey,string>>> & {
 required(key:EnvironmentKey):string;
 childEnvironment(overrides?:Record<string,string|undefined>):NodeJS.ProcessEnv;
};
export = environment;
