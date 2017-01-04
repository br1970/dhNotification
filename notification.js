'use strict';

console.log('Loading function');



exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'POST':


           // test if connected to the DB
           if(_dbConnected==true)
           { // connected to the DB
             var jsonRecord;                // the json record to be added to the collection
        
             // get the mandatory requied clientId parm
             var clientId    = event.pathParameters.clientid;
             clientId=parseInt(clientId);
             // get the optional agentId parm
             var agentId = event.pathParameters.agentid;
             agentId=parseInt(agentId);
             if(!agentId)
             { // missing optional agentId parm
               // if no agentId we will set it to -1 to indicate no assigned agent yet.
               agentId=-1;
             }
        
             if(clientId && agentId)
             { // we have the required parms
               // create a unique pkId (primaryKeyId ) for the notification record
               helper.genNotificationId(
               function(err,pkId)
               { // we should now have the generated unique pkId for the Notification Record
                 if(!err)
                 { // notificationId generated successfully
                   // add the record/row to the Notification collection
                   jsonRecord = { notificationId:pkId, agentId:agentId, clientId:clientId};
                   _crefNotification.insertOne( jsonRecord, {w:1, j:true},
                   function(err,result)
                   { 
                     if(!err)
                     {
                       retjson.success  = "Agent has been notified, client should get a response shortly.";
                     }
                     else
                     {
                       statusCode    = 500;
                       retjson.RC    = _rcError;
                       retjson.error = "ERROR: failed to add record to Notification collection! err: " + err;
                     }
        
                     // send the http response message
                     res.status(statusCode).json(retjson);
                     res.end;
                   });
                 }
                 else
                 { // error generating the unique pkID!
                   statusCode    = 500;
                   retjson.RC    = _rcError;
                   retjson.error = "ERROR: failed to generate pkID! err: " + err;
        
                   // send the http response message
                   res.status(statusCode).json(retjson);
                   res.end;
                 }
               });
             }
             else
             { // required parms missing
               retjson = {};
               retjson.RC = _rcError;
               retjson.error = "Missing or bad parms, valid syntax: .../notify?agentId=1001&clientId=1001";
            
               // set http status code
               statusCode = 400;
        
               // send the http response message
               helper.httpJsonResponse(res,statusCode,retjson);
             }
           }
           else
           { // not connected to the DB
             retjson = {};
             retjson.RC = _rcError;
             retjson.error = "ERROR: we are not connected to the DB!";
             statusCode = 500;  // internal error while connecting to the DB
        
             // send the http response message
             helper.httpJsonResponse(res,statusCode,retjson);
           }

            done(null, "Agent " + event.pathParameters.agentid +
                    " Client " + event.pathParameters.clientid);


            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
