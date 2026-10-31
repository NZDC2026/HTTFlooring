using System.Text.Json;
using Htt.Infrastructure;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class SalesSeriesTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
 private readonly Guid customer=Guid.NewGuid(),branch=Guid.NewGuid(),product=Guid.NewGuid(),uom=Guid.NewGuid();
 private object Fact(string date,decimal net,decimal qty=1,Guid? unit=null,Guid? item=null)=>new{factId=Guid.NewGuid(),date,net=net.ToString(System.Globalization.CultureInfo.InvariantCulture),baseQuantity=qty.ToString(System.Globalization.CultureInfo.InvariantCulture),customerId=customer,branchId=branch,productId=item??product,baseUomId=unit??uom,sku="FLOOR",productName="Floor",baseUnitCode=unit is null?"M2":"PIECE"};
 // Pure arithmetic is private to the database owner; run the actual report helper without exposing a fake-facts API.
 private async Task<JsonElement> OwnedSeries(string from,string to,string bucket,params object[]facts){var result=await db.OwnerScalarAsync("SELECT sales.build_sales_series(@data::jsonb,@from::date,@to::date,@bucket)::text",("data",JsonSerializer.Serialize(facts)),("from",from),("to",to),("bucket",bucket));return JsonDocument.Parse((string)result!).RootElement.Clone();}
 [Fact]public async Task Monthly_customer_product_series_has_zero_buckets_and_calendar_previous_and_year_comparisons()
 {var rows=await OwnedSeries("2026-01-01","2026-04-01","MONTH",Fact("2025-01-15",50),Fact("2025-12-15",80),Fact("2026-01-15",100),Fact("2026-03-15",200));Assert.Equal(3,rows.GetArrayLength());Assert.Equal(100,D(rows[0].GetProperty("net")));Assert.Equal(0,D(rows[1].GetProperty("net")));Assert.Equal(25,D(rows[0].GetProperty("previousBucket").GetProperty("percent")));Assert.Equal(100,D(rows[0].GetProperty("yearAgo").GetProperty("percent")));Assert.Equal("NO_BASELINE",rows[2].GetProperty("previousBucket").GetProperty("status").GetString());}
 [Fact]public async Task Leap_day_has_no_fabricated_year_equivalent_and_Feb28_compares_once()
 {var rows=await OwnedSeries("2024-02-28","2024-03-01","DAY",Fact("2023-02-28",10),Fact("2024-02-28",20),Fact("2024-02-29",30));Assert.Equal(2,rows.GetArrayLength());Assert.Equal(10,D(rows[0].GetProperty("yearAgo").GetProperty("baseline")));Assert.Equal("NO_CALENDAR_EQUIVALENT",rows[1].GetProperty("yearAgo").GetProperty("status").GetString());Assert.Equal(JsonValueKind.Null,rows[1].GetProperty("yearAgo").GetProperty("percent").ValueKind);}
 [Fact]public async Task Partial_month_intervals_compare_corresponding_calendar_boundaries()
 {var rows=await OwnedSeries("2026-03-15","2026-04-01","MONTH",Fact("2026-02-14",500),Fact("2026-02-15",25),Fact("2026-03-14",800),Fact("2026-03-15",50));Assert.Equal(50,D(rows[0].GetProperty("net")));Assert.Equal(25,D(rows[0].GetProperty("previousBucket").GetProperty("baseline")));}
 [Fact]public async Task Different_base_units_never_merge_quantities()
 {var unit=Guid.NewGuid();var p=Guid.NewGuid();var rows=await OwnedSeries("2026-01-01","2026-02-01","MONTH",Fact("2026-01-01",100,10),Fact("2026-01-01",50,3,unit,p));Assert.Equal(2,rows.GetArrayLength());Assert.Equal(2,rows.EnumerateArray().Select(x=>x.GetProperty("baseUomId").GetString()).Distinct().Count());}
 [Theory][InlineData(0,"NO_BASELINE")][InlineData(-10,"NEGATIVE_BASELINE")][InlineData(10,"COMPARABLE")]
 public async Task Zero_and_negative_baselines_do_not_invent_growth_percent(decimal baseline,string status)
 {var rows=await OwnedSeries("2026-02-01","2026-03-01","MONTH",Fact("2026-01-01",baseline),Fact("2026-02-01",20));var comparison=rows[0].GetProperty("previousBucket");Assert.Equal(status,comparison.GetProperty("status").GetString());if(baseline<=0)Assert.Equal(JsonValueKind.Null,comparison.GetProperty("percent").ValueKind);}
 [Fact]public async Task Quantities_round_after_aggregation_so_fractional_full_credit_closes_to_zero()
 {var rows=await OwnedSeries("2026-01-01","2026-02-01","MONTH",Fact("2026-01-01",100,1),Fact("2026-01-02",-33.33m,-1m/3),Fact("2026-01-03",-33.33m,-1m/3),Fact("2026-01-04",-33.34m,-1m/3));Assert.Equal(0,D(rows[0].GetProperty("net")));Assert.Equal(0,D(rows[0].GetProperty("baseQuantity")));}
 [Fact]public async Task Dimension_bucket_explosion_is_rejected_before_expanding_output()
 {var facts=Enumerable.Range(0,5001).Select(x=>Fact("2026-01-01",1,item:Guid.NewGuid())).ToArray();var error=await Assert.ThrowsAsync<Npgsql.PostgresException>(()=>OwnedSeries("2026-01-01","2026-02-01","MONTH",facts));Assert.Equal("HR422",error.SqlState);}
 [Fact]public async Task Series_helper_is_not_an_application_side_fake_fact_endpoint()
 {await using var s=await db.SessionAsync();var e=await Assert.ThrowsAsync<Npgsql.PostgresException>(()=>Sql.RowsAsync(s,"SELECT sales.build_sales_series('[]','2026-01-01','2026-02-01','MONTH')",default));Assert.Equal("42501",e.SqlState);}
}
