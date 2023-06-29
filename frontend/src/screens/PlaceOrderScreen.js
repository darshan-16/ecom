import Axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';
import { TrackGoogleAnalyticsEventVal } from '../analytics';
import CouponList from '../components/CouponList';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const [avaredeamcoins] = useState(userInfo.rewardCoins);
  const [redeamcoins, setredeamcoin] = useState('0');
  const [name] = useState(userInfo.name);
  const [email] = useState(userInfo.email);

  const [couponcode, setcouponcode] = useState('');
  const [couponid, setcouponid] = useState('');
  const [couponvalue, setcouponvalue] = useState('0.00');
  var [usersUsed, setusersUsed] = useState('');
  var [remainingUsage, setremainingUsage] = useState('');
  const [modalShow, setModalShow] = useState(false);

  var rewardCoins = avaredeamcoins - redeamcoins;
  if (rewardCoins < 0) {
    rewardCoins = 'avalible only ' + avaredeamcoins + ' coins';
  }

  var iscoupon = true;
  var [isused, setisused] = useState('false');

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
  const carttotal = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
  var coupondis = carttotal - couponvalue;
  if (redeamcoins <= avaredeamcoins && cart.totalPrice > 0) {
    cart.totalPrice = coupondis - redeamcoins;
  }

  const CouponRemoveHandler = async () => {
    setcouponcode('');
    iscoupon = true;
    setisused('false');
    setcouponvalue('0.00');
  };

  const CouponOrderHandler = async () => {
    if (couponcode !== '') {
      try {
        const { data } = await Axios.get(
          `/api/coupons/code/${couponcode}`,
          {},
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        setisused('false');
        setusersUsed(data.usersUsed);
        setcouponid(data._id);
        setremainingUsage(data.remainingUsage);
        if (data.remainingUsage <= 0) {
          toast.warning('Coupon expired');
          iscoupon = false;
          setisused('false');
        } else if (data.purchaceAbove > carttotal) {
          const more = data.purchaceAbove - carttotal;
          toast.warning('Purchace $' + more + ' more');
          iscoupon = false;
          setisused('false');
        }
        if (data.category === 'percentage' && iscoupon === true) {
          setisused('true');
          setcouponvalue((carttotal * data.value) / 100);
          iscoupon = false;
        } else if (data.category === 'flat' && iscoupon === true) {
          setisused('true');
          setcouponvalue(data.value);
          iscoupon = false;
        }
        TrackGoogleAnalyticsEventVal(
          'User',
          'User Coupon Usage',
          `User ID: ${userInfo._id}`,
          data.code
        );
        TrackGoogleAnalyticsEventVal(
          'Coupon',
          'Coupon Usage Tries',
          `Coupon ID: ${data.code}`,
          1
        );
      } catch (err) {
        setcouponvalue(0);
        toast.warning('Coupon not avalible');
      }
    } else {
      toast.warning('Enter something in coupon');
      setcouponvalue(0);
    }
  };

  const placeOrderHandler = async () => {
    if (redeamcoins <= avaredeamcoins && cart.totalPrice > 0) {
      usersUsed = usersUsed + 1;
      remainingUsage = remainingUsage - 1;
      if (couponcode !== '' && isused === 'true') {
        try {
          dispatch({ type: 'CREATE_REQUEST' });
          await Axios.put(
            `/api/coupons/usedcoupon/${couponid}`,
            {
              couponid,
              usersUsed,
              remainingUsage,
            },
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );
        } catch (err) {
          toast.error(getError(err));
        }
      }
      try {
        dispatch({ type: 'CREATE_REQUEST' });

        const { data } = await Axios.post(
          '/api/orders',
          {
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            couponCode: couponcode,
            couponDiscount: couponvalue,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
            redeamCoins: redeamcoins,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        ctxDispatch({ type: 'CART_CLEAR' });
        dispatch({ type: 'CREATE_SUCCESS' });
        localStorage.removeItem('cartItems');
        TrackGoogleAnalyticsEventVal(
          'User',
          'Order',
          `User ID: ${userInfo._id}`,
          cart.totalPrice
        );
        navigate(`/order/${data.order._id}`);
      } catch (err) {
        dispatch({ type: 'CREATE_FAIL' });
        toast.error(getError(err));
      }
      try {
        dispatch({ type: 'UPDATE_REQUEST' });
        const { data } = await Axios.post(
          '/api/users/redeamcoins',
          {
            name,
            email,
            rewardCoins,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        dispatch({ type: 'UPDATE_SUCCESS' });
        ctxDispatch({ type: 'USER_SIGNIN', payload: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (err) {
        dispatch({ type: 'UPDATE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>₹{item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>₹{cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>₹{cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>₹{cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Avalible Coins</Col>
                    <Col>{rewardCoins}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Redeam coins</Col>
                    <Col>
                      <form>
                        <Form.Group controlId="name">
                          <Form.Control
                            value={redeamcoins}
                            onChange={(e) => setredeamcoin(e.target.value)}
                          />
                        </Form.Group>
                      </form>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Coupon</Col>
                    <Col>
                      <form>
                        <Form.Group controlId="name">
                          <Form.Control
                            value={couponcode}
                            onChange={(e) => setcouponcode(e.target.value)}
                            disabled={isused === 'true'}
                          />
                        </Form.Group>
                      </form>
                    </Col>
                    <Col>
                      {isused === 'false' ? (
                        <Button
                          type="button"
                          onClick={CouponOrderHandler}
                          disabled={cart.cartItems.length === 0}
                        >
                          Apply
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={CouponRemoveHandler}
                          disabled={cart.cartItems.length === 0}
                        >
                          Remove
                        </Button>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col></Col>
                    <Col>
                      <Link onClick={() => setModalShow(true)}>Coupons</Link>
                      <CouponList
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                      />
                    </Col>
                    <Col></Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Coupon Discount </strong>
                    </Col>
                    <Col>${round2(couponvalue)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
