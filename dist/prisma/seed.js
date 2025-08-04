"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const donor1 = await prisma.user.create({
        data: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1234567890',
            zipcode: '12345',
            userType: 'DONOR',
            description: 'Healthy mother with excellent nutrition habits',
            bloodGroup: 'O+',
            babyDeliveryDate: new Date('2024-01-15'),
            healthStyle: '["healthy_diet", "regular_exercise", "no_smoking", "prenatal_vitamins"]',
            ableToShareMedicalRecord: true,
        },
    });
    const buyer1 = await prisma.user.create({
        data: {
            name: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            phone: '+1987654321',
            zipcode: '54321',
            userType: 'BUYER',
        },
    });
    const admin1 = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@momsmilk.com',
            phone: '+1555000111',
            zipcode: '00000',
            userType: 'ADMIN',
        },
    });
    await prisma.baby.create({
        data: {
            name: 'Emma Johnson',
            gender: 'GIRL',
            deliveryDate: new Date('2024-01-15'),
            bloodGroup: 'O+',
            weight: 3.2,
            height: 50.5,
            userId: donor1.id,
        },
    });
    await prisma.baby.create({
        data: {
            name: 'James Johnson',
            gender: 'BOY',
            deliveryDate: new Date('2023-06-10'),
            bloodGroup: 'A+',
            weight: 3.8,
            height: 52.0,
            userId: donor1.id,
        },
    });
    await prisma.baby.create({
        data: {
            name: 'Olivia Wilson',
            gender: 'GIRL',
            deliveryDate: new Date('2024-02-20'),
            weight: 2.9,
            height: 48.0,
            userId: buyer1.id,
        },
    });
    console.log('Seed data created successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map