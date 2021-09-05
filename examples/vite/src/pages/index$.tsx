import React from 'react';
import { Link } from 'react-router-dom';

function Index() {
  return (
    <>
      <h1>Index</h1>
      <Link to="/user">user list</Link>
    </>
  );
}

export default Index;
