# GameShare

## Introducción

Como personas que activamente juegan videojuegos o juegos de mesa, nos gusta compartir
nuestras experiencias con cada juego y buscamos recomendaciones sobre qué deberíamos
jugar después o con quién hacerlo. Consecuentemente, hemos ideado la creación de una
aplicación web que le dé al usuario la capacidad de crear listas personalizadas de videojuegos
y/o juegos de mesa, similar al comportamiento de Letterboxd. Al finalizar el proyecto, los
usuarios podrán interactuar con otros al dejar comentarios en las listas o críticas en cada juego,
así satisfaciendo la necesidad de encontrar fácilmente más contenido que pueda ser de nuestro
interés. Dado a que nuestra idea está inspirada en necesidades personales que hemos notado
como jugadores, el proyecto va dirigido para personas de esta misma comunidad, las cuales
son aquellas interesadas en los juegos.

## Cliente

En nuestro caso, el cliente principal somos nosotros los desarrolladores. Nos consideramos
usuarios independientes con un gusto por los juegos y por compartir nuestras experiencias de
ellos, el cual es el público meta de este tipo de aplicación web. No se quisiera poner una
restricción de edad al tipo de público que podría disfrutar de esta aplicación, mas consideramos
que los usuarios podrían ser personas de 15+ con una afición por los videojuegos/juegos de
mesa.

## Necesidad

Después de reflexionar un poco sobre las necesidades que tienen nuestros clientes, llegamos a
las siguientes conclusiones: Las principales necesidades que debemos atender incluyen ver
contenido agrupado por similitudes propuestas por otros jugadores y sus reseñas sobre estos
mismos. Todo esto con el objetivo de promover que se generen conversaciones sobre distintos
tipos de juegos y que se pueda encontrar contenido que sea de interés para los usuarios con
mayor comodidad.

Para ello, se debe tener dos tipos de cuentas: administradores y cuentas regulares. Las
cuentas regulares tendrán la capacidad de agregar, modificar y eliminar listas y sus entradas, al
igual que dejar reseñas en los juegos o comentarios en las listas. Los administradores tendrán
estas mismas habilidades, más adicionalmente podrán agregar juegos, actualizar el nivel de
privilegios de las cuentas registradas (a administrador o usuario regular) y eliminar cuentas o
listas en caso de que sea necesario.

Unas estimaciones del volumen de audiencia que esperamos atender en este primer intento de
desarrollo son alrededor de 4 administradores y máximo 100 cuentas regulares. Cabe
mencionar que tendremos en mente mientras trabajemos que si el proyecto aumenta en
alcance, estos números podrían crecer.

## Restricciones técnicas

Como esperamos que esta primera iteración de nuestra idea sea un prototipo funcional, no
esperamos que haya un gran tráfico de usuarios. Por lo tanto, usaremos planes libres de costo
para el almacenamiento de nuestros datos en MongoDB Atlas y planeamos hospedar el
servicio usando una plataforma como Heroku. Esto quiere decir que los servidores tendrán una
capacidad limitada de recursos pero nos proveerán con la oportunidad de poder contratar una
mayor cantidad si lo vemos como necesario conforme avancemos con el proyecto.

## Solución

Para poder atender adecuadamente las necesidades previamente descritas, se considera que
nuestro proyecto debe proporcionar a los usuarios las siguientes funcionalidades: poder buscar
juegos para agregar a sus listas, poder administrar sus propias listas, poder ver las listas de
otras personas y poder dejar comentarios o reseñas en juegos y listas. También, para mejorar
nuestro sistema proponemos agregar filtros de búsqueda para las listas por conceptos como
número de likes, fecha de creación y por orden alfabético. Cabe mencionar que planeamos
tener las funcionalidades bases de registro e inicio de sesión, a parte de recuperación de
contraseña. Las herramientas que pensamos utilizar para poder hacer de nuestra solución una
realidad son Node.js, Atlas, Bootstrap y Heroku. Los beneficios que nuestra aplicación web le
traerá al cliente son facilidad para la creación, visualización y divulgación de listas o de juegos.
De manera tal que puedan realizar acciones que van desde investigar juegos para planear que
jugar, hasta llevar un registro de recomendaciones o juegos que han jugado.
