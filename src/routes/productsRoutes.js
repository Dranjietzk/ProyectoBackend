const express = require('express');
const router = express.Router();
const ProductManager = require('../models/productManager');
const fs = require('fs');

const productManager = new ProductManager('../files/products.json');
const productsFilePath = 'src/files/products.json';

router.get('/', async (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    const products = JSON.parse(productsData);

    res.render('home', { products });
  } catch (error) {
    console.error('Error al leer el archivo products.json:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/:pid', async (req, res) => {
  const productId = req.params.pid;
  const product = await productManager.getProductById(productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

router.post('/', async (req, res) => {
  const newProduct = req.body;

  const addedProduct = await productManager.addProduct(newProduct);
  if (addedProduct) {
    res.json(addedProduct);
  } else {
    res.status(400).send('El producto ya existe');
  }
});

router.put('/:pid', async (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;

  const success = await productManager.updateProduct(productId, updatedProduct);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

router.delete('/:pid', async (req, res) => {
  const productId = req.params.pid;

  const success = await productManager.deleteProduct(productId);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

module.exports = router;
