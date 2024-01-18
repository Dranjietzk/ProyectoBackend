const express = require('express');
const bodyParser = require('body-parser');
const ProductManager = require('./gaminghouse.js');

const app = express();
const port = 8081;

app.use(bodyParser.json());

const productManager = new ProductManager('productos.json');

app.post('/api/products', async (req, res) => {
  try {
    const newProductData = {
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      price: req.body.price,
      status: true,
      stock: req.body.stock,
      category: req.body.category,
      thumbnails: req.body.thumbnails || [],
    };

    await productManager.addProduct(newProductData);
    res.json({ message: 'Producto agregado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});
app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

app.get('/api/products/:pid', async (req, res) => {
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

app.get('/', (req, res) => {
  res.send('¡Bienvenido a la aplicación!');
});

app.put('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const updatedFields = {
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      thumbnails: req.body.thumbnails || [],
    };

    await productManager.updateProduct(productId, updatedFields);
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

app.delete('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    await productManager.deleteProduct(productId);
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});



const cartRouter = productManager.getCartRouter();
app.use('/api/carts', cartRouter);

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
