using System.Security.Cryptography;
using System.Text;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
namespace Htt.IntegrationTests;
public sealed class CrmMigrationTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
 [Fact]public async Task Existing_drafts_in_two_companies_backfill_registry_without_switching_context_before_financial_constraints()
 {
  var name="htt_c05_upgrade_test_"+Guid.NewGuid().ToString("N");var adminString=new NpgsqlConnectionStringBuilder(db.Owner){Database="postgres",Pooling=false}.ConnectionString;await using var admin=new NpgsqlConnection(adminString);await admin.OpenAsync();await using(var cmd=new NpgsqlCommand($"CREATE DATABASE \"{name}\"",admin))await cmd.ExecuteNonQueryAsync();var owner=new NpgsqlConnectionStringBuilder(db.Owner){Database=name,Pooling=false}.ConnectionString;
  try
  {
   await using(var con=new NpgsqlConnection(owner))
   {
    await con.OpenAsync();await using(var cmd=new NpgsqlCommand("CREATE TABLE public.htt_schema_history(name text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())",con))await cmd.ExecuteNonQueryAsync();var assembly=typeof(MigrationRunner).Assembly;
    foreach(var resource in assembly.GetManifestResourceNames().Where(n=>n.EndsWith(".sql",StringComparison.Ordinal)).Order(StringComparer.Ordinal).Take(44))
    {await using var stream=assembly.GetManifestResourceStream(resource)!;using var reader=new StreamReader(stream);var sql=await reader.ReadToEndAsync();await using var tx=await con.BeginTransactionAsync();await using(var cmd=new NpgsqlCommand(sql,con,tx))await cmd.ExecuteNonQueryAsync();await using(var cmd=new NpgsqlCommand("INSERT INTO public.htt_schema_history(name,sha256)VALUES(@name,@hash)",con,tx)){cmd.Parameters.AddWithValue("name",resource);cmd.Parameters.AddWithValue("hash",Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sql))));await cmd.ExecuteNonQueryAsync();}await tx.CommitAsync();}
    var actor=Guid.NewGuid();await using(var cmd=new NpgsqlCommand("INSERT INTO identity.users(id,issuer,subject,display_name)VALUES(@id,'c05-upgrade','historical-owner','Historical owner')",con)){cmd.Parameters.AddWithValue("id",actor);await cmd.ExecuteNonQueryAsync();}
    foreach(var label in new[]{"A","B"})
    {var company=Guid.NewGuid();await using var tx=await con.BeginTransactionAsync();await using(var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@scope,true),set_config('htt.actor_id',@actor_text,true)",con,tx)){cmd.Parameters.AddWithValue("scope",company.ToString());cmd.Parameters.AddWithValue("actor_text",actor.ToString());await cmd.ExecuteNonQueryAsync();}await using(var cmd=new NpgsqlCommand("INSERT INTO core.companies(id,name)VALUES(@company,@label);INSERT INTO crm.mobile_drafts(id,company_id,kind,owner_id,data,version)VALUES(@draft,@company,'CUSTOMER',@actor,jsonb_build_object('name',@label::text,'code','OLD-'||@label),3)",con,tx)){cmd.Parameters.AddWithValue("company",company);cmd.Parameters.AddWithValue("label",label);cmd.Parameters.AddWithValue("draft",Guid.NewGuid());cmd.Parameters.AddWithValue("actor",actor);await cmd.ExecuteNonQueryAsync();}await tx.CommitAsync();}
   }
   await MigrationRunner.ApplyAsync(owner);await MigrationRunner.ApplyAsync(owner);await using var check=new NpgsqlConnection(owner);await check.OpenAsync();await using var count=new NpgsqlCommand("SELECT count(*)FROM crm.mobile_drafts d JOIN platform.documents p ON p.company_id=d.company_id AND p.id=d.id WHERE d.version=3 AND p.version=3 AND p.document_type='CRM_DRAFT'AND p.created_by=d.owner_id AND p.state='DRAFT'",check);Assert.Equal(2L,await count.ExecuteScalarAsync());count.CommandText="SELECT count(DISTINCT company_id)FROM platform.documents";Assert.Equal(2L,await count.ExecuteScalarAsync());count.CommandText="SELECT count(*)FROM public.htt_schema_history";Assert.Equal(45L,await count.ExecuteScalarAsync());
  }
  finally{await using var drop=new NpgsqlCommand($"DROP DATABASE \"{name}\" WITH(FORCE)",admin);await drop.ExecuteNonQueryAsync();}
 }
}
