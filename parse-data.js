const {chain} = require('stream-chain');
const model = require("./aircraft_model.js");


const {parser} = require('stream-json');
const fs = require('fs');
const {pick} = require('stream-json/filters/Pick');
const {streamArray} = require('stream-json/streamers/StreamArray');
let filepath ='/Users/justin/Downloads/2016-07-01/';
let fileprefix = '2016-07-01-';
let filesuffix = 'Z.json';

const timeConvert = (n)=>{
    let hours = (n/60);
    let rhours = Math.floor(hours);
    let minutes = n%60;
    if (hours<10){
        if(minutes<10){
            return "0"+rhours.toString()+"0"+minutes.toString();
        } else {
            return "0"+rhours.toString()+minutes.toString(); 
        }
    } else {
        if(minutes<10){
            return rhours.toString()+"0"+minutes.toString();
        } else {
            return rhours.toString()+minutes.toString(); 
        } 
    }
} 

let I_SIZE = 1440;
let generateIArray = (size) => {
    let array = Array(size);
    for (let i=0;i<size;i++){
        array[i] = timeConvert(i);
    }
    return array
}

let i_array = generateIArray(I_SIZE);

let sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

let run = async ()=>{
    for (i of i_array){
        console.log(i);
        let filename = filepath+fileprefix+i+filesuffix;
        let timedata = i+'Z';
        await sleep(5000).then(() => {
        let pipeline = chain([
            fs.createReadStream(filename),
            parser(),
            pick({filter: 'acList'}),
            streamArray(),
        ]);
    
        pipeline.on('data', data => {
                //console.log("******")
            data = data.value
            // console.log(data)
            //console.log("------")
            let fs = regExp.exec(data['FSeen']);
            let obj = {
            id: data['Id'] ? data['Id'] : -1,
            reg: data['Reg'] ? data['Reg'] : null,
            has_sig : data['HasSig'] ? data['HasSig'] : false,
            sig: data['Sig'] ? data['Sig'] : -1,
            icao: data['Icao'] ? data['Icao'] : null,
            from: data['From'] ? data['From'] : null,
            to: data['To'] ? data['To']: null,
            gnd: data['Gnd'] ? data['Gnd'] : false,
            alt: data['Alt'] ? data['Alt'] : -1,
            lat: data['Lat'] ? data['Lat'] : -1,
            long: data['Long'] ? data['Long'] : -1,
            first_seen: fs ? fs[1] : null,
            time: timedata
            }
            model.AirCraft.create(obj);
            });
        });
    }
}

// db.aircraft.find({$and: [{"lat": {$gt: }},{"lat": {$lt: 20}},{"long": {$gt: 20}},{"long": {$lt: 20}}]},{"id":1, "":1})


//const asm = assmbler.connectTo(pipeline);
//asm.on('done',asm=>console.log(asm.current));

var regExp = /\(([^)]+)\)/;






const Redis = require('ioredis');

run();

// Lat-long coorditates for cities in Switzerland are in range: Latitude from 45.83203 to 47.69732 and longitude from 6.07544 to 9.83723.
// {$and: [{"lat":{$gt:45.83203}},{"lat":{$lt:47.69732}},{"long":{$gt:6.07544}},{"long":{$lt:9.83723}}]}