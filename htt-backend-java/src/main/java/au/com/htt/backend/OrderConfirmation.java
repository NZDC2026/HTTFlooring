package au.com.htt.backend;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty("htt.staff.database.url")
class OrderConfirmation {
    private final JdbcClient jdbc;private final LegacyRows rows;
    OrderConfirmation(JdbcClient jdbc,LegacyRows rows){this.jdbc=jdbc;this.rows=rows;}
    Result confirm(StaffScope.CompanyAccess scope,Request r) {
                var credit=jdbc.sql("SELECT * FROM sales.lock_credit(:id)").param("id",r.customer).query(rows::row).single();
                BigDecimal receivable=number(credit,"receivable"),before=number(credit,"unbilledOrders"),advances=number(credit,"availableAdvances");
                BigDecimal exposure=receivable.add(before).add(r.gross).subtract(advances).max(BigDecimal.ZERO);
                if(exposure.compareTo(r.creditLimit)>0)throw new StaffScope.Failure(409,"credit_limit_exceeded","Customer credit is insufficient for this tax-inclusive order.");
                var demand=new TreeMap<UUID,BigDecimal>(Comparator.comparing(UUID::toString));
                for(var line:r.lines)if("STOCK".equals(line.type()))demand.merge(line.product(),line.base(),BigDecimal::add);
                var balances=new HashMap<UUID,UUID>();
                for(var entry:demand.entrySet()) {
                    var balance=jdbc.sql("SELECT * FROM inventory.lock_balance(:warehouse,:product)").param("warehouse",r.warehouse).param("product",entry.getKey()).query(rows::row).optional();
                    if(balance.isEmpty() || number(balance.get(),"onHand").subtract(number(balance.get(),"reserved")).compareTo(entry.getValue())<0)
                        throw new StaffScope.Failure(409,"insufficient_stock","Available stock is insufficient; no part of the order was reserved.");
                    balances.put(entry.getKey(),(UUID)balance.get().get("id"));
                }
                UUID id=UUID.randomUUID();var doc=jdbc.sql("INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(:id,:company,'SALES_ORDER',sales.next_number('SALES_ORDER'),:today,'CONFIRMED',:actor) RETURNING number,version")
                    .param("id",id).param("company",scope.companyId()).param("today",r.today).param("actor",scope.actorId()).query(rows::row).single();
                jdbc.sql("INSERT INTO sales.orders(id,company_id,order_origin,source_quote_id,approved_quote_version,creation_reason,notes,pricing_at,customer_id,customer_branch_id,warehouse_id,customer_snapshot,net,tax,gross,approved_by,created_by) VALUES(:id,:company,:origin,CAST(:quote AS uuid),CAST(:quoteVersion AS bigint),CAST(:reason AS text),:notes,:at,:customer,:branch,:warehouse,CAST(:snapshot AS jsonb),:net,:tax,:gross,:actor,:actor)")
                    .param("id",id).param("company",scope.companyId()).param("origin",r.quote==null?"DIRECT":"QUOTE").param("quote",r.quote).param("quoteVersion",r.quoteVersion).param("reason",r.reason).param("notes",r.notes).param("at",r.at).param("customer",r.customer).param("branch",r.branch).param("warehouse",r.warehouse).param("snapshot",r.snapshot).param("net",r.net).param("tax",r.tax).param("gross",r.gross).param("actor",scope.actorId()).update();
                for(var l:r.lines) {
                    UUID line=UUID.randomUUID();jdbc.sql("INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(:line,:company,:id,:no,:actor)").param("line",line).param("company",scope.companyId()).param("id",id).param("no",l.number()).param("actor",scope.actorId()).update();
                    jdbc.sql("INSERT INTO sales.order_lines(id,company_id,order_id,source_quote_line_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_price,net,tax,gross,snapshot,created_by) VALUES(:line,:company,:id,CAST(:source AS uuid),:product,:unit,:type,:quantity,:base,:price,:net,:tax,:gross,CAST(:snapshot AS jsonb),:actor)")
                        .param("line",line).param("company",scope.companyId()).param("id",id).param("source",l.source()).param("product",l.product()).param("unit",l.unit()).param("type",l.type()).param("quantity",l.qty()).param("base",l.base()).param("price",l.price()).param("net",l.net()).param("tax",l.tax()).param("gross",l.gross()).param("snapshot",l.snapshot()).param("actor",scope.actorId()).update();
                    if("STOCK".equals(l.type()))jdbc.sql("INSERT INTO inventory.stock_reservations(company_id,order_line_id,stock_balance_id,quantity,created_by) VALUES(:company,:line,:balance,:qty,:actor)")
                        .param("company",scope.companyId()).param("line",line).param("balance",balances.get(l.product())).param("qty",l.base()).param("actor",scope.actorId()).update();
                }
                jdbc.sql("INSERT INTO sales.credit_decisions(company_id,order_id,customer_id,credit_limit,receivable,unbilled_before,advances,order_amount,exposure_after,created_by) VALUES(:company,:id,:customer,:limit,:ar,:before,:advances,:gross,:exposure,:actor)")
                    .param("company",scope.companyId()).param("id",id).param("customer",r.customer).param("limit",r.creditLimit).param("ar",receivable).param("before",before).param("advances",advances).param("gross",r.gross).param("exposure",exposure).param("actor",scope.actorId()).update();
                jdbc.sql("INSERT INTO sales.credit_commitments(company_id,order_id,customer_id,amount,created_by) VALUES(:company,:id,:customer,:gross,:actor)")
                    .param("company",scope.companyId()).param("id",id).param("customer",r.customer).param("gross",r.gross).param("actor",scope.actorId()).update();
        return new Result(id,(String)doc.get("number"),((Number)doc.get("version")).longValue());
    }
    private static BigDecimal number(Map<String,Object> row,String name){return new BigDecimal(row.get(name).toString());}
    record Line(int number,UUID source,UUID product,UUID unit,String type,BigDecimal qty,BigDecimal base,BigDecimal price,BigDecimal net,BigDecimal tax,BigDecimal gross,String snapshot) {}
    record Request(UUID customer,UUID branch,UUID warehouse,LocalDate today,BigDecimal creditLimit,String snapshot,BigDecimal net,BigDecimal tax,BigDecimal gross,List<Line> lines,UUID quote,Long quoteVersion,String reason,String notes,OffsetDateTime at) {}
    record Result(UUID id,String number,long version) {}
}
