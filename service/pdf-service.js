const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
const TurndownService = require('turndown');
  
const fs = require('fs');
const initSqlJs = require('sql.js')
const filebuffer = fs.readFileSync('sql/document.db');
 
// const fetch = require('node-fetch');

let pretxtdb = [], txtdb =[], postdb =[]; 

var turndownService = new TurndownService()
 

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

    for(let i = 0; i < pretxtdb.length; i++){
	if(ArrayBuffer.isView(pretxtdb[i][0])){
	    var string = new TextDecoder().decode(pretxtdb[i][0]);
	    pretxtdb[i] = string;
	}
    }

    for(let i = 0; i < pretxtdb.length; i++){
	if(pretxtdb[i].length != 0){
	    if(i < 100){
		txtdb.push(pretxtdb[i][0].toString()); // viejo formato
	    } else {
		txtdb.push(pretxtdb[i].toString()); // nuevo formato
	    }
	}
    }

   postdb = txtdb.slice(0, txtdb.length-5); // las últimas notas parece que son imágenes

    // console.log(postdb)
    // consoleq.log(markdown);
    // const dbmark = markdown;
    // console.log(dbmark);
    algo(); // cuando funcionan aparte está mejor
});

function algo (){

    const dbsort = postdb.sort();
    // console.log(dbsort.length); 
    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(dbsort.toString());
    //console.log(markdown); 

}

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
