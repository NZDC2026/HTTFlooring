using Htt.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Htt.Host.Api.Portal;

internal static class PortalAuthentication
{
    public const string Scheme="CustomerPortal";
    public static void AddCustomerPortal(this WebApplicationBuilder builder)
    {
        var authority=builder.Configuration["PortalAuthentication:Authority"];
        var audience=builder.Configuration["PortalAuthentication:Audience"];
        var mode=builder.Configuration["PortalAuthentication:Mode"]??"Oidc";
        var connection=builder.Configuration.GetConnectionString("PortalDatabase");
        if(mode is not ("Oidc" or "Cognito"))throw new InvalidOperationException("PortalAuthentication:Mode must be Oidc or Cognito.");
        if(!string.IsNullOrWhiteSpace(authority)||!string.IsNullOrWhiteSpace(audience))
        {
            if(!Uri.TryCreate(authority,UriKind.Absolute,out var u)||u.Scheme!="https"||!string.IsNullOrEmpty(u.UserInfo)||!string.IsNullOrEmpty(u.Query)||!string.IsNullOrEmpty(u.Fragment)||string.IsNullOrWhiteSpace(audience)||string.IsNullOrWhiteSpace(connection))
                throw new InvalidOperationException("Customer portal requires an HTTPS authority, audience and dedicated database connection.");
            if(audience==builder.Configuration["Authentication:Audience"])throw new InvalidOperationException("Portal and staff must have distinct token audiences/client IDs.");
        }
        PortalDatabase.ValidateConnection(connection);
        builder.Services.AddSingleton(_=>new PortalDatabase(connection));builder.Services.AddScoped<PortalSession>();
        builder.Services.AddAuthentication().AddJwtBearer(Scheme,options=>
        {
            options.MapInboundClaims=false;options.Authority=string.IsNullOrWhiteSpace(authority)?null:authority;options.Audience=audience;options.RequireHttpsMetadata=true;
            options.TokenValidationParameters.ValidateIssuer=true;options.TokenValidationParameters.ValidateAudience=mode=="Oidc";
            options.TokenValidationParameters.ValidateLifetime=true;options.TokenValidationParameters.RequireSignedTokens=true;options.TokenValidationParameters.ClockSkew=TimeSpan.FromSeconds(30);
            options.Events=new JwtBearerEvents{OnTokenValidated=context=>
            {
                if(mode=="Cognito" && (context.Principal?.FindFirst("token_use")?.Value!="access" || context.Principal.FindFirst("client_id")?.Value!=audience))context.Fail("Invalid customer access token type or client.");
                return Task.CompletedTask;
            }};
        });
        builder.Services.AddAuthorization(options=>options.AddPolicy("customer-portal",p=>p.AddAuthenticationSchemes(Scheme).RequireAuthenticatedUser()));
    }
}
