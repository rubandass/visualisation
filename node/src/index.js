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
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(responseData => {
                setCountryData(responseData.country_data)
            });
    }

    function editCountry(year) {
        setSelectedYear(year);
        setSelectedIndustryGdp(countryData["industry_percent_of_gdp"][year] || "");
        setSelectedAgricultureGdp(countryData["agriculture_percent_of_gdp"][year] || "");
        setSelectedServicesGdp(countryData["services_percent_of_gdp"][year] || "");
        setError(false)
        handleShow();
    }

    function submitFormHandler() {
        if (validate(selectedIndustryGdp) || validate(selectedAgricultureGdp) || validate(selectedServicesGdp)) {
            setError(true)
        } else {
            let data = { 'country': selectedCountry, 'year': selectedYear, 'industry': selectedIndustryGdp, 'agriculture': selectedAgricultureGdp, 'services': selectedServicesGdp }
            fetch(`/data/update/`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(data),
            })
                .then(response => {
                    if (!response.ok) throw new Error(response.status);
                    else return response.json();
                })
                .then(data => {
                    fetchCountryData(selectedCountry);
                    handleClose();
                });
        }
    }

    function deleteCountryHandler() {
        handleShowDelete()
    }

    function submitDeleteFormHandler() {
        let data = { 'country': selectedCountry }
        fetch('/data', {
            headers: { 'Content-Type': 'application/json' },
            method: 'DELETE',
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) throw new Error(response.status);
            else return response.json();
        })
            .then(data => {
                localStorage.removeItem('countries')
                fetch("/countries")
                    .then(response => response.json())
                    .then(data => {
                        setApiResponse(data.countries);
                        setSelectedCountry("");
                        setCountryData([]);
                        handleCloseDelete();
                    });
            });
    }

    function validate(gdpValue) {
        return isNaN(gdpValue) || gdpValue > 100
    }
    return (
        <Fragment>
            <div className="App">
                <header className="App-header">
                    <div className="form-group row">
                        <select onChange={(e) => { handleCountryChange(e) }} value={selectedCountry}>
                            <option key={"select"} value={""}>Select Country</option>
                            {apiResponse.map(country => (
                                <option key={country} value={country}>{country}</option>))}
                        </select>

                        <input type="button" className="ml-5 btn btn-danger" value="Delete" onClick={deleteCountryHandler} disabled={!selectedCountry}/>
                    </div>
                    {errorMessage ? <p className={"text-danger"}>{errorMessage}</p> : null}

                    <table className="table table-striped col-md-10">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Industry Gdp(%)</th>
                                <th>Agriculture Gdp(%)</th>
                                <th>Services Gdp(%)</th>
                                <th>Edit</th>
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
                                        <td><input type="button" className="btn  btn-warning" value="Edit" onClick={() => { editCountry(key) }} /></td>
                                    </tr>
                                )) : null}
                        </tbody>
                    </table>

                </header>
            </div>
            {selectedYear ? (
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Country Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="countryName" className="col-sm-4 col-form-label">Country Name</label>
                                <div className="col-sm-8">
                                    <input type="text" readOnly className="form-control-plaintext" name="country" id="countryName" value={selectedCountry} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="countryYear" className="col-sm-4 col-form-label">Year</label>
                                <div className="col-sm-8">
                                    <input type="text" readOnly className="form-control-plaintext" name="country" id="countryYear" value={selectedYear} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="industry" className="col-sm-4 col-form-label">Industry gdp</label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="industry" name="industryGdp" onChange={(e) => { setSelectedIndustryGdp(e.target.value) }} value={selectedIndustryGdp} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="agriculture" className="col-sm-4 col-form-label">Agriculture gdp</label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="agriculture" name="agricultureGdp" onChange={(e) => setSelectedAgricultureGdp(e.target.value)} value={selectedAgricultureGdp} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="services" className="col-sm-4 col-form-label">Services gdp</label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="services" name="servicesGdp" onChange={(e) => setSelectedServicesGdp(e.target.value)} value={selectedServicesGdp} />
                                </div>
                            </div>
                            {showError ? (<div className="form-group row">
                                <label className="col-sm-12 col-form-label text-danger">Error: Value should be a number and maximum is 100</label>
                            </div>) : null}
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
            </Button>
                        <Button variant="primary" onClick={submitFormHandler}>
                            Save Changes
            </Button>
                    </Modal.Footer>
                </Modal>) : null}

            <Modal show={showDelete} onHide={handleCloseDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Country</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <span>Are you sure you want to delete the country <b>{selectedCountry}?</b></span>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDelete}>
                        No
                    </Button>
                    <Button variant="primary" onClick={submitDeleteFormHandler}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('reactContainer')
);