import { config, COMBO, laneZ, clamp, approach, smooth, STAGE_END } from './config.js';
export class Player {
  constructor() {
    this.x = 2; this.z = laneZ(0); this.lane = 0; this.facing = 1; this.vx = 0;
    this.hp = 100; this.state = 'idle'; this.time = 0; this.invulnerable = 0;
    this.dodgeCooldown = 0; this.attack = null; this.transition = null;
    this.buffer = 0; this.comboCount = 0; this.walk = 0; this.damageTaken = 0;
  }
  setState(state) { this.state = state; this.time = 0; }
  changeLane(lane) {
    if (lane === this.lane || !['idle','run'].includes(this.state)) return false;
    this.transition = { from: this.lane, to: lane, duration: config.laneTime };
    this.setState('lane'); return true;
  }
  startAttack(index = 0) {
    const c = COMBO[index];
    this.attack = { index, hits: new Set(), windup: c.windup / config.attackSpeed,
      active: c.active / config.attackSpeed, recovery: c.recovery / config.attackSpeed,
      range: config.attackRange, facing: this.facing, ...{damage:c.damage,knockback:c.knockback} };
    this.buffer = 0; this.comboCount = index + 1; this.setState('attack');
  }
  get activeAttack() { const a = this.attack; return this.state === 'attack' && this.time >= a.windup && this.time < a.windup + a.active; }
  get invincible() { return this.invulnerable > 0 || (this.state === 'dodge' && this.time < this.dodgeInvincibility); }
  update(dt, input) {
    this.invulnerable = Math.max(0,this.invulnerable-dt);
    this.dodgeCooldown = Math.max(0,this.dodgeCooldown-dt);
    this.buffer = Math.max(0,this.buffer-dt);
    if (this.state === 'dead') { this.time += dt; return; }
    const dir = Number(!!input.right) - Number(!!input.left);
    if (input.attack) this.buffer = .22;
    // A single destination is latched. Key repeat/held touch never toggles lanes.
    if (input.back) this.changeLane(1);
    else if (input.front) this.changeLane(0);
    if (input.dodge && this.dodgeCooldown === 0 && ['idle','run','attack'].includes(this.state)) {
      this.facing = dir || this.facing; this.dodgeDir = this.facing;
      this.dodgeSpeed = config.dodgeDistance / .22;
      this.dodgeInvincibility = config.invincibility;
      this.dodgeCooldown = .64; this.attack = null; this.buffer = 0; this.setState('dodge');
    }
    if (['idle','run'].includes(this.state) && this.buffer > 0) this.startAttack();
    this.time += dt;
    if (this.state === 'attack') {
      const a = this.attack;
      this.vx = approach(this.vx, dir * config.speed * .18, config.deceleration * dt);
      if (this.time >= a.windup + a.active + a.recovery) {
        if (this.buffer > 0 && a.index < 2) this.startAttack(a.index + 1);
        else { this.attack = null; this.comboCount = 0; this.setState('idle'); }
      }
    } else if (this.state === 'dodge') {
      this.vx = this.time < .22 ? this.dodgeDir * this.dodgeSpeed : 0;
      if (this.time >= .30) this.setState('idle');
    } else if (this.state === 'hurt') {
      this.vx = approach(this.vx, 0, 18 * dt);
      if (this.time >= .22) this.setState('idle');
    } else {
      this.vx = approach(this.vx, dir * config.speed, (dir ? config.acceleration : config.deceleration) * dt);
      if (dir) this.facing = dir;
      if (this.state === 'lane') {
        const tr = this.transition, t = clamp(this.time / tr.duration,0,1);
        this.z = laneZ(tr.from) + (laneZ(tr.to)-laneZ(tr.from))*smooth(t);
        if (t === 1) { this.lane = tr.to; this.transition = null; this.setState(dir ? 'run' : 'idle'); }
      } else this.state = dir ? 'run' : 'idle';
    }
    this.x = clamp(this.x + this.vx * dt, .7, STAGE_END + .5);
    this.walk += Math.abs(this.vx) * dt * 2.6;
    if (this.state !== 'lane') this.z = laneZ(this.lane);
  }
  hurt(damage, direction) {
    if (this.invincible || this.hp <= 0) return false;
    this.hp = Math.max(0,this.hp-damage); this.damageTaken += damage;
    this.invulnerable = .85; this.vx = direction * 4.5;
    // Interrupted lane travel returns to the still-authoritative source lane.
    this.transition = null; this.z = laneZ(this.lane); this.attack = null; this.buffer = 0;
    this.setState(this.hp === 0 ? 'dead' : 'hurt'); return true;
  }
}
