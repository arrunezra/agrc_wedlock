import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { InputField } from './GluestackUI';
import profileService from '@/src/services/profileService';

const CitySelector = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Use useCallback so the debounced function is persisted between renders
    const logicToFetch = useCallback(
        debounce(async (text: any) => {
            // Your PHP API Call logic goes here
            try {
                const response = await profileService.getCities(text);
                console.log('cities', response.data)
                //setCities(response.data);
            } catch (error) {
                console.error("Error fetching cities", error);
            }

            console.log("Fetching from PHP for:", text);
        }, 500),
        [] // Empty dependency array ensures this is created only once
    );

    const handleInputChange = (text: any) => {
        setSearchQuery(text); // Update UI immediately so typing feels fast
        logicToFetch(text);   // Trigger the delayed API call
    };

    return (
        <InputField
            value={searchQuery}
            onChangeText={handleInputChange}
            placeholder="Type to search cities..."
        />
    );
};