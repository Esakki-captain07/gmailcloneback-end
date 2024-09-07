import { Router } from "express"
import userService from "../service/userService.js"

const routes = Router()

routes.post('/create',userService.createUser)
routes.post('/login',userService.loginUser)

export default routes