using System.Globalization;
using System.Threading.RateLimiting;
using Htt.Host.Api;
using Htt.Host.Api.Inventory;
using Htt.Host.Api.Portal;
using Htt.Infrastructure;
using Htt.Infrastructure.Documents;
using Htt.SharedKernel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Database")
    ?? throw new InvalidOperationException("Configure ConnectionStrings__Database using the restricted htt_app login.");
if (new NpgsqlConnectionStringBuilder(connectionString).Username != "htt_app")
    throw new InvalidOperationException("The API must use the restricted htt_app login, never the migration/owner credential.");
var authority = builder.Configuration["Authentication:Authority"];
var audience = builder.Configuration["Authentication:Audience"];
var mode = builder.Configuration["Authentication:Mode"] ?? "Oidc";
if (mode is not ("Oidc" or "Cognito")) throw new InvalidOperationException("Authentication:Mode must be Oidc or Cognito.");
if (!builder.Environment.IsDevelopment() && (string.IsNullOrWhiteSpace(authority) || string.IsNullOrWhiteSpace(audience)))
    throw new InvalidOperationException("Production requires a verified HTTPS OIDC authority and audience/client ID.");
if (!string.IsNullOrEmpty(authority) && (!Uri.TryCreate(authority, UriKind.Absolute, out var uri) || uri.Scheme != "https"))
    throw new InvalidOperationException("Authentication authority must use HTTPS.");

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();
builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddScoped<CompanySession>();
builder.Services.AddScoped<AccessResolver>();
builder.Services.AddScoped<Idempotency>();
builder.Services.AddSingleton(builder.Configuration.GetSection("Documents").Get<DocumentOptions>() ?? new DocumentOptions());
builder.Services.AddDbContext<FoundationDbContext>((services, options) => options.UseNpgsql(services.GetRequiredService<CompanySession>().Connection));
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.Converters.Add(new DecimalStringConverter()));
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.Authority = string.IsNullOrWhiteSpace(authority) ? null : authority;
    options.Audience = audience;
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters.ValidateIssuer = true;
    options.TokenValidationParameters.ValidateAudience = mode == "Oidc";
    options.TokenValidationParameters.ValidateLifetime = true;
    options.TokenValidationParameters.RequireSignedTokens = true;
    options.TokenValidationParameters.ClockSkew = TimeSpan.FromSeconds(30);
    // Cognito access tokens use client_id, not the ID-token aud claim. Never accept ID tokens as API access tokens.
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            if (mode == "Cognito" && (context.Principal?.FindFirst("token_use")?.Value != "access"
                || context.Principal.FindFirst("client_id")?.Value != audience))
                context.Fail("Invalid access token type or client.");
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();
builder.AddCustomerPortal();
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("portal",http=>RateLimitPartition.GetFixedWindowLimiter(
        (http.User.FindFirst("iss")?.Value??"")+":"+(http.User.FindFirst("sub")?.Value??http.Connection.RemoteIpAddress?.ToString()??"unknown"),
        _=>new FixedWindowRateLimiterOptions{PermitLimit=300,Window=TimeSpan.FromMinutes(1),QueueLimit=0}));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("api", http => RateLimitPartition.GetFixedWindowLimiter(
        http.User.FindFirst("sub")?.Value ?? http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 300, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

var app = builder.Build();
if (string.IsNullOrWhiteSpace(authority)) app.Logger.LogWarning("No OIDC authority configured: all protected endpoints remain locked. No development bypass is enabled.");
app.Use(async (http, next) =>
{
    http.Response.Headers["X-Request-Id"] = http.TraceIdentifier;
    http.Response.Headers["X-Content-Type-Options"] = "nosniff";
    http.Response.Headers.CacheControl = "no-store";
    try { await next(http); }
    catch (Exception error) when (!http.Response.HasStarted)
    {
        var (status, code, message, retryable) = error switch
        {
            PostgresException { SqlState: "HS409" } e => (409, "settings_conflict", e.MessageText, false),
            PostgresException { SqlState: "HS422" } e => (422, "settings_validation", e.MessageText, false),
            PostgresException { SqlState: "HX409" } e => (409, "document_lifecycle_conflict", e.MessageText, false),
            PostgresException { SqlState: "HX422" } e => (422, "document_lifecycle_validation", e.MessageText, false),
            BusinessException e => (e.StatusCode, e.Code, e.Message, false),
            PostgresException { SqlState: "HC409" } e => (409, "portal_conflict", e.MessageText, false),
            PostgresException { SqlState: "HC422" } e => (422, "portal_validation", e.MessageText, false),
            PostgresException { SqlState: "HD409" } e => (409, "document_conflict", e.MessageText, false),
            PostgresException { SqlState: "HD422" } e => (422, "document_validation", e.MessageText, false),
            PostgresException { SqlState: "HI409" } e => (409, "inventory_control_conflict", e.MessageText, false),
            PostgresException { SqlState: "HI422" } e => (422, "inventory_control_validation", e.MessageText, false),
            BadHttpRequestException => (400, "invalid_request", "Invalid request body or parameters.", false),
            PostgresException { SqlState: "HP409" } e => (409, "purchase_conflict", e.MessageText, false),
            PostgresException { SqlState: "HP422" } e => (422, "purchase_validation", e.MessageText, false),
            PostgresException { SqlState: "HR409" } e => (409, "settlement_conflict", e.MessageText, false),
            PostgresException { SqlState: "HR422" } e => (422, "settlement_validation", e.MessageText, false),
            PostgresException { SqlState: "HT404" } => (404, "not_found", "Resource is unavailable in this scope.", false),
            PostgresException { SqlState: "HT409" } => (409, "invoice_conflict", "Order changed, is not confirmed, or quantity exceeds the delivered uninvoiced remainder. Refresh the order.", false),
            PostgresException { SqlState: "HT422" } e => (422, "invoice_validation", e.MessageText, false),
            PostgresException { SqlState: "23505" } => (409, "duplicate", "The resource or operation already exists.", false),
            PostgresException { SqlState: "42501" } => (403, "scope_denied", "The database rejected this data scope.", false),
            PostgresException { SqlState: "55P03" or "40001" or "40P01" } => (409, "concurrent_operation", "Another operation is in progress; retry with the same idempotency key.", true),
            PostgresException { SqlState: "23503" or "23514" or "23P01" or "22003" } => (422, "constraint_violation", "A reference, effective interval, or business constraint is invalid.", false),
            NpgsqlException => (503, "database_unavailable", "The service is temporarily unavailable; check the operation result before retrying.", true),
            _ => (500, "internal_error", "The operation could not be completed.", false)
        };
        if (status >= 500) app.Logger.LogError("Request {RequestId} failed ({ExceptionType})", http.TraceIdentifier, error.GetType().Name);
        http.Response.Clear();
        http.Response.Headers["X-Request-Id"] = http.TraceIdentifier;
        http.Response.StatusCode = status;
        await http.Response.WriteAsJsonAsync(new { code, message, requestId = http.TraceIdentifier, retryable, fieldErrors=(error as BusinessException)?.FieldErrors });
    }
});
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapGet("/health/live", () => Results.Ok(new { status = "live" })).AllowAnonymous();
app.MapGet("/health/ready", async (NpgsqlDataSource source, CancellationToken token) =>
{
    try
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var command = new NpgsqlCommand("SELECT to_regprocedure('identity.resolve_access(text,text)') IS NOT NULL AND to_regprocedure('identity.seed_master_data_roles(uuid)') IS NOT NULL AND to_regclass('sales.orders') IS NOT NULL AND to_regprocedure('inventory.confirm_pick(uuid,bigint,text,text,text)') IS NOT NULL AND to_regprocedure('sales.post_invoice(uuid,bigint,jsonb,text)') IS NOT NULL AND to_regprocedure('accounting.post_receipt(uuid,numeric,text,text,date,jsonb,jsonb)') IS NOT NULL AND to_regprocedure('sales.post_credit_note(uuid,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.receive_order(uuid,bigint,text,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.post_bill(uuid,text,date,date,date,text,date,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.post_supplier_payment(uuid,numeric,numeric,text,text,date,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.return_goods(uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('inventory.post_control(text,uuid,uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('inventory.dispatch_transit(uuid,uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('accounting.reconciliation_checks()') IS NOT NULL AND to_regprocedure('platform.claim_document_job()') IS NOT NULL AND to_regprocedure('portal.me(text,text)') IS NOT NULL AND to_regprocedure('platform.change_visibility(uuid,bigint,bigint,boolean,text)') IS NOT NULL AND to_regprocedure('identity.seed_direct_order_roles(uuid)') IS NOT NULL AND to_regprocedure('purchase.post_expense_bill(uuid,text,date,date,date,text,date,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.post_expense_credit(uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.apply_supplier_credit(uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('sales.apply_customer_credit(uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('accounting.reverse_receipt(uuid,text,text)') IS NOT NULL AND to_regprocedure('purchase.reverse_supplier_payment(uuid,text,text)') IS NOT NULL AND to_regprocedure('accounting.reverse_customer_refund(uuid,text,text)') IS NOT NULL AND to_regprocedure('purchase.reverse_supplier_refund(uuid,text,text)') IS NOT NULL AND to_regprocedure('sales.post_amount_credit_note(uuid,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.post_amount_credit(uuid,text,text,jsonb)') IS NOT NULL AND to_regprocedure('purchase.post_bill_with_variance(uuid,text,date,date,date,text,date,text,jsonb,text)') IS NOT NULL AND to_regprocedure('core.configure_business(bigint,integer,integer,integer,text,text)') IS NOT NULL AND to_regprocedure('inventory.move_position(uuid,uuid,text,numeric,text,text,uuid)') IS NOT NULL AND to_regprocedure('accounting.configure_bank(uuid,bigint,text,text,text,text,text,text,boolean)') IS NOT NULL AND to_regprocedure('accounting.finalize_bank_reconciliation(uuid,bigint,text,text,jsonb)') IS NOT NULL AND to_regclass('accounting.report_open_item_movements') IS NOT NULL AND to_regclass('accounting.cash_flow_effective') IS NOT NULL", connection) { CommandTimeout = 3 };
        return (bool)(await command.ExecuteScalarAsync(token))! ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503);
    }
    catch (NpgsqlException) { return Results.StatusCode(503); }
}).AllowAnonymous();
if (app.Environment.IsDevelopment()) app.MapOpenApi().AllowAnonymous();
app.MapGet("/api/v1/me", async (HttpContext http, AccessResolver resolver) =>
{
    var (issuer, subject) = PrincipalIdentity.External(http.User);
    return Results.Ok(new { companies = await resolver.ResolveAsync(issuer, subject, http.RequestAborted) });
}).RequireAuthorization().RequireRateLimiting("api");
app.MapFoundation();
app.MapMasterData();
app.MapSales();
app.MapPurchasing();
app.MapInventoryControl();
app.MapTransit();
app.MapReconciliation();
app.MapDocuments();
app.MapDocumentTrash();
app.MapPortalManagement();
app.MapPortal();
app.Run();

public partial class Program;
