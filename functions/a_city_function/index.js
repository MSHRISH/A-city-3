'use strict';
var express = require('express');
var app = express();
var catalyst = require('zcatalyst-sdk-node');
app.use(express.json());
const tableName = 'AlienCity'; // The table created in the Data Store
const columnName = 'CityName'; // The column created in the table
const counter='Counter';//coulmn for counter


// The POST API that reports the alien encounter for a particular city
app.post('/alien', (req, res) => {
 var cityJson = req.body;
console.log(cityJson);
 // Initializing Catalyst SDK
 var catalystApp = catalyst.initialize(req);
 // Queries the Catalyst Data Store table and checks whether a row is present for the given city
 getDataFromCatalystDataStore(catalystApp, cityJson.city_name).then(cityDetails => {
  if (cityDetails.length == 0) { // If the row is not present, then a new row is inserted
   console.log("Alien alert!"); //Written to the logs. You can view this log from Logs under the Monitor section in the console 
   var rowData={}
   rowData[columnName]=cityJson.city_name;
   var i=1;
   rowData[counter]=i;

  var rowArr=[];
  rowArr.push(rowData);
   // Inserts the city name as a row in the Catalyst Data Store table
   catalystApp.datastore().table(tableName).insertRows(rowArr).then(cityInsertResp => {
    res.send({
     "message": "Thanks for reporting!!,Your the first to report.Consider Adding your Mail to our Alert List"
     
    });

    fetchmails(catalystApp).then(mails=>{
        mails.forEach(element => {
            var mail=element.Mails.userMail;
            var content="There is a Alien Activity in "+cityJson.city_name+" Stay  Clear of that Area";
            let config={
                from_email:"200701060@rajalakshmi.edu.in",
                to_email:mail,
                html_mode:true,
                subject:"Alien Report",
                content:content
            }
            let email=catalystApp.email();
            
            email.sendMail(config).then(mail_obj=>{
                console.log("Sent!");
            });

        });
    });





   }).catch(err => {
    console.log(err);
    sendErrorResponse(res);
   })
  } else { // If the row is present, then a message is sent indicating duplication
    

    getDataFromCatalystDataStore(catalystApp,cityJson.city_name).then(counterDetails=>
        {   
            counterDetails.forEach(element => { 
                var c=element.AlienCity.Counter
                c=parseInt(c)+1
                //console.log(element.AlienCity.Counter);
                updateCounter(catalystApp,cityJson.city_name,c).then(U_details=>{
                    console.log("Updated!");
                    console.log(U_details);
                })
                var message="Looks like you are not the first person to encounter aliens in this city! Someone has already reported an alien encounter here!.Consider Adding your Mail to our Alert List. No.of Reports here is:"+c;
                res.send({
                    "message": message
                    
                   });


            });
            //console.log(counterDetails);
        });





   
  }
 }).catch(err => {
  console.log(err);
  sendErrorResponse(res);
 })
});



// The GET API that checks the table for an alien encounter in that city 
app.get('/alien', (req, res) => {
 var city = req.query.city_name;

 // Initializing Catalyst SDK
 var catalystApp = catalyst.initialize(req);

 // Queries the Catalyst Data Store table and checks whether a row is present for the given city
 getDataFromCatalystDataStore(catalystApp, city).then(cityDetails => {
  if (cityDetails.length == 0) {
   res.send({
    "message": "Hurray! No alien encounters in this city yet!",
    "signal": "negative"
   });
  } else {
    cityDetails.forEach(element => {
        var c=element.AlienCity.Counter;
        console.log("Counter");
        console.log(c)
        res.send({
            "message": "Uh oh! Looks like there are aliens in this city!!! No.of Reporting is:"+c,
            "signal": "positive"
           });
        
    });
   
  }
 }).catch(err => {
  console.log(err);
  sendErrorResponse(res);
 })
});



// shows all the infected cities
app.get('/allcity',(req,res)=>{
    var catalystApp = catalyst.initialize(req);
    showAllCity(catalystApp).then(cityDetails=>{
        console.log(cityDetails);
        var all_city=[]
        cityDetails.forEach(element => {
            var city_n=element.AlienCity.CityName;
            var city_count=element.AlienCity.Counter;
            var city_d={"cityname":city_n,"counter":city_count};
            console.log(element.AlienCity.Counter);
            all_city.push(city_d);
        });
        console.log("all city details")
        console.log(all_city);
        res.send({citydetails:all_city});
    });
    

});

//removes the city name
app.post("/remove",(req,res)=>{
    var city_name=req.body.city_name
    var catalystApp = catalyst.initialize(req);
    console.log(city_name);

    removeCity(catalystApp,city_name).then(result=>{
        //console.log("Remove");
        console.log(result);
        result.forEach(element => {
            var r=element.AlienCity.DELETED_ROWS_COUNT;
            if(r==0){
                res.send({"status":"City Not Found"});

                fetchmails(catalystApp).then(mails=>{
                    mails.forEach(element => {
                        var mail=element.Mails.userMail;
                        var content="The Alien Activity of the City is Eliminated from the city "+city_name;
                        let config={
                            from_email:"200701060@rajalakshmi.edu.in",
                            to_email:mail,
                            html_mode:true,
                            subject:"Alien Report",
                            content:content
                        }
                        let email=catalystApp.email();
                        
                        email.sendMail(config).then(mail_obj=>{
                            console.log("Sent!");
                        });
            
                    });
                });
                



            }
            else{
                res.send({"status":"City Removed Successfully!"});
            }
            
        });
    });

    
});

//Add mail to the db
app.post("/mail_add",(req,res)=>{
    
    var mail_id=req.body.mail_id; 
    var catalystApp = catalyst.initialize(req);
    console.log(mail_id);
    var rowArr=[{"userMail":mail_id}];
    //rowArr.push(mail_row);
    catalystApp.datastore().table("Mails").insertRows(rowArr).then(result=>
        {   
            
            showAllCity(catalystApp).then(cityDetails=>{
                var all_city=[]
                cityDetails.forEach(element => {
                    var city_n=element.AlienCity.CityName;
                    var city_count=element.AlienCity.Counter;
                    var city_d={"cityname":city_n,"counter":city_count};
                
                    all_city.push(city_d);
        });
            var content="<table><tr><th>City</th><th>Reportings</th></tr>"    
            all_city.forEach(ele=>{
                    var city_n=ele.cityname;
                    var city_c=ele.counter;
                    content=content+"<tr><td>"+city_n+"</td><td>"+city_c+"</td></tr>"
            });
            content=content+"</table>";
            
            let config={
                from_email:"200701060@rajalakshmi.edu.in",
                to_email:mail_id,
                html_mode:true,
                subject:"Alien Report",
                content:content
            }
            let email=catalystApp.email();
            
            email.sendMail(config).then(mail_obj=>{
                console.log("Sent!");
            });
            res.send({"status":"Mail Added and a Report is sent"});

            });
            
            
            

        });

    
});













//function to remove a city
function removeCity(catalystApp,city_name){
    return new Promise((resolve, reject) => {
        // Queries the Catalyst Data Store table
        var q="DELETE FROM AlienCity WHERE CityName='"+city_name+"';";
        catalystApp.zcql().executeZCQLQuery(q).then(queryResponse => {
         resolve(queryResponse);
        }).catch(err => {
         reject(err);
        })
       });

}













/**
 * Checks whether an alien encounter is already reported for the given city by querying the Data Store table
 * @param {*} catalystApp 
 * @param {*} cityName 
 */
function getDataFromCatalystDataStore(catalystApp, cityName) {
 return new Promise((resolve, reject) => {
  // Queries the Catalyst Data Store table
  catalystApp.zcql().executeZCQLQuery("Select * from "+tableName+" where "+columnName+"='" + cityName + "'").then(queryResponse => {
   resolve(queryResponse);
  }).catch(err => {
   reject(err);
  })
 });

}

//Function to update the counter of a city
function updateCounter(catalystApp,cityName,counter){
    
    return new Promise((resolve, reject) => {
        // Queries the Catalyst Data Store table
        var q="update AlienCity set Counter="+counter+" where CityName='"+cityName+"'"
        //var query="Select * from "+tableName+" where "+columnName+"='" + cityName + "'"
        catalystApp.zcql().executeZCQLQuery(q).then(queryResponse => {

            
         
        }).catch(err => {
         reject(err);
        })
       });   
}


function showAllCity(catalystApp){
    return new Promise((resolve, reject) => {
        // Queries the Catalyst Data Store table
        catalystApp.zcql().executeZCQLQuery("Select * from "+tableName).then(queryResponse => {
         resolve(queryResponse);
        }).catch(err => {
         reject(err);
        })
       });
    
}

function fetchmails(catalystApp){
    return new Promise((resolve, reject) => {
        // Queries the Catalyst Data Store table
        catalystApp.zcql().executeZCQLQuery("Select * from Mails").then(queryResponse => {
         resolve(queryResponse);
        }).catch(err => {
         reject(err);
        })
       });
    
}

/**
 * Sends an error response
 * @param {*} res 
 */
function sendErrorResponse(res) {
 res.status(500);
 res.send({
  "error": "Internal server error occurred. Please try again in some time."
 });
}
module.exports = app;