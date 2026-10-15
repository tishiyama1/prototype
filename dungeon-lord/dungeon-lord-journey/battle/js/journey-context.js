const fallback={id:'standalone',creation:true,height:3,weaponName:'旅の剣',weaponPower:1,mastery:0,skills:{slash:0,thrust:0,heavy:0},fit:1,terrain:'road'};
export let journeyContext={...fallback};
export function setJourneyContext(ctx){journeyContext={...fallback,...ctx};}
if(typeof window!=='undefined'){const id=new URLSearchParams(location.search).get('journey');try{const raw=sessionStorage.getItem('lord-journey-battle:'+id);if(raw)setJourneyContext(JSON.parse(raw));}catch{} }
export const masteryTier=n=>n>=16?2:n>=6?1:0;
export function postureInfo(p){return {stable:(p.steady||0)>=.2,recentDodge:(p.recentDodge||0)>0,recentHurt:(p.recentHurt||0)>0};}
export function effectivePower(p,move){const c=journeyContext,posture=postureInfo(p),balance=posture.recentHurt?.72:posture.recentDodge?.82:posture.stable?1:.9;return c.weaponPower*(1+masteryTier(c.mastery)*.08+masteryTier(c.skills[move]||0)*.04)*(.94+c.fit*.12)*balance;}
