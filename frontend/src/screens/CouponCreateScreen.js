import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};
export default function CouponCreateScreen() {
  const navigate = useNavigate();

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ error, loadingUpdate }, dispatch] = useReducer(reducer, {
    error: '',
  });

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState('');
  const [purchaceAbove, setPurchaceAbove] = useState('');
  const [remainingUsage, setRemainingUsage] = useState('');
  const handleRadioChange = (event) => {
    setCategory(event.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        `/api/coupons/create`,
        {
          name,
          code,
          category,
          value,
          purchaceAbove,
          remainingUsage,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Coupon created successfully');
      navigate('/admin/coupon');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return (
    <Container className="small-container">
      <Helmet>
        <title>Create Coupon</title>
      </Helmet>
      <h1>Create Coupon</h1>

      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="code">
            <Form.Label>Code</Form.Label>
            <Form.Control
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Check
              className="mb-3"
              type="radio"
              id="percentage"
              label="Percentage"
              name="category"
              value="percentage"
              checked={category === 'percentage'}
              onChange={handleRadioChange}
            />
            <Form.Check
              className="mb-3"
              type="radio"
              id="flat"
              label="Flat"
              name="category"
              value="flat"
              checked={category === 'flat'}
              onChange={handleRadioChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="value">
            <Form.Label>Coupon Value</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="purchaceAbove">
            <Form.Label>Purchace Above</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={purchaceAbove}
              onChange={(e) => setPurchaceAbove(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="remainingUsage">
            <Form.Label>Remaining Usage</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={remainingUsage}
              onChange={(e) => setRemainingUsage(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Create
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
