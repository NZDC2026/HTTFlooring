package au.com.htt.backend;

import java.nio.*;
import java.nio.charset.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.*;
import java.util.*;
import static au.com.htt.backend.MasterDataChecks.*;

final class BankStatementCsv {
    static List<BankStatementImport.Line> parse(byte[] bytes){
        check(bytes.length<=2097152,"file","CSV exceeds 2 MiB.");String text;
        try{text=StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();}
        catch(CharacterCodingException error){throw new StaffScope.Failure(422,"invalid_csv","CSV must be valid UTF-8.");}
        int bom=0;while(bom<text.length()&&text.charAt(bom)=='\uFEFF')bom++;text=text.substring(bom);
        check(text.indexOf(0)<0,"file","CSV contains NUL.");
        var records=new ArrayList<List<String>>();var row=new ArrayList<String>();var field=new StringBuilder();boolean quoted=false,after=false;
        for(int i=0;i<text.length();i++){char ch=text.charAt(i);
            if(quoted){if(ch=='"'){if(i+1<text.length()&&text.charAt(i+1)=='"'){field.append('"');i++;}else{quoted=false;after=true;}}else field.append(ch);continue;}
            if(ch=='"'){check(field.length()==0&&!after,"file","Unexpected CSV quote.");quoted=true;}
            else if(ch==','){row.add(field.toString());field.setLength(0);after=false;}
            else if(ch=='\r'||ch=='\n'){if(ch=='\r'&&i+1<text.length()&&text.charAt(i+1)=='\n')i++;row.add(field.toString());field.setLength(0);after=false;add(records,row);row=new ArrayList<>();}
            else{check(!after,"file","Unexpected text after closing quote.");field.append(ch);}
        }
        check(!quoted,"file","Unclosed CSV quote.");if(field.length()>0||!row.isEmpty()||after){row.add(field.toString());add(records,row);}
        check(!records.isEmpty(),"file","CSV header required.");var header=records.get(0).stream().map(x->MasterDataChecks.trim(x).toLowerCase(Locale.ROOT)).toList();
        check(new HashSet<>(header).size()==header.size()&&Set.of("date","amount","description","reference","externalid").containsAll(header)&&header.containsAll(List.of("date","amount","description")),"header","Use date,amount,description and optional reference,externalId headers.");
        var result=new ArrayList<BankStatementImport.Line>();
        for(var values:records.subList(1,records.size())){check(values.size()==header.size(),"file","CSV column count differs from header.");var line=new BankStatementImport.Line();
            String date=MasterDataChecks.trim(value(header,values,"date"));try{
                if(date.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}"))line.date=LocalDate.parse(date);
                else if(date.matches("[0-9]{2}/[0-9]{2}/[0-9]{4}"))line.date=LocalDate.parse(date,DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT));
                else throw new DateTimeException("format");check(line.date.getYear()>=1&&line.date.getYear()<=9999,"date","Use ISO or Australian dd/MM/yyyy dates.");
            }catch(DateTimeException error){throw new StaffScope.Failure(422,"validation_failed","Use ISO or Australian dd/MM/yyyy dates.");}
            line.amount=decimal(MasterDataChecks.trim(value(header,values,"amount")));
            line.description=value(header,values,"description");line.reference=value(header,values,"reference");String external=value(header,values,"externalid");line.externalId=MasterDataChecks.trim(external).isEmpty()?null:external;result.add(line);
        }return result;
    }
    static BigDecimal decimal(String input){
        check(input.matches("[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)"),"amount","Use a signed decimal amount without currency symbols or thousands separators.");
        BigDecimal original=new BigDecimal(input);var max=new java.math.BigInteger("79228162514264337593543950335");
        for(int scale=Math.min(Math.max(original.scale(),0),28);scale>=0;scale--){
            BigDecimal rounded=original.setScale(scale,java.math.RoundingMode.HALF_EVEN);
            if(rounded.unscaledValue().abs().compareTo(max)<=0)return rounded;
        }
        throw new StaffScope.Failure(422,"validation_failed","Decimal storage limit exceeded.");
    }
    private static String value(List<String> header,List<String> row,String name){int index=header.indexOf(name);return index<0?"":row.get(index);}
    private static void add(List<List<String>> records,List<String> row){if(row.size()!=1||!row.get(0).isEmpty())records.add(row);check(records.size()<=5001,"lines","CSV exceeds 5000 rows.");}
}
