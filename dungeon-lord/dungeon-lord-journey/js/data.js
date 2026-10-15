export const REGIONS={
 outskirts:{name:'街の外れ',subtitle:'門の外にも、暮らしはある。',terrain:'road',x:31,y:73,food:0,hygiene:-3,description:'行商人の荷車と、街へ続く大きな門。',jobs:['carry','escort']},
 village:{name:'農村',subtitle:'畑と、壊れた農具と、昼寝。',terrain:'field',x:27,y:29,food:2,hygiene:-2,description:'小川沿いに畑が続く。主は案山子より目立つ。',jobs:['farm','harvest']},
 mine:{name:'北の鉱山',subtitle:'山の中では、人手が足りない。',terrain:'mine',x:76,y:26,food:0,hygiene:-5,description:'坑道の奥で、何かが動く音がする。',jobs:['mining','ore-carry']}
};
export const JOBS={
 carry:{name:'荷運び',region:'outskirts',money:14,food:1,text:'行商人の荷を門の手前まで運んだ。主は大きいが、荷車には乗れない。'},
 escort:{name:'街道の護衛',region:'outskirts',money:23,food:2,battles:1,text:'行商人の荷車について歩く。今日は道をふさぐ影がある。'},
 farm:{name:'畑の手伝い',region:'village',money:10,food:3,text:'農夫と畑を耕した。柄の折れた農具が、畑の脇に並んでいる。'},
 harvest:{name:'収穫の手伝い',region:'village',money:8,food:4,text:'余った野菜を分けてもらった。主は食べないので、全部こちらの分だ。'},
 mining:{name:'採掘の手伝い',region:'mine',money:19,food:1,text:'鉱夫と石を運んだ。道具は古く、鉱夫は柄を何度も直していた。'},
 'ore-carry':{name:'鉱石運び',region:'mine',money:16,food:2,text:'選り分けた鉱石を入口まで運んだ。袋に、小さな欠片を一つ残してくれた。'},
 'seed-cart':{name:'村の配達',region:'village',money:17,food:5,text:'増えた収穫を街の外れへ届ける。行商人が、次の荷車の相談を始めた。'},
 'new-vein':{name:'新しい坑道の採掘',region:'mine',money:27,food:2,battles:1,text:'新しい道具で奥へ進む。珍しい鉱石と、そこに住むものが見つかった。'}
};
export const WEAPONS={sword:{name:'旅の剣',tags:['road','field'],power:1},pick:{name:'鉱山のつるはし',tags:['mine'],power:1.08}};
export const CLOTHES={coat:{name:'旅の外套',tags:['road','field','mine']},boots:{name:'履き慣れた靴',tags:['road','field']},'work-boots':{name:'作業靴',tags:['mine','field']}};
export const RUMORS={
 gate:'大きな連れがいると、街の門を通れないらしい。',
 village:'小川の先に農村がある。畑の手伝いを探しているらしい。',
 mine:'北の鉱山では人手が足りないらしい。行商人が道を教えてくれた。',
 farmer:'農村の農具は、修理してもすぐ壊れるらしい。',
 miner:'鉱山の道具は古い。鉱夫が「道具さえあれば」と言っていた。',
 trader:'行商人は南の街から来た。次は海沿いへ行くつもりらしい。',
 villageChange:'農村で、同じ形の農具がたくさん使われ始めたらしい。',
 mineChange:'北の鉱山で、新しい道具と坑道が増え始めたらしい。',
 city:'今の大きさなら、二人で街に入れる。門番も顔を覚えていた。'
};
// Conditions are private content rules. The journal contains only learned facts.
export const EVENTS=[
 {id:'road-discovery',when:{location:'outskirts',kind:'explore'},effects:[{type:'region',id:'village'},{type:'region',id:'mine'},{type:'flag',key:'trader',value:true},{type:'rumor',id:'village'},{type:'rumor',id:'mine'},{type:'rumor',id:'trader'}],lines:[['語り','門の外を歩くと、小川沿いの道が見つかった。畑から煙が上がっている。'],['行商人','北の鉱山？ この道を山へ。人手なら、いつでも足りてないよ。'],['主','道、増えたね。']]},
 {id:'farmer-meeting',when:{location:'village'},effects:[{type:'rumor',id:'farmer'}],lines:[['農夫','大きいね。いや、そっちじゃなくて、連れの方。'],['主','うん。'],['農夫','畑の手伝いなら歓迎だ。農具は、まあ、見ての通りだけど。']]},
 {id:'miner-meeting',when:{location:'mine'},effects:[{type:'rumor',id:'miner'}],lines:[['鉱夫','入口が狭いから、連れは外で待っててくれ。'],['主','外から手伝えるよ。'],['鉱夫','道具が新しければ、奥まで掘れるんだがな。']]},
 {id:'farm-help',when:{location:'village',kind:'work',job:'farm',completed:['farmer-meeting']},effects:[{type:'flag',key:'farmHelp',value:true}],lines:[['語り','農夫は折れた柄を紐でつないだ。主が、その手元を見ていた。']]},
 {id:'mine-help',when:{location:'mine',kind:'work',job:'mining',completed:['miner-meeting']},effects:[{type:'flag',key:'mineHelp',value:true}],lines:[['語り','鉱夫が欠けた刃を見せた。主は、道具を一つ作って渡した。']]},
 {id:'farmer-gift',when:{location:'village',ability:'creation',completed:['farm-help'],visits:{village:2},world:{giftTo:null}},effects:[{type:'gift',to:'farmer'}],lines:[['語り','帰り際、農夫の手から農具が一つ出てきた。もう一つ、出てきた。'],['主人公','え、あれ渡したの？'],['主','うん。'],['主人公','……自分では、もう作れないんだよね。'],['主','そうだね。']]},
 {id:'miner-gift',when:{location:'mine',ability:'creation',completed:['mine-help'],visits:{mine:2},world:{giftTo:null}},effects:[{type:'gift',to:'miner'}],lines:[['語り','鉱夫が掌から新しい刃を出した。主人公は、少し遅れて気づいた。'],['主人公','え、あれ渡したの？'],['主','うん。'],['主人公','王の剣も、もう出ない？'],['主','出ないね。']]},
 {id:'city-entry',when:{location:'outskirts',world:{small:true}},effects:[{type:'flag',key:'city',value:true},{type:'rumor',id:'city'}],lines:[['門番','今なら通れるな。頭、ぶつけるなよ。'],['主','小さくなったから。'],['語り','街の井戸で身なりを整えた。二人の拠点にはしなかった。']]},
 {id:'village-growth-1',when:{world:{giftTo:'farmer'},giftAge:2},effects:[{type:'world',key:'villageLevel',value:1,region:'village'},{type:'job',id:'seed-cart'},{type:'rumor',id:'villageChange'}],lines:[['語り','村の農具が増えた、という話が届いた。畑も少し広がったらしい。']]},
 {id:'village-growth-2',when:{world:{giftTo:'farmer'},giftAge:4,completed:['village-growth-1']},effects:[{type:'world',key:'villageLevel',value:2,region:'village'},{type:'item',id:'村の保存食',count:1}],lines:[['語り','村から小さな保存食の包みが届いた。余るくらい採れるようになったらしい。']]},
 {id:'mine-growth-1',when:{world:{giftTo:'miner'},giftAge:2},effects:[{type:'world',key:'mineLevel',value:1,region:'mine'},{type:'job',id:'new-vein'},{type:'rumor',id:'mineChange'}],lines:[['語り','北の鉱山に新しい道具が揃い始めた。使わなくなった坑道も、掘り直しているらしい。']]},
 {id:'mine-growth-2',when:{world:{giftTo:'miner'},giftAge:4,completed:['mine-growth-1']},effects:[{type:'world',key:'mineLevel',value:2,region:'mine'},{type:'weapon',id:'pick'},{type:'item',id:'青い鉱石',count:1}],lines:[['語り','鉱夫から、つるはしと青い鉱石が届いた。新しい地層まで掘れたそうだ。'],['主','青いね。']]},
 {id:'cross-road',when:{kind:'work',job:'carry',completed:['farmer-meeting'],historyIncludes:{target:'village'}},effects:[{type:'item',id:'南の街の布切れ',count:1}],lines:[['行商人','農村まで行ったのか。向こうの野菜、次は運んでもらおうかな。']]},
 {id:'mine-memory',when:{location:'village',completed:['miner-meeting'],historyTail:[{target:'mine'},{target:'village'}]},effects:[{type:'item',id:'山で拾った白い石',count:1}],lines:[['農夫','鉱山帰りか。川の石と、山の石は違うんだな。']]}
];
