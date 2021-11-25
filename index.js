var AWS = require("aws-sdk");
var fs = require('fs');
const moment = require('moment');
const program = require("commander");


program
.option("-t, --table [tablename]", "Table Name")
// .option("-f, --FilterExpression [filter expression]", " Filter expression name")
.option("-r, --region [regionname]")
.option("-s, --startDate [Start Date]", "TTL Start Date")
.option("-e, --endDate [End Date]", "TTL End Date")
.option("-p, --profile [profile]", "Use profile from your credentials file")
.option(
    "-ec --envcreds",
    "Load AWS Credentials using AWS Credential Provider Chain"
  )
  .parse();
// .parse(process.argv)

let argOption = program.opts();


if (!argOption.table) {
    console.log("You must specify a table");
    program.outputHelp();
    process.exit(1);
}

if (argOption.region && AWS.config.credentials) {
    AWS.config.update({ region: argOption.region });
    } else {
    AWS.config.loadFromPath(__dirname + "/config.json");
}

if (argOption.profile) {
    let newCreds = new AWS.SharedIniFileCredentials({ profile: argOption.profile });
    newCreds.profile = argOption.profile;
    AWS.config.update({ credentials: newCreds });
}
  
// if (program.envcreds) {
//     let newCreds = AWS.config.credentials;
//     newCreds.profile = program.profile;
//     AWS.config.update({
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//       },
//       region: process.env.AWS_DEFAULT_REGION
//     });
// }

let sDate;
let eDate;
var params = {};

if(argOption.startDate != undefined || argOption.endDate != undefined){
    let startDt = argOption.startDate;
    let endDt = argOption.endDate;


    params.FilterExpression = "armLiftDate between :start_dt and :end_dt";
    params.ExpressionAttributeValues = {
            ':start_dt' : startDt,
            ':end_dt' : endDt,
        }
    // params.Limit =  1000;
    params.ProjectionExpression = "transactionId, siteId, eventId, expirationdate";
}

var docClient = new AWS.DynamoDB.DocumentClient();

params.TableName = argOption.table;

console.log(params);
// docClient.scan(params, onScan);

scanAll = async (params) => {
    let lastEvaluatedKey = 'dummy'; // string must not be empty
    const itemsAll = [];
    while (lastEvaluatedKey) {
      const data = await docClient.scan(params).promise();
      if(data.Items.length > 0){
        data.Items.map( async (element) => {
            console.log("Iterating through DDB Data",element);
            let updateStatus = await updateTTL(element)
            console.log("Update Status",updateStatus);
        })
      }
      lastEvaluatedKey = data.LastEvaluatedKey;
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
    }
    return itemsAll;
  }

  scanAll(params);

  
  updateTTL = element => {
    return new Promise((resolve, rej)=> {
      let updateParams = {
        TableName: argOption.table,
        Key: {
          "transactionId": element.transactionId,
          "siteId": element.siteId,
        },
        UpdateExpression: "set expirationdate = :expDate, eventId = :eventId",
        ExpressionAttributeValues: {
          // ":expDate": Math.round(moment().add(1, 'days').valueOf()/1000),
          ":expDate": Math.round(Number(element.expirationdate)/1000),
          ":eventId": Number(element.eventId)
        }
      };
        docClient.update(updateParams, (err, data) => {
          if (err) {
            console.log("INFO - FAIL TO UPDATE DATA INTO DDB." + err);
            rej(err);
          } else {
            console.log("INFO - SUCCESSFULLY DATA UPDATED INTO DDB." + JSON.stringify(data));
            resolve(data);
          }
        });
    });
  }