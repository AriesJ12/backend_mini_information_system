import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Starting seed...');

    /**
     * DELETE ORDER (respect FK constraints)
     * We are NOT touching reservations or grades per instruction,
     * but still deleting them defensively in case they exist.
     */
    await prisma.grade.deleteMany();
    await prisma.subjectReservation.deleteMany();
    await prisma.student.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    /**
     * ADMIN USER
     */
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: adminPassword,
        role: Role.admin,
      },
    });

    console.log('Credentials → admin@example.com / Admin123!');

    /**
     * COURSES (4)
     */
    await prisma.course.createMany({
      data: [
        {
          code: 'BSCS',
          name: 'Bachelor of Science in Computer Science',
          description: 'Computer science fundamentals and software development',
        },
        {
          code: 'BSBA',
          name: 'Bachelor of Science in Business Administration',
          description: 'Business management and administration',
        },
        {
          code: 'BSME',
          name: 'Bachelor of Science in Mechanical Engineering',
          description: 'Mechanical systems and engineering principles',
        },
        {
          code: 'BSPY',
          name: 'Bachelor of Science in Psychology',
          description: 'Behavioral and cognitive psychology',
        },
      ],
    });

    const courses = await prisma.course.findMany();

    /**
     * SUBJECTS (10 total, valid per-course codes)
     */
    await prisma.subject.createMany({
      data: [
        // BSCS
        { courseId: courses[0].id, code: 'CS101', title: 'Introduction to Programming', units: 3 },
        { courseId: courses[0].id, code: 'CS102', title: 'Data Structures', units: 3 },
        { courseId: courses[0].id, code: 'CS103', title: 'Databases', units: 3 },

        // BSBA
        { courseId: courses[1].id, code: 'BA101', title: 'Principles of Management', units: 3 },
        { courseId: courses[1].id, code: 'BA102', title: 'Financial Accounting', units: 3 },

        // BSME
        { courseId: courses[2].id, code: 'ME101', title: 'Engineering Mathematics', units: 3 },
        { courseId: courses[2].id, code: 'ME102', title: 'Thermodynamics', units: 3 },
        { courseId: courses[2].id, code: 'ME103', title: 'Fluid Mechanics', units: 3 },

        // BSPY
        { courseId: courses[3].id, code: 'PY101', title: 'General Psychology', units: 3 },
        { courseId: courses[3].id, code: 'PY102', title: 'Cognitive Psychology', units: 3 },
      ],
    });

    /**
     * STUDENTS (50)
     */
    const studentsData = Array.from({ length: 50 }).map((_, index) => {
      const course = courses[index % courses.length];
      const studentNo = `2024-${String(index + 1).padStart(4, '0')}`;

      return {
        studentNo,
        firstName: `Student${index + 1}`,
        lastName: 'Test',
        email: `student${index + 1}@example.com`,
        birthDate: new Date(2000, index % 12, (index % 28) + 1),
        courseId: course.id,
      };
    });

    await prisma.student.createMany({
      data: studentsData,
    });

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })