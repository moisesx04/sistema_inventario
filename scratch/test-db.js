const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log('Probando conexión y creación...');
    const product = await prisma.product.create({
      data: {
        name: 'Producto Test',
        sku: 'TEST-' + Date.now(),
        price: 100,
        stock: 10
      }
    });
    console.log('✅ Producto creado con éxito:', product);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
