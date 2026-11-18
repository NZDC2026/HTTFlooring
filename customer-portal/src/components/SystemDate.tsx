import { useState } from "react";
export default function SystemDate(){
 const [date]=useState(()=>new Date());
 return <div className="system-date"><i/> System date <strong>{date.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</strong> · updated {date.toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"})}</div>;
}
