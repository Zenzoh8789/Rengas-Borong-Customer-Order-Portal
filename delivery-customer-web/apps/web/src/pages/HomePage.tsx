import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SearchBox } from "../components/AppShell";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";
const categoryName = (category: ProductCategory) => typeof category === "string" ? category : category?.name || "Uncategorised";
const categoryEmoji = (name: string) => { const v=name.toLowerCase(); if(v==="all")return "🛍️"; if(/drink|beverage|water|juice/.test(v))return "🥤"; if(/snack|biscuit|sweet/.test(v))return "🍪"; if(/house|clean|laundry/.test(v))return "🧹"; if(/personal|beauty|care|health/.test(v))return "🧴"; if(/food|grocery|rice|noodle/.test(v))return "🍚"; return "📦"; };
export function HomePage() {
  const [products,setProducts]=useState<Product[]>([]); const [search,setSearch]=useState(""); const [params]=useSearchParams(); const navigate=useNavigate();
  useEffect(()=>{api.products().then(setProducts).catch(()=>setProducts([]));},[]);
  const categories=useMemo(()=>["All",...Array.from(new Set(products.map(p=>categoryName(p.category)))).sort()],[products]);
  const requested=params.get("category")||"All"; const matching=products.filter(p=>(requested==="All"||categoryName(p.category)===requested)&&`${p.name} ${p.code} ${p.subtitle||""}`.toLowerCase().includes(search.toLowerCase()));
  const sections=requested!=="All"||search?[[requested==="All"?"Search results":requested,matching] as const]:categories.slice(1).map(name=>[name,products.filter(p=>categoryName(p.category)===name).slice(0,3)] as const);
  const open=(name:string)=>navigate(name==="All"?"/":`/?category=${encodeURIComponent(name)}`);
  return <div className="home-page storefront-page"><div className="home-controls storefront-controls"><SearchBox value={search} onChange={setSearch} placeholder="Search products..."/><div className="category-tiles">{categories.map(name=><button key={name} className={requested===name?"active":""} onClick={()=>open(name)}><span>{categoryEmoji(name)}</span><b>{name.replace(/\s+products$/i,"")}</b></button>)}</div></div><div className="storefront-scroll">{sections.map(([name,items])=>items.length>0&&<section className="product-section" key={name}><header><div><h2>{name.replace(/\s+products$/i,"")}</h2><p>Popular picks for your shop</p></div><button onClick={()=>open(name)}>See more</button></header><div className="product-row">{items.map(product=><ProductCard key={product.id} product={product}/>)}</div></section>)}{!matching.length&&(search||requested!=="All")&&<div className="empty">No products found.</div>}</div></div>;
}
