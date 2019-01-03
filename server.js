var config = require("./config");
var docdbClient = require("documentdb").DocumentClient;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

console.log(config.primaryKey);
var client = new docdbClient(config.url, {"masterKey": config.primaryKey});

var databaseUrl = `dbs/${config.database.id}`;

var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;
var HttpStatusCodes = { NOTFOUND: 404};

console.log("collectionUrl " + collectionUrl);

function createDatabaseIfNotExists () {
    console.log("databaseUrl " + databaseUrl);


    client.readDatabase(databaseUrl, (err, result)=>{
        if(err) {
            console.log(JSON.stringify(err));
            if (err.code == HttpStatusCodes.NOTFOUND) {
                client.createDatabase(config.database, (err, created) => {
                    if (err) {
                        console.log(JSON.stringify(err));
                    } else {
                        console.log("Database Created " + JSON.stringify(created));
                    }
                });
            }
        } else {
            console.log("Database Created " + JSON.stringify(result));
        }
    })
};

function createCollectionIfNotExists() {
    console.log(`Getting collection: ${config.collection.id}`);

    client.readCollection(collectionUrl, (err, result) => {
        if (err) {
            if (err.code == HttpStatusCodes.NOTFOUND) {
                client.createCollection(databaseUrl, config.collection, { offerThroughput: 1000 } , (e, c) => {
                    if (e) {
                        console.log(`Error: ${JSON.stringify(e)}`);
                    } else {
                        console.log(`Created: ${JSON.stringify(c)}`);
                    }
                })
            }else {
                console.log(`Result: ${JSON.stringify(result)}`);
            }
        }
    })
}

//createDatabaseIfNotExists();
//createCollectionIfNotExists();


(function createDocumentsIfNotExists(documents) {
    for (let i=0; i < documents.length; i++) {
        let documentUrl = `${collectionUrl}/docs/${documents[i].id}`;

        console.log(`DocumentUrl: ${documentUrl}\n`);
        //console.log(`Document: ${JSON.stringify(documents[i])}\n`);

        client.readDocument(documentUrl, null, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, documents[i], (err,created) => {
                        if (err) {
                            console.log(`Error on creation is ${JSON.stringify(err)}\n`);
                        } else {
                            console.log(`Document created: ${JSON.stringify(created)}\n`);
                        }
                    })
                } else {
                    console.log(`Error except NOTFOUND is ${JSON.stringify(err)}\n`);
                }
            } else {
                console.log(`Result is ${JSON.stringify(result)}\n`);            
            }
            });
    }
}(config.documents));

(function query() {
    client.queryDocuments(collectionUrl, "Select * from root r").toArray((err, results) => {
        if (err) {
            console.log("collectionUrl " + JSON.stringify(err));
        } else {
            for (let result of results) {
                console.log("Value " + JSON.stringify(result) + "\n");
            }
        }
    })
})();

(function replace(doc) {
    let documentUrl = `${collectionUrl}/docs/${doc.id}`;
    console.log(documentUrl);
    console.log(JSON.stringify(doc));

    doc.name = "Chander Dhall";
    client.replaceDocument(documentUrl, doc, (err, rersult) => {
        if (err) {
            console.log(JSON.stringify(err));
        } else {
            console.log(JSON.stringify(doc));
        }
    })
})(config.documents[0]);

(function deleteDocument(id)
 {
    let documentUrl = `${collectionUrl}/docs/${id}`;

    client.deleteDocument(documentUrl, (err, result) => {
        if (err) {
            console.log(JSON.stringify(err));
        } else {
            console.log(JSON.stringify(result));
        }
    })
})(config.documents[0].id);

function deleteDatabase() {
    client.deleteDatabase(databaseUrl, (err, result) => {
        if (err) {
            console.log(JSON.stringify(err));
        } else {
            console.log(JSON.stringify(result));
        }
    })
};