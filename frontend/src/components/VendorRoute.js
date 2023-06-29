import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

export default function Vendor({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && (userInfo.isVendor || userInfo.isAdmin) ? (
    children
  ) : (
    <Navigate to="/signin" />
  );
}
