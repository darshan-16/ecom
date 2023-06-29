import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Table from 'react-bootstrap/esm/Table';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH1_REQUEST':
      return { ...state, loading: true };
    case 'FETCH1_SUCCESS':
      return {
        ...state,
        loading: false,
      };
    case 'FETCH1_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function OrderVenforListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [productIDs, setproductIDs] = useState([]);
  const [orders, setorders] = useState([]);
  const createduserid = userInfo._id;
  const [{ loading, error, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setorders(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }

      try {
        dispatch({ type: 'FETCH1_REQUEST' });
        const { data } = await axios.get(
          `/api/products/vendor/order?createduserid=${createduserid}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setproductIDs(data.products);
        dispatch({ type: 'FETCH1_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH1_FAIL',
          payload: getError(err),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete, createduserid]);

  const productidlist = [];
  productIDs.forEach((product) => {
    productidlist.push(product._id);
  });
  console.log(productidlist);
  const orderlist = [];
  orders.forEach((order) => {
    order.orderItems.forEach((products) => {
      productidlist.forEach((item1) => {
        if (products.product === item1) {
          orderlist.push(
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user ? order.user.name : 'DELETED USER'}</td>
              <td>{order.createdAt.substring(0, 10)}</td>
              <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>

              <td>{products.name}</td>
              <td>{products.quantity}</td>
              <td>{products.price}</td>
              <td>{products.price * products.quantity}</td>
              <td>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => {
                    navigate(`/order/${order._id}`);
                  }}
                >
                  Details
                </Button>
              </td>
            </tr>
          );
        }
      });
    });
  });
  console.log(orderlist);

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table className="table" responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>PAID</th>
              <th>PRODUCT NAME</th>
              <th>PRODUCT QUANTITY</th>
              <th>PRODUCT PRICE</th>
              <th>TOTAL</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>{orderlist}</tbody>
        </Table>
      )}
    </div>
  );
}
