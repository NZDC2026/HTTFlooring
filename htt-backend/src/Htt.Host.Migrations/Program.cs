using Htt.Infrastructure;

var connection = Environment.GetEnvironmentVariable("HTT_MIGRATION_CONNECTION")
    ?? throw new InvalidOperationException("Set HTT_MIGRATION_CONNECTION to the owner/migration connection. Never use this credential for the API.");
if (args.Length == 0 || args[0] == "migrate")
{
    await MigrationRunner.ApplyAsync(connection);
}
else if (args[0] == "bootstrap")
{
    string Required(string key)
    {
        var index = Array.IndexOf(args, key);
        return index >= 0 && index + 1 < args.Length ? args[index + 1] : throw new ArgumentException($"Missing {key}");
    }
    // No automatic migrations or production data at API startup.
    var id = await CompanyBootstrap.CreateAsync(connection, Required("--name"),
        args.Contains("--abn") ? Required("--abn") : null, Required("--timezone"), Required("--issuer"), Required("--subject"));
    Console.WriteLine($"Company created: {id}");
}
else if (args[0] == "stock-opening")
{
    string Required(string key) { var index = Array.IndexOf(args, key); return index >= 0 && index + 1 < args.Length ? args[index + 1] : throw new ArgumentException($"Missing {key}"); }
    var id = await StockOpening.InitializeAsync(connection, Guid.Parse(Required("--company")), Guid.Parse(Required("--warehouse")), Guid.Parse(Required("--product")), decimal.Parse(Required("--quantity"), System.Globalization.NumberStyles.AllowLeadingSign | System.Globalization.NumberStyles.AllowDecimalPoint, System.Globalization.CultureInfo.InvariantCulture), Required("--reference"), Required("--issuer"), Required("--subject"));
    Console.WriteLine($"Opening recorded: {id}");
}
else if (args[0] == "stock-valuation")
{
    string Required(string key) { var index = Array.IndexOf(args, key); return index >= 0 && index + 1 < args.Length ? args[index + 1] : throw new ArgumentException($"Missing {key}"); }
    var id = await StockValuation.InitializeAsync(connection, Guid.Parse(Required("--company")), Guid.Parse(Required("--warehouse")), Guid.Parse(Required("--product")), decimal.Parse(Required("--value"), System.Globalization.NumberStyles.AllowLeadingSign | System.Globalization.NumberStyles.AllowDecimalPoint, System.Globalization.CultureInfo.InvariantCulture), Required("--reference"), Required("--issuer"), Required("--subject"));
    Console.WriteLine($"Opening valuation recorded: {id}");
}
else if (args[0] == "tax-registration")
{
    string Required(string key) { var index = Array.IndexOf(args, key); return index >= 0 && index + 1 < args.Length ? args[index + 1] : throw new ArgumentException($"Missing {key}"); }
    await CompanyTaxSettings.ConfigureAsync(connection, Guid.Parse(Required("--company")), bool.Parse(Required("--registered")), Required("--basis"), Required("--issuer"), Required("--subject"));
    Console.WriteLine("Company GST settings recorded.");
}
else throw new ArgumentException("Supported commands: tax-registration --company UUID --registered true|false --basis CASH|NON_CASH --issuer ISSUER --subject SUBJECT | stock-valuation --company UUID --warehouse UUID --product UUID --value AUD_VALUE --reference REF --issuer ISSUER --subject SUBJECT | migrate | stock-opening --company UUID --warehouse UUID --product UUID --quantity BASE_QTY --reference REF --issuer ISSUER --subject SUBJECT | bootstrap --name NAME --timezone Australia/Sydney --issuer ISSUER --subject SUBJECT [--abn ABN]");
