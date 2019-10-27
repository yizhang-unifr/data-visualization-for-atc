const mongoose =  require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/act'

mongoose.connect(mongoDB,{
    /* server: {
      socketOptions: {
        socketTimeoutMS: 0,
        connectionTimeout: 0
      }
    },*/
    useNewUrlParser: true, 
    useUnifiedTopology:true
});

const db= mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;

const AirCraftModelSchema = new Schema({
    id: Number,
    reg: String,
    has_sig : Boolean,
    sig: Number,
    icao: String,
    from: String,
    to: String,
    gnd: Boolean,
    alt: Number,
    lat: Number,
    long: Number,
    first_seen: String,
    time: String
},{
    runSetterOnQuery:true
});

class BaseDao {
    constructor(Model) {
        this.Model = Model;
    }

    create(obj) {
        return new Promise((resolve,reject) =>{
            let entity = new this.Model(obj);
            this.Model.create(entity,(error,result)=>{
                if(error){
                    console.log('create error--> ',error);
                    reject(error)
                } else {
                    console.log('create result--> ',result);
                    resolve(result)
                }
            })
        });
    }

    findAll(condition, constraints) {
        return new Promise((resolve, reject) => {
            this.Model.find(condition, constraints ? constraints : null, (error, result)=>{
                if (error) {
                    // console.log('findAll error--> ',error);
                    reject(error);
                } else {
                    // console.log('findAll result--> ', result);
                    resolve(result);
                }
            });
        });
    }

    distinctAll(field, condition) {
        return new Promise((resolve, reject) => {
            this.Model.distinct(field, condition ? condition : null, (error, result)=>{
                if (error) {
                    console.log('distinctAll error--> ',error);
                    reject(error);
                } else {
                    console.log('distinctAll result--> ', result);
                    resolve(result);
                }
            });
        });
    }


}

var AirCraft = db.model('AirCraft',AirCraftModelSchema,'aircraft');
var AirCraft = new BaseDao(AirCraft)

// var quit = () => mongoose.connection.close();
/*
// test 
var obj = {
    id: 123,
    reg: "register",
    has_sig : true,
    sig: 445566,
    icao: "icao_str",
    from: "SHA",
    to: "ZRH",
    gnd: false,
    alt: 27000,
    lat: 45.333,
    long: 6.4554,
    first_seen: 1234567890,
    time: "2016-23-34T11:22:33"
}

let run = async ()=>{
    await AirCraft.create(obj);
    mongoose.connection.close();
}

run();
*/


module.exports = {
    AirCraft:AirCraft,

    // quit:quit
}




