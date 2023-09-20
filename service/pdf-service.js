const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
const TurndownService = require('turndown').default;
const fs = require('fs');
const initSqlJs = require('sql.js')
const filebuffer = fs.readFileSync('sql/document.db');
 
// const fetch = require('node-fetch');

 let pretxtdb = [];

   
initSqlJs().then(function(SQL){
    // Load the db
    
    // const intarr = new Uint8Array(buf);
    const db = new SQL.Database(new Uint8Array(filebuffer));
    // console.log(db);
    const stmt = db.prepare("SELECT note_contents.content FROM note_contents ORDER BY note_contents.content ASC"); // como filtrar para que aparezcan en un orden determinado?
    while (stmt.step()){
	pretxtdb.push(stmt.get());
    }
    
    stmt.free();
    console.log(pretxtdb);  
});

function buildPDF(dataCallback, endCallback) {
    const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });
    
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20).text(`A heading`);
    
    doc.image('img/cusco.jpg', 0, 15, {width: 300})
	.text('Proportional to width', 0, 0);
    
    doc
	.fontSize(12)
	.text(
	    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores, saepe.`
	);
    doc.end();
}

module.exports = { buildPDF };
