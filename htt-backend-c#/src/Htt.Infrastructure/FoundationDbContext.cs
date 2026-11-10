using Htt.Modules.Foundation;
using Microsoft.EntityFrameworkCore;

namespace Htt.Infrastructure;

public sealed class FoundationDbContext(DbContextOptions<FoundationDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Party> Parties => Set<Party>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductUnit> ProductUnits => Set<ProductUnit>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Customer>().ToTable("customers", "crm");
        model.Entity<Party>().ToTable("parties", "crm");
        model.Entity<Product>().ToTable("products", "catalog");
        model.Entity<ProductUnit>().ToTable("product_units", "catalog");
        foreach (var entity in model.Model.GetEntityTypes())
        foreach (var property in entity.GetProperties())
        {
            property.SetColumnName(string.Concat(property.Name.Select((c, i) =>
                char.IsUpper(c) && i > 0 ? "_" + char.ToLowerInvariant(c) : char.ToLowerInvariant(c).ToString())));
            if (property.Name == "Version") property.IsConcurrencyToken = true;
            if (property.ClrType == typeof(decimal)) property.SetColumnType("numeric(20,6)");
        }
        model.Entity<Customer>().Property(x => x.CreditLimit).HasColumnType("numeric(20,2)");
    }
}
