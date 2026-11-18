import {useSearchParams} from 'react-router-dom';
import {ReportsReferenceWorkspace} from '../reference/ReportsReferenceWorkspace';
import {ReportsFrame} from '../ReportsFrame';
import {DashboardPage} from '../../dashboard/pages/DashboardPage';

export function SummariesPage(){
 const [params]=useSearchParams();
 if(params.get('view')!=='legacy')return <ReportsReferenceWorkspace/>;
 return <ReportsFrame category="Summaries"><DashboardPage/></ReportsFrame>;
}
