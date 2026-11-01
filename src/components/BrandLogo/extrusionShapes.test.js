import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { LOGO_SHAPES as original } from './logoShapes.js';
import { LOGO_SHAPES as simplified } from './extrusionShapes.js';
function distance(p,a,b){const x=b[0]-a[0],y=b[1]-a[1];const t=x||y?Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y))):0;return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);}
test('extrusion outlines preserve silhouette within 0.002 units and signed area within 1%',()=>{
 assert.equal(simplified.length, original.length);
 original.forEach((points,index)=>{
  const outline=simplified[index];
  assert.ok(outline.length<points.length/3);
  for(const p of points)assert.ok(Math.min(...outline.map((a,i)=>distance(p,a,outline[(i+1)%outline.length])))<=0.002001);
  const area=pts=>THREE.ShapeUtils.area(pts.map(p=>new THREE.Vector2(...p)));
  assert.ok(Math.abs((area(outline)-area(points))/area(points))<0.01);
  const geometry=new THREE.ExtrudeGeometry(new THREE.Shape(outline.map(p=>new THREE.Vector2(...p))),{depth:0.45,bevelSegments:2,steps:1});
  assert.ok(geometry.attributes.position.count>0);
  assert.ok(Array.from(geometry.attributes.position.array).every(Number.isFinite));
  geometry.dispose();
 });
});
