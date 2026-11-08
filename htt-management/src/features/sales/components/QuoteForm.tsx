import {SalesEntryEditor} from './SalesEntryEditor';
import {salesRepository} from '../data/salesRepository';
interface QuoteFormProps{customerId:string;customerName:string;onCancel:()=>void;onSaved:()=>void;}
export function QuoteForm({customerId,onCancel,onSaved}:QuoteFormProps){return <SalesEntryEditor kind="QUOTE" initial={{customerId}} onCancel={onCancel} onSave={value=>{const {expiryDate,...draft}=value;salesRepository.createQuote({...draft,expiryDate});onSaved();}}/>;}
