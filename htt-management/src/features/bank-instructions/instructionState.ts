import { useSyncExternalStore } from 'react';
import type { AbaPayer,AbaCredit } from './aba';
export type InstructionKind='SUPPLIER'|'PAYROLL';
export type Profile={id:string;bankAccountId:string;revision:number;values:AbaPayer;sourceRevision:string;actorId:string;at:string;reason:string};
export type Beneficiary={id:string;kind:InstructionKind;entityId:string;revision:number;bsb:string;account:string;title:string;sourceRevision:string;actorId:string;at:string;reason:string};
export type Instruction={id:string;operationId:string;kind:InstructionKind;sourceId:string;bankAccountId:string;date:string;status:'Prepared'|'Approved'|'Exported'|'Recorded locally'|'Voided'|'Reversed locally';revision:number;financialToken:string;sourceToken:string;payer:Profile;beneficiaries:Beneficiary[];credits:AbaCredit[];text:string;sha256:string;createdBy:string;approvedBy?:string;localPaymentIds:string[];externalReference?:string;history:{id:string;action:string;actorId:string;at:string;reason:string;revision:number}[]};
export type InstructionState={profiles:Profile[];beneficiaries:Beneficiary[];instructions:Instruction[];receipts:{operationId:string;fingerprint:string;actorId:string;input:Record<string,unknown>;result:unknown}[]};
let state:InstructionState={profiles:[],beneficiaries:[],instructions:[],receipts:[]},version=0;const listeners=new Set<()=>void>();
export const instructionState=()=>state;
export const restoreInstructionState=(value:InstructionState)=>{state=value;};
export const publishInstructionState=()=>{version++;listeners.forEach(f=>f());};
export function useBankInstructions(){useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f);};},()=>version,()=>version);return state;}
