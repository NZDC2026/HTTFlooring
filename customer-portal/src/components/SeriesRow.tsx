import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { ProductSeries } from "../data/products";

export default function SeriesRow({series}: {series: ProductSeries}) {
    const location = useLocation();
    return <Link to={`/series/${series.id}`} className="series-card" state={{inventorySearch:location.search}}>
        <div className="series-card-image"><img src={series.image} alt="" loading="lazy"/></div>
        <div className="series-card-body">
            <small>{series.category}</small>
            <h2>{series.name}</h2>
            <div className="series-card-footer"><span>{series.products.length} {series.products.length === 1 ? "colour" : "colours"}</span><span>View colours <ArrowUpRight size={16}/></span></div>
        </div>
    </Link>;
}
