using System.Text.Json;
using System.Text.Json.Serialization;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.MasterData;
public sealed record TaskDetails(string Title,Guid AssigneeId,string? Description=null,Guid? CustomerId=null,Guid? BranchId=null,string Priority="NORMAL",DateTimeOffset? DueAt=null,DateTimeOffset? ReminderAt=null);
public sealed record TaskCreate(Guid Id,TaskDetails Data);
public sealed record TaskOperation(Guid OperationId,long Sequence,Guid Id,string Action,long? Version=null,TaskDetails? Data=null);
public sealed record MessageRead([property:JsonRequired]bool Read);
public sealed record NoteFollow([property:JsonRequired]bool Enabled);
public sealed record PushPreferences([property:JsonRequired]bool PushEnabled,[property:JsonRequired]bool TasksPush,[property:JsonRequired]bool NotesPush);
public sealed record PushSubscription(string Token,string Platform,[property:JsonRequired]bool Enabled);
public sealed record PushRetry(string ExpectedState,[property:JsonRequired]bool AcceptDuplicateDelivery);
internal static class TaskNotificationEndpoints
{
 private static async Task<object> Value(CompanySession s,string sql,CancellationToken ct,params DbArg[]args)=>Element((await One(s,sql+"::text AS body",ct,args))["body"]!);
 private static Task Guard(CompanySession s,Guid id,bool write,CancellationToken ct)=>Read(s,"SELECT crm.require_task(@id,@write)",ct,new DbArg("id",id),new DbArg("write",write));
 private static TaskDetails Normalize(TaskDetails? x)
 {Check.That(x is not null,"data","Task details required.");Check.That(x!.AssigneeId!=Guid.Empty&&x.CustomerId!=Guid.Empty&&x.BranchId!=Guid.Empty,"ids","Supply nonempty IDs.");Check.That(x.BranchId is null||x.CustomerId is not null,"branchId","Customer required for branch.");Check.That(x.ReminderAt is null||x.DueAt is not null&&x.ReminderAt<=x.DueAt,"reminderAt","Reminder must not follow due time.");Check.That(x.DueAt!=default(DateTimeOffset)&&x.ReminderAt!=default(DateTimeOffset),"dates","Valid timestamps required.");return x with{Title=Check.Text(x.Title,"title"),Description=Check.Optional(x.Description,"description",10000),Priority=Check.OneOf(x.Priority,"priority","LOW","NORMAL","HIGH","URGENT"),DueAt=x.DueAt?.ToUniversalTime(),ReminderAt=x.ReminderAt?.ToUniversalTime()};}
 private static Task DataGuard(CompanySession s,TaskDetails data,CancellationToken ct)=>Read(s,"SELECT crm.authorize_task_data(@data)",ct,new DbArg("data",Json(data),NpgsqlDbType.Jsonb));
 private static Task<object> Command(CompanySession s,Guid id,string action,long? version,TaskDetails? data,CancellationToken ct)=>Value(s,"SELECT crm.task_command(@id,@action,@version,@data)",ct,new DbArg("id",id),new DbArg("action",action),new DbArg("version",version,NpgsqlDbType.Bigint),new DbArg("data",data is null?"{}":Json(data),NpgsqlDbType.Jsonb));
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/crm/task-assignees",async(Guid? customerId,string? q,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{q=Check.Optional(q,"q",100);var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=await Value(s,"SELECT crm.task_assignees(@customer,@q,@size,@offset)",ct,new DbArg("customer",customerId,NpgsqlDbType.Uuid),new DbArg("q",q,NpgsqlDbType.Text),new DbArg("size",size),new DbArg("offset",offset)),page=page??1,pageSize=size});}).WithMetadata(new Permission("crm.tasks.write"));
  g.MapGet("/crm/notes/{id:guid}/follow",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.follow_view(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("crm.notifications.read"));
  g.MapGet("/crm/tasks",List).WithMetadata(new Permission("crm.tasks.read"));
  g.MapPost("/crm/tasks",Create).WithMetadata(new Permission("crm.tasks.write"));
  g.MapGet("/crm/tasks/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.task_json(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("crm.tasks.read"));
  g.MapGet("/crm/tasks/{id:guid}/history",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.task_history_view(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("crm.tasks.read"));
  g.MapPut("/crm/tasks/{id:guid}",Update).WithMetadata(new Permission("crm.tasks.write"));
  foreach(var action in new[]{"START","COMPLETE","CANCEL","REOPEN","DELETE"}){var operation=action;g.MapPost("/crm/tasks/{id:guid}/"+action.ToLowerInvariant(),async(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Change(id,operation,h,s,idem,ct)).WithMetadata(new Permission("crm.tasks.write"));}
  g.MapPost("/crm/mobile/devices/{device:guid}/task-operations",Push).WithMetadata(new Permission("crm.mobile.sync"));
  g.MapGet("/crm/messages",Messages).WithMetadata(new Permission("crm.notifications.read"));
  g.MapGet("/crm/messages/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.message_json(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("crm.notifications.read"));
  g.MapPut("/crm/messages/{id:guid}/read",ReadMessage).WithMetadata(new Permission("crm.notifications.read"));
  g.MapGet("/crm/messages/{id:guid}/push",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.push_status(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("crm.notifications.read"));
  g.MapPost("/crm/push/jobs/{id:guid}/retry",Retry).WithMetadata(new Permission("crm.push.write"));
  g.MapPut("/crm/notes/{id:guid}/follow",Follow).WithMetadata(new Permission("crm.notifications.read"));
  g.MapGet("/crm/notification-preferences",async(CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.preferences_view()",ct))).WithMetadata(new Permission("crm.push.write"));
  g.MapPut("/crm/notification-preferences",Preferences).WithMetadata(new Permission("crm.push.write"));
  g.MapGet("/crm/mobile/devices/{device:guid}/push-subscription",async(Guid device,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.subscription_view(@device)",ct,new DbArg("device",device)))).WithMetadata(new Permission("crm.push.write"));
  g.MapPut("/crm/mobile/devices/{device:guid}/push-subscription",Subscribe).WithMetadata(new Permission("crm.push.write"));
  g.MapGet("/crm/action-centre",async(CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT crm.action_centre()",ct))).WithMetadata(new Permission("crm.tasks.read"));
 }
 private static async Task<IResult> List(Guid? assigneeId,Guid? customerId,string? state,DateTimeOffset? dueBefore,int? page,int? pageSize,CompanySession s,CancellationToken ct)
 {if(state is not null)Check.OneOf(state,"state","OPEN","IN_PROGRESS","COMPLETED","CANCELLED");var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=await Value(s,"SELECT crm.task_list(@filter)",ct,new DbArg("filter",Json(new{assigneeId,customerId,state,dueBefore=dueBefore?.ToUniversalTime(),offset,size}),NpgsqlDbType.Jsonb)),page=page??1,pageSize=size});}
 private static async Task<IResult> Create(TaskCreate x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.That(x.Id!=Guid.Empty,"id","Stable task ID required.");var data=Normalize(x.Data);await Read(s,"SELECT crm.task_create_guard(@id,@data)",ct,new DbArg("id",x.Id),new DbArg("data",Json(data),NpgsqlDbType.Jsonb));return await Write("create",x.Id,new{x.Id,data},h,s,idem,ct,()=>Command(s,x.Id,"CREATE",null,data,ct),201);}
 private static async Task<IResult> Update(Guid id,TaskDetails x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Guard(s,id,true,ct);await Read(s,"SELECT crm.require_live_task(@id)",ct,new DbArg("id",id));var data=Normalize(x);await DataGuard(s,data,ct);var version=Version(h);return await Write("update",id,new{id,version,data},h,s,idem,ct,()=>Command(s,id,"UPDATE",version,data,ct));}
 private static async Task<IResult> Change(Guid id,string action,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Guard(s,id,true,ct);if(action!="DELETE")await Read(s,"SELECT crm.require_live_task(@id)",ct,new DbArg("id",id));var version=Version(h);return await Write(action.ToLowerInvariant(),id,new{id,version},h,s,idem,ct,()=>Command(s,id,action,version,null,ct));}
 private static async Task<IResult> Push(Guid device,TaskOperation x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Read(s,"SELECT crm.require_mobile_device(@device),crm.require_mobile('crm.tasks.read'),crm.require_mobile('crm.tasks.write')",ct,new DbArg("device",device));Check.That(x.OperationId!=Guid.Empty&&x.Id!=Guid.Empty&&x.Sequence>0,"operation","Stable IDs and positive sequence required.");Check.OneOf(x.Action,"action","CREATE","UPDATE","START","COMPLETE","CANCEL","REOPEN","DELETE");TaskDetails? data=null;if(x.Action!="CREATE"){await Guard(s,x.Id,true,ct);if(x.Action!="DELETE")await Read(s,"SELECT crm.require_live_task(@id)",ct,new DbArg("id",x.Id));Check.That(x.Version>0,"version","Expected version required.");}if(x.Action is"CREATE"or"UPDATE"){data=Normalize(x.Data);await DataGuard(s,data,ct);}await Read(s,"SELECT crm.task_offline_cache_guard(@id)",ct,new DbArg("id",x.Id));var request=new{domain="TASK",id=x.Id,action=x.Action,version=x.Version,data};return await Write("push",x.Id,new{device,x.OperationId,x.Sequence,request},h,s,idem,ct,()=>Value(s,"SELECT crm.task_push(@device,@op,@seq,@data)",ct,new DbArg("device",device),new DbArg("op",x.OperationId),new DbArg("seq",x.Sequence),new DbArg("data",Json(request),NpgsqlDbType.Jsonb)));}
 private static async Task<IResult> Messages(bool? unread,int? page,int? pageSize,CompanySession s,CancellationToken ct)
 {var(offset,size)=Page(page,pageSize);return Results.Ok(await Value(s,"SELECT crm.message_list(@unread,@size,@offset)",ct,new DbArg("unread",unread??false),new DbArg("size",size),new DbArg("offset",offset)));}
 private static async Task<IResult> ReadMessage(Guid id,MessageRead x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Value(s,"SELECT crm.message_json(@id)",ct,new DbArg("id",id));var version=Version(h);return await Write("read",id,new{id,version,x.Read},h,s,idem,ct,()=>Value(s,"SELECT crm.mark_message(@id,@v,@read)",ct,new DbArg("id",id),new DbArg("v",version),new DbArg("read",x.Read)));}
 private static async Task<IResult> Follow(Guid id,NoteFollow x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Read(s,"SELECT crm.require_collab(@id,false)",ct,new DbArg("id",id));var version=InitialVersion(h);return await Write("follow",id,new{id,version,x.Enabled},h,s,idem,ct,()=>Value(s,"SELECT crm.follow_note(@id,@enabled,@v)",ct,new DbArg("id",id),new DbArg("enabled",x.Enabled),new DbArg("v",version)));}
 private static async Task<IResult> Preferences(PushPreferences x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {var version=InitialVersion(h);return await Write("preferences",Guid.Empty,new{version,x},h,s,idem,ct,()=>Value(s,"SELECT crm.set_preferences(@v,@push,@tasks,@notes)",ct,new DbArg("v",version),new DbArg("push",x.PushEnabled),new DbArg("tasks",x.TasksPush),new DbArg("notes",x.NotesPush)));}
 private static async Task<IResult> Subscribe(Guid device,PushSubscription x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Read(s,"SELECT crm.require_mobile_device(@device)",ct,new DbArg("device",device));Check.That(x.Token is{Length:>=20 and<=4096}&&!x.Token.Any(char.IsWhiteSpace)&&!x.Token.Any(char.IsControl),"token","Valid FCM registration token required.");Check.OneOf(x.Platform,"platform","ANDROID","IOS","WEB");var version=InitialVersion(h);return await Write("subscribe",device,new{device,version,x},h,s,idem,ct,()=>Value(s,"SELECT crm.set_subscription(@device,@v,@token,@platform,@enabled)",ct,new DbArg("device",device),new DbArg("v",version),new DbArg("token",x.Token),new DbArg("platform",x.Platform),new DbArg("enabled",x.Enabled)));}
 private static async Task<IResult> Retry(Guid id,PushRetry x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.OneOf(x.ExpectedState,"expectedState","FAILED","UNKNOWN");await Read(s,"SELECT crm.require_push_retry(@id)",ct,new DbArg("id",id));return await Write("retry",id,new{id,x},h,s,idem,ct,async()=>{await Read(s,"SELECT crm.retry_push(@id,@state,@ack)",ct,new DbArg("id",id),new DbArg("state",x.ExpectedState),new DbArg("ack",x.AcceptDuplicateDelivery));return new{id,state="RETRY"};});}
 private static long InitialVersion(HttpContext h)
 {if(!long.TryParse(h.Request.Headers.IfMatch.ToString().Trim('"'),out var v)||v<0)throw new BusinessException("version_required","Supply If-Match, using 0 for first registration.",428);return v;}
 private static async Task<IResult> Write(string action,Guid id,object input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct,Func<Task<object>> run,int status=200)
 {var result=await idem.ExecuteAsync("POST /crm/task-notifications/"+action,h.Request.Headers["Idempotency-Key"].ToString(),Json(input),async()=>{var value=await run();await Sql.AuditAsync(s,"crm.tasks_"+action,"crm_task_notification",id,h.TraceIdentifier,ct);return ApiJson.Stored(value,status);},ct);return ApiJson.Result(result);}
}
