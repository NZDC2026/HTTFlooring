import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useSecurity } from "../security/securityClient";
export function DocumentTrashLink({recordId,status}:{recordId:string;status:string}){
 const {session}=useSecurity();
 if(!session?.user.roles.includes('ADMIN')||status!=='DRAFT')return null;
 return <Link className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50" to={`/settings/trash?state=active&recordId=${encodeURIComponent(recordId)}`}><Trash2 size={14}/>Move to Trash</Link>;
}
