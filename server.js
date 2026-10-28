//server.js
//va antes de importar las rutas, porque db.js y los controllers leen el .env al cargarse
const dotenv=require('dotenv')
dotenv.config()//Cargamos todas las variables del sistema

//Importamos la libreria de express para poder gestionar la API
const express=require('express')
//Usamos CORS como un protector que permite tanto filtrar quien puede hacer peticiones, como seguridad y middleware para la API
const cors=require('cors')
//Declaramos todas las rutas que nuestra API utilizará, cada una es un router, y simplemente estamos importando todo el router con sus rutas (endpoints)
const productoRoutes=require('./routes/producto.route')
const pedidosAdmin=require('./routes/pedidoAdmin.routes')
const pedidosCliente=require('./routes/pedidoCliente.routes')
const carrito=require('./routes/carrito.routes')
const productoProveedores=require('./routes/productoProveedor.routes')
const finanzas=require('./routes/reporteFinanzas.routes')
const trabajadores=require('./routes/trabajador.routes')
const auth=require('./routes/auth.routes')
const ventas=require('./routes/ventas.routes')
const proveedores=require('./routes/proveedor.routes')
const compras=require('./routes/compra.routes')
const asistencias=require('./routes/asistencia.routes')
const nominas=require('./routes/nomina.routes')



//Declaramos el objeto app, que permite instanciar un objeto que gestiona todo el proceso de la API
//desde sus rutas, middlewares y en sí quien se encarga de permitir recibir y mandar consultas y hacer posible la API
const app=express();

//Limitamos las consultas solo desde localhost en el puerto 4200 para evitar conexiones no validas
app.use(cors({origin:'http://localhost:4200'}))
//Limitamos el máximo de información a 5MB para evitar una gran cantidad de información o datos no procesables
app.use(express.json({ limit: '5mb' }));//Es un middleware que la información la recive en JSON, automáticamente la interpreta
//Agregamos todas las rutas (routes) directamente a nuestra app, para ser accesibles
//y declaramos la ruta base para cada uno
app.use('/uploads',express.static('uploads'))//Esta permite que se consulten archivos y como tal la carpeta

//Estas son las rutas de los endpoints
app.use('/api/productos',productoRoutes)
app.use('/api/pedidos-admin', pedidosAdmin);
app.use('/api/pedidos-cliente',pedidosCliente );
app.use('/api/carrito', carrito);
app.use('/api/proveedores',productoProveedores );
app.use('/api/proveedores',proveedores );
app.use('/api/finanzas',finanzas );
app.use('/api/trabajadores', trabajadores);
app.use('/api/ventas',ventas)
app.use('/api/auth',auth );
app.use('/api/compras',compras );
app.use('/api/asistencias', asistencias);
app.use('/api/nomina', nominas);

app.listen(3200,()=>{//Usamos esto, para habilitar la API en el puerto 3200
    console.log('Servidor ejecutandose en http://localhost:3200')//Hacemos que una vez que se habilita, nos muestre este mensaje para indiciar que todo fue correcto
})