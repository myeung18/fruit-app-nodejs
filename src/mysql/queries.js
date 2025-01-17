const mysql = require("mysql2");
const uuid = require("uuid");

const {
    getMYSQLConnectConfig,
} = require("./mysql")

let dbConn;
try {
    dbConn = mysql.createConnection(getMYSQLConnectConfig());
} catch (err) {
    console.log("failed to connect to database.")
}

process.on('uncaughtException', (err, origin) => {
    console.log('Caught exception: ' + err);
});

const createFruit = (req, rep) => {
    (async () => {
        let fruit = {
            id: uuid.v4(),
            name: req.body.name,
            quantity: req.body.quantity,
        }
        console.log('post called', fruit);
        if (!fruit.name) {
            throw new Error("missing fruit name.")
        }
        dbConn.execute(`insert into fruit (id, name, quantity)values (?, ?, ?)`, [fruit.id, fruit.name, fruit.quantity],
            function(err, results ,fields){
                if (err) console.log(err);
                rep.send(fruit);
            });

    })().catch((err) => console.log("err from async: " + err.stack));
}

const listFruits = (req, rep) => {
    console.log("list.");
    dbConn.execute(
        'SELECT * FROM fruit',
        function(err, results, fields) {
            if (err) console.log(err);
            rep.status(200).send(results);
        });
}

const deleteFruit = (req, rep) => {
    (async () => {
        console.log("deleting", req.params.id);
        dbConn.query("delete from fruit where id = ?", [req.params.id],
            function (err, res, fields) {
                if (err) console.log(err);
                rep.status(200).send(res);
            });
    })().catch((err) => console.log("err from async: " + err.stack));
}

const updateFruit = (req, rep) => {
    (async () => {
        console.log("updating", req.params.id, req.body.name, req.body.quantity);
        if (!req.body.name) {
            throw new Error("missing fruit name.")
        }
        dbConn.query("update fruit set name = ?, quantity = ? where id = ?", [req.body.name, req.body.quantity, req.params.id],
            function (err, res, fields) {
                if (err) console.log(err);
                rep.status(200).send(res)
            });
    })().catch((err) => console.log("err from async: " + err.stack));
}

module.exports = {
    createFruit,
    listFruits,
    deleteFruit,
    updateFruit,
};
