# sqlexec

Sqlexec is library for running query MySQL Database with nodejs in the easy way.

The library will simplifies your coding syntax when write SQL command. You can write single query or transaction queries with a few code and readable syntax. Connection default is using pooling.

# Install

`npm install sqlexec `

# Dependencies

- [mysql package](https://www.npmjs.com/package/mysql)

# Setup Environment Variable

You can use enviroment variable (dot env file) to set database configuration with following parameters :

1. MYSQL_HOST : host database (default : 127.0.0.1)
2. MYSQL_USER : user database (default : root)
3. MYSQL_PASSWORD : password database (default : empty)
4. MYSQL_PORT: port database (default : 3306)
5. MYSQL_DATABASE : database name (default : test)
6. MYSQL_CONNECTIONLIMIT : connection limit for pooling (default : 10)
7. MYSQL_TIMEZONE : time zone (default : 'Asia/Jakarta')

If you add variable node env (dot env file) with 'dev' mode, you can see log sql statement in terminal during development

NODE_ENV = dev

so you can trace your sql staement is right or show error if there is any wrong syntax.

# Setup Connection

If you are not using dot env file you can set in your config.js file and call it in index.js/app.js :

    const dbsql = require("sqlexec");

    let dbconfig = {
        user: "root",
        password: "psw123",
        database: "dbtest",
        connectionLimit : 10,
        host: "localhost",
        port:  "3306",
        timezone:'Asia/Jakarta'
    };
    //create connection
    let con=dbsql.connect(dbconfig);
    //you can check connection object if needed
    console.log(con)

If you are using dot env file :

    const dbsql = require("sqlexec");

    //empty object
    let dbconfig = {};
    //create connection
    let con=dbsql.connect(dbconfig);
    //you can check connection object if needed
    console.log(con)

# Singe SQL Command

This is sample single sql statement

    const dbsql = require("sqlexec");

    let dbconfig = {
        user: "root",
        password: "psw123",
        database: "dbtest",
        connectionLimit : 10,
        host: "localhost",
        port:  "3306",
        timezone:'Asia/Jakarta'
    };
    //create connection
    dbsql.connect(dbconfig);


    try {
        //select
        let result=await dbsql.sqlExec("SELECT name,city FROM customer WHERE name=?", ['David']);
        console.log(result)

     } catch(err){
        console.log(err)
     }

     try {
        //insert
        let sql="INSERT INTO customer(name,city) VALUES(?,?)";
        let param=['Andy','Jakarta'];
        await dbsql.sqlExec(sql,param);

     } catch(err) {
        console.log(err)
     }

# Transaction SQL Command First Methode

This methode you will use session variable to link all sql statement, also you can retrieve some data that can be used to next query

    const dbsql = require("sqlexec");

    try {
        //create session to begin transaction
        let session = await dbsql.beginTrans();

        //statement one to retrieve data
        let sql1 = "SELECT name FROM customer WHERE id=?";
        let sqlResult= await dbsql.execTrans(session, sql1, [59]);
        console.log(sqlResult)

        //statement two, data retrieve will be inserted into other other table
        let sql2 = "INSERT INTO purchase(namecustomer) VALUES(?)";
        await dbsql.execTrans(session, sql2, [sqlResult[0].name]);

        //commit transaction
        await dbsql.commitTrans(session);
    } catch(err){
        console.log(err)
    }

if you will rollback transaction you can use

     await dbsql.rollbackTrans(session);

# Transaction SQL Command Second Methode

This methode you are not using session, all sql statement will be set into array and execute all statement. This methode suitable for insert table with large data or delete data from many tables. For your information you cannot get return result using this methode.

    const dbsql = require("sqlexec");

    //insert table with many records
    try{
        let sqls = [];

        sqls.push({query: "INSERT INTO customer(name,address) VALUES(?,?)",parameters:['Andy','New York']})
        sqls.push({query: "INSERT INTO customer(name,address) VALUES(?,?)",parameters:['Andrew','California']});

        await dbsql.sqlExecTrans(sqls);

    } catch(err){
        console.log(err)
    }

You can stick with methode one for using insert large data set and not using methode two, this is up to you.

## Methods

- **connect**(< object > configuration, return is connection object).

- **sqlExec**(< string > sql statemtent, < array > value param), return is query result.

- **beginTrans**() begin transaction and the return is session.

- **execTrans**(`session` session from methode beginTrans, < string > sql statemnent, < array > value param), return is query result.

- **commitTrans**() commit transaction and close session.

- **rollbackTrans**() rollback transaction and close session.

- **sqlExecTrans**(< object > {query:< string > sql statement, parameters:< array > value param }).
