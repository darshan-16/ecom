import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Store } from '../Store';
import LoadingBox from './LoadingBox';
import MessageBox from './MessageBox';
import Table from 'react-bootstrap/esm/Table';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        coupons: action.payload.coupons,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};
export default function CouponList(props) {
  const [{ coupons, loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;
  useEffect(() => {
    dispatch({ type: 'FETCH_REQUEST' });
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/coupons/list', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        console.log(data);

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, [userInfo]);

  return (
    <>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Coupons
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="grid-example">
            <Table className="table" responsive>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>Code</th>
                  <th>CATEGORY</th>
                  <th>Value</th>
                  <th>Purchace Above</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td>{coupon.name}</td>
                    <td>{coupon.code}</td>
                    <td>{coupon.category}</td>
                    <td>{coupon.value}</td>
                    <td>{coupon.purchaceAbove}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
