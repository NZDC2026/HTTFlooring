import {describe,it,expect} from 'vitest';
// @ts-expect-error Release tooling is native ESM, exercised directly here.
import {validateRelease} from '../../../scripts/release-preflight.mjs';
import pkg from '../../../package.json';
const valid={pkg,node:pkg.engines.node,pnpm:pkg.engines.pnpm,platform:'darwin',tag:`v${pkg.version}`,dirty:false,env:{CSC_LINK:'synthetic',CSC_KEY_PASSWORD:'synthetic',CSC_NAME:'Developer ID Application: Synthetic',APPLE_ID:'synthetic',APPLE_APP_SPECIFIC_PASSWORD:'synthetic',APPLE_TEAM_ID:'synthetic'}};
describe('formal release gate',()=>{
 it('accepts complete macOS inputs without claiming a signed artifact exists',()=>expect(validateRelease(valid)).toEqual([]));
 it('rejects missing credentials without exposing secret values',()=>{const errors=validateRelease({...valid,env:{CSC_KEY_PASSWORD:'DO-NOT-PRINT'}});expect(errors.join(' ')).toMatch(/Missing signing/);expect(errors.join(' ')).not.toContain('DO-NOT-PRINT');});
 it.each([{node:'22.0.0'},{pnpm:'9.0.0'},{tag:'v9.9.9'},{dirty:true},{platform:'linux'},{env:{...valid.env,CSC_IDENTITY_AUTO_DISCOVERY:'false'}},{env:{...valid.env,CSC_NAME:'-'}}])('rejects unsafe release input %j',override=>expect(validateRelease({...valid,...override}).length).toBeGreaterThan(0));
 it('rejects floating dependency ranges',()=>expect(validateRelease({...valid,pkg:{...pkg,dependencies:{react:'^19.3.0'}}}).join()).toMatch(/exact/));
 it('uses independent Windows signing requirements',()=>expect(validateRelease({...valid,platform:'win32',env:{CSC_LINK:'synthetic',CSC_KEY_PASSWORD:'synthetic'}})).toEqual([]));
});
