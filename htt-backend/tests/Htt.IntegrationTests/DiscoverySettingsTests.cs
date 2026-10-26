using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class DiscoverySettingsTests:IAsyncLifetime
{
    private static Task<JsonElement> VerifiedGet(HttpClient c,string path)=>ReadVerified(c,path);
    private static async Task<JsonElement> ReadVerified(HttpClient c,string path)=>await Expect(await c.GetAsync("/api/v1"+path),HttpStatusCode.OK);
 private readonly DatabaseFixture db=new();public Task InitializeAsync()=>db.InitializeAsync();public Task DisposeAsync()=>db.DisposeAsync();
 [Fact] public async Task Settings_optimistic_concurrency_replay_and_prospective_defaults()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var before=await VerifiedGet(c,"/settings/business");var input=new BusinessPreferencesInput(14,21,45,"DELIVERY");var key=Code();var version=before.GetProperty("version").GetInt64();var first=await Expect(await Send(c,HttpMethod.Put,"/settings/business",input,version,key),HttpStatusCode.OK);var replay=await Expect(await Send(c,HttpMethod.Put,"/settings/business",input,version,key),HttpStatusCode.OK);Assert.True(JsonElement.DeepEquals(first,replay));await Expect(await Send(c,HttpMethod.Put,"/settings/business",input,version),HttpStatusCode.Conflict);
  var id=await Create(c,"/customers",new CustomerDraft(Code(),"New terms",null));Assert.Equal(14,Convert.ToInt32(await db.OwnerScalarAsync("SELECT payment_terms_days FROM crm.customers WHERE company_id=@company AND id=@id",("company",db.Company),("id",id))));var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"New supplier terms",null));Assert.Equal(21,Convert.ToInt32(await db.OwnerScalarAsync("SELECT payment_terms_days FROM crm.suppliers WHERE company_id=@company AND id=@id",("company",db.Company),("id",supplier))));
  var current=first.GetProperty("version").GetInt64();var race=await Task.WhenAll(Send(c,HttpMethod.Put,"/settings/business",input with{SalesTermsDays=7},current),Send(c,HttpMethod.Put,"/settings/business",input with{SalesTermsDays=28},current));Assert.Single(race,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(race,x=>x.StatusCode==HttpStatusCode.Conflict);
 }
 [Fact] public async Task Numbering_cannot_rewind_and_uses_shared_sequence_version()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var seq=(await VerifiedGet(c,"/settings/document-numbering")).GetProperty("items").EnumerateArray().First(x=>x.GetProperty("documentType").GetString()=="LOCATION_MOVE");var version=seq.GetProperty("version").GetInt64();var changed=await Expect(await Send(c,HttpMethod.Put,"/settings/document-numbering/LOCATION_MOVE",new NumberingInput("LOC-",100),version),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,"/settings/document-numbering/LOCATION_MOVE",new NumberingInput("LOC-",99),changed.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);
 }
 [Fact] public async Task Search_catalog_barcodes_and_customer_scopes_are_enforced()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var hidden=await Setup(db,c);var code=Code();var input=new BarcodeInput(d.BoxUnit,code);var key=Code();var created=await Expect(await Send(c,HttpMethod.Post,"/product-barcodes",input,key:key),HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(created,await Expect(await Send(c,HttpMethod.Post,"/product-barcodes",input,key:key),HttpStatusCode.Created)));var found=await VerifiedGet(c,"/search/products?q="+code);Assert.Equal(d.Product,found.GetProperty("items")[0].GetProperty("id").GetGuid());var staff=await Staff(db,"SALES",d);using var sales=api.Authenticated(staff.Subject);var customers=(await Expect(await sales.GetAsync("/api/v1/search/customers"),HttpStatusCode.OK)).GetProperty("items").EnumerateArray().ToArray();Assert.Contains(customers,x=>x.GetProperty("id").GetGuid()==d.Customer);Assert.DoesNotContain(customers,x=>x.GetProperty("id").GetGuid()==hidden.Customer);await Expect(await sales.GetAsync($"/api/v1/customers/{hidden.Customer}/catalog?warehouseId={d.Warehouse}"),HttpStatusCode.NotFound);var catalog=await Expect(await c.GetAsync($"/api/v1/customers/{d.Customer}/catalog?warehouseId={d.Warehouse}&q={code}"),HttpStatusCode.OK);Assert.NotEmpty(catalog.GetProperty("items").EnumerateArray());Assert.NotEmpty((await VerifiedGet(c,$"/search/branches?customerId={d.Customer}&q=Sydney")).GetProperty("items").EnumerateArray());Assert.Empty((await VerifiedGet(c,"/search/customers?q=%25")).GetProperty("items").EnumerateArray());await Expect(await sales.GetAsync("/api/v1/settings/business"),HttpStatusCode.Forbidden);
 }
 [Theory][InlineData(-1,30,30)][InlineData(30,366,30)][InlineData(30,30,0)]
 public async Task Invalid_settings_do_not_change_version(int sales,int purchase,int validity)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var before=await VerifiedGet(c,"/settings/business");await Expect(await Send(c,HttpMethod.Put,"/settings/business",new BusinessPreferencesInput(sales,purchase,validity,"PICKUP"),before.GetProperty("version").GetInt64()),HttpStatusCode.UnprocessableEntity);Assert.Equal(before.GetProperty("version").GetInt64(),(await VerifiedGet(c,"/settings/business")).GetProperty("version").GetInt64());
 }
}
