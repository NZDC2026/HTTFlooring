import { registerRepository } from '../security/repositoryHost';
import { instructionState,restoreInstructionState,publishInstructionState } from './instructionState';
const required=(_input:unknown):any=>{throw new Error('Use the secure desktop application.');};
export const bankInstructionClient={savePayer:required,saveBeneficiary:required,preview:required,prepare:required,approve:required,exportFile:required,void:required,recordLocal:required,reverseLocal:required};
registerRepository('bankInstructions',{repository:bankInstructionClient,read:'banking.read',commands:{savePayer:'banking.write',saveBeneficiary:'banking.write',preview:'banking.read',prepare:'banking.write',approve:'accounting.post',exportFile:'banking.write',void:'banking.write',recordLocal:'banking.write',reverseLocal:'banking.write'},snapshot:instructionState,restore:restoreInstructionState,publish:publishInstructionState});
