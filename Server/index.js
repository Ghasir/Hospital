const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "hospital",
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/get/users", (req, res) => {
  const sqlInsert = "SELECT username,name FROM user";
  db.query(sqlInsert, (err, result) => {
    res.send(result);
  });
});

app.get("/api/get/users/byname", (req, res) => {
  const { name } = req.query;
  const sqlInsert = `SELECT username,name from user where name like '%${name}%'`;
  db.query(sqlInsert, (err, result) => {
    res.send(result);
  });
});
app.post("/api/post/users/create", (req, res) => {
  const { name, username, password } = req.body;
  const query = "INSERT INTO user VALUES(?,?,?)";
  db.query(query, [username, password, name], (error, result) => {
    if (error) {
      res.send({ success: false });
    } else {
      res.send({ success: true });
    }
  });
});

app.post("/api/post/users/prescription/add", (req, res) => {
  const { username, medication, Amount, prescribedBy, collected } = req.body;
  const query = "INSERT INTO prescription VALUES(?,?,?,?,?)";
  db.query(
    query,
    [username, medication, Amount, prescribedBy, collected],
    (error, result) => {
      if (error) {
        res.send({ success: false });
      } else {
        res.send({ success: true });
      }
    }
  );
});

app.post("/api/post/users/prescription/change", (req, res) => {
  const { username, medication } = req.body;
  const query =
    "Update prescription set collected=1 where username=? and medication=?";
  db.query(query, [username, medication], (error, result) => {
    if (error) {
      res.send({ success: false });
    } else {
      res.send({ success: true });
    }
  });
});

app.post("/api/post/users/history/add", (req, res) => {
  const { username, problem } = req.body;
  const query = "INSERT INTO history VALUES(?,?)";
  db.query(query, [username, problem], (error, result) => {
    if (error) {
      res.send({ success: false });
    } else {
      res.send({ success: true });
    }
  });
});

app.get("/api/get/users/userDetails", (req, res) => {
  const { username } = req.query;

  const query1 = `SELECT username,name from user where username ="${username}"`;
  const query2 = `SELECT problem from history where username="${username}"`;
  const query3 =
    "SELECT medication,Amount,`prescribed-by`,collected from prescription where username=? order by collected";
  let data = [];
  db.query(query1, (err, result) => {
    data.push(result);
    db.query(query2, (err2, result2) => {
      data.push(result2);
      db.query(query3, [username], (err3, result3) => {
        data.push(result3);
        res.send(data);
      });
    });
  });
});

app.get("/api/get/ValidateUser", (req, res) => {
  const { username, password } = req.query;
  const query = "SELECT * from user where username=? AND password=?";
  db.query(query, [username, password], (error, result) => {
    if (!result) {
      console.log(error);
    } else {
      if (result.length > 0) {
        res.send({ result: true });
      } else {
        res.send({ result: false });
      }
    }
  });
});

app.get("/api/get/ValidateDoctor", (req, res) => {
  const { username, password } = req.query;
  const query = "SELECT * from doctor where username=? AND password=?";
  db.query(query, [username, password], (error, result) => {
    if (!result) {
      console.log(error);
    } else {
      if (result.length > 0) {
        res.send({ result: true });
      } else {
        res.send({ result: false });
      }
    }
  });
});
app.get("/api/get/ValidatePharmacy", (req, res) => {
  const { username, password } = req.query;
  const query = "SELECT * from pharmacy where username=? AND password=?";
  db.query(query, [username, password], (error, result) => {
    if (!result) {
      console.log(error);
    } else {
      if (result.length > 0) {
        res.send({ result: true });
      } else {
        res.send({ result: false });
      }
    }
  });
});

app.get("/api/get/users/user", (req, res) => {
  const { username, password } = req.query;
  const query = "SELECT * from user where username=? AND password=?";
  db.query(query, [username, password], (error, result) => {
    if (!result) {
      console.log(error);
    } else {
      if (result.length > 0) {
        res.send({ result, loginType: "user" });
      } else {
        const query2 = "SELECT * from doctor where username=? AND password=?";
        db.query(query2, [username, password], (error1, result1) => {
          if (!result1) {
            console.log(error1);
          } else {
            if (result1.length > 0) {
              res.send({ result1, loginType: "doctor" });
            } else {
              const query3 =
                "SELECT * from pharmacy where username=? AND password=?";
              db.query(query3, [username, password], (error2, result2) => {
                if (!result2) {
                  console.log(error2);
                } else {
                  if (result2.length > 0) {
                    res.send({ result2, loginType: "pharmacy" });
                  } else {
                    res.send({ result2, loginType: "Error" });
                  }
                }
              });
            }
          }
        });
      }
    }
  });
});

app.listen(5000, () => {
  console.log("Server Is Running On Port 5000");
});
