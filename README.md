![portada](https://raw.githubusercontent.com/EmilioOcelotl/tres-back/main/img/bannerTres.png)

# Tres Estudios Abiertos

La presente investigación tiene lugar en una frontera donde el conocimiento y lo sensible se encuentran, se adscribe a la “generación de nuevos modos de performance musical y a la apertura de canales innovadores para la presentación y difusión de la investigación artística en música” (de Assis, 2018). En este sentido surge la pregunta presente en el núcleo de esta investigación: ¿Qué aportes puede realizar la escritura de código a los nuevos modos del performance audiovisual y a la escritura de un documento reflexivo que involucra materiales como sonido, gráficos y texto en el contexto de la investigación artística? La respuesta a esta pregunta parte del lenguaje de programación JavaScript.

Este repositorio contiene el trasfondo del proyecto que organiza e imprime notas. El render en PDF de este proyecto se puede consultar en: [https://ocelotl.cc/tres](https://ocelotl.cc/tres)

Esta parte del proyecto se complementa con el [frente](https://ocelotl.cc/tres) del proyecto que renderiza información de forma interactiva en un entorno tridimensional. 

## Recursos

Este proyecto utiliza principalmente: 

- [Trilium](https://github.com/zadam/trilium). Un proyecto para construir y montar una base personal de conocimiento en un servidor.

- [PDFKit](https://github.com/productioncoder/pdfkit-node). Para generar un PDF con node.

- [sql.js](https://sql.js.org/). Para importar la base de datos generada con Trilium.

- [Turndown](https://github.com/mixmark-io/turndown). para convertir HTML a Markdown. 
- [Express](https://expressjs.com/) Para gestionar procesos de node.js

- [pm2](https://pm2.io/). Para administrar procesos de producción.

- [nodemon](https://nodemon.io/). Para hacer pruebas en fases anteriores a producción. 

## Ejecución

Para instalar

`npm install`

Para escribir fuera de producción

`npm run dev`

Para lanzar en producción

`pm2 index`

## Notas adicionales

Fue necesario crear una instancia de [Trilium Notes](https://github.com/zadam/trilium) en un servidor personalizado. 

Las instrucciones que se usaron para desplegar una instancia de Trilum están en el siguiente enlace: 

[Docker-server-installation](https://github.com/zadam/trilium/wiki/Docker-server-installation)

Para tener dos o más instancias con docker, es necesario forwardear de la siguiente manera y cambiar el nombre de la carpeta: 

`docker run -d -p 8085:8080 -v ~/tesis:/home/node/tesis zadam/trilium:0.63.7`

## Referencias

- De Assis, P. (2018). Logic of Experimentation. Leuven University Press. https://doi.org/10.2307/j.ctv6zdcpg