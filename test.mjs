import{test}from'node:test';import assert from'node:assert/strict';import{captureSnapshot,captureSpecimen}from'./capture.mjs';import{allowed}from'./server.mjs';
test('wrong network rejected before reading configuration',async()=>assert.rejects(()=>captureSnapshot({server:{getNetwork:async()=>({passphrase:'wrong'})}}),/Wrong network/));
test('missing settings never become empty safe snapshot',async()=>assert.rejects(()=>captureSnapshot({server:{getNetwork:async()=>({passphrase:'Test SDF Network ; September 2015'}),getLedgerEntries:async()=>({entries:[]})}}),/Both/));
test('cross origin and invalid hosts rejected',()=>{assert.equal(allowed({headers:{host:'evil.test'}}),false);assert.equal(allowed({headers:{host:'127.0.0.1:4501',origin:'http://evil.test'}}),false);assert.equal(allowed({headers:{host:'127.0.0.1:4500'}}),true)});
test('invalid specimen rejected without RPC',async()=>assert.rejects(()=>captureSpecimen({}),/Invalid specimen/));
