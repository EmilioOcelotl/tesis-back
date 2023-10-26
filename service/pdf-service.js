// Primer paso, cargar las librerías

const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
const TurndownService = require('turndown');
const data = require('./../data/imgs.js');

// En este apartado de la investigación defino una parte de la infraestructura 
// Necesito separar esto para que pueda funcionar en el front. 

// console.log(data); 
const fs = require('fs');
const initSqlJs = require('sql.js')

// Leer el archivo de la base de datos; 

const filebuffer = fs.readFileSync('sql/document.db');
 
// const fetch = require('node-fetch');
// una de esta podría ser la variable global
let pretxtdb = [], txtdb =[], postdb =[]; 
var turndownService = new TurndownService()

// Lectura de la base de datos

initSqlJs().then(function(SQL){
    // Load the db
    // const intarr = new Uint8Array(buf);
    const db = new SQL.Database(new Uint8Array(filebuffer));
    // Preparación de la declaración para obtener todas las notas ordenadas por orden alfabético ascendente. 
    const stmt = db.prepare("SELECT note_contents.content FROM note_contents ORDER BY note_contents.content ASC");
    // Es necesaria una iteración para guardar cada una de las notas dentro de un arreglo temporal. 
    while (stmt.step()){
	pretxtdb.push(stmt.get());
    }
    // Cerramos la consulta
    stmt.free();
    //Una vez que está completo el arreglo con todas las notas, es neccesario decodificar
    for(let i = 0; i < pretxtdb.length; i++){
	if(ArrayBuffer.isView(pretxtdb[i][0])){
	    var string = new TextDecoder().decode(pretxtdb[i][0]); // Tendrá qué ver?  
	    pretxtdb[i] = string;
	}
    }
    // En algunos casos, el formato de los índices del arreglo son distintos entonces es necesario filtrar.
    // También es necesario filtrar las primeras 100 notas
    for(let i = 0; i < pretxtdb.length; i++){
	if(pretxtdb[i].length != 0){
	    if(i < 100){
		txtdb.push(pretxtdb[i][0].toString()); // viejo formato
	    } else {
		txtdb.push(pretxtdb[i].toString()); // nuevo formato
	    }
	}
    }
    // agregamos en un nuevo arreglo todas las notas menos las últimas 5
    postdb = txtdb.slice(0, txtdb.length-5); // las últimas notas parece que son imágenes. Parece que por esto no se imprimen las últimas notas en el servidor

});

// Esta función es llamada más adelante. En este módulo de código se construye el PDF con la biblioteca PDFkit  
function buildPDF(dataCallback, endCallback) {

    let index = []; // guardar las páginas del índice. 
    
    // Primero hay que ordenar las notas alfabéticamente. Esto permite que se ordenen jerárquicamente a partir de una notación tipo índice
    //const dbsort = postdb.sort();

    // Los strings extraídos de las notas tienen notación HTML. Entonces es necesario convertir a markdown. Algunas anotaciones se mantienen
    var turndownService = new TurndownService()
    // No paso todo el bloque de notas sino que separo en arreglos para intercalar imágenes
    let markdown = []; 

    // Si cada una de las notas es un archivo markdown entonces es más fácil de trabajar.
    // Por otro lado, también se podría compilar en el servidor un documento latex. Pertinente revisar si esto es necesario
    
    for(let i = 0; i < postdb.length; i++){
	markdown[i] = turndownService.turndown(postdb[i].toString());
    }

    marksort = markdown.sort(); 

    // Condiciones iniciales del documento PDF.
    // bufferPages permite regresar a las páginas del documento para agregar elementos. Por ejemplo el número de página.
    // Con font es posible personalizar la fuente. En este caso, la fuente general del documento es SourceCodePro
    // También se determinan el tamaño de la página y los márgenes
    const doc = new PDFDocument({ bufferPages: true, font: 'fonts/SourceCodePro-Regular.ttf', size: [792, 612], margins: { top: 72+72/2, left: 72, right: 72, bottom: 72} });

    // la funcion buildPDF tiene dos estados, dataCallback que es el llamado de los datos solicitados, en este caso un archivo pdf
    doc.on('data', dataCallback);
    // el llamao termina cuando el documento termina de realizarse
    doc.on('end', endCallback);

    // Primera página. En este caso, la portada del documento es un string. 
    doc.fontSize(10).text(`
UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO\n
Programa de Maestría y Doctorado en Música
Facultad de Música
Instituto de Ciencias Aplicadas y Tecnología
Instituto de Investigaciones Antropológicas\n\n\n\n\n
TRES ESTUDIOS ABIERTOS
Escrituras performáticas audiovisuales e investigación con Javascript\n\n\n\n\n
Que para optar por el grado de
Doctor en Música
(Tecnología Musical)\n
Presenta
Emilio Ocelotl
Tutor Principal: Hugo Solís
Comité tutor: Iracema de Andrade y Fernando Monreal`);

    // Dos páginas en blanco

    doc.addPage({size: [792, 612]});
    doc.addPage({size: [792, 612]}); 

    // contador general
    let con = 0;
    // contador de páginas 
    let pgCo = 0;

    // El siguiente loop lee todas las notas ya convertidas a markdown 
    for(let i = 0; i < marksort.length; i++){

	// Solamente se imprimen notas con más de dos caracteres
	if(markdown[i].length > 2){ 
	    // const txt = marksort[i].slice(3); // identificador jerárquico. Con una numeración es posible construir el documento de manera lineal
	    const pgBreak = marksort[i].slice(2, 3); // Lectura del segundo número para dar saltos de línea. 
	    const notes = marksort[i].slice(0, 1); // Identificador para filtrar un conjunto de notas que eliminé pero siguen apareciendo en la base. Posiblemente sea necesario eliminarlas desde una declaración. 
	    const code = marksort[i].slice(5, 9); // También es necesario filtrar algunas notas de código que aparecen mal codificadas. 

	    // Cambiar enlaces de markdown a solamente el contenido de la nota 
	    const regexMdLinks = /\[(.*?)\]\(.*?\)/g
	    const matches = marksort[i].replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
	    //console.log(matches)
	    
	    // Salto para el título inicial de cada capítulo. Aquí se implementan los filtros antes declarados. 
	    // También debería haber saltos para las notas
	   
	    if( pgBreak == 0 || pgBreak == 8 && notes!=9 && notes != 6 && code != "code"){
		// es necesario regresar al tamaño de hoja carta cuando se modifica el tamañoo por la inserción de una imagen
		doc.addPage({size: [792, 612]});
	    }
	    
	    if(notes == 'a' && notes!=9  && notes != 6  && code != "code"){		
		// Agregar el bloque de texto. Si es una referencia entonces los espacios entre notas se reducen 
		doc.fillColor('black').fontSize(10).text("\n"+matches, {width: 792-(72*2)})
	    } else if(notes!=9 && notes != 6  && code != "code"){
		// Agrega una nota de texto normal 
		doc.fillColor('black').fontSize(10).text("\n\n"+matches+"\n", {width: 792-(72*2)})
	    }
	    
	    // Para los inicios de capítulo es necesario agregar otro salto de línea. El identificador de cada capítulo es un 0
	    
	    if( pgBreak == 0 && notes!=9 && notes != 6 && code != "code"){
		doc.addPage({size: [792, 612]});
	    }
	    
	    // Hay un contador que aumenta en uno cada vez que se inserta una nueva nota. Este contador es modulado a dos es decir, cada dos notas, va a insertar una nueva nota. Para que no haya problemas con respecto a la cantidad total de imágenes, es necesario poner un límite para que no intente introducir una imagen que está fuera de la cantidad total de imágenes
	    
	    if(con % 3 == 0 && pgCo < data.imgs.length){
		// El primer paso consiste en leer la imagen
		var img = doc.openImage(data.imgs[pgCo].img);
		// Luego, agrego una página con la mitad del tamaño de la imagen
		doc.addPage({size: [img.width/2, img.height/2]});
		// agrego la imagen y asocio un espacio cliqueable del mismo tamaño de la imagen con la url correspondiente 
		doc.image(img, 0, 0, {width: img.width/2, height: img.height/2}).link(0, 0, img.width, img.height, data.imgs[pgCo].url);
		// Dibujo un cuadrado de color negro para que aparezca detrás del texto asociado a la imagen 
		let grad = doc.linearGradient(50, 0, 150, 100);
		grad.stop(0, 'black')
		    .stop(1, 'black');
		doc.rect(68, doc.page.height-(doc.page.height/5)-4, doc.page.width, doc.heightOfString(data.imgs[pgCo].nota)+8);
		doc.fill(grad);
		// Dibujo el texto asociado a la imagen en cuestión. Aparece envima del recuadro dibujado inicialmente 
		doc.fillColor('white').text("Figura "+(pgCo+1)+". "+data.imgs[pgCo].nota, 72, doc.page.height-(doc.page.height/5)-4)
		// cambia el contador de la imagen
		pgCo++;
	    }

	    // En cada iteración cambia el contador de nota 
	    con++;
	}

    }

    // Iniciar un nuevo contador ahora para leer todas las páginas del documento que por el momento se encuentra en bufffer
    let conCol = 0;
    const range2 = doc.bufferedPageRange(); // => { start: 0, count: 2 }

    // Este contador recorre todas las páginas del documento de inicio a fin. 
    for (i = range2.start, end = range2.start + range2.count, range2.start <= end; i < end; i++) {
	if(i != 0){
	    // Para agregar algun tipo de texto es necesario cambiar a la página en cuestión 
	    doc.switchToPage(i);
	    // Es necesario insertar un recuadro negro que pueda indicar la página actual. Utilizo el color negro para que se pueda distinguir la información del número de página en imágenes muy oscuras
	    let grad = doc.linearGradient(50, 0, 150, 100);
	    grad.stop(0, 'black')
		.stop(1, 'black');
	    doc.rect(doc.page.width-(doc.widthOfString('Página 100 de 100')+80)-2, 70, doc.widthOfString('Página 100 de 100')+2, doc.heightOfString('Pagina'));
	    // console.log(doc.page.height); 
	    doc.fill(grad);
	    doc.fillColor('white').text(`Página ${i + 1} de ${range2.count}`, doc.page.width-(doc.widthOfString('Página 100 de 100')+80), 72 )		
	}
    }
    // Por último se vacían las páginas almacenadas en el buffer
    doc.flushPages();
    // termina el documento 
    doc.end();
}

module.exports = { buildPDF };
