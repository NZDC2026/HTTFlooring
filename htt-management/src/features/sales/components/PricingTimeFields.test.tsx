import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PricingTimeFields, PricingTimeSummary } from './PricingTimeFields';
it('shows the reviewed timestamp, saved timezone and exclusive promotion-end rule', () => {
    const html = renderToStaticMarkup(<PricingTimeFields date="2026-10-21" value="2026-10-20T20:00:00Z" timezone="Pacific/Auckland" onChange={()=>{}}/>);
    expect(html).toContain('value="2026-10-20T20:00:00Z"');
    expect(html).toContain('Pacific/Auckland'); expect(html).toContain('exclude their end time');
    expect(html).not.toContain('role="alert"');
});
it('reports ambiguous pricing time instead of presenting it as a reviewed instant', () => {
    const html = renderToStaticMarkup(<PricingTimeFields date="2026-10-21" value="2026-10-21T10:00:00" onChange={()=>{}}/>);
    expect(html).toContain('role="alert"'); expect(html).toContain('explicit UTC offset');
});
it('displays historical evidence and explicitly identifies unknown legacy pricing time', () => {
    const html = renderToStaticMarkup(<PricingTimeSummary lines={[{pricingAt:'2026-10-20T20:00:00Z',pricingTimezone:'Pacific/Auckland'},{}]}/>);
    expect(html).toContain('2026-10-20T20:00:00Z'); expect(html).toContain('Legacy pricing time not recorded');
});
