const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
const TurndownService = require('turndown');
const data = require('./../data/imgs.js');

// En este apartado de la investigación defino una parte de la infraestructura 

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
	    var string = new TextDecoder().decode(pretxtdb[i][0]); // Tendrá qué ver?  
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
    let markdown = []; 

    for(let i = 0; i < dbsort.length; i++){
	markdown[i] = turndownService.turndown(dbsort[i].toString());
    }

    console.log(markdown[0]); 
    
    // console.log(dbsort[50]);
    //const mdFilt = markdown.slice(4); 
    
    const doc = new PDFDocument({ bufferPages: true, font: 'fonts/SourceCodePro-Regular.ttf', size: 'Letter', margins: { top: 72+72/2, left: 72, right: 72, bottom: 72} });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.fontSize(12).text(`
Universidad Nacional Autónoma de México\n
Programa de Maestría y Doctorado en Música
Facultad de Música
Instituto de Ciencias Aplicadas y Tecnología
Instituto de Investigaciones Antropológicas\n\n\n\n\n\n\n\n
TRES ESTUDIOS ABIERTOS
Escrituras performáticas audiovisuales e investigación con Javascript\n\n\n\n\n\n\n\n
Que para optar por el grado de
Doctor en Música
(Tecnología Musical)\n
Presenta
Emilio Ocelotl Reyes
Tutor Principal: Hugo Solís
Comité tutor: Iracema de Andrade y Fernando Monreal`);

    //doc.rect(0, 0, doc.page.width, doc.page.height).fill('#302ed6');  
    /*
    doc.image('img/cusco.jpg', 0, 15, {width: 300})
	.text('Proportional to width', 0, 0);
    */

    doc.addPage();
    doc.addPage(); 

    let con = 0;
    let pgCo = 0;

    for(let i = 0; i < markdown.length; i++){

	if(markdown[i].length > 2){ // filtrar notas en blanco
	  
	    const txt = markdown[i].slice(3);
	    const pgBreak = markdown[i].slice(2, 3);
	    const notes = markdown[i].slice(0, 1);
	    const code = markdown[i].slice(0, 6); 

	    // Salto para el título inicial de cada capítulo

	    if( pgBreak == 0 && notes!=9 && notes != 6 && notes != "//code"){
		doc.addPage({size: [612, 792]});
	    }

	    // Agregar el bloque de texto 

	    if(notes == 'a' && notes!=9  && notes != 6  && notes != "//code"){
		doc.fillColor('black').fontSize(10).text("\n"+txt, {width: 612-(72*2)})
	    } else if(notes!=9 && notes != 6  && notes != "//code"){	
		doc.fillColor('black').fontSize(10).text("\n\n"+txt+"\n", {width: 612-(72*2)})
	    }
	    
	    if( pgBreak == 0 && notes!=9 && notes != 6 && notes != "//code"){
		doc.addPage({size: [612, 792]});
	    }

	   
	    // Salto para las notas finales de cada capítulo

	    /*
	    if( pgBreak == 8){
		doc.addPage();
	    }
	    */
	    
	    if(con % 2 == 0 && pgCo < data.imgs.length){
		//doc.addPage(); 
		var img = doc.openImage(data.imgs[pgCo].img);
		doc.addPage({size: [img.width/2, img.height/2]});
		doc.image(img, 0, 0, {width: img.width/2, height: img.height/2}).link(0, 0, img.width, img.height, data.imgs[pgCo].url);;
		let grad = doc.linearGradient(50, 0, 150, 100);
		grad.stop(0, 'black')
		    .stop(1, 'black');
		doc.rect(68, doc.page.height-(doc.page.height/5)-4, doc.page.width, doc.heightOfString(data.imgs[pgCo].nota)+8);
		doc.fill(grad); 
		doc.fillColor('white').text("Figura "+(pgCo+1)+". "+data.imgs[pgCo].nota, 72, doc.page.height-(doc.page.height/5)-4)
		// doc.addPage();
		pgCo++;
	    }

	    con++;
	}

    }

    let conCol = 0;
    
    const range2 = doc.bufferedPageRange(); // => { start: 0, count: 2 }

    for (i = range2.start, end = range2.start + range2.count, range2.start <= end; i < end; i++) {
	if(i != 0){ 
	    doc.switchToPage(i);
	  
	    // doc.fillColor('black').highlight(70, 70, doc.widthOfString('Página 0 de 1000'), doc.heightOfString('Pagina'), {color: 'gray'}).text(`Página ${i + 1} de ${range2.count}`, 72, 72)
	    let grad = doc.linearGradient(50, 0, 150, 100);
	    grad.stop(0, 'black')
		.stop(1, 'black');
	    doc.rect(doc.page.width-(doc.widthOfString('Página 100 de 100')+80)-2, 70, doc.widthOfString('Página 100 de 100')+2, doc.heightOfString('Pagina'));
	    // console.log(doc.page.height); 
	    doc.fill(grad);
	    doc.fillColor('white').text(`Página ${i + 1} de ${range2.count}`, doc.page.width-(doc.widthOfString('Página 100 de 100')+80), 72 )
		
	}

    }
    // manually flush pages that have been buffered
    doc.flushPages();
    doc.end();
}

module.exports = { buildPDF };
