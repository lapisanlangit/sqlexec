# sqlexec

Sqlexec is library for running query in MySQL Database with the easy way.

This is to simplifies coding syntax in write SQL command. You can write single query or
transaction queries with minimum code and readable syntax. Connection default is using pooling.

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

If you can add variable node env (dot env file) with 'dev' mode, you can see log sql statement in terminal during development

NODE_ENV = dev

so you can trace your sql staement is right and show error there is any wrong syntax.

# Setup Connection

If you are not using dot env file you can set in your config js file like this :

    const dbsql = require("sqlexec");

    let dbconfig = {
        user: "root",
        password: "pws123",
        database: "dbtest",
    };
    dbsql.connect(dbconfig);

If you are using dot env file :

    const dbsql = require("sqlexec");  
 
    let dbconfig = {};
    dbsql.connect(dbconfig);


# Singe SQL Command

This is sample single sql statement 

     const dbsql = require("sqlexec");
 
     try {
        //select
        let result=dbsql.sqlExec("SELECT name,city FROM customer WHERE name=?", ['David']);
        console.log(result)

     } catch(err){
        console.log(err)
     }
       
     try {
        //insert
        let sql="INSERT INTO customer(name,city) VALUES(?,?)";
        let param=['Andy','Jakarta'];
        dbsql.sqlExec(sql,param);

     } catch(err) {
        console.log(err)
     }
     
    

# Transaction SQL Command First Methode 

This methode you will use session variable to link betweeen many sql statemnt, and retrieve some data that can be used to next query
    
    const dbsql = require("sqlexec");

    try {
        //create session to begin transaction 
        let session = await dbsql.beginTrans();
        
        //statement one to retrieve data
        let sql1 = "SELECT name FROM customer WHERE id=?";
        let sqlResult= await dbsql.execTrans(session, sql1, [59]);
        
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

This methode you are not using session, all sql statement will be set into array and execute all statement. This methode suitable for insert table with large data or delete from many tables 

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



## Methods

- **connect**(< object > configuration).

- **sqlExec**(< string > sql statemtent, < array > value param), return is query result.

- **beginTrans**() begin transaction and the return is session.

- **execTrans**(`session` session from methode beginTrans, < string > sql statemnent, < array > value param), return is query result.

- **commitTrans**() commit transaction and close session.

- **rollbackTrans**() rollback transaction and close session.

- **sqlExec**(< object > {query:< string > sql statement, parameters:< array > value param }).

