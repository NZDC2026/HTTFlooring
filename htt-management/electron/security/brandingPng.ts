import {inflateSync,deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const signature=Buffer.from('89504e470d0a1a0a','hex');
export function crc32(bytes:Uint8Array){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
export function pngChunk(kind:string,data:Buffer){const type=Buffer.from(kind),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([type,data])));return Buffer.concat([length,type,data,crc]);}
// Decode a bounded static 8-bit PNG and re-encode only pixels: no metadata, URLs, scripts or animation survives.
export function normalizeLogo(content:string){
 if(typeof content!=='string'||content.length>1398104||!/^[A-Za-z0-9+/]+={0,2}$/.test(content))throw new Error('Choose a PNG file no larger than 1 MB.');
 const bytes=Buffer.from(content,'base64');if(!bytes.length||bytes.length>1048576||bytes.toString('base64')!==content||!bytes.subarray(0,8).equals(signature))throw new Error('Invalid PNG content.');
 let offset=8,header:Buffer|undefined,transparency:Buffer|undefined,ended=false,dataEnded=false;const pieces:Buffer[]=[];
 while(offset<bytes.length){if(offset+12>bytes.length)throw new Error('Truncated PNG.');const length=bytes.readUInt32BE(offset),type=bytes.subarray(offset+4,offset+8),name=type.toString('ascii'),end=offset+12+length;if(end>bytes.length||!/^[A-Za-z]{4}$/.test(name)||bytes.readUInt32BE(end-4)!==crc32(bytes.subarray(offset+4,end-4)))throw new Error('PNG chunk integrity failed.');const data=bytes.subarray(offset+8,end-4);
  if(!header&&name!=='IHDR')throw new Error('PNG header must be first.');
  if(name==='IHDR'){if(header||length!==13)throw new Error('Invalid PNG header.');header=Buffer.from(data);}
  else if(name==='IDAT'){if(dataEnded)throw new Error('PNG image chunks must be contiguous.');pieces.push(data);}
  else if(name==='tRNS'){if(transparency||pieces.length)throw new Error('Invalid PNG transparency.');transparency=Buffer.from(data);}
  else if(name==='IEND'){if(length||!pieces.length||end!==bytes.length)throw new Error('Invalid PNG end.');ended=true;}
  else{if(pieces.length)dataEnded=true;if(['acTL','fcTL','fdAT'].includes(name)||name[0]===name[0].toUpperCase())throw new Error('Only static non-indexed PNG images are supported.');}
  offset=end;
 }
 if(!header||!ended)throw new Error('Incomplete PNG.');const width=header.readUInt32BE(0),height=header.readUInt32BE(4),type=header[9],channels=({0:1,2:3,4:2,6:4} as Record<number,number>)[type];
 if(!width||!height||width>1024||height>1024||header[8]!==8||!channels||header[10]||header[11]||header[12])throw new Error('Use a static 8-bit RGB, RGBA or grayscale PNG up to 1024 × 1024 pixels, without interlacing.');
 if(transparency&&((type!==0&&type!==2)||transparency.length!==(type===0?2:6)||Array.from({length:type===0?1:3},(_,i)=>transparency!.readUInt16BE(i*2)).some(n=>n>255)))throw new Error('Invalid PNG transparency key.');
 const stride=width*channels,expected=(stride+1)*height,raw=inflateSync(Buffer.concat(pieces),{maxOutputLength:expected});if(raw.length!==expected)throw new Error('PNG pixel length mismatch.');const pixels=Buffer.alloc(stride*height),rgba=Buffer.alloc((width*4+1)*height);
 const paeth=(a:number,b:number,c:number)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];if(filter>4)throw new Error('Invalid PNG filter.');for(let x=0;x<stride;x++){const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;pixels[y*stride+x]=(raw[y*(stride+1)+1+x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  for(let x=0;x<width;x++){const src=y*stride+x*channels,dst=y*(width*4+1)+1+x*4;rgba[dst]=pixels[src];rgba[dst+1]=pixels[src+(type===0||type===4?0:1)];rgba[dst+2]=pixels[src+(type===0||type===4?0:2)];rgba[dst+3]=type===4?pixels[src+1]:type===6?pixels[src+3]:transparency&&(type===0?pixels[src]===transparency.readUInt16BE(0):pixels[src]===transparency.readUInt16BE(0)&&pixels[src+1]===transparency.readUInt16BE(2)&&pixels[src+2]===transparency.readUInt16BE(4))?0:255;}
 }
 const outHeader=Buffer.from(header);outHeader[9]=6;const png=Buffer.concat([signature,pngChunk('IHDR',outHeader),pngChunk('IDAT',deflateSync(rgba)),pngChunk('IEND',Buffer.alloc(0))]);if(png.length>262144)throw new Error('Optimized logo exceeds 256 KB; reduce its dimensions or complexity.');return {width,height,size:png.length,mime:'image/png' as const,content:png.toString('base64'),sha256:createHash('sha256').update(png).digest('hex')};
}
