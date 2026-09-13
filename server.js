const express=require('express')
const cors=require('cors')
const productoRoutes=require('./routes/producto.route')
const pedidosAdmin=require('./routes/pedidoAdmin.routes')
const pedidosCliente=require('./routes/pedidoCliente.routes')
const carrito=require('./routes/productoCarrito.routes')
const productoProveedores=require('./routes/productoProveedor.routes')
const finanzas=require('./routes/reporteFinanzas.routes')
const trabajadores=require('./routes/trabajador.routes')
const auth=require('./routes/auth.routes')
const ventas=require('./routes/ventas.routes')
const proveedores=require('./routes/proveedor.routes')
const compras=require('./routes/compra.routes')
const asistencias=require('./routes/asistencia.routes')
const nominas=require('./routes/nomina.routes')
const app=express();

app.use(cors())
app.use(express.json({ limit: '5mb' }));//Es un middleware que la información la recive en JSON, automáticamente la interpreta
app.use('/uploads',express.static('uploads'))
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

app.use('/uploads', express.static('uploads'));

app.listen(3200,()=>{
    console.log('Servidor ejecutandose en http://localhost:3200')
})