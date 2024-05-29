import { Router } from "express";
import WalletApi from "../wallet/wallet.api";

const router: Router = Router();
router.use("/wallet", WalletApi);

export default router;
