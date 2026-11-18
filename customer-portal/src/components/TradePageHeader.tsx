import DateRangePicker from "./DateRangePicker";

import SystemDate from "./SystemDate";
export default function TradePageHeader({title,description,period,onPeriod,now}:{title:string;description:string;period?:string;onPeriod?:(value:string)=>void;now?:Date}){
 return <section className="trade-page-heading"><div className="reference-width"><div><h1>{title}</h1><p>{description}</p></div>{period&&now?<div className="trade-date"><DateRangePicker value={period} onChange={value=>onPeriod?.(value)} now={now}/><SystemDate/></div>:<SystemDate/>}</div></section>;
}
