import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Coupon from '../models/couponModel.js';
import { isAuth, isAdmin } from '../utils.js';

const CouponRouter = express.Router();

CouponRouter.get('/', async (req, res) => {
  const coupons = await Coupon.find();
  res.send(coupons);
});

CouponRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newCoupon = new Coupon({
      name: 'sample name ' + Date.now(),
      code: 'generated' + Date.now(),
      category: 'persentage',
      value: 15,
      purchaceAbove: 200,
      remainingUsage: 5,
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
      await coupon.deleteMany();
      res.send({ message: 'coupon Deleted' });
    } else {
      res.status(404).send({ message: 'coupon Not Found' });
    }
  })
);

// CouponRouter.post(
//   '/:id/reviews',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Coupon.findById(productId);
//     if (product) {
//       if (product.reviews.find((x) => x.name === req.user.name)) {
//         return res
//           .status(400)
//           .send({ message: 'You already submitted a review' });
//       }

//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         comment: req.body.comment,
//       };
//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating =
//         product.reviews.reduce((a, c) => c.rating + a, 0) /
//         product.reviews.length;
//       const updatedProduct = await product.save();
//       res.status(201).send({
//         message: 'Review Created',
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: product.numReviews,
//         rating: product.rating,
//       });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

const PAGE_SIZE = 3;

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

// CouponRouter.get(
//   '/search',
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const pageSize = query.pageSize || PAGE_SIZE;
//     const page = query.page || 1;
//     const category = query.category || '';
//     const price = query.price || '';
//     const rating = query.rating || '';
//     const order = query.order || '';
//     const searchQuery = query.query || '';

//     const queryFilter =
//       searchQuery && searchQuery !== 'all'
//         ? {
//             name: {
//               $regex: searchQuery,
//               $options: 'i',
//             },
//           }
//         : {};
//     const categoryFilter = category && category !== 'all' ? { category } : {};
//     const ratingFilter =
//       rating && rating !== 'all'
//         ? {
//             rating: {
//               $gte: Number(rating),
//             },
//           }
//         : {};
//     const priceFilter =
//       price && price !== 'all'
//         ? {
//             // 1-50
//             price: {
//               $gte: Number(price.split('-')[0]),
//               $lte: Number(price.split('-')[1]),
//             },
//           }
//         : {};
//     const sortOrder =
//       order === 'featured'
//         ? { featured: -1 }
//         : order === 'lowest'
//         ? { price: 1 }
//         : order === 'highest'
//         ? { price: -1 }
//         : order === 'toprated'
//         ? { rating: -1 }
//         : order === 'newest'
//         ? { createdAt: -1 }
//         : { _id: -1 };

//     const products = await Product.find({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     })
//       .sort(sortOrder)
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);

//     const countProducts = await Product.countDocuments({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     });
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

// CouponRouter.get(
//   '/categories',
//   expressAsyncHandler(async (req, res) => {
//     const categories = await Product.find().distinct('category');
//     res.send(categories);
//   })
// );

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
