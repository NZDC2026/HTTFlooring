namespace Htt.Modules.Foundation;

public sealed class Customer
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid PartyId { get; set; }
    public string Code { get; set; } = "";
    public string Status { get; set; } = "ACTIVE";
    public decimal CreditLimit { get; set; }
    public int PaymentTermsDays { get; set; }
    public long Version { get; set; }
}

public sealed class Party
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string LegalName { get; set; } = "";
    public string? Abn { get; set; }
    public string Country { get; set; } = "AU";
}

public sealed class Product
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public string ItemType { get; set; } = "STOCK";
    public string Status { get; set; } = "ACTIVE";
    public Guid BaseUomId { get; set; }
    public bool WholePacks { get; set; }
    public long Version { get; set; }
}

public sealed class ProductUnit
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid ProductId { get; set; }
    public Guid UomId { get; set; }
    public decimal ConversionToBase { get; set; }
    public decimal QuantityStep { get; set; }
    public bool Active { get; set; } = true;
    public long Version { get; set; }
}
