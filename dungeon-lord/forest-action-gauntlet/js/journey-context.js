// Shared assessment hook retained in this isolated combat copy.
import {run} from './run-state.js';
import {WEAPONS,STAGES,equipmentFit,tier} from './run-data.js';
export let journeyContext={};
export function syncContext(){journeyContext={weaponName:WEAPONS[run.weapon].name,weaponPosture:WEAPONS[run.weapon].posture,mastery:run.mastery[run.weapon],skills:{thrust:run.mastery.lunge},fit:equipmentFit(run,STAGES[run.stage-1].terrain),terrain:STAGES[run.stage-1].terrain};}
export const masteryTier=tier;
export function postureInfo(p){return {stable:(p.steady||0)>=.2,recentDodge:(p.recentDodge||0)>0,recentHurt:(p.recentHurt||0)>0};}
export function effectivePower(p,move){const w=WEAPONS[run.weapon],pose=postureInfo(p),balance=pose.recentHurt?w.posture:pose.recentDodge?(w.posture+1)/2:pose.stable?1:.94;return (1+tier(run.mastery[run.weapon])*.12+(run.upgrades[run.weapon]||0)*.12)*(move==='thrust'?1+tier(run.mastery.lunge)*.08:1)*(.92+equipmentFit(run,STAGES[run.stage-1].terrain)*.16)*balance;}
syncContext();
