using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
namespace Htt.Host.Api;
internal static class GlobalSearchEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/search", async (string? q, string? kind, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            var row = await One(s, "SELECT platform.global_search(@q,@kind,@page,@size)::text AS body", ct,
                new DbArg("q", q, NpgsqlDbType.Text), new DbArg("kind", kind, NpgsqlDbType.Text),
                new DbArg("page", page ?? 1), new DbArg("size", pageSize ?? 25));
            return Results.Content((string)row["body"]!, "application/json");
        }).WithMetadata(new Permission("search.global.read"));
    }
}
