const fs = require('fs');
const readline = require('readline');

const cache1024 = {cache: new Array(64), cacheMiss: 0, cacheHit: 0, length: 1024};
const cache2Way1024 = {cache: [new Array(32), new Array(32)], cacheMiss: 0, cacheHit: 0, length: 1024};

const cache2048 = {cache: new Array(128), cacheMiss: 0, cacheHit: 0, length: 2048};
const cache2Way2048 = {cache: [new Array(64), new Array(64)], cacheMiss: 0, cacheHit: 0, length: 2048};

const cache4096 = {cache: new Array(256), cacheMiss: 0, cacheHit: 0, length: 4096};
const cache2Way4096 = {cache: [new Array(128), new Array(128)], cacheMiss: 0, cacheHit: 0, length: 4096};

const cache8192 = {cache: new Array(512), cacheMiss: 0, cacheHit: 0, length: 8192};
const cache2Way8192 = {cache: [new Array(256), new Array(256)], cacheMiss: 0, cacheHit: 0, length: 8192};

const cache16384 = {cache: new Array(1024), cacheMiss: 0, cacheHit: 0, length: 16384};
const cache2Way16384 = {cache: [new Array(512), new Array(512)], cacheMiss: 0, cacheHit: 0, length: 16384};

const rd = readline.createInterface({
  input: fs.createReadStream('./trace'),
  console: false
});

console.log('Please wait, i am simulating cache');

rd.on('line', function(line) {
  cacheCheck(line, cache1024);
  cacheCheck(line, cache2048);
  cacheCheck(line, cache4096);
  cacheCheck(line, cache8192);
  cacheCheck(line, cache16384);

  cacheSetAssociativeCheckFIFO(line, cache2Way1024);
  cacheSetAssociativeCheckFIFO(line, cache2Way2048);
  cacheSetAssociativeCheckFIFO(line, cache2Way4096);
  cacheSetAssociativeCheckFIFO(line, cache2Way8192);
  cacheSetAssociativeCheckFIFO(line, cache2Way16384);
});

rd.on('close', () => {
  console.log(`         ${cache1024.length}     ${cache2048.length}      ${cache4096.length}     ${cache8192.length}     ${cache16384.length}`);
  console.log(`Direto   ${cache1024.cacheMiss}   ${cache2048.cacheMiss}   ${cache4096.cacheMiss}   ${cache8192.cacheMiss}   ${cache16384.cacheMiss}`);
});

const convertNumber = (n, fromBase, toBase = 10) => {
  return parseInt(n.toString(), fromBase).toString(toBase);
};

const cacheCheck = (line, cache) => {
  let start
  
  switch(cache.length){
    case 1024:
      start = 21;
      break;
    case 2048:
      start = 20;
      break;
    case 4096:
      start = 19;
      break;
    case 8192:
      start = 18;
      break;
    case 16384:
      start = 17;
      break;
  }

  let binaryAddr = convertNumber(line, 16, 2);
  let cacheIndex = getCacheIndex(binaryAddr, start);

  if(!cache.cache[cacheIndex] || cache.cache[cacheIndex] !== binaryAddr){
    cache.cache[cacheIndex] = binaryAddr;
    cache.cacheMiss++;
  }else{
    cache.cacheHit++;
  }
};

const cacheSetAssociativeCheckFIFO = (line, cache, numberOfSets) => {
  let start
  
  switch(cache.length){
    case 1024:
      start = 21;
      break;
    case 2048:
      start = 20;
      break;
    case 4096:
      start = 19;
      break;
    case 8192:
      start = 18;
      break;
    case 16384:
      start = 17;
      break;
  }

  let binaryAddr = convertNumber(line, 16, 2);
  let cacheIndex = getCacheIndex(binaryAddr, start);

  const set = cacheIndex % numberOfSets; 

  cache.cache2Way[set].map(values => {
    
  });
};

const getCacheIndex = (binaryAddr, start) => {
  let cacheIndexBinary = binaryAddr.slice(start, 27);
  let cacheIndex = convertNumber(cacheIndexBinary, 2);

  return cacheIndex;
};