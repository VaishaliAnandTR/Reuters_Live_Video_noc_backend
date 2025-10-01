import { Router } from 'express';
import { UserController } from '../Controller/index';
import { ROUTES_URL } from '../Util/Constants';
const router = Router();
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get(ROUTES_URL.GET_USER_LIST, UserController.userList);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user
 */
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send({ id: userId, name: 'Alice' });
});

export default router;
