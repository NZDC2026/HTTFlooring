import type { Product, ProductUnit } from '../types/product';
import { trustedAuthorization } from '../../security/trustedAuthorization';
/** Compare final ex-tax selling prices, after discounts, in the selected unit. */
export function assertProductFloorPrice(product:Product,unit:ProductUnit,price:number,preview=false) {
 const floor=product.setup?.floorPrice??product.priceFloor;
 if (!preview && floor!==undefined && price+1e-8<floor*unit.conversionToBase) trustedAuthorization.require('promotions.margin');
}
