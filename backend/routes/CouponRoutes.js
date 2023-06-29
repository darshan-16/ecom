import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Coupon from '../models/couponModel.js';
import { isAuth, isAdmin } from '../utils.js';

const CouponRouter = express.Router();

CouponRouter.get('/', async (req, res) => {
  const coupons = await Coupon.find();
  res.send(coupons);
});

CouponRouter.get(
  '/list',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const coupons = await Coupon.find();
    res.send({ coupons });
  })
);

CouponRouter.post(
  '/create',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newCoupon = new Coupon({
      name: req.body.name,
      code: req.body.code,
      category: req.body.category,
      value: req.body.value,
      purchaceAbove: req.body.purchaceAbove,
      remainingUsage: req.body.remainingUsage,
      usersUsed: 0,
    });
    const product = await newCoupon.save();
    res.send({ message: 'Coupon Created', product });
  })
);

CouponRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      coupon.name = req.body.name;
      coupon.code = req.body.code;
      coupon.category = req.body.category;
      coupon.value = req.body.value;
      coupon.purchaceAbove = req.body.purchaceAbove;
      coupon.remainingUsage = req.body.remainingUsage;
      await coupon.save();
      res.send({ message: 'coupon Updated' });
    } else {
      res.status(404).send({ message: 'coupon Not Found' });
    }
  })
);

CouponRouter.put(
  '/usedcoupon/:id',
  expressAsyncHandler(async (req, res) => {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      coupon.usersUsed = req.body.usersUsed;
      coupon.remainingUsage = req.body.remainingUsage;
      await coupon.save();
      res.send({ message: 'coupon Updated' });
    } else {
      res.status(404).send({ message: 'coupon Not Found' });
    }
  })
);

CouponRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await Coupon.deleteMany(coupon);
      res.send({ message: 'coupon Deleted' });
    } else {
      res.status(404).send({ message: 'coupon Not Found' });
    }
  })
);

const PAGE_SIZE = 10;

CouponRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const coupons = await Coupon.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countcoupons = await Coupon.countDocuments();
    res.send({
      coupons,
      countcoupons,
      page,
      pages: Math.ceil(countcoupons / pageSize),
    });
  })
);

CouponRouter.get('/code/:couponcode', async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.couponcode });
  if (coupon) {
    res.send(coupon);
  } else {
    res.status(404).send({ message: 'Coupon Not Found' });
  }
});

CouponRouter.get('/:id', async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.send(coupon);
  } else {
    res.status(404).send({ message: 'coupon Not Found' });
  }
});

export default CouponRouter;
