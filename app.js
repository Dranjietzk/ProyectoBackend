const express = require('express');
const bodyParser = require('body-parser');
const ProductManager = require('./gaminghouse'); 

const app = express();
const port = 8080; 

app.use(bodyParser.json());

const productManager = new ProductManager('productos.json'); 

app.get('/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

app.get('/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
