import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/easyshop';

// Product Schema
const productSchema = new mongoose.Schema(
  {
    _id: { type: String },
    originalId: { type: String },
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    categories: [String],
    image: [String],
    rating: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    shop_category: { type: String, required: true },
    unit_of_measure: String,
    colors: [String],
    sizes: [String],
  },
  {
    timestamps: true,
    _id: false,
  }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

// Fix image paths
function getImagePath(originalPath: string, shopCategory: string): string {
  const fileName = path.basename(originalPath);

  const categoryMap: { [key: string]: string } = {
    electronics: 'gadgetsImages',
    medicine: 'medicineImages',
    grocery: 'groceryImages',
    clothing: 'clothingImages',
    furniture: 'furnitureImages',
    books: 'books',
    beauty: 'makeupImages',
    snacks: 'groceryImages',
    bakery: 'bakeryImages',
    bags: 'bagsImages',
  };

  const imageDir = categoryMap[shopCategory] || `${shopCategory}Images`;

  return `/${imageDir}/${fileName}`;
}

async function migrateData() {
  try {
    console.log('=====================================');
    console.log('Starting EasyShop Database Migration');
    console.log('=====================================');

    console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connection successful.');

    const projectRoot = path.resolve(__dirname, '..');

    const jsonFile = path.join(projectRoot, '.db', 'db.json');

    console.log(`Reading data from ${jsonFile}`);

    const jsonData = await fs.readFile(jsonFile, 'utf8');

    const data = JSON.parse(jsonData);

    console.log(`Loaded ${data.products.length} products.`);

    console.log('Deleting existing products...');

    await Product.deleteMany({});

    console.log('Old products removed.');

    const usedIds = new Set<string>();

    const products = data.products.map((product: any) => {
      let paddedId = String(product.id).padStart(10, '0');

      while (usedIds.has(paddedId)) {
        paddedId = (parseInt(paddedId) + 1)
          .toString()
          .padStart(10, '0');
      }

      usedIds.add(paddedId);

      return {
        _id: paddedId,
        originalId: paddedId,
        ...product,
        image: product.image.map((img: string) =>
          getImagePath(img, product.shop_category)
        ),
      };
    });

    console.log('Inserting products...');

    await Product.insertMany(products);

    console.log(`${products.length} products inserted successfully.`);

    console.log('=====================================');
    console.log('Database Migration Completed');
    console.log('=====================================');
  } catch (error) {
    console.error('=====================================');
    console.error('Migration FAILED');
    console.error(error);
    console.error('=====================================');

    throw error;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error while closing MongoDB connection:', err);
    }
  }
}

migrateData()
  .then(() => {
    console.log('Migration Job Finished Successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration Job Failed.');
    console.error(err);
    process.exit(1);
  });
