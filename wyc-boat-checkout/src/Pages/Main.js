import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/main.css'

function Main() {
  const [user, setUser] = useState({ first: '', last: '', WYCNumber: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkedOutBoats, setCheckedOutBoats] = useState([]);
  const [checkedInBoats, setCheckedInBoats] = useState([]);
  const [checkedInView, setCheckedInView] = useState('table'); // 'card' or 'table'
  const [checkedOutView, setCheckedOutView] = useState('card'); // 'card' or 'table'

  useEffect(() => {
    // Fetch user info
    axios.get('http://localhost:3000/api/user')
      .then(response => {
        if (response.data.loggedIn) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        }
      });

    // Fetch checked-out boats
    axios.get('http://localhost:3000/api/checkouts?status=out')
      .then(response => {
        setCheckedOutBoats(response.data);
      });

    // Fetch checked-in boats
    axios.get('http://localhost:3000/api/checkouts?status=in')
      .then(response => {
        setCheckedInBoats(response.data);
      });
  }, []);

  const switchView = (type,newView) => {
    if (type==='in') {
      setCheckedInView(newView)
    } else {
      setCheckedOutView(newView)
    }
  };


  return (
    <div>
    <header>
      <link rel="icon" type="image/x-icon" href="/images/wyc-logo.svg" />
      <link rel="stylesheet" href="css/wyc.css" />
      <link rel="stylesheet" href="css/style.css" />
      <title>WYC Boat Checkouts</title>
    </header>
    <div className="header">
      <h1>WYC Boat Checkouts</h1>
      
    </div>
        {isLoggedIn ? (
          <>
            <div className="user-info">
              <p>Hello {user.first} {user.last}!</p>
              <a href="/checkout">Check out a boat!</a><br />
              <a href="/logout">Logout</a><br />
            </div>
          </>
        ) : (
          <div className="sign-in-reminder">
            <p>Remember to <a href="/login">log in</a> before checking out a boat!</p>
          </div>
        )}
<div className="main-container">
      <body>
        <h2>Boats actively checked out</h2>
        <div className="view-switcher">
          <button onClick={() => switchView('out','table')}>Table View</button>
          <button onClick={() => switchView('out','card')}>Card View</button>
        </div>
        {checkedOutView === 'table' ? (
          <div id="checked-out-table">
            <Table data={checkedOutBoats} status={"Out"}/>
          </div>
        ) : (
          <div id="checked-out-card" className="cards">
            {checkedOutBoats.map(checkedOutBoats => (
              <Card key={checkedOutBoats._index} data={checkedOutBoats} user = {user} />
            ))}
          </div>
        )}
        
        <h2>Boats recently back in</h2>
        <div className="view-switcher">
          <button onClick={() => switchView('in','table')}>Table View</button>
          <button onClick={() => switchView('in','card')}>Card View</button>
        </div>
        {checkedInView === 'table' ? (
          <div id="checked-in-table">
            <Table data={checkedInBoats} status="In"/>
          </div>
        ) : (
          <div id="checked-in-card" className="cards">
            {checkedInBoats.map(checkout => (
              <Card key={checkout._index} data={checkout} user = {user}/>
            ))}
          </div>
        )}
      </body>
    </div>
    </div>
  );
}

const Table = ({data, status}) => {
  return (
    <table className='checkout-table'>
      <thead>
        <tr>
          <th>Boat</th>
          <th>Member</th>
          <th>Expected Return</th>
          {status === "In" && (
          <th>Actual Return</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((checkout, index) => (
          <tr key={index}>
            <td>{checkout.BoatName}</td>
            <td>{checkout.MemberName}</td>
            <td>{checkout.FormattedExpectedReturn}</td>
            {checkout.Status === "In" && (
            <td>{checkout.FormattedTimeReturn}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const handleCheckIn = (index) => {
  axios.post(`http://localhost:3000/api/check-in`, {index})
    .then(response => {
      console.log('Response:', response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
    window.location.reload();
};

const Card = ({ data, user }) => {
  return (
    <div className="checkout-card">
      <div className="cardMemberName">{data.MemberName}</div>
      <div className="cardBoatName">{data.BoatName}</div>
      <div className="cardDestination">{data.Destination}</div>
      <div className="cardTime">{data.FormattedTimeDeparture}
      {data.Status === "In" && (
        <>
        - {data.FormattedTimeReturn}
        </>
      )}
      </div>
      <div className="cardRating">{data.RatingName}</div>
      {data.Status === "Out" && (
        <>
        <div className="cardStatus">Not Yet Checked In</div>
        <div className="cardEstimatedTimeReturn">ETA {data.FormattedExpectedReturn}</div>
        </>
      )}
  
      {data.Status === "Out" && data.WYCNumber === user.WYCNumber && (
        <>
        <div className="cardCheckIN"><button onClick={() => handleCheckIn(data._index)}>Check In</button></div>
        </>
      )}
    </div>
  );
};

export default Main;
