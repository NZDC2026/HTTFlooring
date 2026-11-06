import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
/** Place a form-controlled field in the page heading without creating a second form state. */
export function FormHeaderSlot({targetId,children}:{targetId?:string;children:ReactNode}) {
    const [target,setTarget]=useState<HTMLElement|null>(null);
    useEffect(()=>{setTarget(targetId?document.getElementById(targetId):null);},[targetId]);
    if(!targetId)return <>{children}</>;
    return target?createPortal(children,target):null;
}
