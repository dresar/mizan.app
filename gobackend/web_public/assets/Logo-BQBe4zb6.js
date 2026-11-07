import{c as l,g as u,e}from"./index-DisSPmNd.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=l("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]),y=({className:a="",variant:s="icon",iconClassName:i="w-10 h-10"})=>{const{data:o,isLoading:n}=u(["settings"],"/core/settings"),t="/logo.svg",c=(o==null?void 0:o.logo)||(o==null?void 0:o.logoUrl)||t;return s==="full"?e.jsx("img",{src:c,alt:"Logo Pesantren",className:`${a} transition-opacity duration-300 ${n?"opacity-0":"opacity-100"}`,onError:r=>{r.currentTarget.src=t,r.currentTarget.onerror=null}}):e.jsx("div",{className:`${i} rounded-xl overflow-hidden flex items-center justify-center bg-white/5 shadow-sm ${a}`,children:e.jsx("img",{src:c,alt:"Logo",className:`w-full h-full object-cover transition-opacity duration-300 ${n?"opacity-0":"opacity-100"}`,onError:r=>{r.currentTarget.src=t,r.currentTarget.onerror=null}})})};export{y as L,d as a};
