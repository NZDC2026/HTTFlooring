export type CaptureSourceCheck=(id:string)=>{name:string;sha256:string};
let check:CaptureSourceCheck=()=>{throw new Error('Recognition evidence requires the secure desktop.');};
export function configureCaptureSourceCheck(fn:CaptureSourceCheck){check=fn;}
export const checkedCaptureSource=(id:string)=>check(id);
