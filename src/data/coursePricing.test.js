import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cartTotal,hasCoursePrice} from './coursePricing.js';
test('cart preserves distinct backend prices',()=>assert.equal(cartTotal([{price:89000},{price:49900}]),138900));
test('unknown prices are never replaced with a default or zero',()=>{for(const price of [null,undefined,-1,NaN,'89000']) {assert.equal(hasCoursePrice(price),false);assert.equal(cartTotal([{price}]),null);}});
test('explicit zero price remains valid',()=>assert.equal(cartTotal([{price:0},{price:89000}]),89000));
