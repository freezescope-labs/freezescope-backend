import{sdk,decodeKey,normalizeSnapshot}from'../freezescope-engine/index.mjs';
export const RPC='https://soroban-testnet.stellar.org';
export async function captureSnapshot({server=new sdk.rpc.Server(RPC,{timeout:20000})}={}){
 const net=await server.getNetwork();if(net.passphrase!==sdk.Networks.TESTNET)throw Error('Wrong network');
 const keys=[17,19].map(id=>sdk.xdr.LedgerKey.configSetting(new sdk.xdr.LedgerKeyConfigSetting({configSettingId:sdk.xdr.ConfigSettingId.fromXdrObject(id)})));
 const r=await server.getLedgerEntries(...keys);if(r.entries.length!==2)throw Error('Both CAP-77 settings must be present');
 let frozenKeys,bypassHashes;const evidence=[];
 for(const e of r.entries){const v=e.val.value,id=v.type;evidence.push({keyXdr:e.key.toXdr('base64'),entryXdr:e.val.toXdr('base64'),lastModifiedLedgerSeq:e.lastModifiedLedgerSeq});
  if(id==='configSettingFrozenLedgerKeys')frozenKeys=v.value.keys.map(k=>Buffer.from(k.toBytes()).toString('base64'));
  if(id==='configSettingFreezeBypassTxs')bypassHashes=v.value.txHashes.map(h=>Buffer.from(h.toBytes()).toString('hex'));
 }
 if(!frozenKeys||!bypassHashes)throw Error('Unexpected CAP-77 response');
 const s={schemaVersion:1,network:'testnet',ledger:r.latestLedger,protocolVersion:net.protocolVersion,frozenKeys,bypassHashes,capturedAt:new Date().toISOString(),provenance:'Live testnet RPC configuration snapshot',rpc:RPC,evidence};normalizeSnapshot(s);return s;
}
export async function captureSpecimen(config,{server=new sdk.rpc.Server(RPC,{timeout:20000})}={}){
 if(!sdk.StrKey.isValidContract(config.contractId)||!sdk.StrKey.isValidEd25519PublicKey(config.sourceAccount))throw Error('Invalid specimen');
 if((await server.getNetwork()).passphrase!==sdk.Networks.TESTNET)throw Error('Wrong network');
 const envelopes=[];
 for(const [id,fn,args]of [['read','read',[]],['write','write',[sdk.nativeToScVal(2,{type:'u32'})]]]){
  let tx=new sdk.TransactionBuilder(await server.getAccount(config.sourceAccount),{fee:'10000',networkPassphrase:sdk.Networks.TESTNET}).addOperation(new sdk.Contract(config.contractId).call(fn,...args)).setTimeout(120).build();
  const simulation=await server.simulateTransaction(tx);if(!sdk.rpc.Api.isSimulationSuccess(simulation))throw Error('Specimen simulation failed');
  tx=sdk.rpc.assembleTransaction(tx,simulation).build();envelopes.push({id,xdr:tx.toXDR(),kind:'unsigned-testnet-simulation',ledger:simulation.latestLedger,transactionDataXdr:simulation.transactionData.build().toXdr('base64')});
 }
 return {envelopes,capturedAt:new Date().toISOString(),scope:'Independent unsigned preflight simulations; no freeze attempted'};
}
