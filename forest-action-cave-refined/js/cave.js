import {SceneBackdrop} from './scene-backdrop.js';
export class Cave extends SceneBackdrop{
 constructor(scene,options={}){super(scene,new URL('../media/scene.json',import.meta.url),options);}
}
