import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {purchasePriceChange,PurchasePriceComparison} from './PurchasePriceComparison';
it('calculates increases, decreases, unchanged and zero or missing baselines',()=>{
 expect(purchasePriceChange(20,25)).toEqual({amount:5,percent:25});
 expect(purchasePriceChange(20,15)).toEqual({amount:-5,percent:-25});
 expect(purchasePriceChange(20,20)).toEqual({amount:0,percent:0});
 expect(purchasePriceChange(0,5)).toEqual({amount:5,percent:undefined});
 expect(purchasePriceChange(undefined,5)).toBeUndefined();
});
it('links each price to its own supplier bill and colours changes',()=>{
 const render=(price:number)=>renderToStaticMarkup(<MemoryRouter><PurchasePriceComparison previous={{price:20,billId:'old'}} current={{price,billId:'new'}} unit="m²" canPurchase/></MemoryRouter>);
 const rise=render(25);expect(rise).toContain('/purchases/bills/old');expect(rise).toContain('/purchases/bills/new');expect(rise).toContain('#b91c1c');expect(rise).toContain('+25.00%');
 expect(render(15)).toContain('#15803d');
});
it('does not expose bill navigation without purchase access',()=>{
 const html=renderToStaticMarkup(<PurchasePriceComparison previous={{price:20,billId:'old'}} current={{price:25,billId:'new'}} unit="m²" canPurchase={false}/>);
 expect(html).not.toContain('href=');
});
