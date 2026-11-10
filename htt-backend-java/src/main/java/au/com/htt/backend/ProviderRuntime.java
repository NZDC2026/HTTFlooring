package au.com.htt.backend;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

final class ProviderRuntime {
    static DocumentRuntime.WorkException fail(String code,String state){return new DocumentRuntime.WorkException(code,state);}
    record Reply(int status,JsonNode json,HttpHeaders headers){}
    static final class LimitException extends java.io.IOException {
        final int status;LimitException(int status){super("Provider output limit");this.status=status;}
    }
    interface Transport {Reply send(HttpRequest request,int limit) throws Exception;}
    static String setting(Map<String,String> settings,String name){return settings.getOrDefault(name,"");}

    static Reply http(HttpRequest request,int limit) throws Exception {
        try(var client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build()) {
            HttpResponse.BodyHandler<byte[]> handler=info->new HttpResponse.BodySubscriber<>() {
                final java.util.concurrent.CompletableFuture<byte[]> body=new java.util.concurrent.CompletableFuture<>();
                final java.io.ByteArrayOutputStream output=new java.io.ByteArrayOutputStream();
                java.util.concurrent.Flow.Subscription subscription;
                public java.util.concurrent.CompletionStage<byte[]> getBody(){return body;}
                public void onSubscribe(java.util.concurrent.Flow.Subscription value){subscription=value;if(info.statusCode()==429||info.statusCode()>=500){value.cancel();body.complete(new byte[0]);}else value.request(1);}
                public void onNext(List<java.nio.ByteBuffer> buffers){
                    for(var buffer:buffers){if(output.size()+buffer.remaining()>limit){subscription.cancel();body.completeExceptionally(new LimitException(info.statusCode()));return;}byte[] bytes=new byte[buffer.remaining()];buffer.get(bytes);output.writeBytes(bytes);}subscription.request(1);
                }
                public void onError(Throwable error){body.completeExceptionally(error);}
                public void onComplete(){body.complete(output.toByteArray());}
            };
            var future=client.sendAsync(request,handler);
            HttpResponse<byte[]> response;
            try{response=future.get(request.timeout().orElse(Duration.ofSeconds(30)).toMillis(),java.util.concurrent.TimeUnit.MILLISECONDS);}
            catch(java.util.concurrent.TimeoutException e){future.cancel(true);throw new HttpTimeoutException("Provider deadline");}
            catch(java.util.concurrent.ExecutionException e){if(e.getCause() instanceof LimitException limitFailure)throw limitFailure;throw new java.io.IOException("Provider exchange failed",e.getCause());}
            JsonNode json=null;
            if(response.body().length>0)try{json=DocumentExecutor.JSON.readTree(response.body());}catch(RuntimeException ignored){}
            return new Reply(response.statusCode(),json,response.headers());
        }
    }
    static URI gateway(String value,String key,String code,boolean strict) throws Exception {
        try{URI uri=URI.create(value);if(!"https".equals(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||key.isBlank()||strict&&(uri.getQuery()!=null||uri.getFragment()!=null))throw new IllegalArgumentException();return uri;}
        catch(IllegalArgumentException e){throw fail(code,"FAILED");}
    }
    static HttpRequest.Builder post(URI uri,JsonNode body,int seconds){return HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(seconds)).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body.toString()));}
    static JsonNode card(UUID id,JsonNode payload) throws Exception {
        return card(id,payload,System.getenv(),ProviderRuntime::http);
    }
    static JsonNode card(UUID id,JsonNode payload,Map<String,String> settings,Transport transport) throws Exception {
        String key=setting(settings,"HTT_CARD_OCR_API_KEY");URI uri=gateway(setting(settings,"HTT_CARD_OCR_ENDPOINT"),key,"card_ocr_unconfigured",false);
        var body=DocumentExecutor.JSON.createObjectNode().put("operationId",id.toString()).put("contentType",payload.get("contentType").asText()).put("content",payload.get("content").asText());
        Reply reply;
        try{reply=transport.send(post(uri,body,30).header("Authorization","Bearer "+key).build(),16000);}
        catch(LimitException e){throw fail(e.status>=300?"card_ocr_rejected":"card_ocr_output_limit","FAILED");}
        catch(HttpTimeoutException e){throw fail("card_ocr_timeout","RETRY");}
        catch(java.io.IOException e){throw fail("card_ocr_unavailable","RETRY");}
        if(reply.status==429||reply.status>=500)throw fail("card_ocr_transient","RETRY");if(reply.status<200||reply.status>=300)throw fail("card_ocr_rejected","FAILED");
        JsonNode root=reply.json;var name=root==null?null:root.get("name");if(name==null||!name.isString()||MasterDataChecks.trim(name.asText()).isEmpty()||MasterDataChecks.trim(name.asText()).length()>200)throw fail("card_ocr_invalid_output","FAILED");
        var result=DocumentExecutor.JSON.createObjectNode().put("name",MasterDataChecks.trim(name.asText()));
        String[] fields={"email","phone","mobile","jobTitle","organization","storeName"};int[] limits={254,40,40,100,200,200};
        for(int i=0;i<fields.length;i++){var v=root.get(fields[i]);if(v==null||v.isNull())result.putNull(fields[i]);else{if(!v.isString()||v.asText().length()>limits[i])throw fail("card_ocr_invalid_output","FAILED");result.put(fields[i],v.asText());}}
        result.putArray("branchIds");return result;
    }
    static JsonNode geocode(JsonNode payload) throws Exception {
        return geocode(payload,System.getenv(),ProviderRuntime::http);
    }
    static JsonNode geocode(JsonNode payload,Map<String,String> settings,Transport transport) throws Exception {
        String key=setting(settings,"HTT_GEOCODE_API_KEY");if(key.isBlank())throw fail("geocoder_unconfigured","FAILED");
        String country=payload.get("country").asText();if(!country.matches("[a-zA-Z]{2}"))throw fail("geocode_invalid_address","FAILED");
        String uri="https://maps.googleapis.com/maps/api/geocode/json?address="+encode(payload.get("address").asText())+"&components="+encode("country:"+country)+"&key="+encode(key);
        Reply reply;
        try{reply=transport.send(HttpRequest.newBuilder(URI.create(uri)).timeout(Duration.ofSeconds(20)).GET().build(),65536);}
        catch(LimitException e){throw fail(e.status>=300?"geocode_provider_rejected":"geocode_output_limit","FAILED");}
        catch(HttpTimeoutException e){throw fail("geocode_timeout","RETRY");}catch(java.io.IOException e){throw fail("geocode_unavailable","RETRY");}
        if(reply.status==429||reply.status>=500)throw fail("geocode_transient","RETRY");if(reply.status<200||reply.status>=300)throw fail("geocode_provider_rejected","FAILED");
        try {
            String status=reply.json.get("status").asText();if(Set.of("OVER_QUERY_LIMIT","UNKNOWN_ERROR").contains(status))throw fail("geocode_transient","RETRY");if(!status.equals("OK"))throw fail(status.equals("ZERO_RESULTS")?"geocode_no_result":"geocode_provider_rejected","FAILED");
            var results=reply.json.get("results");if(!results.isArray()||results.size()!=1)throw fail("geocode_ambiguous","FAILED");var result=results.get(0);
            if(result.path("partial_match").asBoolean(false))throw fail("geocode_partial_match","FAILED");
            boolean match=false;for(var component:result.get("address_components"))for(var type:component.get("types"))if(type.asText().equals("country")&&country.equalsIgnoreCase(component.path("short_name").asText()))match=true;
            if(!match)throw fail("geocode_country_mismatch","FAILED");
            var geom=result.get("geometry");var location=geom.get("location");var lat=location.get("lat").decimalValue();var lng=location.get("lng").decimalValue();String precision=geom.get("location_type").asText(),place=result.get("place_id").asText();
            if(lat.abs().doubleValue()>90||lng.abs().doubleValue()>180||!Set.of("ROOFTOP","RANGE_INTERPOLATED","GEOMETRIC_CENTER","APPROXIMATE").contains(precision)||place.isEmpty()||place.length()>300)throw fail("geocode_invalid_output","FAILED");
            return DocumentExecutor.JSON.createObjectNode().put("latitude",lat.setScale(7,java.math.RoundingMode.HALF_EVEN)).put("longitude",lng.setScale(7,java.math.RoundingMode.HALF_EVEN)).put("precision",precision).put("placeId",place);
        }catch(RuntimeException e){throw fail("geocode_invalid_output","FAILED");}
    }
    static String encode(String value){return URLEncoder.encode(value,StandardCharsets.UTF_8).replace("+","%20");}
    static JsonNode feed(JsonNode request) throws Exception {
        return feed(request,System.getenv(),ProviderRuntime::http);
    }
    static JsonNode feed(JsonNode request,Map<String,String> settings,Transport transport) throws Exception {
        String key=setting(settings,"HTT_BANKFEEDS_API_KEY");
        if(!"true".equalsIgnoreCase(setting(settings,"HTT_BANKFEEDS_ENABLED")))throw fail("feed_gateway_unconfigured","FAILED");
        URI uri=gateway(setting(settings,"HTT_BANKFEEDS_ENDPOINT"),key,"feed_gateway_unconfigured",true);
        boolean mutation=request.path("kind").asText().equals("REVOKE");String uncertain=mutation?"UNKNOWN":"RETRY";
        Reply reply;
        try{reply=transport.send(post(uri,request,20).header("Authorization","Bearer "+key).header("Idempotency-Key",request.get("operationId").asText()).header("X-HTT-Gateway-Version","1").build(),2097152);}
        catch(LimitException e){throw fail(e.status>=300?"feed_gateway_rejected":"feed_response_limit",e.status>=300?(mutation&&e.status<400?"UNKNOWN":"FAILED"):(mutation?"UNKNOWN":"FAILED"));}
        catch(HttpTimeoutException e){throw fail("feed_gateway_timeout",uncertain);}catch(java.io.IOException e){throw fail("feed_gateway_unavailable",uncertain);}
        if(reply.status==429)throw fail("feed_rate_limited","RETRY");if(reply.status>=500)throw fail("feed_gateway_unavailable",uncertain);
        if(reply.status<200||reply.status>=300)throw fail("feed_gateway_rejected",mutation&&reply.status>=300&&reply.status<400?"UNKNOWN":"FAILED");
        if(reply.json==null||!reply.json.isObject())throw fail("feed_invalid_response",mutation?"UNKNOWN":"FAILED");return reply.json;
    }
    record PushResult(String state,String error,String provider,int retry){}
    static String token;static Instant tokenExpiry=Instant.EPOCH;
    static String b64(byte[] bytes){return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
    static synchronized String token(Map<String,String> settings,Transport transport) throws Exception {
        if(token!=null&&tokenExpiry.isAfter(Instant.now().plusSeconds(120)))return token;
        String pem=setting(settings,"HTT_PUSH_PRIVATE_KEY_PEM");PrivateKey key;
        try{key=KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getMimeDecoder().decode(pem.replace("-----BEGIN PRIVATE KEY-----","").replace("-----END PRIVATE KEY-----",""))));}
        catch(GeneralSecurityException|IllegalArgumentException e){throw fail("push_credentials_invalid","FAILED");}
        long now=Instant.now().getEpochSecond();var claims=DocumentExecutor.JSON.createObjectNode().put("iss",setting(settings,"HTT_PUSH_CLIENT_EMAIL")).put("scope","https://www.googleapis.com/auth/firebase.messaging").put("aud","https://oauth2.googleapis.com/token").put("iat",now).put("exp",now+3600);
        String unsigned=b64("{\"alg\":\"RS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8))+"."+b64(claims.toString().getBytes(StandardCharsets.UTF_8));
        var signature=Signature.getInstance("SHA256withRSA");signature.initSign(key);signature.update(unsigned.getBytes(StandardCharsets.US_ASCII));String assertion=unsigned+"."+b64(signature.sign());
        Reply reply=transport.send(HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/token")).timeout(Duration.ofSeconds(25)).header("Content-Type","application/x-www-form-urlencoded").POST(HttpRequest.BodyPublishers.ofString("grant_type="+encode("urn:ietf:params:oauth:grant-type:jwt-bearer")+"&assertion="+encode(assertion))).build(),65536);
        if(reply.status==429||reply.status>=500)throw fail("push_oauth_unavailable","RETRY");if(reply.status<200||reply.status>=300)throw fail("push_credentials_rejected","FAILED");
        String value=reply.json.path("access_token").asText();int seconds=reply.json.path("expires_in").asInt();if(value.isEmpty()||value.length()>16384||seconds<60||seconds>3600)throw fail("push_credentials_invalid","FAILED");token=value;tokenExpiry=Instant.ofEpochSecond(now+seconds);return value;
    }
    static PushResult push(JsonNode work) throws Exception {
        return push(work,System.getenv(),ProviderRuntime::http);
    }
    static PushResult push(JsonNode work,Map<String,String> settings,Transport transport) throws Exception {
        String project=setting(settings,"HTT_PUSH_PROJECT_ID");if(!project.matches("[A-Za-z0-9-]+")||setting(settings,"HTT_PUSH_CLIENT_EMAIL").isBlank()||setting(settings,"HTT_PUSH_PRIVATE_KEY_PEM").isBlank())return new PushResult("FAILED","push_unconfigured",null,0);
        String bearer;
        try{bearer=token(settings,transport);}catch(DocumentRuntime.WorkException e){return new PushResult(e.state,e.code,null,0);}catch(Exception e){return new PushResult("RETRY","push_oauth_unavailable",null,0);}
        ObjectNode root=DocumentExecutor.JSON.createObjectNode(),message=root.putObject("message");message.put("token",work.get("token").asText());message.putObject("notification").put("title","HTT update").put("body","Open HTT to view your update.");
        var data=message.putObject("data");for(String field:List.of("messageId","companyId","sourceType","sourceId"))data.put(field,work.get(field).asText());
        message.putObject("android").put("collapse_key","htt-updates").put("ttl","3600s");message.putObject("apns").putObject("headers").put("apns-collapse-id","htt-updates").put("apns-expiration",Long.toString(Instant.now().plusSeconds(3600).getEpochSecond()));
        var web=message.putObject("webpush");web.putObject("headers").put("TTL","3600");web.putObject("notification").put("tag","htt-updates");
        Reply reply;
        try{reply=transport.send(post(URI.create("https://fcm.googleapis.com/v1/projects/"+project+"/messages:send"),root,25).header("Authorization","Bearer "+bearer).build(),65536);}catch(LimitException e){return new PushResult("UNKNOWN","push_receipt_invalid",null,0);}catch(Exception e){return new PushResult("UNKNOWN","push_delivery_uncertain",null,0);}
        if(reply.status==429||reply.status>=500){int retry=0;try{String value=reply.headers.firstValue("Retry-After").orElse("0");try{retry=Integer.parseInt(value);}catch(NumberFormatException e){retry=(int)Duration.between(Instant.now(),ZonedDateTime.parse(value,java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME).toInstant()).toSeconds();}}catch(Exception ignored){}return new PushResult("RETRY","push_provider_unavailable",null,Math.clamp(retry,0,86400));}
        if(reply.json==null)return new PushResult("UNKNOWN","push_receipt_invalid",null,0);
        if(reply.status>=200&&reply.status<300){String name=reply.json==null?"":reply.json.path("name").asText();return name.isBlank()||name.length()>500?new PushResult("UNKNOWN","push_receipt_invalid",null,0):new PushResult("SUCCEEDED",null,name,0);}
        if(reply.json!=null)for(var detail:reply.json.path("error").path("details"))if(detail.path("errorCode").asText().equals("UNREGISTERED"))return new PushResult("FAILED","push_token_unregistered",null,0);
        if(reply.status==401){token=null;return new PushResult("RETRY","push_authorization_expired",null,0);}return new PushResult("FAILED","push_provider_rejected",null,0);
    }
}
