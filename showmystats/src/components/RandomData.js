import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constants/endpoints';

function RandomData() {
    const [randomData, setRandomData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(API_URL);
                setRandomData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching random data:', error);
            }
        }

        fetchData();
    }, []);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Random Data:</h2>
                    <p>Random Number: {randomData.random_number}</p>
                    <p>Random String: {randomData.random_string}</p>
                    <p>Random Boolean: {randomData.random_boolean ? 'True' : 'False'}</p>
                    <p>Random List: {randomData.random_list.join(', ')}</p>
                </div>
            )}
        </div>
    );
}

export default RandomData;
