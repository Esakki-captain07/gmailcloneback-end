import { Router } from "express";
import userRouter from './userRouter.js'
import emailRouter from './emailRouter.js'

const routes = Router()

routes.get('/',(req,res)=>{
    res.send(`<div>
        <h1>Welcome to Backend of reset password</h1>
        <p>Please refer postman collections for API endpoints</p>
    </div>`)
})

routes.use('/user',userRouter)
routes.use('/email',emailRouter)

export default routes