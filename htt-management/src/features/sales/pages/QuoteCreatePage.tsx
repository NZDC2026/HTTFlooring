import {useNavigate,useSearchParams} from 'react-router-dom';
import {SalesEntryEditor} from '../components/SalesEntryEditor';
import {salesRepository} from '../data/salesRepository';
export function QuoteCreatePage(){
 const navigate=useNavigate(),[query]=useSearchParams();
 return <SalesEntryEditor kind="QUOTE" initialSample={query.get('sample')==='1'} initial={{customerId:query.get('customerId')??''}} onCancel={()=>navigate('/sales')} onSave={value=>{const saved=salesRepository.createQuote(value);navigate('/sales/quotes/'+saved.id);return saved.id;}}/>;
}
