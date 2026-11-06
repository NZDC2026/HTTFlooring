package au.com.htt.backend;

import java.text.Normalizer;
import java.util.*;
import static au.com.htt.backend.MasterDataChecks.*;

final class ContactFields {
    private ContactFields() {}
    static String email(String input){String value=optional(input,"email",254);check(value==null||address(value),"email","Invalid email address.");return value;}
    // Match System.Net.Mail's addr-spec readers and the original mail.Address == input check.
    // Primary rules: dotnet/runtime v10.0.0 MailAddressParser, DotAtomReader,
    // QuotedStringFormatReader, DomainLiteralReader and WhitespaceReader (MIT).
    static boolean address(String value){
        if(value.indexOf('\r')>=0||value.indexOf('\n')>=0||!Normalizer.isNormalized(value,Normalizer.Form.NFC))return false;
        for(int i=0;i<value.length();i++){char c=value.charAt(i);if(Character.isHighSurrogate(c)){if(++i>=value.length()||!Character.isLowSurrogate(value.charAt(i)))return false;}else if(Character.isLowSurrogate(c))return false;}
        // The separator is the last @ outside a domain literal; quoted local parts can contain @.
        int at=value.lastIndexOf('@');if(value.endsWith("]")){at=value.lastIndexOf("@[");if(at<0)return false;}
        if(at<=0||at>=value.length()-1||value.charAt(at)!='@')return false;
        String local=value.substring(0,at),host=value.substring(at+1);
        return (local.startsWith("\"")?wrapped(local,'"','"',true):atom(local))&&(host.startsWith("[")?wrapped(host,'[',']',false):atom(host));
    }
    private static boolean atom(String text){if(text.isEmpty()||text.charAt(0)=='.'||text.contains(".."))return false;for(char c:text.toCharArray())if(c<128&&!(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||"!#$%&'*+-/=?^_`{|}~.".indexOf(c)>=0))return false;return true;}
    private static boolean wrapped(String text,char first,char last,boolean unicode){
        if(text.length()<2||text.charAt(0)!=first||text.charAt(text.length()-1)!=last)return false;
        int i=text.length()-2;
        while(i>=1){char c=text.charAt(i);
            if(c==' '||c=='\t'){i--;continue;}
            if(c=='\n'){if(i<=1||text.charAt(i-1)!='\r')return false;i-=2;continue;}
            if(c=='\r')return false;
            int slashes=0;for(int k=i-1;k>=1&&text.charAt(k)=='\\';k--)slashes++;
            if(slashes%2==1){if(!unicode&&c>127)return false;i-=slashes+1;continue;}
            if(unicode){if(c<128&&(c==0||c=='"'||c=='\\'))return false;}
            else if(c>127||c==0||c=='['||c==']'||c=='\\')return false;
            i--;
        }
        return true;
    }
    static String phone(String input,String field){String value=optional(input,field,40);if(value!=null)check(value.chars().anyMatch(c->c>='0'&&c<='9')&&value.chars().allMatch(c->c>='0'&&c<='9'||"+(). -xextEXT#".indexOf(c)>=0),field,"Invalid "+field+" number.");return value;}
    static List<UUID> branches(List<UUID> input){List<UUID> ids=input==null?List.of():input;check(ids.size()<=50&&ids.stream().allMatch(id->id!=null&&!id.equals(new UUID(0,0)))&&new HashSet<>(ids).size()==ids.size(),"branchIds","Supply at most 50 distinct nonempty branch IDs.");return ids.stream().sorted(Comparator.comparing(UUID::toString)).toList();}
}
