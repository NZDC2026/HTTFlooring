import {it,expect} from 'vitest';
import {deflateSync,inflateSync} from 'node:zlib';
import {normalizeLogo,pngChunk,crc32} from '../../../electron/security/brandingPng';
import {logoA,logoB} from './testLogos';
const signature=Buffer.from('89504e470d0a1a0a','hex');
function png(patch:{width?:number;height?:number;depth?:number;type?:number;interlace?:number;raw?:Buffer;extra?:Buffer}={}){const h=Buffer.alloc(13);h.writeUInt32BE(patch.width??1);h.writeUInt32BE(patch.height??1,4);h[8]=patch.depth??8;h[9]=patch.type??6;h[12]=patch.interlace??0;return Buffer.concat([signature,pngChunk('IHDR',h),patch.extra??Buffer.alloc(0),pngChunk('IDAT',deflateSync(patch.raw??Buffer.from([0,25,91,67,255]))),pngChunk('IEND',Buffer.alloc(0))]).toString('base64');}
function pixels(base64:string){const b=Buffer.from(base64,'base64');let o=8;const parts=[];while(o<b.length){const n=b.readUInt32BE(o);if(b.toString('ascii',o+4,o+8)==='IDAT')parts.push(b.subarray(o+8,o+8+n));o+=12+n;}return inflateSync(Buffer.concat(parts));}
it('validates independent Python/zlib fixtures, strips metadata and preserves RGBA pixels',()=>{expect(crc32(Buffer.from('123456789'))).toBe(0xcbf43926);const a=normalizeLogo(logoA),b=normalizeLogo(logoB);expect(a).toMatchObject({width:80,height:32,mime:'image/png'});expect(Buffer.from(a.content,'base64').includes(Buffer.from('Private note'))).toBe(false);expect([...pixels(a.content).subarray(1,5)]).toEqual([25,91,67,255]);expect([...pixels(b.content).subarray(1,5)]).toEqual([195,91,20,160]);expect(normalizeLogo(a.content)).toEqual(a);});
it.each([{width:0},{width:1025},{height:1025},{depth:16},{type:3},{interlace:1},{raw:Buffer.from([5,1,2,3,4])},{raw:Buffer.alloc(10000)},{raw:Buffer.from([0,1])},{extra:pngChunk('acTL',Buffer.alloc(8))},{extra:pngChunk('ABCD',Buffer.alloc(1))}])('rejects unsafe or unsupported PNG shape %j',patch=>{expect(()=>normalizeLogo(png(patch))).toThrow();});
it.each(['','not-base64','data:image/png;base64,AAAA',Buffer.from('<svg onload="alert(1)"/>').toString('base64'),'A'.repeat(1398108)])('rejects empty, encoded URLs, vector or oversized data',content=>{expect(()=>normalizeLogo(content)).toThrow();});
it('rejects invalid CRC, truncation and trailing file payloads',()=>{const b=Buffer.from(logoA,'base64');b[20]^=1;expect(()=>normalizeLogo(b.toString('base64'))).toThrow(/integrity/);expect(()=>normalizeLogo(Buffer.from(logoA,'base64').subarray(0,-4).toString('base64'))).toThrow();expect(()=>normalizeLogo(Buffer.concat([Buffer.from(logoA,'base64'),Buffer.from('hidden')]).toString('base64'))).toThrow();});
it.each([
 [0,[10,20,30,40,50,60,70,80],[11,21,31,41,51,61,71,81]],
 [1,[10,20,30,40,40,40,40,40],[11,21,31,41,40,40,40,40]],
 [2,[10,20,30,40,50,60,70,80],[1,1,1,1,1,1,1,1]],
 [3,[10,20,30,40,45,50,55,60],[6,11,16,21,21,21,21,21]],
 [4,[10,20,30,40,40,40,40,40],[1,1,1,1,1,1,1,1]]
] as const)('decodes PNG filter %i across rows and pixel boundaries', (filter,row1,row2)=>{const raw=Buffer.from([filter,...row1,filter,...row2]);expect([...pixels(normalizeLogo(png({width:2,height:2,raw})).content)]).toEqual([0,10,20,30,40,50,60,70,80,0,11,21,31,41,51,61,71,81]);});
it('converts supported grayscale, RGB and color-key transparency into canonical RGBA',()=>{expect([...pixels(normalizeLogo(png({type:0,raw:Buffer.from([0,50])})).content)]).toEqual([0,50,50,50,255]);expect([...pixels(normalizeLogo(png({type:2,raw:Buffer.from([0,10,20,30]),extra:pngChunk('tRNS',Buffer.from([0,10,0,20,0,30]))})).content)]).toEqual([0,10,20,30,0]);});
