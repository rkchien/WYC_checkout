import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api.js';

import '../css/form.css'

const CheckoutForm = () => {
  const [boats, setBoats] = useState([]);
  const [ratings, setRatings] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    api.get('/api/boats')
      .then(response => setBoats(response.data))
      .catch(error => console.error('Error fetching boats:', error));

    api.get(`/ratings?wycnumber=${user.WYCNumber}`)
      .then(response => setRatings(response.data))
      .catch(error => console.error('Error fetching ratings:', error));
    

  }, [user]);

  const [formData, setFormData] = useState({
    WYCNumber: 0,
    Boat: '',
    RelevantRating: 0,
    ChiefId: '',
    Destination: '',
    TimeDeparture: new Date().toISOString().slice(0, 16),
    ExpectedReturn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    Crew: [0],
  });
  
  useEffect(() => {
    if (user.WYCNumber) { // Ensure user data is available
      setFormData((prevData) => ({
        ...prevData,
        'WYCNumber':user.WYCNumber,
      }))
    }
  }, [user.WYCNumber]); // Runs when user.WYCNumber changes

  const handleInputChange = (e) => {
    const { name, value } = e.target; 
    
    // For select elements, handle the value differently
    if (e.target.tagName === 'SELECT') {
      const selectedIndex = e.target.selectedIndex;
      const selectedOption = e.target.options[selectedIndex];
      setFormData({ ...formData, [name]: selectedOption.value });
    } else {
      setFormData({ ...formData, [name]: value });
    };
  }

  const addCrewMember = (id) => {
    setFormData({ ...formData, crew: [...formData.crew, id] });
  };

  const addGuest = (guest) => {
    setFormData({ ...formData, guests: [...formData.guests, guest] });
  };

  const handleSubmit = () => {
    console.log('Submitting form:', formData);
    
    api.post(`/api/submit-form`, formData)
      .then(response => {
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
      window.location.href = '/';
  };

  return (
    <div>
      <div className="header">
      <h1>WYC Boat Checkout Form</h1>
      <a href="/" >Return to the main page</a>
      </div>
      <form id="main-form">
        <h2>Boat Selection:</h2>
        <p>Select the class of boat you are checking out and then select the applicable rating you have for this boat and the current weather conditions</p>
        <p>If one of your ratings is not showing up, reach out to the Chief/Ratings Examiner/Instructor to get it updated</p>
        <div className="formEntry">
          <label htmlFor="boat">Boat Class: </label>
          <select name="Boat" id="Boat" value={formData.Boat} onChange={handleInputChange}>
          <option value="">Select a boat</option>
          {boats.map((boat) => (
            <option key={boat._index} value={boat._index}>{boat.type}</option>
          ))}
        </select>
        </div>
        {formData.Boat && (
          <div className="formEntry">
            <label htmlFor="rating">Relevant Rating: </label>
            <select name="RelevantRating" id="RelevantRating" value={formData.RelevantRating} onChange={handleInputChange}>
              <option value="">Select a rating</option>
              {ratings.map((rating) => (
                <option key={rating._index} value={rating._index}>{rating.text}</option>
              ))}
            </select>
          </div>
        )}
        {(formData.RelevantRating!==0) && (
          <div>
            <h3>Special Permissions</h3>
            <p>If you are taking out a boat during a supervised sailing event or lesson under an Instructor, a Chief, or a Ratings Examiner, enter their ID number to gain special checkout permissions.</p>
            <div className="formEntry">
              <label htmlFor="ChiefId">Superviser ID: </label>
              <input type="text" id="ChiefId" name="ChiefId" value={formData.ChiefId} onChange={handleInputChange}/>
            </div>
            <h2>Destination:</h2>
            <p>Novice and Intermediate - Union Bay only!</p>
            <div className="formEntry" id="radio-buttons">
              <input type="radio" id="ub" name="Destination" value="Union Bay" onChange={handleInputChange}/><label htmlFor="ub">Union Bay</label>
              <input type="radio" id="ssp" name="Destination" value="Sail Sand Point" onChange={handleInputChange}/><label htmlFor="ssp">Sail Sand Point</label>
              <input type="radio" id="pb" name="Destination" value="Portage Bay" onChange={handleInputChange}/><label htmlFor="pb">Portage Bay</label>
              <input type="radio" id="lu" name="Destination" value="Lake Union" onChange={handleInputChange}/><label htmlFor="lu">Lake Union</label>
              <input type="radio" id="nlw" name="Destination" value="North Lake Washington" onChange={handleInputChange}/><label htmlFor="nlw">Lake Washington - North of 520 Bridge</label>
              <input type="radio" id="slw" name="Destination" value="South Lake Washington" onChange={handleInputChange}/><label htmlFor="slw">Lake Washington - South of 520 bridge</label>
              <input type="radio" id="other" name="Destination" value="Other" onChange={handleInputChange}/><label htmlFor="other">Other</label>
            </div>
            <div className="formEntry">
              <label htmlFor="otherDest">If other: </label>
              <input type="text" name="otherDest" id="otherDest" value={formData.otherDest} onChange={handleInputChange}/>
            </div>
        </div>
        )}
        {formData.Destination && (
          <div>
          <h2>Time</h2>
          <div className="formEntry">
            <label htmlFor="TimeDeparture">Departure Time: </label>
            <input type="datetime-local" name="TimeDeparture" id="TimeDeparture" value={formData.TimeDeparture} onChange={handleInputChange} required/>
          </div>
          <div className="formEntry">
            <label htmlFor="ExpectedReturn">Estimated Return Time: </label>
            <input type="datetime-local" name="ExpectedReturn" id="ExpectedReturn" value={formData.ExpectedReturn} onChange={handleInputChange}/>
          </div>
          {/*
          <h2>Crew/Guests with WYC Numbers:</h2>
          <p>If the WAC is open, have all WYC members swipe-in at the window.</p>
          <div className="formEntry">
            <input type="text" id="crew" name="crew" onBlur={(e) => addCrewMember(e.target.value)}/>
            <button type="button" onClick={() => addCrewMember(document.getElementById('crew').value)}>Add Crew</button>
            <table id="crewTable" className="crewTable">
              <thead>
                <tr>
                  <th>WYC ID#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Expiration</th>
                </tr>
              </thead>
              <tbody>
                {formData.crew.map((crew, index) => (
                  <tr key={index}>
                    <td>{crew}</td>
                    <td>Name</td>
                    <td>Status</td>
                    <td>Expiration</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          */}
          <div className="formEntry" id="submit">
            <button type="button" onClick={handleSubmit}>Submit Form</button>
          </div>
          </div> 
        )}
      </form>
      </div>
  );

  function updateGuest(index, field, value) {
    const newGuests = [...formData.guests];
    newGuests[index][field] = value;
    setFormData({ ...formData, guests: newGuests });
  }
};

export default CheckoutForm;
