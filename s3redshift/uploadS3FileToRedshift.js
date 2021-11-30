//https://stackoverflow.com/questions/18465313/java-sdk-for-copying-to-redshift
//https://github.com/abhilashahyd/nodeaws/blob/main/index.js

var stringify = require('csv-stringify');
var aws = require('aws-sdk');
var Redshift = require('node-redshift');


var client = {
    user: 'awsuser',
    database: 'dev',
    password: 'Awsredshiftpassword1',
    port: '5439',
    host: 'redshift-cluster-1.ctqtd45s8xvi.us-east-1.redshift.amazonaws.com',
};

var redshiftClient = new Redshift(client);

var pg_query = "copy mytest from 's3://athenaddbquerydata/patient.json' " + "ACCESS_KEY_ID 'access key id' SECRET_ACCESS_KEY 'secret access key' FORMAT JSON 'noshred';";

redshiftClient.query(pg_query, { raw: true }, function(err1, data) {
    //query completed, we can close the connection
    // release();
    if (err1) {
        console.log('error here');
        console.error(err1);
    } else {
        //upload successful
        console.log('upload success');
        console.log(data);

    }
});
//  redshiftClient.close(); 
console.log('outside');
