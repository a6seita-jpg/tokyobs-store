import { motion, useReducedMotion } from "framer-motion";
export function FeaturedAura({color,children}:{color:string;children:React.ReactNode}) {
 const reduced=useReducedMotion();
 return <div className="group relative isolate overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] text-white" style={{backgroundColor:"#0A0A0A",color:"#fff"}}>
  <motion.div aria-hidden className="pointer-events-none absolute -inset-20 -z-10 rounded-full blur-[80px] transition-all duration-500 group-hover:blur-[100px]" style={{backgroundColor:color}} animate={reduced?undefined:{scale:[1,1.2,1],opacity:[.3,.5,.3]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}/>
  {children}
 </div>;
}
