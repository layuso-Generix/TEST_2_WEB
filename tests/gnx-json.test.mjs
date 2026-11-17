import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {analyze} from "../Assets/spfe/modelo.mjs";
import {indexJsonLines,lineForPath} from "../Assets/spfe/lineas.mjs";
import {SCHEMA_URL, EXAMPLES, exampleUrl} from "../Assets/spfe/config.mjs";
const json=async p=>JSON.parse(await readFile(new URL("../"+p,import.meta.url),"utf8"));
const schema=await json(SCHEMA_URL), m=analyze(schema);
test("El visor resuelve herencia y conserva las reglas de terceros y retenciones",()=>{
 const field=s=>m.fields.find(f=>f.path.endsWith(s));
 assert.equal(new Set(m.fields.map(f=>f.path)).size,336);
 const third=field(".Parties.ThirdParty");assert.equal(third.type,"Lista");
 assert.deepEqual(new Set(third.conditions.map(c=>c.mode)),new Set(["present","absent"]));
 assert(!field("TaxesWithheld[].Tax.TaxOperationType"));
 assert(field("TaxesWithheld[].Tax.WithholdingConceptCode").required);
 assert.equal(field(".Address.CountryCode").values.length,249);
});
test("Los dominios condicionales se calculan por impuesto y por expedidor",()=>{
 const by=(field,context)=>m.catalogs.find(c=>c.title.startsWith(field+" · ")&&c.title.includes('"'+context+'"')).values;
 assert(!by("TaxRegimeCode","IVA").includes("17"));
 assert(by("TaxRegimeCode","IGIC").includes("17"));
 assert.deepEqual(by("InvoiceDocumentType","RE"),["389","471"]);
});
test("El JSON que se descarga contiene ejemplos del perfil actual",async()=>{
 for(const [k] of EXAMPLES){const f=await json(exampleUrl(k)),i=f.InvoiceGNX.Invoices[0],h=i.Invoice[0].InvoiceHeader;
  assert.equal(i.Parties.SellerParty.LegalEntity.Address.CountryCode,"ES");
  if(k==="tercero")assert(Array.isArray(i.Parties.ThirdParty));
  if(k==="rectificativa")assert.equal(h.Corrective.CorrectionMethod,"I");
 }
});
test("El error apunta al campo de la factura correcta o al padre si falta",()=>{
 const x={Invoices:[{InvoiceNumber:"A"},{InvoiceNumber:"B","pun.to":["uno","dos"]}]};
 const lines=JSON.stringify(x,null,2).split("\n"),idx=indexJsonLines(lines);
 const at=p=>lines[lineForPath(p,idx)-1].trim();
 assert.match(at("$.Invoices[1].InvoiceNumber"),/"B"/);
 assert.match(at('$.Invoices[1]["pun.to"][1]'),/"dos"/);
 assert.equal(lineForPath("$.Invoices[1].NoExiste",idx),lineForPath("$.Invoices[1]",idx));
 assert.equal(lineForPath("",idx),null);
});
