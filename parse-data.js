const assmbler = require('stream-json/Assembler');
const {chain} = require('stream-chain');


const {parser} = require('stream-json');
const fs = require('fs');
const {pick} = require('stream-json/filters/Pick');
const {streamArray} = require('stream-json/streamers/StreamArray');

const pipeline = chain([
    fs.createReadStream('/Users/justin/Downloads/2016-07-01/2016-07-01-0000Z.json'),
    parser(),
    pick({filter: 'acList'}),
    streamArray(),
]);

//const asm = assmbler.connectTo(pipeline);
//asm.on('done',asm=>console.log(asm.current));

pipeline.on('data', data => console.log(data));

const Redis = require('ioredis');
