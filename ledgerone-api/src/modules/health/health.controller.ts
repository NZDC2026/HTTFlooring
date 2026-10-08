import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, } from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { DatabaseHealthIndicator } from '../../infrastructure/database/database-health.indicator.js';

@ApiTags('Health')
@Controller({
    path: 'health',
    version: '1',
})
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly database: DatabaseHealthIndicator,
    ) { }

    @Get('live')
    @HealthCheck()
    @ApiOperation({
        summary: 'Check API liveness',
    })
    @ApiResponse({
        status: 200,
        description: 'API process is alive',
    })
    live() {
        return this.health.check([]);
    }

    @Get('ready')
    @HealthCheck()
    @ApiOperation({
        summary: 'Check API readiness',
    })
    @ApiResponse({
        status: 200,
        description: 'API is ready to receive traffic',
    })
    ready() {
        return this.health.check([() => this.database.isHealthy('database')]);
    }
} 