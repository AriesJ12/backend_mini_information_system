Setup neon
Setup env

npm install
npx prisma migrate
npx prisma generate
npx prisma db seed


# WARNING 
RUNNING e2e TESTS MAY DELETE SOME DATA IN THE CURRENT DATABASE THAT IS BEING USED, make sure to save and your database is in dev mode

# Assumptions
- For the sake of speed, I am assuming this backend api is only dedicated to ONE FRONTEND. This is why I used Prisma generated DTO(Data transfer object), it does not returns very clear message when an input is wrong. I will be assuming that is the responsibility of the frontend to show clear message to the user

- I am also assuming in this scenario that the backend will be used in good faith. I was developing a global exception filter for the sql queries but I noticed that I might ran out of time. Some edge cases are bound to fail or return incomplete message error, such as P6009(response limit exceeded), and P5011 (too many connection request on the database)

- I used MUI as a stand-in for a production design system. This allowed me to spend more time on state management, form handling, and overall UX, which I assumed were higher-priority evaluation areas for this exercise.

- The UI assumes that the backend is 100% running, that means it might shows incomplete errors such as throwing invalid credentials when the server is acutally down

# Validations
