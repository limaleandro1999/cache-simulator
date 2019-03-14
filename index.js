const fs = require('fs');
const readline = require('readline');

const cacheSize = 1;
const cacheLineSize = 16;
const cacheSetLines = 4;
const memoryAddressSize = 32;
const cacheReplacePolicy = 1;
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

const cacheLine = { valid: 0, tag: 0, timeStamp: 0, numberAccess: 0 };
const cache = new Array(numberCacheLines);

cache.fill(cacheLine, 0, numberCacheLines)

const rd = readline.createInterface({
  input: fs.createReadStream('./trace'),
  console: false
});

rd.on('line', function(line) {
  let fifo = -1;
  let lru = -1;

  memReq++;
  
  cache.map(item => {
    item.timeStamp++;
  })

  const address = convertNumber(line, 16);

  let offset = address&((Math.pow(2, offsetBits) -1));
  let index = (address >> offsetBits) & (Math.pow(2, indexBits) -1);
  let tag = (address >> (offsetBits + indexBits)) & (Math.pow(2, tagBits) -1);

  let higherNumber = -1;
  let lowerNumber = Math.pow(2,32) - 1;
  let miss = 1;
  let startIndex = (index * 4);
  let finalIndex = ((index * 4) + cacheSetLines);
  
  for(let i = startIndex; i < finalIndex; i++){
    if(cacheReplacePolicy === 0){
      if(cache[i].timeStamp > higherNumber){
        higherNumber = cache[i].timeStamp;
        fifo = i;
      }    
    }else{
      if(cache[i].numberAccess < lowerNumber){
        lowerNumber = cache[i].numberAccess;
        lru = i;
      }
    }
  }

  for(let i = startIndex; i < finalIndex; i++){
    if(cache[i].tag === tag){
      cache[i].numberAccess++;
      cacheHit++;
      miss = 0;
      break;
    }
  }

  if(miss > 0){
    cacheMiss++;
    let replaced = false;

    for(let i = startIndex; i < finalIndex; i++){
      if(cache[i].valid === 0){
        cache[i].valid = 1;
        cache[i]['tag'] = tag;
        cache[i].timeStamp = 0;
        cache[i].numberAccess = 0;
        replaced = true;
        break;
      }
    } 

    if(!replaced){
      if(cacheReplacePolicy === 0){
        cache[fifo]['tag'] = tag;
        cache[fifo].valid = 1;
        cache[fifo].timeStamp = 0;
        cache[fifo].numberAccess = 0;
      }else{
        cache[lru]['tag']= tag;
        cache[lru].valid = 1;
        cache[lru].timeStamp = 0;
        cache[lru].numberAccess = 0;
      }
    }
  }
});

rd.on('close', () => {
  console.log(cacheHit);
  console.log(cacheMiss);
  console.log(cache);
});

const convertNumber = (n, fromBase, toBase = 10) => {
  return parseInt(n.toString(), fromBase).toString(toBase);
};