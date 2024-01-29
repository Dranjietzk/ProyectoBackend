const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const handlebars = require('express-handlebars');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('newProduct', async () => {
    const products = await productManager.getAllProducts();
    io.emit('updateProducts', products); 
  });

  socket.on('deleteProduct', async () => {
    const products = await productManager.getAllProducts();
    io.emit('updateProducts', products); 
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', 'src/views');


app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});


const productRoutes = require('./src/routes/productsRoutes');
const cartRoutes = require('./src/routes/cartsRoutes');

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
