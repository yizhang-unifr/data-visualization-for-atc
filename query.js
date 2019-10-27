const model = require("./aircraft_model.js");
const fs = require("fs");

// db.aircraft.find({$and: [{"lat": {$gt: }},{"lat": {$lt: 20}},{"long": {$gt: 20}},{"long": {$lt: 20}}]},{"id":1, "":1})
// Lat-long coorditates for cities in Switzerland are in range: Latitude from 45.83203 to 47.69732 and longitude from 6.07544 to 9.83723.
// {$and: [{"lat":{$gt:45.83203}},{"lat":{$lt:47.69732}},{"long":{$gt:6.07544}},{"long":{$lt:9.83723}}]}


async function findAllInCH(){ // has duplicated
    let res = model.AirCraft.findAll({$and: [{"lat":{$gt:45.83203}},{"lat":{$lt:47.69732}},{"long":{$gt:6.07544}},{"long":{$lt:9.83723}}]},{"id":1,"reg":1,"_id":0});
    console.log(await res);

}

// db.aircraft.distinct("id",{$and: [{"lat":{$gt:45.83203}},{"lat":{$lt:47.69732}},{"long":{$gt:6.07544}},{"long":{$lt:9.83723}}]})
async function getDistinctIdInCH(){ //  no duplicated
    let ids = await model.AirCraft.distinctAll("id",{'$and': [{"lat":{'$gt':45.83203}},{"lat":{'$lt':47.69732}},{"long":{'$gt':6.07544}},{"long":{'$lt':9.83723}}]})
    
    let size = 1440; // from 0000 to 2359
    for (const ti of [...Array(size).keys()]) {
        let time = timeConvert(ti)+"Z";
        let res = []
        for (const id of ids) {
            let _ = await model.AirCraft.findAll({'id':id,'time':time}).then((result,error)=>{
                if (error) {
                    console.log(error)
                }
                if (result) {
                    // console.log(result)
                    res = res.concat(result)
                }
            });
        }
        for (var doc of res) {
            doc = doc.toObject()
        }

        // console.log(res);
        
        // write to file:
        let end_res = {'time':time,'data':res};
        let data = JSON.stringify(end_res);
        let filename = time+'.json'
        let path = './atc-data/';
        filename = path+filename
        fs.writeFileSync(filename,data);
        
    }    
}


let res = getDistinctIdInCH();

async function findByIdAndTime(id,time){
    let res = await model.AirCraft.findAll({'id':id,'time':time}).then((result,error)=>{
        if (error) {
            console.log(error)
        }
        if (result) {
            console.log(result)
            return result;
        }
    });

    
}

function timeConvert(n){
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


