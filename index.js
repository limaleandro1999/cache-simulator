const fs = require('fs');
const readline = require('readline');

const cacheSize = 1;
const cacheLineSize = 16;
const cacheSetLines = 4;
const memoryAddressSize = 32;
const cacheReplacePolicy = 0;
const cacheSizeUnit = 10;

console.log(`Cache Size ${cacheSize} KB, Cache Block Size ${cacheLineSize}`);

const numberCacheLines = (Math.pow(2 * cacheSize, cacheSizeUnit)) / cacheLineSize;
const cacheSetSize = cacheLineSize * cacheSetLines;

const offsetBits = Math.log2(cacheLineSize);
const indexBits = Math.log2(((Math.pow(2 * cacheSize, cacheSizeUnit)) / cacheSetSize));
const tagBits = memoryAddressSize - offsetBits - indexBits;

console.log(`Cache format, tag bits ${tagBits}, index bits ${indexBits}, offset bits ${offsetBits}`)

let cacheHit = 0;
let cacheMiss = 0;
let time_stamp = 0;
let memReq = 0;

const cacheLine = { valid: 0, tag: 0, lastAccess: 0, numberAccess: 0 };
const cache = new Array(numberCacheLines);

console.log(numberCacheLines);

cache.fill(cacheLine);

const rd = readline.createInterface({
  input: fs.createReadStream('./trace'),
  console: false
});

rd.on('line', function(line) {
  memReq++;
  const address = convertNumber(line, 16);
  
  let offset = address&((Math.pow(2, offsetBits) -1));
  let index = (address >> offsetBits) & (Math.pow(2, indexBits) -1);
  let tag = (address >> (offsetBits + indexBits)) & (Math.pow(2, tagBits) -1);

  let miss = 1;

  for(let i = index; i < (index + cacheSetLines); i++){
    if(cache[i].tag === tag){
      cacheHit++;
      miss = 0;
      break;
    }
  }

  if(miss > 0){
    cacheMiss++;

    for(let i = (index * 4); i < ((index * 4) + cacheSetLines); i++){
      if(cache[i].valid === 0){
        cache[i].valid = 1;
        cache[i].tag = tag;
        break;
      }
    } 
  }
});

rd.on('close', () => {
  console.log(cache);
});

const convertNumber = (n, fromBase, toBase = 10) => {
  return parseInt(n.toString(), fromBase).toString(toBase);
};