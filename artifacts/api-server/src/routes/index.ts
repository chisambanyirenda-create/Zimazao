import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import listingsRouter from "./listings";
import ordersRouter from "./orders";
import diseaseRouter from "./disease";
import pricesRouter from "./prices";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(listingsRouter);
router.use(ordersRouter);
router.use(diseaseRouter);
router.use(pricesRouter);
router.use(dashboardRouter);

export default router;
