const fs = require('fs').promises;
const crypto = require('crypto');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getAllProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getAllProducts();
    return products.find(producto => producto.id == id);
  }

  async addProduct(prod) {
    const products = await this.getAllProducts();
    const existProd = products.find(producto => producto.id == prod.id);
    
    if (existProd) {
      return false;
    } else {
      prod.id = crypto.randomBytes(16).toString('hex');
      products.push(prod);

      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return true;
    }
  }

  async updateProduct(id, producto) {
    const products = await this.getAllProducts();
    const index = products.findIndex(producto => producto.id == id);

    if (index !== -1) {
      products[index] = { ...products[index], ...producto };
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return true;
    } else {
      return false;
    }
  }

  async deleteProduct(id) {
    const products = await this.getAllProducts();
    const index = products.findIndex(producto => producto.id == id);

    if (index !== -1) {
      const deletedProduct = products.splice(index, 1);
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return true;
    } else {
      return false;
    }
  }
}

module.exports = ProductManager;
