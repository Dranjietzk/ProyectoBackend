const express = require('express');
const fs = require('fs/promises');
const app = express();
const PORT = 8080;

app.use(express.json());

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.initialize();
  }

  async initialize() {
    try {
      const fileContent = await fs.readFile(this.path, 'utf-8');
      if (fileContent) {
        this.products = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error al inicializar:', error.message);
    }
  }

  async saveToFile() {
    try {
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al guardar en el archivo:', error.message);
    }
  }

  async addProduct(productData) {
    const id = this.products.length + 1;

    const newProduct = {
      id,
      ...productData,
    };

    this.products.push(newProduct);
    await this.saveToFile();
    console.log('Producto agregado:', newProduct);
  }

  async getProducts(limit) {
    try {
      await this.initialize();
      return limit ? this.products.slice(0, limit) : this.products;
    } catch (error) {
      throw new Error('Error al obtener los productos.');
    }
  }

  async getProductById(id) {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return product;
    } else {
      console.error('Producto no encontrado');
    }
  }

  async updateProduct(id, updatedFields) {
    const productIndex = this.products.findIndex((product) => product.id === id);

    if (productIndex !== -1) {
      this.products[productIndex] = {
        ...this.products[productIndex],
        ...updatedFields,
        id,
      };

      await this.saveToFile();
      console.log('Producto actualizado:', this.products[productIndex]);
    } else {
      console.error('Producto no encontrado');
    }
  }

  async deleteProduct(id) {
    const updatedProducts = this.products.filter((product) => product.id !== id);

    if (updatedProducts.length < this.products.length) {
      this.products = updatedProducts;
      await this.saveToFile();
      console.log('Producto eliminado con éxito');
    } else {
      console.error('Producto no encontrado');
    }
  }

  getCartRouter() {
    const cartRouter = express.Router();

    cartRouter.get('/:cid/products', async (req, res) => {
      try {
        const cartId = req.params.cid;
        const carts = await fs.readFile('carrito.json', 'utf-8');
        const parsedCarts = JSON.parse(carts);
        const cart = parsedCarts.find(cart => cart.id === cartId);

        if (cart) {
          res.json(cart.products);
        } else {
          res.status(404).json({ error: 'Carrito no encontrado' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos del carrito' });
      }
    });

    cartRouter.post('/:cid/products/:pid', async (req, res) => {
      try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const carts = await fs.readFile('carrito.json', 'utf-8');
        const parsedCarts = JSON.parse(carts);
        const cart = parsedCarts.find(cart => cart.id === cartId);

        if (!cart) {
          return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const existingProduct = cart.products.find(product => product.product === productId);

        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.products.push({ product: productId, quantity: 1 });
        }

        await fs.writeFile('carrito.json', JSON.stringify(parsedCarts, null, 2), 'utf-8');

        res.json({ message: 'Producto agregado al carrito con éxito' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
      }
    });

    return cartRouter;
  }
}

const productManager = new ProductManager('productos.json');
const cartRouter = productManager.getCartRouter();
app.use('/api/carts', cartRouter);

app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.get('/api/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

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

app.put('/api/products/:pid', async (req, res) => {
  try {
    const updatedFields = {
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      thumbnails: req.body.thumbnails || [],
    };

    await productManager.updateProduct(req.params.pid, updatedFields);
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

app.delete('/api/products/:pid', async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid);
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor hosteando en http://localhost:${PORT}`);
});

module.exports = ProductManager;
