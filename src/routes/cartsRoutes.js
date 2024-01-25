const express = require('express');
const router = express.Router();
const fs = require('fs');

const cartsFile = '../files/carts.json';

function readCartsFile() {
  try {
    const cartsData = fs.readFileSync(cartsFile, 'utf8');
    return JSON.parse(cartsData);
  } catch (error) {
    return [];
  }
}

function saveCartsFile(carts) {
  fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), 'utf8');
}

router.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const carts = readCartsFile();
  const cart = carts.find((cart) => cart.id === cartId);

  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).send('Carrito no encontrado');
  }
});

router.post('/', (req, res) => {
  const carts = readCartsFile();
  const newCart = {
    id: (carts.length + 1).toString(),
    products: [],
  };

  carts.push(newCart);
  saveCartsFile(carts);

  res.json(newCart);
});

router.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = parseInt(req.params.pid);
  const quantity = req.body.quantity || 1;

  const carts = readCartsFile();
  const cart = carts.find((cart) => cart.id === cartId);

  if (cart) {
    const existingProduct = cart.products.find((product) => product.product === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    saveCartsFile(carts);
    res.json(cart);
  } else {
    res.status(404).send('Carrito no encontrado');
  }
});

module.exports = router;
