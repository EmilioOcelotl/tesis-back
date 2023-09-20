const initSqlJs = require('sql.js'); // para leer sql

function DbReader(){

    this.txtdb = [],  pretxtdb = [];
    this.postdb = []; 

    this.read = async function(path){
	
	const sqlPromise = initSqlJs({
	    locateFile: file => `./sql/${file}`
	});
	
	const dataPromise = fetch(path).then(res => res.arrayBuffer());
	const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
	const intarr = new Uint8Array(buf);
	const db = new SQL.Database(intarr);
	//const stmt = db.prepare("SELECT notes.noteId FROM notes ORDER BY dateModified DESC"); // como filtrar para que aparezcan en un orden determinado?
	const stmt = db.prepare("SELECT note_contents.content FROM note_contents ORDER BY note_contents.content ASC"); // como filtrar para que aparezcan en un orden determinado?
	while (stmt.step()) pretxtdb.push(stmt.get()); // recorre y mientras stmt.step() arroje verdadero, entonces imprime los valores de stmt
	stmt.free();
	// liberar o cerrar hay que checar bien eso
	// convertir de uint8Aimport text from 'bundle-text:./myFile'; rray a un string leíble ( en caso de que sea un uint8array ), si no lo es, deja intacto el texto

	for(let i = 0; i < pretxtdb.length; i++){
	    if(ArrayBuffer.isView(pretxtdb[i][0])){
		var string = new TextDecoder().decode(pretxtdb[i][0]);
		pretxtdb[i] = string;
	    }
	}

	// limpiar la base de datos para quitar los elementos vacíos 
	// Revisar de vez en cuanddo para ver si algo no se está escapando. 
	
	for(let i = 0; i < pretxtdb.length; i++){
	    if(pretxtdb[i].length != 0){
		if(i < 50){
		    this.txtdb.push(pretxtdb[i][0].toString()); // viejo formato
		} else {
		    this.txtdb.push(pretxtdb[i].toString()); // nuevo formato
		}
	    }
	}
	// var regexCode = /<\/\/code/ig;
	// Encontrar una forma más eficiente de eliminar los últimos indices. En otras ocasiones han cambiado. 
	this.postdb = this.txtdb.slice(0, this.txtdb.length-5); // Estos índices ya cambiaron 
	// console.log(this.postdb[105]); 
    }
}

module.exports = { DbReader }
