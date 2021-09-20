import * as React from 'react';
import { Link } from 'react-router-dom';

function User() {
  return (
    <>
      <h1>User</h1>
      <Link to="/">index</Link>
      <ul>
        <li>
          <Link to="/user/1">user 1</Link>
        </li>
        <li>
          <Link to="/user/2">user 2</Link>
        </li>
      </ul>
    </>
  );
}

export default User;
