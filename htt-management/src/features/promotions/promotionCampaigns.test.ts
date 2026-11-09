import {describe,it,expect} from 'vitest';
import {campaignState,promotionCampaigns} from './promotionCampaigns';
describe('promotion campaign dates',()=>{
 it('uses inclusive starts and exclusive ends',()=>{const start='2026-11-10T00:00:00Z',end='2026-11-11T00:00:00Z';expect(campaignState(start,end,Date.parse(start)-1)).toBe('Not started');expect(campaignState(start,end,Date.parse(start))).toBe('In progress');expect(campaignState(start,end,Date.parse(end))).toBe('Ended');});
 it('groups product rows and excludes removed activities',()=>{const base={name:'Offer',status:'Active',revision:'1',createdAt:'',updatedAt:'',starts:'',ends:''};expect(promotionCampaigns([{...base,id:'a',campaignId:'x'},{...base,id:'b',campaignId:'x'},{...base,id:'c',campaignId:'y',deleted:'true'}])).toHaveLength(1);expect(promotionCampaigns([{...base,id:'a'}])[0].lines).toHaveLength(1);});
});
