import { expect,it } from "vitest";
import { collectStaffActivities } from "./staffActivities";
import type { Customer } from "../contacts/types/customer";
import type { Supplier } from "../contacts/types/supplier";
import type { ConfigRow } from "../business-workspace/configurationState";
it("collects all employees' notes, replies and resolutions without losing author attribution",()=>{
 const c={id:"c",businessName:"Customer",notes:[{id:"n",actorId:"sales",actorName:"Alex",text:"Visit",createdAt:"2026-11-01T09:00:00Z"},{id:"reply",threadId:"n",action:"reply",actorId:"warehouse",actorName:"Jamie",text:"Ready",createdAt:"2026-11-02T09:00:00Z"},{id:"done",threadId:"n",action:"resolve",actorId:"sales",actorName:"Alex",text:"Resolved",createdAt:"2026-11-03T09:00:00Z"}]} as Customer;
 const rows=collectStaffActivities([c],[],[],[]);expect(rows).toHaveLength(3);expect(rows.map(r=>r.kind)).toEqual(["Resolved","Reply","Note"]);expect(rows.every(r=>r.status==="Resolved")).toBe(true);expect(rows.find(r=>r.kind==="Reply")?.actorId).toBe("warehouse");
});
it("includes supplier task completions and replies and tracks task creators, owners and completion participants",()=>{
 const supplier={id:"s",businessName:"Supplier",activities:[{id:"t",kind:"Task",text:"Confirm ETA",actorId:"buyer",actorName:"Buyer",at:"2026-11-01T09:00:00Z",due:"2026-11-04",replies:[{id:"r",actorId:"warehouse",actorName:"Jamie",at:"2026-11-02T09:00:00Z",text:"Received"}],completion:{id:"d",actorId:"finance",actorName:"Morgan",at:"2026-11-03T09:00:00Z",text:"Done"}}]} as Supplier;
 const task={revision:"1",updatedAt:"2026-11-03T09:00:00Z",id:"task",name:"Deliver",notes:"Loading dock",customerId:"c",owner:"warehouse",ownerName:"Jamie",createdAt:"2026-11-01T08:00:00Z",status:"Completed",due:"2026-11-04",completedBy:"finance"} as ConfigRow;
 const history=[{id:"h",name:"Save",status:"Active",revision:"1",updatedAt:"2026-11-01T08:00:00Z",recordId:"task",actorId:"sales",createdAt:"2026-11-01T08:00:00Z"}] as ConfigRow[];
 const rows=collectStaffActivities([], [supplier], [task], history);expect(rows).toHaveLength(4);expect(rows.filter(r=>r.status==="Completed")).toHaveLength(4);
 expect(rows.find(r=>r.id==="task-task")?.participants).toEqual(expect.arrayContaining(["sales","warehouse","finance"]));expect(rows.find(r=>r.id==="task-task")?.actorId).toBe("sales");expect(rows.find(r=>r.kind==="Resolved")?.actorId).toBe("finance");
});
