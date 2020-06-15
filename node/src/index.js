import React, { useState, useEffect, Fragment } from 'react';
import '@babel/polyfill'
import { Modal, Button } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import './index.css'

function App() {
    const [apiResponse, setApiResponse] = useState([]);
    const [errorMessage, seterrorMessage] = useState("");
    const [countryData, setCountryData] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedIndustryGdp, setSelectedIndustryGdp] = useState("");
    const [selectedAgricultureGdp, setSelectedAgricultureGdp] = useState("");
    const [selectedServicesGdp, setSelectedServicesGdp] = useState("");
    const [show, setShow] = useState(false);
    const [showError, setError] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleCloseDelete = () => setShowDelete(false);
    const handleShowDelete = () => setShowDelete(true);


    useEffect(() => {
        async function fetchData() {
            let _countries = localStorage.getItem('countries');
            if (_countries === null) {
                seterrorMessage("")
                fetch("/countries")
                    .then(response => {
                        if (!response.ok) throw new Error(response.status);
                        else return response.json();
                    })
                    .then(data => {
                        setApiResponse(data.countries)
                        localStorage.setItem('countries', JSON.stringify(data.countries));
                    })
                    .catch((error) => {
                        console.log('error: ' + error);
                        seterrorMessage("Error in getting country data");
                    });;
            }
            else {
                setApiResponse(JSON.parse(_countries))
            }
        }
        fetchData();
    }, []);

    function handleCountryChange(e) {
        let country = e.target.value;
        if (country !== null && country !== "") {
            setSelectedCountry(country);
            setCountryData([])
            fetchCountryData(country)
        } else {
            setCountryData([])
            setSelectedCountry("");

        }
    }

    function fetchCountryData(country) {
        fetch(`/data?country=${country}`)
            .then(response => response.json())
            .then(responseData => {
                setCountryData(responseData.data)
            });
    }


    return (
        <Fragment>
            <div className="App">
                <header className="App-header">
                    <div className="form-group row mt-5">
                        <select onChange={(e) => { handleCountryChange(e) }} value={selectedCountry}>
                            <option key={"select"} value={""}>Select Country</option>
                            {apiResponse.map(country => (
                                <option key={country} value={country}>{country}</option>))}
                        </select>
                    </div>

                    <table className="table table-striped col-md-10">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Industry Gdp</th>
                                <th>Agriculture Gdp</th>
                                <th>Services Gdp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {"industry_percent_of_gdp" in countryData || "agriculture_percent_of_gdp" in countryData || "services_percent_of_gdp" in countryData ?
                                Object.keys(countryData[Object.keys(countryData)[0]]).map(key => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{"industry_percent_of_gdp" in countryData ? countryData["industry_percent_of_gdp"][key] || "N/A" : "N/A"}</td>
                                        <td>{"agriculture_percent_of_gdp" in countryData ? countryData["agriculture_percent_of_gdp"][key] || "N/A" : "N/A"}</td>
                                        <td>{"services_percent_of_gdp" in countryData ? countryData["services_percent_of_gdp"][key] || "N/A" : "N/A"}</td>
                                    </tr>
                                )) : null}
                        </tbody>
                    </table>

                </header>
            </div>
        </Fragment>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('reactContainer')
);