# instruction to run the program

# run the following command from cmd
# node index.js -t <table name>   - when you want to fetch all record
node index.js -t smarttruck-txn-sit2
# node index.js -t <table name> -s <start time> -e <end time>  - when you want to fect record based on epoch time (give one day ahead of date)
node index.js -t smarttruck-txn-sit2 -s 2020-09-26 -e 2020-09-26   
# -t table name
# -s  - startDate 
# -e  - endTime 
# -r  - region (optinal, default region provided in config.json - us-east-1)
# --profile - aws access credential (optional , it will take default configuration from system aws credential)
# for custom either you can provide using --profile <profile name> which you have configured in your system , or you can configure access key and secret access key in config.json (while configuring in config.json uncomment from line 40 to 50 from index.js)




node index.js -t smarttruck-txn-sit2 -s 2020-07-01 -e 2020-07-05
