import http from'node:http';import{readFile}from'node:fs/promises';import{compare,sdk}from'../freezescope-engine/index.mjs';import{createScenarios}from'../freezescope-scenarios/index.mjs';import{captureSnapshot,captureSpecimen}from'./capture.mjs';
export function allowed(req){return ['127.0.0.1:4501','127.0.0.1:4500'].includes(req.headers.host)&&(!req.headers.origin||req.headers.origin==='http://127.0.0.1:4500')}
export function createBackend(){return http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');try{
 if(!allowed(req)){res.writeHead(403);res.end(JSON.stringify({error:'Local origin required'}));return}
 let result;
 if(req.method==='GET'&&req.url==='/health')result={ok:true,signing:false,upgradeSubmission:false};
 else if(req.method==='GET'&&req.url==='/evidence')result=JSON.parse(await readFile(new URL('testnet-evidence.json',import.meta.url)));
 else if(req.method==='GET'&&req.url==='/teaching')result=createScenarios(sdk);
 else if(req.method==='POST'&&req.url==='/snapshot')result=await captureSnapshot();
 else if(req.method==='POST'&&req.url==='/specimen'){const c=JSON.parse(await readFile(new URL('specimen.json',import.meta.url)));result=await captureSpecimen(c)}
 else if(req.method==='POST'&&req.url==='/compare'){let body='';for await(const c of req){body+=c;if(Buffer.byteLength(body)>1048576)throw Error('Body limit 1 MiB')}const b=JSON.parse(body);result=compare(b.envelopes,b.snapshot,b.proposal)}
 else{res.writeHead(404);result={error:'Unknown endpoint'}}res.end(JSON.stringify(result));
 }catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}))}})}
if(process.argv[1]===new URL(import.meta.url).pathname)createBackend().listen(4501,'127.0.0.1');
