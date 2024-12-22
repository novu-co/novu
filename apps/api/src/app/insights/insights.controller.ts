import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsageInsights } from './usecases/usage-insights/usage-insights.usecase';
import { UsageInsightsCommand } from './usecases/usage-insights/usage-insights.command';

@Controller({
  path: 'insights',
})
export class InsightsController {
  constructor(private usageInsights: UsageInsights) {}

  @Get('/execute')
  @ApiOperation({
    summary: 'Execute insights for a specific organization',
  })
  @ApiQuery({
    name: 'organizationId',
    type: String,
    required: true,
    description: 'The ID of the organization to execute insights for',
  })
  async executeInsights(@Query('organizationId') organizationId: string) {
    const command = new UsageInsightsCommand({ organizationId });

    return this.usageInsights.execute(command);
  }
}
