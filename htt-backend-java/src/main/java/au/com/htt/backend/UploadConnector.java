package au.com.htt.backend;

import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
class UploadConnector implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {
    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> {
            if (connector.getProtocolHandler() instanceof AbstractHttp11Protocol<?> protocol) {
                protocol.setDisableUploadTimeout(false);
                protocol.setConnectionUploadTimeout(DocumentUpload.UPLOAD_TIMEOUT_MS);
            }
        });
    }
}
