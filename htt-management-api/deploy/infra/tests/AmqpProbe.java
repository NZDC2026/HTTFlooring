import com.rabbitmq.client.ConnectionFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

/** Test-only RSA PEM probe for the generated TLS smoke certificates. Never prints credentials. */
class AmqpProbe {
    public static void main(String[] args) throws Exception {
        var certificates=CertificateFactory.getInstance("X.509");
        var trust=KeyStore.getInstance("PKCS12"); trust.load(null,null);
        try(var input=Files.newInputStream(Path.of("/probe-tls/ca.crt"))) { trust.setCertificateEntry("ca",certificates.generateCertificate(input)); }
        var keys=KeyStore.getInstance("PKCS12"); keys.load(null,null);
        String pem=Files.readString(Path.of("/probe-tls/ops-client.key"))
                .replace("-----BEGIN PRIVATE KEY-----","").replace("-----END PRIVATE KEY-----","").replaceAll("\\s","");
        var privateKey=KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(pem)));
        char[] temporaryPassword=UUID.randomUUID().toString().toCharArray();
        try(var input=Files.newInputStream(Path.of("/probe-tls/ops-client.crt"))) {
            keys.setKeyEntry("client",privateKey,temporaryPassword,new java.security.cert.Certificate[]{certificates.generateCertificate(input)});
        }
        var km=KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm()); km.init(keys,temporaryPassword);
        var tm=TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()); tm.init(trust);
        SSLContext ssl=SSLContext.getInstance("TLS"); ssl.init(km.getKeyManagers(),tm.getTrustManagers(),null);
        ConnectionFactory factory=new ConnectionFactory(); factory.setHost("127.0.0.1"); factory.setPort(Integer.parseInt(args[0]));
        factory.setUsername("htt_app"); factory.setPassword(Files.readString(Path.of("/probe-password")).trim());
        factory.setVirtualHost("htt-notifications"); factory.useSslProtocol(ssl); factory.enableHostnameVerification();
        String name="htt.notification.deployment.probe."+UUID.randomUUID();
        try(var connection=factory.newConnection();var channel=connection.createChannel()) {
            channel.exchangeDeclare(name,"direct",false,true,null); channel.queueDeclare(name,false,true,true,null);
            channel.queueBind(name,name,name); channel.confirmSelect();
            channel.basicPublish(name,name,true,null,"htt-deployment-probe".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            channel.waitForConfirmsOrDie(5000);
            var received=channel.basicGet(name,true);
            if(received==null) throw new IllegalStateException("No probe message.");
            channel.queueDelete(name); channel.exchangeDelete(name);
        }
        factory.setVirtualHost("/"); boolean denied=false;
        try(var unexpected=factory.newConnection()) { /* Must be denied: application has no other-vhost permission. */ }
        catch(java.io.IOException failure) { denied=true; }
        if(!denied) throw new IllegalStateException("Foreign vhost access was allowed.");
        System.out.println("PASS: Java AMQP mTLS, application credentials, publish/confirm/consume and vhost isolation.");
    }
}
