const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('node:assert/strict');
const {root,server,installFixtures,fixture}=require('./harness.cjs'),out=process.env.FOREST_QA_OUTPUT,folder='forest-action-card-impact/';
fs.mkdirSync(out,{recursive:true});
(async()=>{const s=await server(8011);let b;try{
 b=await chromium.launch({headless:true,executablePath:process.env.FOREST_QA_BROWSER,args:JSON.parse(process.env.FOREST_QA_ARGS),env:process.env,proxy:{server:process.env.HTTPS_PROXY,bypass:'localhost,127.0.0.1'}});
 const p=await b.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true}),errors=[],clips=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8011/'+folder+'preview.html?capture=1',{waitUntil:'commit'});await p.waitForFunction(()=>window.cardImpactPreview);await p.waitForTimeout(1200);
 let cd=await p.context().newCDPSession(p);
 async function clip(name,action,ms){
  const dir=path.join(out,'wide-record-'+name);fs.mkdirSync(dir,{recursive:true});const images=[];let recording=true;
  const handler=async e=>{if(recording){const file=String(images.length).padStart(5,'0')+'.jpg';fs.writeFileSync(path.join(dir,file),Buffer.from(e.data,'base64'));images.push({file,time:Date.now()/1000})}try{await cd.send('Page.screencastFrameAck',{sessionId:e.sessionId})}catch{}};
  cd.on('Page.screencastFrame',handler);const initial=await cd.send('Page.captureScreenshot',{format:'jpeg',quality:90,clip:{x:0,y:0,width:1280,height:720,scale:.75},captureBeyondViewport:false});fs.writeFileSync(path.join(dir,'00000.jpg'),Buffer.from(initial.data,'base64'));images.push({file:'00000.jpg',time:Date.now()/1000});await cd.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:960,maxHeight:540,everyNthFrame:1});
  await action();const start=Date.now();await p.waitForFunction(()=>window.cardImpactPreview.snapshot().impact.active);const impact=await p.evaluate(()=>window.cardImpactPreview.snapshot().impact);assert.ok(impact.rectangles>0);await p.waitForFunction(()=>window.cardImpactPreview.snapshot().done);await p.waitForTimeout(160);await cd.send('Page.stopScreencast');recording=false;cd.removeListener('Page.screencastFrame',handler);assert.ok(images.length>5,name+' frame count: '+images.length);
  const lines=['ffconcat version 1.0'];images.forEach((im,i)=>{lines.push("file '"+im.file+"'");if(i<images.length-1)lines.push('duration '+Math.max(.005,images[i+1].time-im.time))});lines.push("file '"+images.at(-1).file+"'");fs.writeFileSync(path.join(dir,'frames.ffconcat'),lines.join('\n'));
  clips.push({name,frames:images.length,recordMs:Date.now()-start,observedImpact:impact});console.log('RECORDED',name,images.length);
 }
 for(const move of ['slash','thrust','heavy'])for(const mode of ['normal','over']){
  await p.locator('[data-impact='+mode+']').click();await p.locator('[data-preview-move='+move+']').click();await p.waitForTimeout(1450);
  await clip(move+'-'+mode,()=>p.locator('#preview-replay').evaluate(e=>e.click()),1750);
 }
 await p.locator('[data-impact=normal]').click();await p.locator('[data-preview-outcome=critical]').click();await p.waitForTimeout(1450);await clip('heavy-critical',()=>p.locator('#preview-replay').evaluate(e=>e.click()),1750);
 fs.writeFileSync(path.join(out,'capture-wide.json'),JSON.stringify({clips,errors,description:'Actual Chrome compositor capture with original arrival intervals; encode-recording.py validates and joins each clip separately after capture'},null,2));assert.deepEqual(errors,[]);
 }finally{await b?.close();s.close()}})().catch(e=>{console.error(e);process.exitCode=1});
