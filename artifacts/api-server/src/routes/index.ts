import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import santriRouter from "./santri";
import masterPoinRouter from "./masterPoin";
import riwayatPoinRouter from "./riwayatPoin";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(santriRouter);
router.use(masterPoinRouter);
router.use(riwayatPoinRouter);
router.use(dashboardRouter);
router.use(usersRouter);

export default router;
