import {registerRepository} from '../security/repositoryHost';
import {brandingSnapshot,restoreBranding,publishBranding} from './brandingState';
const required=(_raw:unknown):any=>{throw new Error('Use the secure desktop application.');};
export const brandingClient={upload:required,select:required};
registerRepository('branding',{repository:brandingClient,read:'accounting.read',commands:{upload:'accounting.post',select:'accounting.post'},snapshot:brandingSnapshot,restore:restoreBranding,publish:publishBranding});
