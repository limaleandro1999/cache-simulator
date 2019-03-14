const fs = require('fs');
const readline = require('readline');

const cacheSize = 16; // cache size * 2 ^ cache unit
const cacheLineSize = 16; // tamanho da linha (bloco) em bytes
const cacheSetLines = 4; // cacheSetLines - way
const memoryAddressSize = 32;
const cacheReplacePolicy = 1; // 0 fifo 1 lru
const cacheSizeUnit = 10; // 10 -> KB 20 -> MB  ...

console.log(`Cache Size ${cacheSize} KB, Cache Block Size ${cacheLineSize}, ${cacheSetLines} - way`);

const numberCacheLines = (cacheSize * Math.pow(2, cacheSizeUnit)) / cacheLineSize;
const cacheSetSize = cacheLineSize * cacheSetLines;

const offsetBits = Math.log2(cacheLineSize); // quantidade de bits offset
const indexBits = Math.log2(((cacheSize *  Math.pow(2, cacheSizeUnit)) / cacheSetSize)); // quantidade de bits index
const tagBits = memoryAddressSize - offsetBits - indexBits; // quantidade de bits tag

console.log(`Cache format, tag bits ${tagBits}, index bits ${indexBits}, offset bits ${offsetBits}`)

let cacheHit = 0; // quantidade de cache hit
let cacheMiss = 0; // quantidade de cache miss
let memReq = 0; // // quantidade de requisições

const cache = []; // vetor cache

for(let i = 0; i < numberCacheLines; i++){
  cache.push({ valid: 0, tag: 0, timeStamp: 0, numberAccess: 0 }); // adiciona o json com as informações para cada linha da cache
}

const rd = readline.createInterface({     //Lê arquivo trace
  input: fs.createReadStream('./trace'),  
  console: false
});

rd.on('line', function(line) {  // ouve o evento de cada linha lida, e obtem ela
  let fifo = -1; // index do candidato a ser substituído na política FIFO
  let lru = -1; // index do candidato a ser substituído na política LRU

  memReq++; // incrementa o contador de requisições
  
  cache.map(item => { 
    item.timeStamp++; // incrementa o timestamp de todos os items na cache
  })

  const address = convertNumber(line, 16); // converte o endereço de hexadecimal para decimal

  let offset = address & ((Math.pow(2, offsetBits) -1)); // obtem os bits de offset
  let index = (address >> offsetBits) & (Math.pow(2, indexBits) -1); // obtem os bits de index
  let tag = (address >> (offsetBits + indexBits)) & (Math.pow(2, tagBits) -1); // obtem os bits de tag

  let higherNumber = -1; // guarda o maior timestamp para fazer verificações para política FIFO
  let lowerNumber = Math.pow(2, 32) - 1; // guarda o menor número de acessos para fazer verificações para política LRU
  let miss = true; // variável para verificar se houve um cache miss
  let startIndex = (index * cacheSetLines); // guarda o index do começo do conjunto
  let finalIndex = (startIndex + cacheSetLines); // guarda o index do final do conjunto

  for(let i = startIndex; i < finalIndex; i++){ // verifica todos os items do conjunto, buscando achar uma tag igual
    if(cacheReplacePolicy === 0){               // e também busca o candidato a ser substituído
      if(cache[i].timeStamp > higherNumber){
        higherNumber = cache[i].timeStamp; // busca candidato FIFO
        fifo = i;
      }    
    }else{
      if(cache[i].numberAccess < lowerNumber){ // busca candidato LRU
        lowerNumber = cache[i].numberAccess;
        lru = i;
      }
    }

    if(cache[i].tag === tag){ // verifica se a tag é igual 
      cache[i].numberAccess++;
      cacheHit++;
      miss = false;
      break;
    }
  }

  if(miss){
    cacheMiss++;
    let replaced = false;

    for(let i = startIndex; i < finalIndex; i++){
      if(cache[i].valid === 0){
        cache[i].valid = 1;
        cache[i].tag = tag;
        cache[i].timeStamp = 0;
        cache[i].numberAccess = 0;
        replaced = true;
        break;
      }
    } 

    if(!replaced){
      if(cacheReplacePolicy === 0){
        cache[fifo].tag = tag;
        cache[fifo].valid = 1;
        cache[fifo].timeStamp = 0;
        cache[fifo].numberAccess = 0;
      }else{
        cache[lru].tag= tag;
        cache[lru].valid = 1;
        cache[lru].timeStamp = 0;
        cache[lru].numberAccess = 0;
      }
    }
  }
});

rd.on('close', () => {
  console.log(cache);
  console.log(`Cache hit ${cacheHit}`);
  console.log(`hit rate ${(cacheHit/memReq)}`);
  console.log(`Cache miss ${cacheMiss}`);
  console.log(`miss rate ${(cacheMiss/memReq)}`);
});

const convertNumber = (n, fromBase, toBase = 10) => {
  return parseInt(n.toString(), fromBase).toString(toBase);
};