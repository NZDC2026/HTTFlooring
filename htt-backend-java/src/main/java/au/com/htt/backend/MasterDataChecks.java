package au.com.htt.backend;

final class MasterDataChecks {
    private MasterDataChecks() {}
    // .NET Char.IsWhiteSpace includes NEL and separator categories, but not Java's file separators.
    static String trim(String value){if(value==null)return "";int a=0,b=value.length();while(a<b&&space(value.charAt(a)))a++;while(b>a&&space(value.charAt(b-1)))b--;return value.substring(a,b);}
    private static boolean space(char c){return c>=9&&c<=13||c==0x85||Character.isSpaceChar(c);}
    static String upper(String value){var out=new StringBuilder();trim(value).codePoints().forEach(c->out.appendCodePoint(c==0x131?c:Character.toUpperCase(c)));return out.toString();}
    static String code(String value,String field){String result=upper(value);check(result.matches("[A-Z0-9][A-Z0-9_-]{0,39}"),field,field+" must be 1..40 ASCII letters, digits, underscores or hyphens.");return result;}
    static String optional(String value,String field,int max){String result=trim(value);check(result.length()<=max,field,field+" exceeds "+max+" characters.");return result.isEmpty()?null:result;}
    static String text(String value,String field,int max){String result=trim(value);check(!result.isEmpty()&&result.length()<=max,field,field+" must contain 1.."+max+" characters.");return result;}
    static void check(boolean valid,String field,String message){if(!valid)throw new BranchQuery.InvalidFilter(field,message);}
}
