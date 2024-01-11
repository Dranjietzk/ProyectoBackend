const fs = require('fs/promises');

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
}

module.exports = ProductManager;
