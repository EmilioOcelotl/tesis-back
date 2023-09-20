
// Nueva clase para leer, limpiar e imprimir

const PDFDocument = require('pdfkit');

// const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
var axios = require('axios').default;
//import fs from 'fs';
// import { readFileSync } from "fs";
// var fs = require('fs');

// console.log(text); 

//import fs from 'fs/promises'
//var fs = require('fs');
//const TurndownService = require('turndown')
const TurndownService = require('turndown').default;

// limpiar db con algún parser 

function dbParser(db){

    const dbsort = db.sort();
	
    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(dbsort.join(' '))
    // console.log(markdown);
    this.db = markdown;  
}

// Crear documento con pdfkit 

function createDoc(md){

    const doc = new pdfkit({font: 'Courier', layout: 'landscape'}); 
    // doc.text(str, 100, 100);
    //const doc = new PDFDocument;
    // pipe the document to a blob
    const stream = doc.pipe(blobStream());
    // add your content to the document here, as usual
    // get a blob when you're done

    // create a document the same way as above
    // Con este sistema sería posible ordenar por bloques de notas y de subcapítulos y de capítulos. 
    
    // doc.text('Este es un bloque de texto mucho mayor entonces voy a ver si funciona bien, probablemente cambiaré a este sistema', 100, 100);

    // console.log(md); 
    // let str = md; 

   
    
    doc.fontSize(12);
    
    doc.text(md,
	     {linebreak: false});

    doc.addPage();
  
    
    doc.end();
    stream.on('finish', function() {
	// get a blob you can do whatever you like with
	// const blob = stream.toBlob('application/pdf');
	// or get a blob URL for display in the browser
	const url = stream.toBlobURL('application/pdf');
	iframe.src = url;
    });
    
    document.getElementById("instrucciones").innerHTML = "";
    var iframe = document.querySelector('iframe');
    iframe.style.visibility = 'visible';
    
    const container = document.getElementById( 'container' );
    container.remove();
    
    
}

module.exports =  { DbReader, dbParser, createDoc }
