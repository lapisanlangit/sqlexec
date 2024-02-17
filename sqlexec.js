const mysql = require("mysql");
const env = process.env.NODE_ENV || "dev";
const tz = process.env.MYSQL_TIMEZONE || "Asia/Jakarta";
const port = parseInt(process.env.MYSQL_PORT, 10) || 3306;
let pool;

//create connection
exports.connect = function(dbconfig) {
  const connectionString = {
    connectionLimit : dbconfig.connectionLimit || process.env.MYSQL_CONNECTIONLIMIT || 10,
    host: dbconfig.host || process.env.MYSQL_HOST || "localhost",
    user: dbconfig.user || process.env.MYSQL_USER || "root",
    password: dbconfig.password || process.env.MYSQL_PASSWORD || "",
    port: dbconfig.port || port || "3306",
    database: dbconfig.database || process.env.MYSQL_DATABASE || "test",
    timezone: dbconfig.timezone || tz,
  };

  pool = mysql.createPool(connectionString);
};
// single query
exports.sqlExec = function(sql, parameters) {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject({
          message: error.sqlMessage || error.code,
        });
        return;
      }
      var querySQL = mysql.format(sql, parameters);
      if (env == "dev" || env == "development" || env == "devel") {
        console.log("\x1b[36m", querySQL);
      }

      // exec query SQL
      connection.query(querySQL, (error, results, fields) => {
        connection.release();
        if (error) {
          reject({
            message: error.sqlMessage || error.code,
          }); //https://github.com/mysqljs/mysql#error-handling
          return;
        }
        resolve(results);
      });
    });
  });
};

//transaction
exports.beginTrans = function() {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      connection.beginTransaction(function(err) {
        if (err) {
          reject({
            message: err.sqlMessage || err.code,
          });
          return;
        }

        resolve(connection);
        if (env == "dev" || env == "development" || env == "devel") {
          console.log("\x1b[36m", "BEGIN");
        }
      });
    });
  });
};

exports.execTrans = function(connection, sql, parameters) {
  return new Promise((resolve, reject) => {
    var querySQL = mysql.format(sql, parameters);
    var query = connection.query(querySQL, function(error, result) {
      if (error) {
        reject({
          message: error.sqlMessage || error.code,
        });
        return;
      }
      if (env == "dev" || env == "development" || env == "devel") {
        //        sqlLogConsole(querySQL);
        console.log("\x1b[36m", querySQL);
      }

      resolve(result);
    });
  });
};

exports.commitTrans = function(connection) {
  return new Promise((resolve, reject) => {
    connection.commit(function(err) {
      if (err) {
        reject({
          message: error.sqlMessage || error.code,
        });
        return;
      }

      if (env == "dev" || env == "development" || env == "devel") {
        console.log("\x1b[36m", "COMMIT");
      }

      resolve();
    });
  });
};

exports.rollbackTrans = function(connection) {
  return new Promise((resolve, reject) => {
    connection.rollback(function(err) {
      if (err) {
        reject({
          message: error.sqlMessage || error.code,
        });
        return;
      }

      if (env == "dev" || env == "development" || env == "devel") {
        console.log("\x1b[36m", "ROLLBACK");
      }

      resolve();
    });
  });
};

// multi SQL with transaction
exports.sqlExecTrans = function(queries) {
  var paramCount = queries.length - 1;
  return new Promise((resolve, reject) => {
    var ressql = [];
    pool.getConnection((error, connection) => {
      connection.beginTransaction((err) => {
        function running(count) {
          if (count <= paramCount && count > -1) {
            var query = queries[count];
            var querySQL = mysql.format(query.query, query.parameters);
            var queryId = count;
            prosesSQL(
              connection,
              querySQL,
              resolve,
              reject,
              ressql,
              queryId,
              () => {
                running(count + 1);
              },
            );
          } else {
            completeSQL(connection);
            resolve(ressql);
          }
        }
        running(0);
      });
    });
  });
};

// fungsi proses sql, callback
function prosesSQL(
  connection,
  sql,
  resolve,
  reject,
  ressql,
  queryId,
  callback,
) {
  var query = connection.query(sql, (err, results, fields) => {
    if (env == "dev" || env == "development" || env == "devel") {
      console.log("\x1b[36m", query.sql);

      //      sqlLogConsole(query.sql);
    }

    if (err) {
      connection.rollback();
      connection.release();
      if (env == "dev" || env == "development" || env == "devel") {
        console.log("rollback");
      }
      reject({
        message: err.sqlMessage || error.code,
      });
      return;
    }
    ressql[queryId] = {
      queryid: queryId,
      results: results,
      fields: fields,
    };
    callback();
  });
}

// commit
function completeSQL(connection) {
  if (env == "dev" || env == "development" || env == "devel") {
    console.log("\x1b[36m", "COMMIT");
  }
  connection.commit();
  connection.release();
}
