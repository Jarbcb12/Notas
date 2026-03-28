const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Profesor123*", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "profe@demo.com" },
    update: {},
    create: {
      fullName: "Profesor Demo",
      email: "profe@demo.com",
      passwordHash,
      groups: {
        create: {
          name: "Fisica 1 - Grupo B",
          description: "Grupo de ejemplo para pruebas",
          students: {
            create: [
              { fullName: "Ana Maria Torres", identification: "10001" },
              { fullName: "Carlos Perez", identification: "10002" },
              { fullName: "Laura Medina", identification: "10003" }
            ]
          },
          evaluations: {
            create: [
              { name: "Quiz 1", percentage: 20, type: "QUIZ", order: 1 },
              { name: "Tarea", percentage: 30, type: "HOMEWORK", order: 2 },
              { name: "Parcial", percentage: 50, type: "EXAM", order: 3 }
            ]
          }
        }
      }
    },
    include: {
      groups: {
        include: {
          students: true,
          evaluations: true
        }
      }
    }
  });

  const group = teacher.groups[0];
  const [quiz, homework, exam] = group.evaluations;
  const [ana, carlos, laura] = group.students;

  const grades = [
    { studentId: ana.id, evaluationId: quiz.id, value: 4.5 },
    { studentId: ana.id, evaluationId: homework.id, value: 4.2 },
    { studentId: ana.id, evaluationId: exam.id, value: 4.7 },
    { studentId: carlos.id, evaluationId: quiz.id, value: 3.2 },
    { studentId: carlos.id, evaluationId: homework.id, value: 3.8 },
    { studentId: carlos.id, evaluationId: exam.id, value: 2.9 },
    { studentId: laura.id, evaluationId: quiz.id, value: 4.9 },
    { studentId: laura.id, evaluationId: homework.id, value: 4.6 },
    { studentId: laura.id, evaluationId: exam.id, value: 4.8 }
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: {
        studentId_evaluationId: {
          studentId: grade.studentId,
          evaluationId: grade.evaluationId
        }
      },
      update: { value: grade.value },
      create: grade
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
