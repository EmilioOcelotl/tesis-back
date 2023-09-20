const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
const TurndownService = require('turndown');
const data = require('./../data/imgs.js');

// console.log(data); 
const fs = require('fs');
const initSqlJs = require('sql.js')
const filebuffer = fs.readFileSync('sql/document.db');
 
// const fetch = require('node-fetch');

// una de esta podría ser la variable global

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

});

function buildPDF(dataCallback, endCallback) {

    const dbsort = postdb.sort();

    //for(let i = 3; i < dbsort.length; i++){
//	const dbFilt = dbsort[i].slice(3);; 
  //  }

    // console.log(dbsort.length); 
    var turndownService = new TurndownService()
    // separar en arreglos para intercalar imágenes 
    markdown = turndownService.turndown(dbsort.toString());
    // console.log(dbsort[50]);
    //const mdFilt = markdown.slice(4); 
    
    const doc = new PDFDocument({ bufferPages: true, font: 'Courier', layout: 'landscape',size: 'Letter', margins: { top: 72+72/2, left: 72, right: 72, bottom: 72 } });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.fontSize(14).text(`
Universidad Nacional Autónoma de México
Programa de Maestría y Doctorado en Música
Facultad de Música
Instituto de Ciencias Aplicadas y Tecnología
Instituto de Investigaciones Antropológicas\n\n\n\n\n\n
Tres Estudios Abiertos
Prácticas Performáticas para el navegador`);

    //doc.rect(0, 0, doc.page.width, doc.page.height).fill('#302ed6');

    doc.addPage();
    
    doc.addPage(); 
    /*
    doc.image('img/cusco.jpg', 0, 15, {width: 300})
	.text('Proportional to width', 0, 0);
    */
    doc.fontSize(12).text(markdown)

    doc.addPage(); 
    
    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }

    let count = 0; 
    let pgCount = 0; 

    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {


	if(count % 3 == 0 && pgCount < data.imgs.length){
	    doc.switchToPage(i);
	    console.log(pgCount);
	    console.log(data.imgs[pgCount].img); 
	    //doc.image(data.imgs[pgCount].img, 0, 0, {width: 792});
	    var img = doc.openImage(data.imgs[pgCount].img);
	    doc.addPage({size: [img.width/2, img.height/2]});
	    doc.image(img, 0, 0, {width: img.width/2, height: img.height/2});
	    pgCount++;
	}
	count++;
    }

	//doc.flushPages();

    
    const range2 = doc.bufferedPageRange(); // => { start: 0, count: 2 }

    for (i = range2.start, end = range2.start + range2.count, range2.start <= end; i < end; i++) {

	
	if(i != 0){ 
	    doc.switchToPage(i);
	    doc.fillColor('gray').text(`Página ${i + 1} de ${range2.count}`, 72, 72);
	}
    }
    // manually flush pages that have been buffered
    doc.flushPages();
    doc.end();
}

module.exports = { buildPDF };
