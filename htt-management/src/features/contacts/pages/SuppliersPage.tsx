import {useSearchParams} from 'react-router-dom';
import {LegacySuppliersPage} from './LegacySuppliersPage';
import {SupplierWorkspace} from '../suppliers-workspace/SupplierWorkspace';
export function SuppliersPage(){const [params]=useSearchParams();return params.get('view')==='legacy'?<LegacySuppliersPage/>:<SupplierWorkspace initialTab="all"/>;}
