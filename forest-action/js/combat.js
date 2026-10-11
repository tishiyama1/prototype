export function resolveCombat(game) {
  const p=game.player;
  if(p.activeAttack) {
    const a=p.attack;
    for(const enemy of game.enemies) {
      const forward=(enemy.x-p.x)*a.facing;
      if(enemy.hp<=0 || a.hits.has(enemy.id) || enemy.lane!==p.lane || forward < -.25 || forward > a.range)continue;
      a.hits.add(enemy.id);enemy.hurt(a.damage,a.facing,a.knockback);
      game.emit('hit',{x:enemy.x,z:enemy.z,finish:a.index===2});
      game.hitstop=Math.max(game.hitstop,game.config.hitstop*(a.index===2?1.5:1));
      if(enemy.hp===0)game.kills++;
    }
  }
  for(const e of game.enemies) {
    if(p.hp<=0 || e.hp<=0 || e.state!=='strike' || e.hit || e.lane!==p.lane)continue;
    const f=(p.x-e.x)*e.facing;
    if(f>=-.5 && f <= (e.kind==='rush' ? .95:1.6) && p.hurt(e.kind==='rush'?16:10,e.facing)) {
      e.hit=true;game.emit('hurt',{x:p.x,z:p.z});game.hitstop=Math.max(game.hitstop,.06);
    }
  }
}
