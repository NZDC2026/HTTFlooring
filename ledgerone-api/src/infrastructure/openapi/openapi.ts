import { DocumentBuilder, SwaggerModule, type SwaggerDocumentOptions, } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

export function setupOpenApi(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('LedgerOne API')
        .setDescription('LedgerOne application API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addGlobalParameters({
            name: 'X-Request-Id',
            in: 'header',
            required: false,
            description: 'Optional client request correlation ID',
            schema: { type: 'string', },
        })
        .build();

    const documentOptions: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey, methodKey, version,) => {
            const suffix = version ? `_v${version}` : '';
            return `${controllerKey}_${methodKey}${suffix}`;
        },
    };

    const documentFactory = () => SwaggerModule.createDocument(app, config, documentOptions,);

    SwaggerModule.setup('api/docs', app, documentFactory, { jsonDocumentUrl: '/api/openapi.json', yamlDocumentUrl: '/api/openapi.yaml', customSiteTitle: 'LedgerOne API', },);
}