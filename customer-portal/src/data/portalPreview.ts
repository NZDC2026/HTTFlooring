// Read-only catalogue examples matching the supplied portal design.
export const previewRanges = [
 {id:"bonita",name:"Bonita",category:"Engineered Timber",pattern:"Plank",size:"1900 × 190 × 14/2 mm",pack:"2.166",price:69,stock:479,inStock:1,count:9,promotion:true,incoming:4,arrival:"28 Nov",tone:"stone",swatches:["#ad805a","#c2ad96","#b6a083","#8b8174","#7e6248","#d8c5a4","#6c4832","#cdbca0","#895c3d"]},
 {id:"quercus",name:"Quercus",category:"Engineered Timber",pattern:"Herringbone",size:"600 × 120 × 15/4 mm",pack:"1.86",price:98,stock:350,inStock:5,count:10,promotion:false,incoming:2,arrival:"15 Dec",tone:"oak",swatches:["#b9905b","#c8b99c","#c1a179","#9c8c79","#c18a45","#705e52","#ddd1bd","#ac835e","#b7a28b","#71553d"]},
 {id:"heritage",name:"Heritage",category:"Engineered Timber",pattern:"Chevron",size:"720 × 120 × 15/4 mm",pack:"2.0",price:105,stock:120,inStock:1,count:1,promotion:false,incoming:0,arrival:"",tone:"sand",swatches:["#8f6846"]},
 {id:"guardian",name:"Guardian",category:"Hybrid",pattern:"Plank",size:"1830 × 228 × 9 mm",pack:"2.503",price:47.5,stock:288,inStock:2,count:3,promotion:true,incoming:1,arrival:"12 Dec",tone:"sky",swatches:["#99978e","#c9bda8","#6c5340"]},
 {id:"terra",name:"Terra",category:"Hybrid",pattern:"Herringbone",size:"615 × 123 × 8 mm",pack:"1.51",price:52,stock:76,inStock:2,count:3,promotion:true,incoming:1,arrival:"02 Dec",tone:"mist",swatches:["#d1bd98","#a17a55","#4a433d"]},
 {id:"aquaglow",name:"AquaGlow",category:"Laminate",pattern:"Plank",size:"1218 × 198 × 12 mm",pack:"1.93",price:44,stock:137,inStock:2,count:2,promotion:true,incoming:0,arrival:"",tone:"moss",swatches:["#bcbfc0","#c4a176"]},
 {id:"nordic",name:"Nordic",category:"Laminate",pattern:"Chevron",size:"600 × 100 × 12 mm",pack:"1.44",price:48,stock:43,inStock:1,count:2,promotion:false,incoming:1,arrival:"09 Dec",tone:"sand",swatches:["#e1d3b9","#aaa39a"]},
 {id:"accessories-scotia",name:"Scotia",category:"Accessories",pattern:"Scotia",size:"2400 × 18 × 18 mm",pack:"",price:12.5,stock:580,inStock:7,count:8,promotion:false,incoming:0,arrival:"",tone:"stone",swatches:["#ad805a","#c2ad96","#d8c5a4","#8b8174","#7e6248","#6c4832","#cdb394","#6d5140"]},
 {id:"accessories-stair-nose",name:"Stair Nose",category:"Accessories",pattern:"Stair Noses",size:"2400 mm · made to order",pack:"",price:46,stock:0,inStock:0,count:9,promotion:false,incoming:0,arrival:"",tone:"oak",swatches:["#ad805a","#c2ad96","#b6a083","#8b8174","#7e6248","#d8c5a4","#6c4832","#cdbca0","#895c3d"]},
 {id:"accessories-trims",name:"Trims",category:"Accessories",pattern:"Aluminium Trim",size:"2700 mm",pack:"",price:19.5,stock:309,inStock:6,count:7,promotion:false,incoming:0,arrival:"",tone:"mist",swatches:["#b68b5f","#d6c5a7","#e7dbc4","#9c9080","#292929","#6f4b33","#5e4435"]},
];
export type PreviewRange = typeof previewRanges[number];
export const displayBoards = [{name:"Colour panels",count:26},{name:"Swatch sets",count:7},{name:"Stands",count:8}];
export const creditLimit = 30000;
