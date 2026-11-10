using System.Text.Json;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
internal static class FinancialReportAssertions
{
 public static async Task Check(HttpClient c)
 {
  var date=DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));var start=date.AddDays(-365);
  var bas=await Get(c,$"/accounting/reports/gst-bas?from={start:yyyy-MM-dd}&to={date.AddDays(1):yyyy-MM-dd}");Assert.True(bas.GetProperty("ledgerStatus").GetString()=="RECONCILED",bas.GetRawText());
  var bs=await Get(c,$"/accounting/reports/balance-sheet?asOf={date:yyyy-MM-dd}&fiscalYearStart={start:yyyy-MM-dd}");Assert.Equal("BALANCED",bs.GetProperty("status").GetString());
  var pl=await Get(c,$"/accounting/reports/profit-and-loss?from={start:yyyy-MM-dd}&to={date.AddDays(1):yyyy-MM-dd}");Assert.Equal(D(pl.GetProperty("totals").GetProperty("netProfit")),D(bs.GetProperty("totals").GetProperty("currentYearEarnings")));
  var cf=await Get(c,$"/accounting/reports/cash-flow?from={start:yyyy-MM-dd}&to={date.AddDays(1):yyyy-MM-dd}");Assert.True(cf.GetProperty("ledgerStatus").GetString()=="RECONCILED",cf.GetRawText());Assert.Equal(0,D(cf.GetProperty("totals").GetProperty("movementDifference")));Assert.Equal(0,D(cf.GetProperty("totals").GetProperty("bankScopeDifference")));Assert.Equal(0,D(cf.GetProperty("totals").GetProperty("internalNet")));
  foreach(var side in new[]{"receivables","payables"})
  {
   var aging=await Get(c,$"/accounting/reports/{side}-aging?asOf={date:yyyy-MM-dd}");Assert.True(aging.GetProperty("status").GetString()=="RECONCILED",aging.GetRawText());var t=aging.GetProperty("totals");Assert.Equal(D(t.GetProperty("outstanding"))-D(t.GetProperty("availableCredit")),D(t.GetProperty("netBalance")));Assert.Equal(D(t.GetProperty("outstanding")),new[]{"current","days1To30","days31To60","days61To90","daysOver90"}.Sum(x=>D(t.GetProperty(x))));
  }
 }
}
