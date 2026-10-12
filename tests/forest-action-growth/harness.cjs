const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
function server(port){const s=http.createServer((req,res)=>{let f=path.join(root,new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f+='/index.html';if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);return res.end('404')};res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':f.endsWith('.json')?'application/json':f.endsWith('.mp4')?'video/mp4':'text/html');res.end(fs.readFileSync(f));});return new Promise(resolve=>s.listen(port,'127.0.0.1',()=>resolve(s)));}
async function installFixtures(p){await p.evaluate(async()=>{const {Game}=await import('./js/game.js');const command=Game.prototype.commandAttack;Game.prototype.commandAttack=function(){
 if(window.__fixture){const f=window.__fixture;this.player.x=-f.distance;this.player.z=0;this.player.hp=100;this.player.state='idle';this.player.dash=null;this.player.attackCooldown=0;this.enemy.x=0;this.enemy.z=0;this.enemy.hp=f.enemyHp||120;this.enemy.yaw=Math.PI;this.enemy.aim={x:-1,z:0};this.enemy.velocity={x:0,z:0};this.enemy.kind=f.kind||'slash';this.enemy.setState(f.state,2);this.selected=f.move;window.__duel=this;}
 return command.call(this);
};});}
const fixture=(p,f)=>p.evaluate(f=>{window.__fixture=f},f);
module.exports={root,server,installFixtures,fixture};
