import * as React from 'react';
import { Link, useParams } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <h1>UserDetail {id}</h1>
      <Link to="/user">user list</Link>
    </>
  );
}

export default UserDetail;
