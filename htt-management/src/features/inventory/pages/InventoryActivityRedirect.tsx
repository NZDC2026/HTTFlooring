import {Navigate,useSearchParams} from 'react-router-dom';
/** Keep saved Sold / Bought links, warehouse and sample context. */
export function InventoryActivityRedirect(){const [params]=useSearchParams();const next=new URLSearchParams(params);next.set('tab','sold-bought');next.delete('stock');return <Navigate replace to={'/inventory?'+next.toString()}/>;}
